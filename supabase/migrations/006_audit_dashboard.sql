-- CSV audit dashboard (admin-only QA)

create table if not exists audit_sessions (
  id uuid primary key default gen_random_uuid(),
  admin_email text not null,
  file_name text not null,
  original_headers jsonb not null default '[]'::jsonb,
  column_map jsonb not null default '{}'::jsonb,
  row_count integer not null default 0,
  reviewed_count integer not null default 0,
  agreed_count integer not null default 0,
  disagreed_count integer not null default 0,
  progress_percent numeric(5, 2) not null default 0,
  status text not null default 'in_progress'
    check (status in ('in_progress', 'completed', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_opened_at timestamptz not null default now()
);

create index if not exists audit_sessions_admin_opened_idx
  on audit_sessions (admin_email, last_opened_at desc);

create table if not exists audit_rows (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references audit_sessions(id) on delete cascade,
  row_index integer not null,
  row_data jsonb not null default '{}'::jsonb,
  admin_decision text check (admin_decision in ('agree', 'disagree')),
  admin_reject_reason text,
  admin_reject_note text,
  audit_completed boolean not null default false,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_id, row_index)
);

create index if not exists audit_rows_session_idx on audit_rows (session_id, row_index);
create index if not exists audit_rows_session_reviewed_idx
  on audit_rows (session_id, audit_completed);

create table if not exists audit_progress (
  session_id uuid primary key references audit_sessions(id) on delete cascade,
  current_row_index integer not null default 0,
  filter_state jsonb not null default '{}'::jsonb,
  last_autosave_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table audit_sessions enable row level security;
alter table audit_rows enable row level security;
alter table audit_progress enable row level security;

drop policy if exists "admin_manage_audit_sessions" on audit_sessions;
create policy "admin_manage_audit_sessions" on audit_sessions for all
  using ((auth.jwt() ->> 'email') = 'putuagisna@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'putuagisna@gmail.com');

drop policy if exists "admin_manage_audit_rows" on audit_rows;
create policy "admin_manage_audit_rows" on audit_rows for all
  using ((auth.jwt() ->> 'email') = 'putuagisna@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'putuagisna@gmail.com');

drop policy if exists "admin_manage_audit_progress" on audit_progress;
create policy "admin_manage_audit_progress" on audit_progress for all
  using ((auth.jwt() ->> 'email') = 'putuagisna@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'putuagisna@gmail.com');
