-- Track which Supabase user created each academicaudit backend session so
-- /api/tools/academicaudit/download/[sessionId] can enforce ownership.
--
-- Without this, any authenticated user could enumerate session IDs and
-- download other users' uploaded papers.

create table if not exists academicaudit_sessions (
  session_id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists academicaudit_sessions_user_idx
  on academicaudit_sessions (user_id, created_at desc);

alter table academicaudit_sessions enable row level security;

drop policy if exists "user_manage_own_audit_sessions" on academicaudit_sessions;
create policy "user_manage_own_audit_sessions" on academicaudit_sessions
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Admin override for support.
drop policy if exists "admin_read_audit_sessions" on academicaudit_sessions;
create policy "admin_read_audit_sessions" on academicaudit_sessions
  for select
  using (
    public.is_site_admin() or public.is_legacy_admin_email()
  );
