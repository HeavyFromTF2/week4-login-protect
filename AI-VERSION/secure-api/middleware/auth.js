const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

/**
 * Protects routes using a Bearer JWT.
 * - Verifies signature + expiry
 * - Rejects tokens that were explicitly revoked (logout)
 * - Attaches { id, email } to req.user
 */
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing or malformed Authorization header. Expected: Bearer <token>',
      });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      const message =
        err.name === 'TokenExpiredError' ? 'Token has expired' : 'Invalid token';
      return res.status(401).json({ error: 'Unauthorized', message });
    }

    // Check the revocation list (populated by /auth/logout)
    const { data: revoked, error } = await supabase
      .from('revoked_tokens')
      .select('token')
      .eq('token', token)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ error: 'Server error', message: error.message });
    }

    if (revoked) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'This token has been revoked. Please log in again.',
      });
    }

    req.user = { id: payload.sub, email: payload.email };
    req.token = token;
    return next();
  } catch (err) {
    return res.status(500).json({ error: 'Server error', message: err.message });
  }
}

module.exports = { requireAuth };
