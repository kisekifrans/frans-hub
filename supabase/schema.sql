-- Run in Supabase SQL Editor. Replace admin email if needed.

create extension if not exists "pgcrypto";

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null default 'main',
  username text not null default 'frans',
  display_name text not null default 'Frans Hub',
  bio text not null default '',
  avatar_url text,
  theme text not null default 'violet' check (theme in ('violet', 'cyan', 'rose', 'emerald')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists blocks (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  type text not null check (type in ('link', 'gif', 'tiktok', 'instagram')),
  enabled boolean not null default true,
  sort_order integer not null default 0,
  title text,
  url text,
  accent text,
  thumbnail_url text,
  thumbnail_layout text check (thumbnail_layout in ('side', 'banner')),
  storage_path text,
  alt text,
  caption text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blocks_profile_order_idx on blocks (profile_id, sort_order);

create table if not exists analytics_events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  block_id uuid references blocks(id) on delete set null,
  event_type text not null check (event_type in ('view', 'click')),
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_profile_created_idx
  on analytics_events (profile_id, created_at desc);

-- Storage bucket (Dashboard → Storage → New bucket: hub-assets, public)
-- Then run storage policies below.

alter table profiles enable row level security;
alter table blocks enable row level security;
alter table analytics_events enable row level security;

drop policy if exists "public_read_profiles" on profiles;
create policy "public_read_profiles" on profiles for select using (true);

drop policy if exists "admin_manage_profiles" on profiles;
create policy "admin_manage_profiles" on profiles for all
  using ((auth.jwt() ->> 'email') = 'putuagisna@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'putuagisna@gmail.com');

drop policy if exists "public_read_enabled_blocks" on blocks;
create policy "public_read_enabled_blocks" on blocks for select using (enabled = true);

drop policy if exists "admin_read_blocks" on blocks;
create policy "admin_read_blocks" on blocks for select
  using ((auth.jwt() ->> 'email') = 'putuagisna@gmail.com');

drop policy if exists "admin_manage_blocks" on blocks;
create policy "admin_manage_blocks" on blocks for all
  using ((auth.jwt() ->> 'email') = 'putuagisna@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'putuagisna@gmail.com');

drop policy if exists "public_insert_analytics" on analytics_events;
create policy "public_insert_analytics" on analytics_events for insert with check (true);

drop policy if exists "admin_read_analytics" on analytics_events;
create policy "admin_read_analytics" on analytics_events for select
  using ((auth.jwt() ->> 'email') = 'putuagisna@gmail.com');

-- Storage policies (bucket: hub-assets)
-- insert into storage.buckets (id, name, public) values ('hub-assets', 'hub-assets', true) on conflict do nothing;

drop policy if exists "public_read_hub_assets" on storage.objects;
create policy "public_read_hub_assets" on storage.objects for select
  using (bucket_id = 'hub-assets');

drop policy if exists "admin_upload_hub_assets" on storage.objects;
create policy "admin_upload_hub_assets" on storage.objects for all
  using (
    bucket_id = 'hub-assets'
    and (auth.jwt() ->> 'email') = 'putuagisna@gmail.com'
  )
  with check (
    bucket_id = 'hub-assets'
    and (auth.jwt() ->> 'email') = 'putuagisna@gmail.com'
  );

insert into profiles (slug, username, display_name, bio, theme)
values ('main', 'frans', 'Frans Hub', 'Creator · Deals · Exclusive links below', 'violet')
on conflict (slug) do nothing;
