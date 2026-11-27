import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createDatabase } from '../server/database.js';
import { createApp } from '../server/index.js';

let directory;
let db;
let server;
let baseUrl;

before(async () => {
  directory = mkdtempSync(join(tmpdir(), 'skillmap-test-'));
  db = createDatabase(join(directory, 'test.sqlite'));
  server = await new Promise((resolve) => {
    const instance = createApp({ db, production: false }).listen(0, '127.0.0.1', () => resolve(instance));
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  db.close();
  rmSync(directory, { recursive: true, force: true });
});

test('HTTP pages do not force browsers to upgrade assets to HTTPS', async () => {
  for (const path of ['/', '/api/docs/']) {
    const response = await fetch(`${baseUrl}${path}`);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('strict-transport-security'), null);
    assert.doesNotMatch(response.headers.get('content-security-policy') || '', /upgrade-insecure-requests/i);
  }
});

test('HTTPS mode enables strict transport security headers', async () => {
  const httpsAppServer = await new Promise((resolve) => {
    const instance = createApp({ db, production: false, httpsEnabled: true })
      .listen(0, '127.0.0.1', () => resolve(instance));
  });

  try {
    const secureUrl = `http://127.0.0.1:${httpsAppServer.address().port}`;
    for (const path of ['/', '/api/docs/']) {
      const response = await fetch(`${secureUrl}${path}`);
      assert.match(response.headers.get('strict-transport-security') || '', /max-age=/i);
      assert.match(response.headers.get('content-security-policy') || '', /upgrade-insecure-requests/i);
    }
  } finally {
    await new Promise((resolve, reject) => httpsAppServer.close((error) => error ? reject(error) : resolve()));
  }
});

test('API seeds professions and persists authenticated user progress', async () => {
  const professionsResponse = await fetch(`${baseUrl}/api/professions`);
  assert.equal(professionsResponse.status, 200);
  const professions = await professionsResponse.json();
  assert.equal(professions.length, 11);

  const openApiResponse = await fetch(`${baseUrl}/api/openapi.json`);
  assert.equal(openApiResponse.status, 200);
  const openApi = await openApiResponse.json();
  assert.ok(openApi.paths['/api/auth/login']);
  assert.ok(openApi.paths['/api/me/maps/{professionId}/skills/{skillId}']);

  const swaggerResponse = await fetch(`${baseUrl}/api/docs/`);
  assert.equal(swaggerResponse.status, 200);
  assert.match(await swaggerResponse.text(), /Swagger UI/);

  const skillsResponse = await fetch(`${baseUrl}/api/professions/1/skills`);
  assert.equal(skillsResponse.status, 200);
  const skills = await skillsResponse.json();
  assert.equal(skills.length, 6);
  assert.equal(skills[0].resources[0].name, 'Учебник по HTML и CSS');
  assert.equal(skills[1].prerequisites[0], 1);
  const appPageResponse = await fetch(`${baseUrl}/professions/1/map`);
  assert.equal(appPageResponse.status, 200);
  assert.match(appPageResponse.headers.get('content-type'), /text\/html/);

  const anonymousResponse = await fetch(`${baseUrl}/api/me/maps`);
  assert.equal(anonymousResponse.status, 401);
  const unknownEndpointResponse = await fetch(`${baseUrl}/api/professions/999`);
  assert.equal(unknownEndpointResponse.status, 404);

  const registrationResponse = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'learner@example.com',
      name: 'Learner',
      password: 'a-secure-password',
    }),
  });
  assert.equal(registrationResponse.status, 201);
  const cookie = registrationResponse.headers.get('set-cookie').split(';')[0];
  const registration = await registrationResponse.json();
  assert.equal(registration.user.role, 'user');
  assert.equal('password' in registration.user, false);

  const duplicateRegistrationResponse = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'LEARNER@example.com',
      name: 'Learner',
      password: 'a-secure-password',
    }),
  });
  assert.equal(duplicateRegistrationResponse.status, 409);

  const forbiddenAdminResponse = await fetch(`${baseUrl}/api/admin/summary`, { headers: { cookie } });
  assert.equal(forbiddenAdminResponse.status, 403);

  const savedMapResponse = await fetch(`${baseUrl}/api/me/maps/1`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', cookie },
    body: JSON.stringify({
      level: 'junior',
      skills: [
        { skillId: 1, status: 'mastered' },
        { skillId: 2, status: 'in_progress' },
      ],
    }),
  });
  assert.equal(savedMapResponse.status, 200);

  const invalidStatusResponse = await fetch(`${baseUrl}/api/me/maps/1/skills/2`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', cookie },
    body: JSON.stringify({ status: 'invalid' }),
  });
  assert.equal(invalidStatusResponse.status, 400);

  const updatedStatusResponse = await fetch(`${baseUrl}/api/me/maps/1/skills/2`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', cookie },
    body: JSON.stringify({ status: 'mastered' }),
  });
  assert.equal(updatedStatusResponse.status, 200);

  const mapsResponse = await fetch(`${baseUrl}/api/me/maps`, { headers: { cookie } });
  const maps = await mapsResponse.json();
  assert.equal(maps.length, 1);
  assert.equal(maps[0].level, 'junior');
  assert.equal(maps[0].skills.length, 6);
  assert.equal(maps[0].skills.find((skill) => skill.skillId === 2).status, 'mastered');

  const logoutResponse = await fetch(`${baseUrl}/api/auth/logout`, {
    method: 'POST',
    headers: { cookie },
  });
  assert.equal(logoutResponse.status, 204);
  const afterLogoutResponse = await fetch(`${baseUrl}/api/me/maps`, { headers: { cookie } });
  assert.equal(afterLogoutResponse.status, 401);

  const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'learner@example.com', password: 'a-secure-password' }),
  });
  assert.equal(loginResponse.status, 200);
  const loginCookie = loginResponse.headers.get('set-cookie').split(';')[0];
  const loggedInUserMapsResponse = await fetch(`${baseUrl}/api/me/maps`, { headers: { cookie: loginCookie } });
  const persistedMaps = await loggedInUserMapsResponse.json();
  assert.equal(persistedMaps[0].skills.find((skill) => skill.skillId === 2).status, 'mastered');

  const otherRegistrationResponse = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'other@example.com',
      name: 'Other',
      password: 'another-secure-password',
    }),
  });
  assert.equal(otherRegistrationResponse.status, 201);
  const otherCookie = otherRegistrationResponse.headers.get('set-cookie').split(';')[0];
  const otherMapsResponse = await fetch(`${baseUrl}/api/me/maps`, { headers: { cookie: otherCookie } });
  assert.deepEqual(await otherMapsResponse.json(), []);

  const reloadedDatabase = createDatabase(join(directory, 'test.sqlite'));
  assert.equal(reloadedDatabase.prepare('SELECT COUNT(*) AS count FROM users').get().count, 2);
  reloadedDatabase.close();
});
