/**
 * Protected Routes Router.
 * Handles endpoints requiring direct JWT verification via Supabase Auth.
 */

const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// GET /protected/profile - Verify token and return user metadata
router.get('/profile', async (req, res) => {
  // Extract Authorization header (Expected format: "Bearer <token>")
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // Return HTTP 401 if token is missing
  if (!token) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // Verify token directly with Supabase Auth SDK
  const { data: { user }, error } = await supabase.auth.getUser(token);

  // Return HTTP 401 if token is expired, tampered with, or invalid
  if (error || !user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // Return HTTP 200 with safe user metadata
  return res.status(200).json({
    id: user.id,
    email: user.email,
    created_at: user.created_at
  });
});

module.exports = router;