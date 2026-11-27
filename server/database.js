import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import mockData from '../src/data/mockData.js';

const schema = `
  PRAGMA foreign_keys = ON;
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS professions (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    sort_order INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS skills (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    category_id INTEGER NOT NULL REFERENCES categories(id),
    description TEXT NOT NULL,
    sort_order INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS profession_skills (
    profession_id INTEGER NOT NULL REFERENCES professions(id) ON DELETE CASCADE,
    skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL,
    PRIMARY KEY (profession_id, skill_id)
  );

  CREATE TABLE IF NOT EXISTS skill_prerequisites (
    skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    prerequisite_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    PRIMARY KEY (skill_id, prerequisite_id)
  );

  CREATE TABLE IF NOT EXISTS resources (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    type TEXT NOT NULL,
    language TEXT NOT NULL,
    duration TEXT
  );

  CREATE TABLE IF NOT EXISTS skill_resources (
    skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    resource_id INTEGER NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    PRIMARY KEY (skill_id, resource_id)
  );

  CREATE TABLE IF NOT EXISTS user_maps (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    profession_id INTEGER NOT NULL REFERENCES professions(id) ON DELETE CASCADE,
    level TEXT NOT NULL DEFAULT 'beginner',
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, profession_id)
  );

  CREATE TABLE IF NOT EXISTS user_skill_statuses (
    user_id INTEGER NOT NULL,
    profession_id INTEGER NOT NULL,
    skill_id INTEGER NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('not_started', 'in_progress', 'mastered')),
    PRIMARY KEY (user_id, profession_id, skill_id),
    FOREIGN KEY (user_id, profession_id)
      REFERENCES user_maps(user_id, profession_id) ON DELETE CASCADE,
    FOREIGN KEY (profession_id, skill_id)
      REFERENCES profession_skills(profession_id, skill_id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions(expires_at);
`;

function seedDatabase(db) {
  const professionCount = db.prepare('SELECT COUNT(*) AS count FROM professions').get().count;
  if (professionCount > 0) return;

  const seed = db.transaction(() => {
    const insertProfession = db.prepare(
      'INSERT INTO professions (id, name, description, status, sort_order) VALUES (?, ?, ?, ?, ?)',
    );
    const insertCategory = db.prepare(
      'INSERT INTO categories (id, name, description) VALUES (?, ?, ?)',
    );
    const insertSkill = db.prepare(
      'INSERT INTO skills (id, name, category_id, description, sort_order) VALUES (?, ?, ?, ?, ?)',
    );
    const insertProfessionSkill = db.prepare(
      'INSERT INTO profession_skills (profession_id, skill_id, sort_order) VALUES (?, ?, ?)',
    );
    const insertPrerequisite = db.prepare(
      'INSERT INTO skill_prerequisites (skill_id, prerequisite_id) VALUES (?, ?)',
    );
    const insertResource = db.prepare(
      'INSERT INTO resources (id, name, url, type, language, duration) VALUES (?, ?, ?, ?, ?, ?)',
    );
    const insertSkillResource = db.prepare(
      'INSERT INTO skill_resources (skill_id, resource_id) VALUES (?, ?)',
    );

    for (const profession of mockData.professions) {
      insertProfession.run(
        profession.id,
        profession.name,
        profession.description,
        profession.status,
        profession.order,
      );
    }

    for (const category of mockData.categories) {
      insertCategory.run(category.id, category.name, category.description);
    }

    for (const skill of mockData.skills) {
      insertSkill.run(
        skill.id,
        skill.name,
        skill.categoryId,
        skill.description,
        skill.order,
      );
    }

    for (const resource of mockData.resources) {
      insertResource.run(
        resource.id,
        resource.name,
        resource.url,
        resource.type,
        resource.language,
        resource.duration,
      );
    }

    for (const profession of mockData.professions) {
      profession.skills.forEach((skillId, index) => {
        insertProfessionSkill.run(profession.id, skillId, index + 1);
      });
    }

    for (const skill of mockData.skills) {
      skill.prerequisites.forEach((prerequisiteId) => {
        insertPrerequisite.run(skill.id, prerequisiteId);
      });
      skill.resourceIds.forEach((resourceId) => {
        insertSkillResource.run(skill.id, resourceId);
      });
    }
  });

  seed();
}

export function createDatabase(databasePath = process.env.DB_PATH || './data/skillmap.sqlite') {
  const absolutePath = resolve(databasePath);
  mkdirSync(dirname(absolutePath), { recursive: true });

  const db = new Database(absolutePath);
  db.pragma('foreign_keys = ON');
  db.pragma('journal_mode = WAL');
  db.exec(schema);
  seedDatabase(db);

  return db;
}
