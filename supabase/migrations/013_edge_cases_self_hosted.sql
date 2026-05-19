-- Self-hosted edge case videos (Supabase Storage)

alter table edge_cases
  add column if not exists uploaded_video_path text,
  add column if not exists thumbnail_path text,
  add column if not exists duration_seconds double precision,
  add column if not exists file_size bigint,
  add column if not exists mime_type text;

alter table edge_cases drop column if exists video_url;
alter table edge_cases drop column if exists thumbnail_url;

-- Bucket: edgecases-videos (public read for stable HTML5 playback)
insert into storage.buckets (id, name, public, file_size_limit)
values ('edgecases-videos', 'edgecases-videos', true, 262144000)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit;

drop policy if exists "public_read_edgecases_videos" on storage.objects;
create policy "public_read_edgecases_videos" on storage.objects
  for select
  using (bucket_id = 'edgecases-videos');

drop policy if exists "admin_manage_edgecases_videos" on storage.objects;
create policy "admin_manage_edgecases_videos" on storage.objects
  for all
  using (
    bucket_id = 'edgecases-videos'
    and (auth.jwt() ->> 'email') = 'putuagisna@gmail.com'
  )
  with check (
    bucket_id = 'edgecases-videos'
    and (auth.jwt() ->> 'email') = 'putuagisna@gmail.com'
  );
