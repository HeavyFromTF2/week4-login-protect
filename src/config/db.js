const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      done BOOLEAN NOT NULL DEFAULT false
    );
  `);

  const res = await pool.query('SELECT COUNT(*) FROM tasks');
  if (parseInt(res.rows[0].count) === 0) {
    await pool.query(`
      INSERT INTO tasks (title, done) VALUES 
      ('Learn Express basics', true),
      ('Build Stage 2 of CRUD API', false),
      ('Practice git commits', false);
    `);
  }
}

module.exports = { pool, initDb };