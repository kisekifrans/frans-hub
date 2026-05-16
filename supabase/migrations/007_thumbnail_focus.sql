-- Thumbnail focal point / zoom for link blocks (object-position + scale)

alter table blocks
  add column if not exists thumbnail_focus jsonb;
