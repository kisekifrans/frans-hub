-- Background janitor for orphaned finance-imports PDFs.
--
-- The client uploads the PDF, then parses it, then deletes it. If the user
-- closes the tab mid-parse the storage object survives. This function:
--   1. Marks any pending/processing job older than 1 hour as failed.
--   2. Deletes the matching storage object.
--
-- Schedule this with Supabase scheduled functions (pg_cron):
--   select cron.schedule(
--     'finance_import_janitor_hourly',
--     '15 * * * *',
--     $$select public.purge_stale_finance_imports()$$
--   );
--
-- pg_cron must be enabled in your project (Database → Extensions → pg_cron).

create or replace function public.purge_stale_finance_imports()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  victim record;
  removed integer := 0;
begin
  for victim in
    select id, storage_path
      from finance_import_jobs
     where status in ('pending', 'processing')
       and updated_at < now() - interval '1 hour'
  loop
    if victim.storage_path is not null and victim.storage_path <> '' then
      perform storage.delete_object('finance-imports', victim.storage_path);
    end if;

    update finance_import_jobs
       set status = 'failed',
           error_message = coalesce(error_message,
             'Auto-cancelled: import did not complete within 1 hour.'),
           updated_at = now()
     where id = victim.id;

    removed := removed + 1;
  end loop;

  return removed;
end;
$$;

comment on function public.purge_stale_finance_imports() is
  'Marks stale finance_import_jobs as failed and deletes the underlying PDF '
  'from the finance-imports bucket. Schedule hourly via pg_cron.';
