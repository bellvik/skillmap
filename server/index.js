import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import swaggerUi from 'swagger-ui-express';
import { Buffer } from 'node:buffer';
import { createHash, randomBytes } from 'node:crypto';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDatabase } from './database.js';
import openApiDocument from './openapi.js';

const SESSION_COOKIE = 'skillmap_session';
const SESSION_TTL_MS = 14 * 24 * 60 * 60 * 1000;
const VALID_STATUSES = new Set(['not_started', 'in_progress', 'mastered']);
const VALID_LEVELS = new Set(['beginner', 'junior', 'middle', 'senior']);
const __dirname = dirname(fileURLToPath(import.meta.url));

const hashToken = (token) => createHash('sha256').update(token).digest('hex');

function setSessionCookie(res, token, maxAge) {
  const secure = process.env.NODE_ENV === 'production' && process.env.COOKIE_SECURE !== 'false';
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge,
  });
}

function clearSessionCookie(res) {
  const secure = process.env.NODE_ENV === 'production' && process.env.COOKIE_SECURE !== 'false';
  res.clearCookie(SESSION_COOKIE, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
  });
}

function safeUser(user) {
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

function sendError(res, status, error) {
  res.status(status).json({ error });
}

function getProfession(db, professionId) {
  return db.prepare(`
    SELECT id, name, description, status, sort_order AS "order"
    FROM professions
    WHERE id = ? AND status = 'active'
  `).get(professionId);
}

function getProfessionSkills(db, professionId) {
  const skills = db.prepare(`
    SELECT s.id, s.name, s.category_id AS categoryId, c.name AS categoryName,
           s.description, s.sort_order AS "order"
    FROM profession_skills ps
    JOIN skills s ON s.id = ps.skill_id
    JOIN categories c ON c.id = s.category_id
    WHERE ps.profession_id = ?
    ORDER BY ps.sort_order
  `).all(professionId);
  const prerequisites = db.prepare(
    'SELECT prerequisite_id FROM skill_prerequisites WHERE skill_id = ? ORDER BY prerequisite_id',
  );
  const resources = db.prepare(`
    SELECT r.id, r.name, r.url, r.type, r.language, r.duration
    FROM skill_resources sr
    JOIN resources r ON r.id = sr.resource_id
    WHERE sr.skill_id = ?
    ORDER BY r.id
  `);

  return skills.map((skill) => {
    const skillPrerequisites = prerequisites.all(skill.id).map((row) => row.prerequisite_id);
    const skillResources = resources.all(skill.id);
    return {
      ...skill,
      prerequisites: skillPrerequisites,
      resourceIds: skillResources.map((resource) => resource.id),
      resources: skillResources,
      professionId: Number(professionId),
    };
  });
}

function getUserMaps(db, userId) {
  const maps = db.prepare(`
    SELECT um.profession_id AS professionId, p.name AS professionName,
           um.level, um.updated_at AS updatedAt
    FROM user_maps um
    JOIN professions p ON p.id = um.profession_id
    WHERE um.user_id = ?
    ORDER BY um.updated_at DESC
  `).all(userId);
  const statuses = db.prepare(`
    SELECT ps.skill_id AS skillId, COALESCE(uss.status, 'not_started') AS status
    FROM profession_skills ps
    LEFT JOIN user_skill_statuses uss
      ON uss.user_id = ? AND uss.profession_id = ps.profession_id AND uss.skill_id = ps.skill_id
    WHERE ps.profession_id = ?
    ORDER BY ps.sort_order
  `);

  return maps.map((map) => ({
    ...map,
    skills: statuses.all(userId, map.professionId),
  }));
}

export function createApp({
  db = createDatabase(),
  production = process.env.NODE_ENV === 'production',
  httpsEnabled = process.env.HTTPS_ENABLED === 'true',
} = {}) {
  const app = express();

  app.disable('x-powered-by');
  const hsts = httpsEnabled ? { maxAge: 31536000, includeSubDomains: true } : false;
  const upgradeInsecureRequests = httpsEnabled ? [] : null;
  const defaultSecurityHeaders = helmet({
    hsts,
    contentSecurityPolicy: {
      directives: { upgradeInsecureRequests },
    },
  });
  const docsSecurityHeaders = helmet({
    hsts,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
        upgradeInsecureRequests,
      },
    },
  });
  app.use((req, res, next) => {
    const isDocsPage = req.path === '/api/docs' || req.path.startsWith('/api/docs/');
    (isDocsPage ? docsSecurityHeaders : defaultSecurityHeaders)(req, res, next);
  });
  app.use(express.json({ limit: '32kb' }));

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (_req, res) => sendError(res, 429, 'Слишком много попыток. Попробуйте позже.'),
  });

  app.use((req, _res, next) => {
    const token = req.headers.cookie?.split(';').map((part) => part.trim())
      .find((part) => part.startsWith(`${SESSION_COOKIE}=`))
      ?.slice(SESSION_COOKIE.length + 1);

    if (!token) return next();

    const session = db.prepare(`
      SELECT u.id, u.email, u.name, u.role, s.expires_at AS expiresAt
      FROM sessions s
      JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = ?
    `).get(hashToken(token));

    if (session && session.expiresAt > Date.now()) {
      req.user = safeUser(session);
    } else {
      db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(hashToken(token));
    }

    next();
  });

  const requireUser = (req, res, next) => {
    if (!req.user) return sendError(res, 401, 'Требуется авторизация');
    next();
  };

  const requireAdmin = (req, res, next) => {
    if (!req.user) return sendError(res, 401, 'Требуется авторизация');
    if (req.user.role !== 'admin') return sendError(res, 403, 'Недостаточно прав');
    next();
  };

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
  app.get('/api/openapi.json', (_req, res) => res.json(openApiDocument));
  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(openApiDocument, {
      explorer: true,
      validatorUrl: null,
    }),
  );

  app.post('/api/auth/register', authLimiter, async (req, res, next) => {
    try {
      const body = req.body || {};
      const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
      const name = typeof body.name === 'string' ? body.name.trim() : '';
      const password = typeof body.password === 'string' ? body.password : '';

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
        return sendError(res, 400, 'Укажите корректный email');
      }
      if (name.length < 1 || name.length > 80) {
        return sendError(res, 400, 'Имя должно содержать от 1 до 80 символов');
      }
      if (password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
        return sendError(res, 400, 'Пароль должен содержать не менее 8 символов и не более 72 байт');
      }
      if (db.prepare('SELECT 1 FROM users WHERE email = ?').get(email)) {
        return sendError(res, 409, 'Пользователь с таким email уже существует');
      }

      const passwordHash = await bcrypt.hash(password, 12);
      let result;
      try {
        result = db.prepare(
          'INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)',
        ).run(email, name, passwordHash);
      } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
          return sendError(res, 409, 'Пользователь с таким email уже существует');
        }
        throw error;
      }

      const user = db.prepare('SELECT id, email, name, role FROM users WHERE id = ?').get(result.lastInsertRowid);
      const token = randomBytes(32).toString('base64url');
      const expiresAt = Date.now() + SESSION_TTL_MS;
      db.prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)')
        .run(hashToken(token), user.id, expiresAt);
      setSessionCookie(res, token, SESSION_TTL_MS);
      res.status(201).json({ user: safeUser(user) });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/auth/login', authLimiter, async (req, res, next) => {
    try {
      const body = req.body || {};
      const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
      const password = typeof body.password === 'string' ? body.password : '';
      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

      if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        return sendError(res, 401, 'Неверный email или пароль');
      }

      const token = randomBytes(32).toString('base64url');
      const expiresAt = Date.now() + SESSION_TTL_MS;
      db.prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)')
        .run(hashToken(token), user.id, expiresAt);
      setSessionCookie(res, token, SESSION_TTL_MS);
      res.json({ user: safeUser(user) });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    const token = req.headers.cookie?.split(';').map((part) => part.trim())
      .find((part) => part.startsWith(`${SESSION_COOKIE}=`))
      ?.slice(SESSION_COOKIE.length + 1);
    if (token) db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(hashToken(token));
    clearSessionCookie(res);
    res.status(204).end();
  });

  app.get('/api/auth/me', (req, res) => res.json({ user: req.user || null }));

  app.get('/api/professions', (_req, res) => {
    const professions = db.prepare(`
      SELECT id, name, description, status, sort_order AS "order"
      FROM professions
      WHERE status = 'active'
      ORDER BY sort_order
    `).all();
    res.json(professions);
  });

  app.get('/api/professions/:professionId', (req, res) => {
    const professionId = Number(req.params.professionId);
    if (!Number.isInteger(professionId)) return sendError(res, 400, 'Некорректный ID профессии');
    const profession = getProfession(db, professionId);
    if (!profession) return sendError(res, 404, 'Профессия не найдена');
    res.json(profession);
  });

  app.get('/api/professions/:professionId/skills', (req, res) => {
    const professionId = Number(req.params.professionId);
    if (!Number.isInteger(professionId)) return sendError(res, 400, 'Некорректный ID профессии');
    if (!getProfession(db, professionId)) return sendError(res, 404, 'Профессия не найдена');
    res.json(getProfessionSkills(db, professionId));
  });

  app.get('/api/me/maps', requireUser, (req, res) => {
    res.json(getUserMaps(db, req.user.id));
  });

  app.get('/api/admin/summary', requireAdmin, (_req, res) => {
    const users = db.prepare('SELECT COUNT(*) AS count FROM users').get().count;
    const professions = db.prepare('SELECT COUNT(*) AS count FROM professions').get().count;
    res.json({ users, professions });
  });

  app.put('/api/me/maps/:professionId', requireUser, (req, res) => {
    const professionId = Number(req.params.professionId);
    if (!Number.isInteger(professionId) || !getProfession(db, professionId)) {
      return sendError(res, 404, 'Профессия не найдена');
    }

    const body = req.body || {};
    const level = typeof body.level === 'string' ? body.level : 'beginner';
    const skills = body.skills;
    if (!VALID_LEVELS.has(level) || !Array.isArray(skills) || skills.length > 500) {
      return sendError(res, 400, 'Некорректные данные карты');
    }

    const validSkillIds = new Set(
      db.prepare('SELECT skill_id FROM profession_skills WHERE profession_id = ?')
        .all(professionId).map((row) => row.skill_id),
    );
    const seenSkillIds = new Set();
    for (const skill of skills) {
      if (!skill || typeof skill !== 'object') {
        return sendError(res, 400, 'Некорректный навык в карте');
      }
      const skillId = Number(skill.skillId);
      if (!Number.isInteger(skillId) || !validSkillIds.has(skillId) || seenSkillIds.has(skillId)) {
        return sendError(res, 400, 'В карте указаны некорректные или повторяющиеся навыки');
      }
      if (!VALID_STATUSES.has(skill.status)) return sendError(res, 400, 'Некорректный статус навыка');
      seenSkillIds.add(skillId);
    }

    const saveMap = db.transaction(() => {
      db.prepare(`
        INSERT INTO user_maps (user_id, profession_id, level, updated_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id, profession_id)
        DO UPDATE SET level = excluded.level, updated_at = CURRENT_TIMESTAMP
      `).run(req.user.id, professionId, level);
      db.prepare('DELETE FROM user_skill_statuses WHERE user_id = ? AND profession_id = ?')
        .run(req.user.id, professionId);
      const insertStatus = db.prepare(`
        INSERT INTO user_skill_statuses (user_id, profession_id, skill_id, status)
        VALUES (?, ?, ?, ?)
      `);
      skills.forEach((skill) => {
        insertStatus.run(req.user.id, professionId, Number(skill.skillId), skill.status);
      });
    });
    saveMap();

    res.json(getUserMaps(db, req.user.id).find((map) => map.professionId === professionId));
  });

  app.put('/api/me/maps/:professionId/skills/:skillId', requireUser, (req, res) => {
    const professionId = Number(req.params.professionId);
    const skillId = Number(req.params.skillId);
    if (!Number.isInteger(professionId) || !Number.isInteger(skillId)) {
      return sendError(res, 400, 'Некорректный ID профессии или навыка');
    }
    const body = req.body || {};
    if (!VALID_STATUSES.has(body.status)) return sendError(res, 400, 'Некорректный статус навыка');

    const belongsToProfession = db.prepare(
      'SELECT 1 FROM profession_skills WHERE profession_id = ? AND skill_id = ?',
    ).get(professionId, skillId);
    if (!belongsToProfession) return sendError(res, 404, 'Навык не найден в этой профессии');

    const updateStatus = db.transaction(() => {
      db.prepare(`
        INSERT INTO user_maps (user_id, profession_id, level, updated_at)
        VALUES (?, ?, 'beginner', CURRENT_TIMESTAMP)
        ON CONFLICT (user_id, profession_id)
        DO UPDATE SET updated_at = CURRENT_TIMESTAMP
      `).run(req.user.id, professionId);
      db.prepare(`
        INSERT INTO user_skill_statuses (user_id, profession_id, skill_id, status)
        VALUES (?, ?, ?, ?)
        ON CONFLICT (user_id, profession_id, skill_id)
        DO UPDATE SET status = excluded.status
      `).run(req.user.id, professionId, skillId, body.status);
    });
    updateStatus();
    res.json({ professionId, skillId, status: body.status });
  });

  app.delete('/api/me/maps/:professionId', requireUser, (req, res) => {
    const professionId = Number(req.params.professionId);
    if (!Number.isInteger(professionId)) return sendError(res, 400, 'Некорректный ID профессии');
    db.prepare('DELETE FROM user_maps WHERE user_id = ? AND profession_id = ?')
      .run(req.user.id, professionId);
    res.status(204).end();
  });

  app.use('/api', (_req, res) => sendError(res, 404, 'API endpoint не найден'));

  const distPath = resolve(__dirname, '../dist');
  if (existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get(/.*/, (_req, res) => res.sendFile(resolve(distPath, 'index.html')));
  } else if (production) {
    throw new Error('Production build not found. Run "npm run build" before starting the server.');
  }

  app.use((error, _req, res, _next) => {
    console.error(error);
    if (res.headersSent) return;
    if (error.type === 'entity.parse.failed') return sendError(res, 400, 'Некорректный JSON');
    if (error.status === 413) return sendError(res, 413, 'Слишком большой запрос');
    sendError(res, 500, 'Внутренняя ошибка сервера');
  });

  app.locals.db = db;
  return app;
}

async function createBootstrapAdmin(db) {
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  if (!email && !password) return;
  if (!email || !password) {
    throw new Error('Set both BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD to create an admin.');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    throw new Error('Bootstrap admin email is invalid.');
  }
  if (password.length < 12 || Buffer.byteLength(password, 'utf8') > 72) {
    throw new Error('Bootstrap admin password must be 12-72 characters/bytes.');
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return;

  const passwordHash = await bcrypt.hash(password, 12);
  db.prepare('INSERT INTO users (email, name, password_hash, role) VALUES (?, ?, ?, ?)').run(
    email,
    'Администратор',
    passwordHash,
    'admin',
  );
  console.log(`Created bootstrap admin: ${email}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const db = createDatabase();
  db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(Date.now());
  await createBootstrapAdmin(db);

  const app = createApp({ db });
  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`SkillMap server listening on port ${port}`);
  });
}
