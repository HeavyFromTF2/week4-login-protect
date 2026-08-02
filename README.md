# 🚀 Todo List API - FlyRank Week 4

Task management REST API built for the FlyRank Backend Internship.

---

# 🔒 Assignment A4 – Auth: Login & Protect

This version integrates **Supabase Auth** as the Identity Provider to manage user authentication (Sign Up, Log In, Log Out) and uses a custom Express middleware to verify JSON Web Tokens (JWTs) and protect authenticated endpoints.

## Environment Setup

Copy the example environment file before starting:

```bash
cp .env.example .env
```

Configure your `.env` file:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_public_key
PORT=3000
```

> **Note:** Always use the public **anon** key, never the `service_role` key.

## Run

```bash
npm install
npm start
```

API: `http://localhost:3000`

Swagger: `http://localhost:3000/docs`

## Endpoints

### Public

- `POST /auth/signup`
- `POST /auth/login`
- `GET /public/info`

### Protected (Bearer Token Required)

- `POST /auth/logout`
- `GET /protected/profile`
- `GET /tasks`
- `POST /tasks`

## Authentication

Protected endpoints require a valid **Bearer JWT**.

### Using Swagger UI

1. Call `POST /auth/login`.
2. Copy the returned `access_token`.
3. Click **Authorize** in Swagger UI.
4. Paste **only** the JWT (do **not** include `Bearer`).
5. Execute any protected endpoint.

## Example Requests

### Sign Up & Log In

```bash
# Register a new user
curl -i -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Log in to receive the access token
curl -i -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Access Protected Endpoint

```bash
# Access protected profile with valid Bearer token (200 OK)
curl -i http://localhost:3000/protected/profile \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"

# Access protected profile with missing/invalid token (401 Unauthorized)
curl -i http://localhost:3000/protected/profile \
  -H "Authorization: Bearer invalid_or_tampered_token"
```

### Proof Images

Supabase.com dashboard health status:
<img width="1200" height="870" alt="supa functional" src="https://github.com/user-attachments/assets/8024631e-46c4-48f2-9f19-f340e1c29fc5" />

Token being used to autenticate successfully:
<img width="800" height="600" alt="Bearer1" src="https://github.com/user-attachments/assets/ca7e15e3-420c-47b4-9990-534053c1bfb5" />

Fetch autenticated user private profile:
<img width="1546" height="903" alt="image" src="https://github.com/user-attachments/assets/e16f87e5-629f-40b3-bdaf-135081a5343f" />

Task being created after being logged in with a JWT:
<img width="800" height="600" alt="Bearer3" src="https://github.com/user-attachments/assets/8cc8fdc9-addd-4559-bd3e-f5ea8bace3e1" />


## Features

- Supabase Auth integration
- JWT verification middleware
- Protected Express routes
- OpenAPI / Swagger UI integration
- Bearer token authentication
- Correct HTTP status codes (`200`, `201`, `204`, `400`, `401`)


## ⚔️ AI vs Me (Stage 7 - AI Rematch)

### Original Prompt Used

> "I want you to make a secure api using node js, swagger and express. It should be able to make all crud operations, and it must also have a login system (with login and logout), with JWT tokens, protected routes. Use a postgres BD with the supabase as the BaaS service, and use bearer auth. Send me the whole project ready to be ran. Make it as simple as possible with every feature implemented."

### Analysis & Differences Found

1. **What AI did better:**
   * **Swagger UI Integration**: The AI automatically generated interactive OpenAPI docs directly from JSDoc annotations in routes, keeping the `/api-docs` endpoint fully testable and polished.
   * **Input Validation Details**: It  caught client-side payload issues early, returning detailed validation arrays (e.g., enforcing `Password must be at least 8 characters long` with a 400 Bad Request before hitting the DB).

2. **What AI got wrong or ignored (Breaking the requirements & Security Flaws):**
   * **Critical Security Violation (`service_role` vs `anon`)**: The AI instructed me to use `SUPABASE_SERVICE_ROLE_KEY` in `.env` instead of using the public `anon` key alongside Supabase Auth's native token verification (`supabase.auth.getUser()`), which is a critical flaw.
   * **Re-inventing the Wheel**: Instead of using Supabase Auth as the Identity Provider (IdP) for account creation, login, and token generation, it built a manual local auth system using `bcrypt` and custom JWT signing with a separate `users` and `revoked_tokens` SQL table.
   * **RLS Crashes**: When forced to run with the public `anon` key, the AI's endpoint crashed with a `500 Internal Server Error`. As captured in the Supabase Postgres logs (`new row violates row-level security policy for table "users"`), its manual `INSERT` queries broke because no RLS policies were configured for custom user tables.

<img width="1000" height="740" alt="Supabase first prompt" src="https://github.com/user-attachments/assets/dfec2039-7de8-4263-8dbb-b9298c029448" />


3. **What my prompt forgot to specify:**
   * I forgot to specify using **Supabase Auth SDK directly** (`signUp`, `signInWithPassword`, `signOut`), which led the AI to construct its own local authentication scheme.
   * I didn't enforce using the **public `anon` key**, causing the AI to default to the dangerous `service_role` key thinking it would be something pretty obvious.
   * I didn't enforce the modular directory structure used so far.

### Rematch

After updating the prompt to explicitly enforce: *"Use Supabase Auth directly for authentication, and use postgres via Supabase as the BaaS service with the public anon key (never use the service_role key)"*, the regenerated code successfully eliminated the custom auth/bcrypt overhead, properly integrated native Supabase Auth methods, securely enforced Row Level Security (RLS), and resolved all previous 500 server crashes (now correctly forwarding native Supabase Auth responses like `email rate limit exceeded` via 400 Bad Request).

<img width="1000" height="740" alt="email rate limit (2) exceeded" src="https://github.com/user-attachments/assets/d8ef0fac-cac8-463f-9623-8888c947324b" />


## AI Usage

AI was used as a learning, code-review, and debugging partner to better understand:

- Supabase Auth SDK integration (`signUp`, `signInWithPassword`, `signOut`, `getUser`)
- Extracting and verifying JWT Bearer tokens in Express middleware
- Configuring OpenAPI Bearer security for Swagger UI
- Structuring HTTP status codes correctly (`200`, `201`, `204`, `400`, `401`)
- Creating this README
