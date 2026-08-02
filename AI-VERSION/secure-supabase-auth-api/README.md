# Secure Supabase Auth API

A simple, secure REST API built with **Node.js + Express**, documented with **Swagger**, using **Supabase Auth** directly for login/logout/JWTs, and **Postgres via Supabase** for data — using **only the public `anon` key** (the `service_role` key is never used, anywhere).

Includes one example CRUD resource (`items`), owned per-user and protected entirely by **Row Level Security (RLS)**.

---

## How this works (read this first)

Because the server only ever holds the `anon` key, it has **no special database privileges** — it can only do what any authenticated end-user is allowed to do. Two things make that safe and functional:

1. **Supabase Auth** issues and verifies the JWTs. `POST /api/auth/login` calls Supabase's `signInWithPassword`, which returns a real Supabase session `access_token`. Every protected route verifies that token by asking Supabase (`auth.getUser(token)`), so the server never has to manage sessions or secrets itself.
2. **Row Level Security policies** on the `items` table (`auth.uid() = user_id`) do all the access control. For every request, the server creates a Postgres client whose requests carry the caller's own JWT, so Supabase enforces "you can only see/edit your own rows" at the database level — the API code doesn't need to (and can't bypass it even if it had a bug).

---

## 1. Create your Supabase project

1. Go to https://supabase.com and sign in (or create a free account).
2. Click **New Project**.
   - **Name**: anything, e.g. `secure-auth-api`
   - **Database password**: pick a strong one and save it (not needed for this project directly, but keep it safe).
   - **Region**: closest to you.
3. Wait ~1-2 minutes for provisioning.

## 2. Configure email auth (default, just double check)

Go to **Authentication → Providers** and confirm **Email** is enabled (it is by default).

For quick local testing, you may also want to **disable email confirmation** so `register` immediately returns a usable session instead of requiring the user to click a confirmation link:

- Go to **Authentication → Providers → Email**
- Turn **off** "Confirm email"
- Save

(You can leave it on for a real deployment — in that case `/api/auth/register` will return `session: null` until the user confirms their email, and they'll need to `/api/auth/login` afterward.)

## 3. Create the `items` table + RLS policies

1. Open **SQL Editor → New query** in your Supabase project.
2. Copy the entire contents of `supabase_schema.sql` (included in this project) and paste it in.
3. Click **Run**.

This creates the `items` table (linked to Supabase's built-in `auth.users`) and 4 RLS policies so each user can only select/insert/update/delete their own rows. Without these policies, since the API only uses the anon key, **no one would be able to access the table at all** — that's the point: RLS is the only security boundary.

## 4. Get your API credentials

In your Supabase project, go to **Project Settings → API**:

| Value | Where to find it | Goes into |
|---|---|---|
| **Project URL** | "Project URL" field, `https://xxxxxxxxxxxx.supabase.co` | `SUPABASE_URL` |
| **anon / public key** | Under "Project API keys" → `anon` `public` | `SUPABASE_ANON_KEY` |

⚠️ Do **not** use the `service_role` key anywhere in this project — not in `.env`, not in code. That's intentional: this project's entire security model relies on RLS + the anon key, and pasting the service_role key in would silently bypass all of it.

## 5. Configure the project

```bash
cp .env.example .env
```

Fill in `.env`:

```env
PORT=3001
NODE_ENV=development

SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...        # the anon/public key from step 4

CORS_ORIGIN=*
```

## 6. Install & run

```bash
npm install
npm start
```

You should see:

```
Server running on http://localhost:3001
Swagger docs at   http://localhost:3001/api-docs
```

Open **http://localhost:3001/api-docs** for interactive Swagger docs where you can try every endpoint.

For auto-restart during development:

```bash
npm run dev
```

---

## API overview

Base URL: `http://localhost:3001`

### Auth (`/api/auth`)

| Method | Route | Auth? | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Creates a Supabase Auth user |
| POST | `/api/auth/login` | No | Logs in, returns `access_token` (JWT) |
| POST | `/api/auth/logout` | **Yes** | Revokes the current Supabase session |
| GET | `/api/auth/me` | **Yes** | Returns the logged-in user |

### Items — example CRUD resource (`/api/items`)

All routes require `Authorization: Bearer <access_token>`. RLS ensures each request only ever touches that user's own rows.

| Method | Route | Description |
|---|---|---|
| GET | `/api/items` | List your items |
| GET | `/api/items/:id` | Get one item |
| POST | `/api/items` | Create an item |
| PUT | `/api/items/:id` | Update an item |
| DELETE | `/api/items/:id` | Delete an item |

### Example usage (curl)

```bash
# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"me@example.com","password":"supersecure123","name":"Jane"}'

# Login (if email confirmation is off, this works right after register)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"me@example.com","password":"supersecure123"}'

# -> { "access_token": "eyJhbGciOi...", ... }

# Create an item (replace TOKEN with the access_token above)
curl -X POST http://localhost:3001/api/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"title":"My first item","description":"Hello world"}'

# List items
curl http://localhost:3001/api/items -H "Authorization: Bearer TOKEN"

# Logout (revokes the session/refresh token)
curl -X POST http://localhost:3001/api/auth/logout -H "Authorization: Bearer TOKEN"
```

---

## Security features included

- **Supabase Auth** handles password hashing, JWT signing, and session/token verification — no custom auth code to get wrong
- **Bearer authentication** on every protected route, verified via `supabase.auth.getUser(token)`
- **Row Level Security** on `items` — the *only* line of defense given the anon key has no inherent privileges, and it's enforced by Postgres itself, not application code
- **Per-request scoped Postgres client**: each request builds a Supabase client carrying the caller's own JWT, so queries always run "as" that user
- **Only the anon/public key is ever used** — the service_role key is never referenced anywhere in this codebase
- **Input validation** on every route (`express-validator`)
- **Helmet** for secure HTTP headers
- **Rate limiting**: global limiter + a stricter one on `/auth/login` and `/auth/register`
- **CORS** configurable via `CORS_ORIGIN`
- Centralized error handler that hides internal error details in production (`NODE_ENV=production`)

## Project structure

```
secure-api/
├── config/
│   └── supabase.js        # anon client + per-user scoped client factory
├── docs/
│   └── swagger.js         # Swagger/OpenAPI spec generation
├── middleware/
│   └── auth.js            # verifies Supabase JWT, attaches scoped client
├── routes/
│   ├── auth.js             # register / login / logout / me (Supabase Auth)
│   └── items.js            # example CRUD resource (RLS-protected)
├── supabase_schema.sql     # run this in Supabase's SQL editor
├── .env.example
├── server.js                # app entrypoint
└── package.json
```

## Adding your own CRUD resource

1. In Supabase's SQL editor, create a new table with a `user_id uuid not null references auth.users(id) default auth.uid()` column.
2. Enable RLS and add the 4 policies (select/insert/update/delete, each checking `auth.uid() = user_id`) — copy the pattern from `supabase_schema.sql`.
3. Copy `routes/items.js` to `routes/yourthing.js`, swap the table name, use `req.supabase` for every query exactly like `items.js` does.
4. Register it in `server.js`:
   ```js
   const yourthingRoutes = require('./routes/yourthing');
   app.use('/api/yourthing', yourthingRoutes);
   ```
5. It'll automatically appear in Swagger docs (picked up from `./routes/*.js`).

## Notes on logout behaviour

`POST /api/auth/logout` calls Supabase's `signOut()`, which revokes the session's refresh token server-side — so the session can't be silently renewed. Like any stateless JWT system, the specific access token the user already has remains cryptographically valid until it naturally expires (Supabase's default access token lifetime is 1 hour). This is standard Supabase Auth behaviour, not a bug — if you need instant, hard revocation of the exact token in use, that requires either short-lived tokens (lower the expiry in Supabase Auth settings) or a server-side token blacklist backed by elevated privileges, which is out of scope here since this project intentionally never uses the service_role key.
