-- Admin edge cases library (AtlasCapture-style direct playback)

create table if not exists edge_cases (
  id uuid primary key default gen_random_uuid(),
  episode_id text,
  qa_url text,
  video_url text,
  thumbnail_url text,
  project_name text,
  task_id text,
  task_description text,
  title text not null default '',
  description text not null default '',
  decision text check (decision in ('approve', 'reject', 'pending')),
  reject_reason text,
  tags text[] not null default '{}',
  notes text,
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists edge_cases_created_idx
  on edge_cases (created_at desc);

create index if not exists edge_cases_project_idx
  on edge_cases (project_name);

create index if not exists edge_cases_decision_idx
  on edge_cases (decision);

create index if not exists edge_cases_favorite_idx
  on edge_cases (is_favorite) where is_favorite = true;

create index if not exists edge_cases_episode_idx
  on edge_cases (episode_id);

alter table edge_cases enable row level security;

drop policy if exists "admin_manage_edge_cases" on edge_cases;
create policy "admin_manage_edge_cases" on edge_cases for all
  using ((auth.jwt() ->> 'email') = 'putuagisna@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'putuagisna@gmail.com');
