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

## Features

- Supabase Auth integration
- JWT verification middleware
- Protected Express routes
- OpenAPI / Swagger UI integration
- Bearer token authentication
- Correct HTTP status codes (`200`, `201`, `204`, `400`, `401`)

---

## ⚔️ AI vs Me (Assignment A4)

### Original Prompt Used

> "Integrate Supabase Auth into my existing Express Todo API. Implement Sign Up, Login, Logout, JWT verification middleware, protect authenticated routes, configure Swagger with Bearer authentication, and keep the existing task endpoints protected."

### Analysis & Differences Found

**1. What AI did better:**

- **Supabase SDK integration:** The AI correctly used the official authentication methods (`signUp`, `signInWithPassword`, `signOut`, and `getUser`) instead of manually handling passwords.
- **JWT verification middleware:** It created a reusable middleware that extracts the Bearer token from the `Authorization` header and validates it before allowing access to protected routes.
- **Swagger integration:** It configured the HTTP Bearer authentication scheme, allowing authenticated endpoints to be tested directly from Swagger UI.

**2. What AI got wrong or ignored:**

- Some responses initially returned incorrect HTTP status codes.
- The authentication middleware needed adjustments to correctly reject missing, expired, or tampered JWTs with `401 Unauthorized`.
- Some authentication error responses required refinement to fully match the assignment specification.

**3. What my prompt forgot to specify:**

- The exact HTTP status codes expected for every endpoint.
- That Swagger users should paste only the raw JWT (without the `Bearer` prefix).
- That the project must use only the Supabase public **anon** key and never the `service_role` key.

### Rematch

After refining the prompt with the required status codes, middleware behavior, Swagger configuration, and environment requirements, the regenerated implementation matched the assignment requirements while keeping the authentication flow clean and reusable.

## AI Usage

AI was used as a learning, code-review, and debugging partner to better understand:

- Supabase Auth SDK integration (`signUp`, `signInWithPassword`, `signOut`, `getUser`)
- Extracting and verifying JWT Bearer tokens in Express middleware
- Configuring OpenAPI Bearer security for Swagger UI
- Structuring HTTP status codes correctly (`200`, `201`, `204`, `400`, `401`)
- Creating this README