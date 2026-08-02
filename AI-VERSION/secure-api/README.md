# Secure Supabase API

A simple, secure REST API built with **Node.js + Express**, documented with **Swagger**, backed by **Postgres via Supabase**, with a full **JWT login/logout system** and **Bearer-token protected routes**.

Includes one example CRUD resource (`items`), owned per-user, that you can duplicate for any other resource.

---

## 1. Create your Supabase project

1. Go to https://supabase.com and sign in (or create a free account).
2. Click **New Project**.
   - **Name**: anything, e.g. `secure-api`
   - **Database password**: pick a strong password and save it somewhere (you won't need it for this project, but keep it safe).
   - **Region**: pick the one closest to you.
3. Wait ~1-2 minutes for the project to finish provisioning.

## 2. Create the database tables

1. In your Supabase project, open **SQL Editor** (left sidebar) → **New query**.
2. Copy the entire contents of `supabase_schema.sql` (included in this project) and paste it in.
3. Click **Run**.

This creates 3 tables:
- `users` — email, hashed password, name
- `items` — the example CRUD resource, one row per item, linked to a user
- `revoked_tokens` — used to make `/auth/logout` actually invalidate a JWT

It also enables Row Level Security on all 3 tables with **no policies**. That's intentional: our API talks to Supabase using the `service_role` key, which always bypasses RLS, and all access control is handled by the Express app itself. This just means that if the public/anon key ever leaked, it still couldn't read or write any of this data.

## 3. Get your API credentials

In your Supabase project, go to **Project Settings → API**. You need two values:

| Value | Where to find it | Goes into |
|---|---|---|
| **Project URL** | "Project URL" field, looks like `https://xxxxxxxxxxxx.supabase.co` | `SUPABASE_URL` |
| **service_role key** | Under "Project API keys" → `service_role` (click "Reveal") | `SUPABASE_SERVICE_ROLE_KEY` |

⚠️ **Never** use the `anon`/`public` key for this project, and never expose the `service_role` key to a frontend/browser — it has full read/write access to your database and bypasses all security rules. It must only ever live in your server's `.env` file.

## 4. Configure the project

```bash
cp .env.example .env
```

Open `.env` and fill in:

```env
PORT=3000
NODE_ENV=development

SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...        # the service_role key from step 3

JWT_SECRET=                              # see below
JWT_EXPIRES_IN=1h

CORS_ORIGIN=*
```

Generate a strong `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Paste the output as `JWT_SECRET`.

## 5. Install & run

```bash
npm install
npm start
```

You should see:

```
Server running on http://localhost:3000
Swagger docs at   http://localhost:3000/api-docs
```

Open **http://localhost:3000/api-docs** in your browser for interactive Swagger docs where you can try every endpoint.

For development with auto-restart on file changes:

```bash
npm run dev
```

---

## API overview

Base URL: `http://localhost:3000`

### Auth (`/api/auth`)

| Method | Route | Auth? | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create a user, returns a JWT |
| POST | `/api/auth/login` | No | Log in, returns a JWT |
| POST | `/api/auth/logout` | **Yes** | Revokes the current JWT |
| GET | `/api/auth/me` | **Yes** | Returns the logged-in user |

### Items — example CRUD resource (`/api/items`)

All routes below require `Authorization: Bearer <token>` and only ever return/modify items owned by the logged-in user.

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
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"me@example.com","password":"supersecure123","name":"Jane"}'

# -> { "user": {...}, "token": "eyJhbGciOi..." }

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"me@example.com","password":"supersecure123"}'

# Create an item (replace TOKEN)
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"title":"My first item","description":"Hello world"}'

# List items
curl http://localhost:3000/api/items -H "Authorization: Bearer TOKEN"

# Logout (revokes the token — using it again will now fail)
curl -X POST http://localhost:3000/api/auth/logout -H "Authorization: Bearer TOKEN"
```

---

## Security features included

- **Password hashing** with bcrypt (12 salt rounds)
- **JWT** bearer authentication, configurable expiry
- **Real logout**: tokens are stored in a `revoked_tokens` table and rejected by the auth middleware after logout, instead of just deleting them client-side
- **Per-user data isolation**: every query on `items` filters by `user_id`, so users can never read/write each other's data
- **Input validation** on every route (`express-validator`)
- **Helmet** for secure HTTP headers
- **Rate limiting**: global limiter + a stricter one on `/auth/login` and `/auth/register` to slow down brute force
- **CORS** configurable via `CORS_ORIGIN`
- **service_role key stays server-side only**, RLS enabled as defense-in-depth on all tables
- Centralized error handler that hides internal error details in production (`NODE_ENV=production`)

## Project structure

```
secure-api/
├── config/
│   └── supabase.js        # Supabase client (service_role key)
├── docs/
│   └── swagger.js         # Swagger/OpenAPI spec generation
├── middleware/
│   └── auth.js            # JWT verification + revocation check
├── routes/
│   ├── auth.js            # register / login / logout / me
│   └── items.js           # example CRUD resource
├── supabase_schema.sql    # run this in Supabase's SQL editor
├── .env.example
├── server.js               # app entrypoint
└── package.json
```

## Adding your own CRUD resource

1. Create a new table in Supabase (SQL editor), following the pattern of `items` (include a `user_id uuid references users(id)` column if it should be owned per-user).
2. Copy `routes/items.js` to `routes/yourthing.js` and change the table name / fields.
3. Register it in `server.js`:
   ```js
   const yourthingRoutes = require('./routes/yourthing');
   app.use('/api/yourthing', yourthingRoutes);
   ```
4. It'll automatically show up in Swagger docs since it's picked up from `./routes/*.js`.

## Notes

- This project implements **its own** user table and JWT auth rather than using Supabase Auth, so you have a self-contained, portable auth system (useful if you want to swap Supabase out later — only `config/supabase.js` and the SQL would need to change).
- Expired/revoked tokens accumulate in `revoked_tokens`. For a production system, add a scheduled job (e.g. Supabase's `pg_cron` or an external cron) to delete rows where `expires_at < now()`.
