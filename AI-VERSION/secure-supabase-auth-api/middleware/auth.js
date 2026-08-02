const { supabaseAnon, getUserClient } = require('../config/supabase');

/**
 * Protects routes using a Supabase-issued Bearer JWT.
 * - Asks Supabase Auth to verify the token and return the user (also
 *   catches revoked/expired sessions, since a signed-out session's
 *   access token is rejected by Supabase after signOut()+expiry checks).
 * - Attaches:
 *     req.user     -> the Supabase user object
 *     req.token    -> the raw access token
 *     req.supabase -> a Postgres client scoped to this user (RLS-aware)
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

    const { data, error } = await supabaseAnon.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid, expired, or revoked token. Please log in again.',
      });
    }

    req.user = data.user;
    req.token = token;
    req.supabase = getUserClient(token);
    return next();
  } catch (err) {
    return res.status(500).json({ error: 'Server error', message: err.message });
  }
}

module.exports = { requireAuth };
