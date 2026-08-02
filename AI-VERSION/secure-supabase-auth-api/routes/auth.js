const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabaseAnon } = require('../config/supabase');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ error: 'Validation error', details: errors.array() });
    return true;
  }
  return false;
}

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user (Supabase Auth)
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
 *                 minLength: 6
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created. If email confirmation is enabled on the Supabase project, session will be null until the user confirms their email.
 *       400:
 *         description: Validation error, or user already registered
 */
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long (Supabase minimum)'),
    body('name').optional().isString().trim(),
  ],
  async (req, res) => {
    if (handleValidation(req, res)) return;

    const { email, password, name } = req.body;

    const { data, error } = await supabaseAnon.auth.signUp({
      email,
      password,
      options: name ? { data: { name } } : undefined,
    });

    if (error) {
      return res.status(400).json({ error: 'Registration failed', message: error.message });
    }

    return res.status(201).json({
      user: data.user,
      session: data.session, // null if the project requires email confirmation
      message: data.session
        ? 'Registered and logged in.'
        : 'Registered. Please check your email to confirm your account before logging in.',
    });
  }
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in and receive a Supabase JWT
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
 *         description: Login successful, returns access_token to use as Bearer token
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

    const { data, error } = await supabaseAnon.auth.signInWithPassword({ email, password });

    if (error) {
      return res.status(401).json({ error: 'Unauthorized', message: error.message });
    }

    return res.json({
      user: data.user,
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in,
      token_type: 'bearer',
    });
  }
);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Log out (revokes the current Supabase session)
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
  const { error } = await req.supabase.auth.signOut();

  if (error) {
    return res.status(500).json({ error: 'Server error', message: error.message });
  }

  return res.json({
    message:
      'Logged out. The session/refresh token has been revoked. Note: like all JWTs, the current access token remains cryptographically valid until it naturally expires; this is standard Supabase Auth behaviour.',
  });
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
  return res.json({ user: req.user });
});

module.exports = router;
