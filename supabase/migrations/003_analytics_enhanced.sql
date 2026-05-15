-- Enhanced analytics: unique visitors, device/browser breakdown

alter table analytics_events
  add column if not exists visitor_id text,
  add column if not exists device_type text,
  add column if not exists browser text,
  add column if not exists os text;

create index if not exists analytics_events_profile_type_created_idx
  on analytics_events (profile_id, event_type, created_at desc);

create index if not exists analytics_events_profile_block_created_idx
  on analytics_events (profile_id, block_id, created_at desc)
  where block_id is not null;

create index if not exists analytics_events_profile_visitor_idx
  on analytics_events (profile_id, visitor_id)
  where visitor_id is not null;
