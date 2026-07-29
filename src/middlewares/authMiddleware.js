/**
 * Authentication Middleware.
 * Validates the JWT bearer token sent in the Authorization header via Supabase Auth.
 */

const supabase = require('../config/supabase');

const authenticateToken = async (req, res, next) => {
  // Extract Authorization header (Expected format: "Bearer <token>")
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // Return HTTP 401 if token is missing
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    // Validate JWT token against Supabase Auth SDK
    const { data: { user }, error } = await supabase.auth.getUser(token);

    // Return HTTP 401 if token is expired, tampered with, or invalid
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Attach user payload to request object for downstream usage
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = authenticateToken;