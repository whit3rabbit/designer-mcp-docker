/**
 * Supabase Auth (Outside Service) + Row-Level Security (RLS) Adapter Template
 * Install: pnpm add @supabase/supabase-js @supabase/ssr
 * Required env vars (.env):
 *   - Client-safe: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
 *   - Server-ONLY (NEVER prefix with NEXT_PUBLIC_ or VITE_): SUPABASE_SERVICE_ROLE_KEY
 */
export const SUPABASE_ENV_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
] as const;

export const SUPABASE_SQL_RBAC = `
-- Run in Supabase SQL Editor to separate user vs admin roles cleanly:
-- CRITICAL: Never store roles or is_admin in auth.users.raw_user_meta_data (user_metadata),
-- because authenticated users can call supabase.auth.updateUser({ data }) to self-escalate!
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'user' check (role in ('user', 'manager', 'admin', 'superadmin')),
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "Users read own profile" on public.profiles
  for select using (auth.uid() = id);

-- Use a SECURITY DEFINER helper (or JWT app_metadata claim) to avoid PostgreSQL
-- RLS infinite recursion (42P17) when querying public.profiles inside its own policy.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'superadmin')
  );
$$;

create policy "Admins read all profiles" on public.profiles
  for select using (public.is_admin());

-- Note: Any SQL view over auth.users must use WITH (security_invoker = true) and explicit grants.
-- Use @supabase/ssr (HttpOnly cookies) instead of localStorage for SSR/Next.js apps.
`;
