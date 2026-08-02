const { createClient } = require('@supabase/supabase-js');

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  // eslint-disable-next-line no-console
  console.error(
    '[FATAL] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in your .env file.'
  );
  process.exit(1);
}

// We use the service_role key because this client only ever runs on the
// server, never in a browser. It bypasses Row Level Security, which is fine
// here because ALL access control is enforced by our own API/JWT layer.
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

module.exports = supabase;
