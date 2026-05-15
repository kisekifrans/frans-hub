-- Creator storefront collections

create table if not exists collections (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  slug text not null,
  title text not null,
  description text not null default '',
  hero_gif_url text,
  review_text text,
  seo_title text,
  seo_description text,
  enabled boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, slug)
);

create index if not exists collections_profile_slug_idx on collections (profile_id, slug);

create table if not exists collection_gallery_images (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references collections(id) on delete cascade,
  url text not null,
  alt text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists collection_gallery_collection_order_idx
  on collection_gallery_images (collection_id, sort_order);

create table if not exists collection_products (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references collections(id) on delete cascade,
  title text not null,
  description text not null default '',
  image_url text,
  gif_url text,
  affiliate_url text not null,
  cta_label text not null default 'Shop now',
  review_text text,
  sort_order integer not null default 0,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists collection_products_collection_order_idx
  on collection_products (collection_id, sort_order);

alter table analytics_events
  add column if not exists collection_id uuid references collections(id) on delete set null;

alter table analytics_events
  add column if not exists product_id uuid references collection_products(id) on delete set null;

alter table collections enable row level security;
alter table collection_gallery_images enable row level security;
alter table collection_products enable row level security;

drop policy if exists "public_read_enabled_collections" on collections;
create policy "public_read_enabled_collections" on collections for select using (enabled = true);

drop policy if exists "admin_manage_collections" on collections;
create policy "admin_manage_collections" on collections for all
  using ((auth.jwt() ->> 'email') = 'putuagisna@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'putuagisna@gmail.com');

drop policy if exists "public_read_collection_gallery" on collection_gallery_images;
create policy "public_read_collection_gallery" on collection_gallery_images for select using (
  exists (
    select 1 from collections c
    where c.id = collection_id and c.enabled = true
  )
);

drop policy if exists "admin_manage_collection_gallery" on collection_gallery_images;
create policy "admin_manage_collection_gallery" on collection_gallery_images for all
  using ((auth.jwt() ->> 'email') = 'putuagisna@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'putuagisna@gmail.com');

drop policy if exists "public_read_enabled_collection_products" on collection_products;
create policy "public_read_enabled_collection_products" on collection_products for select using (
  enabled = true
  and exists (
    select 1 from collections c
    where c.id = collection_id and c.enabled = true
  )
);

drop policy if exists "admin_manage_collection_products" on collection_products;
create policy "admin_manage_collection_products" on collection_products for all
  using ((auth.jwt() ->> 'email') = 'putuagisna@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'putuagisna@gmail.com');
