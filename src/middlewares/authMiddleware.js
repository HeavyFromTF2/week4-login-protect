/**
 * Authentication Middleware.
 * Validates the JWT bearer token sent in the Authorization header via Supabase Auth.
 */

const supabase = require('../config/supabase');

const authenticateToken = async (req, res, next) => {
  // Extract Authorization header (Expected format: "Bearer <token>")
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // Return HTTP 401 Unauthorized if token is missing
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  // Validate the JWT token against Supabase Auth SDK
  const { data: { user }, error } = await supabase.auth.getUser(token);

  // Return HTTP 403 Forbidden if token validation fails or is expired
  if (error || !user) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  // Attach user context to request object and proceed to controller
  req.user = user;
  next();
};

module.exports = authenticateToken;