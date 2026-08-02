-- ==========================================================
-- Run this entire file in Supabase -> SQL Editor -> New query
-- ==========================================================

create extension if not exists "uuid-ossp";

-- Users table (our own auth, not Supabase Auth)
create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  password_hash text not null,
  name text,
  created_at timestamptz not null default now()
);

-- Example CRUD resource, owned by a user
create table if not exists items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  title text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Revoked JWTs (used to support real /auth/logout)
create table if not exists revoked_tokens (
  token text primary key,
  expires_at timestamptz not null
);

create index if not exists idx_items_user_id on items(user_id);
create index if not exists idx_revoked_tokens_expires_at on revoked_tokens(expires_at);

-- ----------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------
-- The API server talks to Supabase using the SERVICE ROLE key,
-- which always bypasses RLS. All access control (who can read/
-- write which row) is enforced in the Express app itself via the
-- JWT + WHERE user_id = <current user> checks in routes/items.js.
--
-- We still enable RLS with no policies as defense-in-depth: it
-- guarantees that if the anon/public key were ever leaked or used
-- directly against Supabase, no data could be read or written.
alter table users enable row level security;
alter table items enable row level security;
alter table revoked_tokens enable row level security;
-- (No policies are created on purpose: only the service_role key,
--  which bypasses RLS, can access these tables.)
