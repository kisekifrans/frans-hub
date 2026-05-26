-- Replace all hardcoded admin-email checks with site_admins lookup.
-- After this migration, rotating the admin email is a single insert into
-- public.site_admins instead of an SQL migration.
--
-- Migration 016 must run first (creates site_admins, is_site_admin(),
-- user_owns_profile(), can_manage_profile(), is_legacy_admin_email()).
--
-- Strategy: keep is_legacy_admin_email() in policies as a fallback during
-- rollout so the original admin keeps access if site_admins is empty.

-- Helper: short-form admin check used by every policy below.
create or replace function public.is_admin_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_site_admin() or public.is_legacy_admin_email();
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
drop policy if exists "admin_manage_profiles" on profiles;
create policy "admin_manage_profiles" on profiles
  for all
  using (public.is_admin_user())
  with check (public.is_admin_user());

-- ---------------------------------------------------------------------------
-- blocks (admin override; owner policy from 016 covers normal users)
-- ---------------------------------------------------------------------------
drop policy if exists "admin_read_blocks" on blocks;
create policy "admin_read_blocks" on blocks
  for select
  using (public.is_admin_user());

drop policy if exists "admin_manage_blocks" on blocks;
create policy "admin_manage_blocks" on blocks
  for all
  using (public.is_admin_user())
  with check (public.is_admin_user());

-- ---------------------------------------------------------------------------
-- analytics_events (admin read; public insert + owner read remain)
-- ---------------------------------------------------------------------------
drop policy if exists "admin_read_analytics" on analytics_events;
create policy "admin_read_analytics" on analytics_events
  for select
  using (public.is_admin_user());

-- ---------------------------------------------------------------------------
-- collections / collection_gallery_images / collection_products
-- ---------------------------------------------------------------------------
drop policy if exists "admin_manage_collections" on collections;
create policy "admin_manage_collections" on collections
  for all
  using (public.is_admin_user())
  with check (public.is_admin_user());

drop policy if exists "admin_manage_collection_gallery" on collection_gallery_images;
create policy "admin_manage_collection_gallery" on collection_gallery_images
  for all
  using (public.is_admin_user())
  with check (public.is_admin_user());

drop policy if exists "admin_manage_collection_products" on collection_products;
create policy "admin_manage_collection_products" on collection_products
  for all
  using (public.is_admin_user())
  with check (public.is_admin_user());

-- ---------------------------------------------------------------------------
-- audit dashboard
-- ---------------------------------------------------------------------------
drop policy if exists "admin_manage_audit_sessions" on audit_sessions;
create policy "admin_manage_audit_sessions" on audit_sessions
  for all
  using (public.is_admin_user())
  with check (public.is_admin_user());

drop policy if exists "admin_manage_audit_rows" on audit_rows;
create policy "admin_manage_audit_rows" on audit_rows
  for all
  using (public.is_admin_user())
  with check (public.is_admin_user());

drop policy if exists "admin_manage_audit_progress" on audit_progress;
create policy "admin_manage_audit_progress" on audit_progress
  for all
  using (public.is_admin_user())
  with check (public.is_admin_user());

-- ---------------------------------------------------------------------------
-- gear
-- ---------------------------------------------------------------------------
drop policy if exists "admin_manage_gear_settings" on gear_page_settings;
create policy "admin_manage_gear_settings" on gear_page_settings
  for all
  using (public.is_admin_user())
  with check (public.is_admin_user());

drop policy if exists "admin_manage_gear_categories" on gear_categories;
create policy "admin_manage_gear_categories" on gear_categories
  for all
  using (public.is_admin_user())
  with check (public.is_admin_user());

drop policy if exists "admin_read_gear_items" on gear_items;
create policy "admin_read_gear_items" on gear_items
  for select
  using (public.is_admin_user());

drop policy if exists "admin_manage_gear_items" on gear_items;
create policy "admin_manage_gear_items" on gear_items
  for all
  using (public.is_admin_user())
  with check (public.is_admin_user());

-- ---------------------------------------------------------------------------
-- finance (admin override; owner policies from 016 cover normal users)
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
  tables text[] := array[
    'finance_categories',
    'finance_payment_methods',
    'finance_budget_periods',
    'finance_budget_limits',
    'finance_transactions',
    'finance_subscriptions',
    'finance_import_jobs'
  ];
begin
  foreach t in array tables
  loop
    execute format('drop policy if exists "admin_manage_%s" on %I', t, t);
    execute format(
      'create policy "admin_manage_%s" on %I for all
         using (public.is_admin_user())
         with check (public.is_admin_user())',
      t, t
    );
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- edge cases
-- ---------------------------------------------------------------------------
drop policy if exists "admin_manage_edge_cases" on edge_cases;
create policy "admin_manage_edge_cases" on edge_cases
  for all
  using (public.is_admin_user())
  with check (public.is_admin_user());

-- ---------------------------------------------------------------------------
-- Storage policies
-- ---------------------------------------------------------------------------
drop policy if exists "admin_upload_hub_assets" on storage.objects;
create policy "admin_upload_hub_assets" on storage.objects
  for all
  using (bucket_id = 'hub-assets' and public.is_admin_user())
  with check (bucket_id = 'hub-assets' and public.is_admin_user());

drop policy if exists "admin_manage_finance_imports" on storage.objects;
create policy "admin_manage_finance_imports" on storage.objects
  for all
  using (bucket_id = 'finance-imports' and public.is_admin_user())
  with check (bucket_id = 'finance-imports' and public.is_admin_user());

drop policy if exists "admin_manage_edgecases_videos" on storage.objects;
create policy "admin_manage_edgecases_videos" on storage.objects
  for all
  using (bucket_id = 'edgecases-videos' and public.is_admin_user())
  with check (bucket_id = 'edgecases-videos' and public.is_admin_user());

-- After this migration, populate site_admins for your account so the
-- legacy email fallback can eventually be removed:
--
--   insert into site_admins (user_id)
--     select id from auth.users where email = 'your-admin-email@example.com'
--   on conflict do nothing;
