/**
 * Protected Routes Router.
 * Handles endpoints requiring valid JWT authentication.
 */

const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authMiddleware');

// Apply auth middleware to all routes in this router
router.use(authenticateToken);

// GET /protected/profile - Returns authenticated user metadata
router.get('/profile', (req, res) => {
  return res.status(200).json({
    id: req.user.id,
    email: req.user.email,
    created_at: req.user.created_at
  });
});

// GET /protected/dashboard - Second protected route to demonstrate middleware reusability
router.get('/dashboard', (req, res) => {
  return res.status(200).json({
    message: `Welcome to your protected dashboard, ${req.user.email}!`,
    user_id: req.user.id
  });
});

module.exports = router;