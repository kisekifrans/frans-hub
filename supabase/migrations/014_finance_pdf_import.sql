-- PDF import: storage bucket + job metadata

alter table finance_import_jobs
  add column if not exists original_filename text,
  add column if not exists completed_at timestamptz,
  add column if not exists preview_json jsonb;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'finance_import_jobs' and column_name = 'parsed_count'
  ) and not exists (
    select 1 from information_schema.columns
    where table_name = 'finance_import_jobs' and column_name = 'extracted_count'
  ) then
    alter table finance_import_jobs rename column parsed_count to extracted_count;
  end if;
end $$;

alter table finance_import_jobs
  add column if not exists extracted_count integer not null default 0;

insert into storage.buckets (id, name, public, file_size_limit)
values ('finance-imports', 'finance-imports', false, 26214400)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit;

drop policy if exists "admin_manage_finance_imports" on storage.objects;
create policy "admin_manage_finance_imports" on storage.objects
  for all
  using (
    bucket_id = 'finance-imports'
    and (auth.jwt() ->> 'email') = 'putuagisna@gmail.com'
  )
  with check (
    bucket_id = 'finance-imports'
    and (auth.jwt() ->> 'email') = 'putuagisna@gmail.com'
  );
