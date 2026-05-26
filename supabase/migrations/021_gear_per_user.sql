-- Per-user gear opt-in.
--
-- Until now the gear feature was site-owner only: only the admin email could
-- read/write gear, and the bare `/gear` route always read the "main" profile.
-- This migration extends gear to every signed-in user behind an opt-in flag.
--
-- Highlights:
--   1. profiles.gear_enabled: per-profile switch. Default false so existing
--      and new users don't accidentally expose an empty setup page.
--   2. Owner-scoped RLS on gear_categories / gear_items / gear_page_settings,
--      mirroring the same pattern used by blocks / finance.
--   3. Public read of gear is gated on the profile being gear_enabled AND
--      published, except admins / owners.
--   4. Backfill: the marketing site profile (slug = 'main') gets
--      gear_enabled = true so https://<host>/gear keeps working.

------------------------------------------------------------
-- 1. profile column
------------------------------------------------------------
alter table profiles
  add column if not exists gear_enabled boolean not null default false;

-- Existing site profile keeps its gear page live.
update profiles
   set gear_enabled = true
 where slug = 'main';

------------------------------------------------------------
-- 2. Per-profile ownership helper
------------------------------------------------------------
-- Returns true when the calling auth.uid() owns the given profile row.
create or replace function public.is_profile_owner(p_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles p
    where p.id = p_profile_id
      and p.user_id = auth.uid()
  );
$$;

------------------------------------------------------------
-- 3. gear_page_settings — owner manage + public read when enabled
------------------------------------------------------------
drop policy if exists "public_read_gear_settings" on gear_page_settings;
drop policy if exists "admin_manage_gear_settings" on gear_page_settings;
drop policy if exists "owner_manage_gear_settings" on gear_page_settings;
drop policy if exists "public_read_enabled_gear_settings" on gear_page_settings;

create policy "owner_manage_gear_settings" on gear_page_settings
  for all
  using (public.is_admin_user() or public.is_profile_owner(profile_id))
  with check (public.is_admin_user() or public.is_profile_owner(profile_id));

create policy "public_read_enabled_gear_settings" on gear_page_settings
  for select
  using (
    exists (
      select 1 from profiles p
      where p.id = gear_page_settings.profile_id
        and p.gear_enabled = true
        and coalesce(p.is_published, true) = true
    )
  );

------------------------------------------------------------
-- 4. gear_categories — same pattern
------------------------------------------------------------
drop policy if exists "public_read_gear_categories" on gear_categories;
drop policy if exists "admin_manage_gear_categories" on gear_categories;
drop policy if exists "owner_manage_gear_categories" on gear_categories;
drop policy if exists "public_read_enabled_gear_categories" on gear_categories;

create policy "owner_manage_gear_categories" on gear_categories
  for all
  using (public.is_admin_user() or public.is_profile_owner(profile_id))
  with check (public.is_admin_user() or public.is_profile_owner(profile_id));

create policy "public_read_enabled_gear_categories" on gear_categories
  for select
  using (
    exists (
      select 1 from profiles p
      where p.id = gear_categories.profile_id
        and p.gear_enabled = true
        and coalesce(p.is_published, true) = true
    )
  );

------------------------------------------------------------
-- 5. gear_items — owner manages, public reads only enabled items
--    on enabled+published profiles
------------------------------------------------------------
drop policy if exists "public_read_enabled_gear_items" on gear_items;
drop policy if exists "admin_read_gear_items" on gear_items;
drop policy if exists "admin_manage_gear_items" on gear_items;
drop policy if exists "owner_manage_gear_items" on gear_items;
drop policy if exists "public_read_enabled_gear_items_v2" on gear_items;

create policy "owner_manage_gear_items" on gear_items
  for all
  using (public.is_admin_user() or public.is_profile_owner(profile_id))
  with check (public.is_admin_user() or public.is_profile_owner(profile_id));

create policy "public_read_enabled_gear_items_v2" on gear_items
  for select
  using (
    enabled = true
    and exists (
      select 1 from profiles p
      where p.id = gear_items.profile_id
        and p.gear_enabled = true
        and coalesce(p.is_published, true) = true
    )
  );

------------------------------------------------------------
-- 6. Helpful index for the gear_enabled lookup
------------------------------------------------------------
create index if not exists profiles_gear_enabled_idx
  on profiles (gear_enabled)
  where gear_enabled = true;
