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

## AI Usage

AI was used as a learning, code-review, and debugging partner to better understand:

- Supabase Auth SDK integration (`signUp`, `signInWithPassword`, `signOut`, `getUser`)
- Extracting and verifying JWT Bearer tokens in Express middleware
- Configuring OpenAPI Bearer security for Swagger UI
- Structuring HTTP status codes correctly (`200`, `201`, `204`, `400`, `401`)
- Creating this README
