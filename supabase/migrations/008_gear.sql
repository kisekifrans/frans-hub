-- Gear showcase: categories, items, page settings

create table if not exists gear_page_settings (
  profile_id uuid primary key references profiles(id) on delete cascade,
  setup_description text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists gear_categories (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  slug text not null,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (profile_id, slug)
);

create index if not exists gear_categories_profile_order_idx
  on gear_categories (profile_id, sort_order);

create table if not exists gear_items (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  category_id uuid not null references gear_categories(id) on delete cascade,
  name text not null,
  description text not null default '',
  image_url text,
  storage_path text,
  image_focus jsonb,
  product_url text,
  price numeric(14, 2),
  price_currency text not null default 'IDR',
  featured boolean not null default false,
  enabled boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists gear_items_profile_order_idx
  on gear_items (profile_id, sort_order);

create index if not exists gear_items_category_order_idx
  on gear_items (category_id, sort_order);

create index if not exists gear_items_featured_idx
  on gear_items (profile_id, featured)
  where featured = true and enabled = true;

alter table gear_page_settings enable row level security;
alter table gear_categories enable row level security;
alter table gear_items enable row level security;

drop policy if exists "public_read_gear_settings" on gear_page_settings;
create policy "public_read_gear_settings" on gear_page_settings
  for select using (true);

drop policy if exists "admin_manage_gear_settings" on gear_page_settings;
create policy "admin_manage_gear_settings" on gear_page_settings for all
  using ((auth.jwt() ->> 'email') = 'putuagisna@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'putuagisna@gmail.com');

drop policy if exists "public_read_gear_categories" on gear_categories;
create policy "public_read_gear_categories" on gear_categories
  for select using (true);

drop policy if exists "admin_manage_gear_categories" on gear_categories;
create policy "admin_manage_gear_categories" on gear_categories for all
  using ((auth.jwt() ->> 'email') = 'putuagisna@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'putuagisna@gmail.com');

drop policy if exists "public_read_enabled_gear_items" on gear_items;
create policy "public_read_enabled_gear_items" on gear_items
  for select using (enabled = true);

drop policy if exists "admin_read_gear_items" on gear_items;
create policy "admin_read_gear_items" on gear_items for select
  using ((auth.jwt() ->> 'email') = 'putuagisna@gmail.com');

drop policy if exists "admin_manage_gear_items" on gear_items;
create policy "admin_manage_gear_items" on gear_items for all
  using ((auth.jwt() ->> 'email') = 'putuagisna@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'putuagisna@gmail.com');
