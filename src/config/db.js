/**
 * Database configuration module.
 * Sets up the PostgreSQL connection pool and creates initial table/data.
 */

const { Pool } = require('pg');

// Create a connection pool using the DATABASE_URL environment variable
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Creates the 'tasks' table if missing and seeds initial sample data.
 */
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