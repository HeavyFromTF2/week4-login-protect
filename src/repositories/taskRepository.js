/**
 * Task Repository.
 * Data Access Object (DAO) executing SQL queries against the database.
 */

const { pool } = require('../config/db');

const taskRepository = {
  // Query all tasks, with optional title search or completion status filter
  async findAll({ search, done }) {
    let query = 'SELECT * FROM tasks';
    let params = [];

    if (search) {
      query += ' WHERE title ILIKE $1';
      params.push(`%${search}%`);
    } else if (done !== undefined) {
      query += ' WHERE done = $1';
      params.push(done === 'true');
    }

    query += ' ORDER BY id ASC';
    const result = await pool.query(query, params);
    return result.rows;
  },

  // Query a single task record by ID
  async findById(id) {
    const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    return result.rows[0];
  },

  // Insert a new task record into the database
  async create(title) {
    const result = await pool.query(
      'INSERT INTO tasks (title, done) VALUES ($1, $2) RETURNING *',
      [title, false]
    );
    return result.rows[0];
  },

  // Update a task record by ID and return the updated row
  async update(id, title, done) {
    const result = await pool.query(
      'UPDATE tasks SET title = $1, done = $2 WHERE id = $3 RETURNING *',
      [title, done, id]
    );
    return result.rows[0];
  },

  // Delete a task record by ID and return the deleted row
  async delete(id) {
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }
};

module.exports = taskRepository;