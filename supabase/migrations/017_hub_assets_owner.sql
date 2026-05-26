-- Owner-scoped writes for the public link-hub assets bucket.
-- Without this, every non-admin user gets RLS denied when uploading
-- thumbnails / GIFs / avatars through components/admin/MediaUpload.tsx.
--
-- Path convention (see lib/supabase/hub-service.ts -> assetPath):
--   <profileId>/<thumbnails|gifs|avatars|gear>/<filename>
-- The first folder segment must equal the caller's profile id.

drop policy if exists "owner_manage_hub_assets" on storage.objects;
create policy "owner_manage_hub_assets" on storage.objects
  for all
  using (
    bucket_id = 'hub-assets'
    and (
      public.is_site_admin()
      or public.is_legacy_admin_email()
      or exists (
        select 1 from profiles p
        where p.user_id = auth.uid()
          and (storage.foldername(name))[1] = p.id::text
      )
    )
  )
  with check (
    bucket_id = 'hub-assets'
    and (
      public.is_site_admin()
      or public.is_legacy_admin_email()
      or exists (
        select 1 from profiles p
        where p.user_id = auth.uid()
          and (storage.foldername(name))[1] = p.id::text
      )
    )
  );

-- public_read_hub_assets from schema.sql remains unchanged (anyone can SELECT).
