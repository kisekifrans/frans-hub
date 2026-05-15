-- Extended collection CMS fields

alter table collections
  add column if not exists hero_image_url text,
  add column if not exists hero_image_storage_path text,
  add column if not exists hero_gif_storage_path text,
  add column if not exists hero_video_url text,
  add column if not exists accent_color text,
  add column if not exists gradient_preset text not null default 'violet'
    check (gradient_preset in ('violet', 'rose', 'fuchsia', 'sunset', 'midnight')),
  add column if not exists layout_style text not null default 'editorial'
    check (layout_style in ('editorial', 'grid', 'compact'));

alter table collection_products
  add column if not exists image_storage_path text,
  add column if not exists gif_storage_path text,
  add column if not exists category text,
  add column if not exists tags jsonb not null default '[]'::jsonb;
