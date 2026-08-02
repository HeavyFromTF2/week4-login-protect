require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');

const swaggerSpec = require('./docs/swagger');
const authRoutes = require('./routes/auth');
const itemsRoutes = require('./routes/items');

// Fail fast if required env vars are missing
['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'JWT_SECRET'].forEach((key) => {
  if (!process.env[key]) {
    // eslint-disable-next-line no-console
    console.error(`[FATAL] Missing required environment variable: ${key}`);
    process.exit(1);
  }
});

const app = express();

// --- Security & core middleware ---
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN === '*' ? '*' : process.env.CORS_ORIGIN.split(','),
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Global rate limiter (protects against brute force / abuse)
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests', message: 'Please try again later.' },
  })
);

// Stricter limiter specifically for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests', message: 'Please try again later.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// --- Docs ---
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));

// --- Health check ---
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/items', itemsRoutes);

// --- 404 handler ---
app.use((req, res) => {
  res.status(404).json({ error: 'Not found', message: `Route ${req.method} ${req.originalUrl} not found` });
});

// --- Global error handler (safety net) ---
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(err.status || 500).json({
    error: 'Server error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on http://localhost:${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`Swagger docs at   http://localhost:${PORT}/api-docs`);
});

module.exports = app;
