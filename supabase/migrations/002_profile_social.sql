-- Profile creator fields: verified badge, social links, avatar storage path

alter table profiles
  add column if not exists verified boolean not null default false,
  add column if not exists social_links jsonb not null default '[]'::jsonb,
  add column if not exists avatar_storage_path text;
