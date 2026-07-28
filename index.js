/**
 * Main application entry point.
 * Loads environment variables, connects to PostgreSQL, and starts the server.
 */

require('dotenv').config();
const app = require('./src/app');
const { initDb } = require('./src/config/db');

const PORT = process.env.PORT || 3000;

// Initialize the database tables before starting the HTTP server
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
  });