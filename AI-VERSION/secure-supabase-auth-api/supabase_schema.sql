-- ==========================================================
-- Run this entire file in Supabase -> SQL Editor -> New query
--
-- This project uses SUPABASE AUTH for users (the built-in
-- auth.users table) and the PUBLIC ANON KEY only - never the
-- service_role key. That means Row Level Security (RLS) is not
-- just a nice-to-have here, it is the ONLY thing enforcing that
-- users can only see/edit their own data. Read it carefully.
-- ==========================================================

create extension if not exists "uuid-ossp";

-- Example CRUD resource, owned by a Supabase Auth user.
create table if not exists items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  title text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_items_user_id on items(user_id);

-- ----------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------
alter table items enable row level security;

-- Users can only ever see their own rows
create policy "Users can view own items"
  on items for select
  using (auth.uid() = user_id);

-- Users can only insert rows for themselves
create policy "Users can insert own items"
  on items for insert
  with check (auth.uid() = user_id);

-- Users can only update their own rows
create policy "Users can update own items"
  on items for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Users can only delete their own rows
create policy "Users can delete own items"
  on items for delete
  using (auth.uid() = user_id);

-- No policy allows access without a matching auth.uid(), and there is no
-- policy at all for anonymous (unauthenticated) requests, so the anon key
-- alone - without a valid user JWT attached - cannot read or write this
-- table at all.
