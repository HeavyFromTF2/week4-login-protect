const { createClient } = require('@supabase/supabase-js');

const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // eslint-disable-next-line no-console
  console.error(
    '[FATAL] Missing SUPABASE_URL or SUPABASE_ANON_KEY in your .env file.'
  );
  process.exit(1);
}

// Base client, used for things that don't need a logged-in user's
// identity: signUp, signInWithPassword, and verifying tokens via getUser().
// Uses ONLY the public anon key - never the service_role key.
const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Returns a Supabase client scoped to a specific user's access token.
 * All Postgres queries made with this client are executed as that user,
 * so Row Level Security policies (auth.uid() = user_id) are enforced by
 * Supabase itself - the API server never needs elevated privileges.
 */
function getUserClient(accessToken) {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}

module.exports = { supabaseAnon, getUserClient };
