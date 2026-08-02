const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const supabase = require('../config/supabase');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
const SALT_ROUNDS = 12;

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ error: 'Validation error', details: errors.array() });
    return true;
  }
  return false;
}

function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  });
}

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already registered
 */
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long'),
    body('name').optional().isString().trim(),
  ],
  async (req, res) => {
    if (handleValidation(req, res)) return;

    const { email, password, name } = req.body;

    try {
      const { data: existing, error: findError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (findError) {
        return res.status(500).json({ error: 'Server error', message: findError.message });
      }
      if (existing) {
        return res.status(409).json({ error: 'Conflict', message: 'Email already registered' });
      }

      const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

      const { data: user, error: insertError } = await supabase
        .from('users')
        .insert({ email, password_hash, name: name || null })
        .select('id, email, name, created_at')
        .single();

      if (insertError) {
        return res.status(500).json({ error: 'Server error', message: insertError.message });
      }

      const token = signToken(user);
      return res.status(201).json({ user, token });
    } catch (err) {
      return res.status(500).json({ error: 'Server error', message: err.message });
    }
  }
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in and receive a JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful, returns JWT
 *       401:
 *         description: Invalid credentials
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    if (handleValidation(req, res)) return;

    const { email, password } = req.body;

    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('id, email, name, password_hash')
        .eq('email', email)
        .maybeSingle();

      if (error) {
        return res.status(500).json({ error: 'Server error', message: error.message });
      }
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized', message: 'Invalid email or password' });
      }

      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        return res.status(401).json({ error: 'Unauthorized', message: 'Invalid email or password' });
      }

      const token = signToken(user);
      const { password_hash, ...safeUser } = user;
      return res.json({ user: safeUser, token });
    } catch (err) {
      return res.status(500).json({ error: 'Server error', message: err.message });
    }
  }
);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Log out (revokes the current JWT)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/logout', requireAuth, async (req, res) => {
  try {
    const decoded = jwt.decode(req.token);
    const expires_at = new Date(decoded.exp * 1000).toISOString();

    const { error } = await supabase
      .from('revoked_tokens')
      .insert({ token: req.token, expires_at });

    if (error) {
      return res.status(500).json({ error: 'Server error', message: error.message });
    }

    return res.json({ message: 'Logged out successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Server error', message: err.message });
  }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get the currently authenticated user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user
 *       401:
 *         description: Unauthorized
 */
router.get('/me', requireAuth, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, created_at')
      .eq('id', req.user.id)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ error: 'Server error', message: error.message });
    }
    if (!user) {
      return res.status(404).json({ error: 'Not found', message: 'User no longer exists' });
    }

    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ error: 'Server error', message: err.message });
  }
});

module.exports = router;
