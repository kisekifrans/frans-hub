-- Multi-tenant foundation: profile ownership, site admins, Indonesia billing skeleton.
-- Safe to run before app deploy; existing admin-email RLS policies remain until Phase 4.

-- ---------------------------------------------------------------------------
-- Profiles: link rows to auth.users
-- ---------------------------------------------------------------------------
alter table profiles
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists is_published boolean not null default true,
  add column if not exists country_code text not null default 'ID'
    check (country_code ~ '^[A-Z]{2}$'),
  add column if not exists plan_id uuid,
  add column if not exists slug_changed_at timestamptz;

create unique index if not exists profiles_user_id_unique
  on profiles (user_id)
  where user_id is not null;

create index if not exists profiles_slug_idx on profiles (slug);

comment on column profiles.user_id is 'Owner; one primary profile per user (unique partial index).';
comment on column profiles.is_published is 'When false, public slug page returns 404.';
comment on column profiles.country_code is 'ISO 3166-1 alpha-2; used for ID-only billing eligibility.';

-- ---------------------------------------------------------------------------
-- Site admins (replaces hardcoded email in new policies over time)
-- ---------------------------------------------------------------------------
create table if not exists site_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table site_admins enable row level security;

drop policy if exists "site_admins_read_self" on site_admins;
create policy "site_admins_read_self" on site_admins
  for select
  using (user_id = auth.uid());

-- After first login, run (replace YOUR_AUTH_USER_UUID):
-- insert into site_admins (user_id) values ('YOUR_AUTH_USER_UUID')
-- on conflict do nothing;

-- ---------------------------------------------------------------------------
-- RLS helpers
-- ---------------------------------------------------------------------------
create or replace function public.is_site_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from site_admins sa where sa.user_id = auth.uid()
  );
$$;

create or replace function public.user_owns_profile(p_profile_id uuid)
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

-- Legacy admin email (remove in Phase 6 when site_admins is populated)
create or replace function public.is_legacy_admin_email()
returns boolean
language sql
stable
as $$
  select coalesce(auth.jwt() ->> 'email', '') = 'putuagisna@gmail.com';
$$;

create or replace function public.can_manage_profile(p_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.user_owns_profile(p_profile_id)
      or public.is_site_admin()
      or public.is_legacy_admin_email();
$$;

-- ---------------------------------------------------------------------------
-- Owner policies on profiles / blocks (additive; admin policies unchanged)
-- ---------------------------------------------------------------------------
drop policy if exists "owner_manage_profiles" on profiles;
create policy "owner_manage_profiles" on profiles
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "owner_manage_blocks" on blocks;
create policy "owner_manage_blocks" on blocks
  for all
  using (public.user_owns_profile(profile_id))
  with check (public.user_owns_profile(profile_id));

drop policy if exists "owner_read_own_analytics" on analytics_events;
create policy "owner_read_own_analytics" on analytics_events
  for select
  using (public.user_owns_profile(profile_id));

-- ---------------------------------------------------------------------------
-- Billing catalog (SaaS — not finance_subscriptions)
-- ---------------------------------------------------------------------------
create table if not exists billing_plans (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  description text not null default '',
  price_idr integer not null default 0 check (price_idr >= 0),
  interval text not null default 'month'
    check (interval in ('month', 'year', 'lifetime')),
  region text not null default 'ID' check (region = 'ID'),
  features jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

insert into billing_plans (code, name, description, price_idr, interval, features, sort_order)
values
  (
    'free',
    'Free',
    'Public link page and personal finance',
    0,
    'month',
    '{"max_blocks": 20, "pdf_imports_per_month": 1}'::jsonb,
    0
  ),
  (
    'pro_id',
    'Pro Indonesia',
    'More blocks, PDF imports, priority support',
    49000,
    'month',
    '{"max_blocks": 100, "pdf_imports_per_month": 10}'::jsonb,
    1
  )
on conflict (code) do nothing;

alter table profiles
  drop constraint if exists profiles_plan_id_fkey;

alter table profiles
  add constraint profiles_plan_id_fkey
  foreign key (plan_id) references billing_plans(id) on delete set null;

update profiles
set plan_id = (select id from billing_plans where code = 'free' limit 1)
where plan_id is null;

-- ---------------------------------------------------------------------------
-- User SaaS subscription & payments (Midtrans / Xendit)
-- ---------------------------------------------------------------------------
create table if not exists billing_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid not null references billing_plans(id),
  status text not null default 'trialing'
    check (status in ('trialing', 'active', 'past_due', 'canceled', 'expired')),
  current_period_start timestamptz not null default now(),
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  payment_provider text check (payment_provider in ('midtrans', 'xendit', 'manual')),
  provider_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists billing_subscriptions_user_idx
  on billing_subscriptions (user_id, status);

create table if not exists billing_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subscription_id uuid references billing_subscriptions(id) on delete set null,
  plan_id uuid not null references billing_plans(id),
  amount_idr integer not null check (amount_idr > 0),
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'failed', 'expired', 'refunded')),
  payment_method text,
  provider text not null check (provider in ('midtrans', 'xendit', 'manual')),
  provider_order_id text,
  provider_transaction_id text,
  idempotency_key text unique,
  metadata jsonb not null default '{}'::jsonb,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists billing_payments_user_created_idx
  on billing_payments (user_id, created_at desc);

alter table billing_plans enable row level security;
alter table billing_subscriptions enable row level security;
alter table billing_payments enable row level security;

drop policy if exists "public_read_billing_plans" on billing_plans;
create policy "public_read_billing_plans" on billing_plans
  for select
  using (is_active = true and region = 'ID');

drop policy if exists "user_read_own_billing_subscriptions" on billing_subscriptions;
create policy "user_read_own_billing_subscriptions" on billing_subscriptions
  for select
  using (user_id = auth.uid() or public.is_site_admin() or public.is_legacy_admin_email());

drop policy if exists "user_read_own_billing_payments" on billing_payments;
create policy "user_read_own_billing_payments" on billing_payments
  for select
  using (user_id = auth.uid() or public.is_site_admin() or public.is_legacy_admin_email());

-- Inserts/updates for billing_subscriptions and billing_payments: service role / webhook only (Phase 5)

-- ---------------------------------------------------------------------------
-- Finance: owner policies (additive alongside admin_manage_finance_*)
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
    execute format('drop policy if exists "owner_manage_%s" on %I', t, t);
    execute format(
      'create policy "owner_manage_%s" on %I for all
         using (public.user_owns_profile(profile_id))
         with check (public.user_owns_profile(profile_id))',
      t, t
    );
  end loop;
end $$;

drop policy if exists "owner_manage_finance_imports" on storage.objects;
create policy "owner_manage_finance_imports" on storage.objects
  for all
  using (
    bucket_id = 'finance-imports'
    and (
      public.is_site_admin()
      or public.is_legacy_admin_email()
      or exists (
        select 1 from profiles p
        where p.user_id = auth.uid()
          and (storage.foldername(name))[1] = 'imports'
          and (storage.foldername(name))[2] = p.id::text
      )
    )
  )
  with check (
    bucket_id = 'finance-imports'
    and (
      public.is_site_admin()
      or public.is_legacy_admin_email()
      or exists (
        select 1 from profiles p
        where p.user_id = auth.uid()
          and (storage.foldername(name))[1] = 'imports'
          and (storage.foldername(name))[2] = p.id::text
      )
    )
  );
