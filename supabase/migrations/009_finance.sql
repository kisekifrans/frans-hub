-- Personal finance (admin-only)

create table if not exists finance_categories (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  icon text not null default '📦',
  color text not null default '#8b5cf6',
  type text not null check (type in ('income', 'expense', 'both')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists finance_categories_profile_idx
  on finance_categories (profile_id, sort_order);

create table if not exists finance_payment_methods (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  icon text not null default '💳',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists finance_payment_methods_profile_idx
  on finance_payment_methods (profile_id, sort_order);

create table if not exists finance_budget_periods (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  start_date date not null,
  end_date date not null,
  salary_received numeric(14, 2),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date >= start_date)
);

create index if not exists finance_budget_periods_profile_dates_idx
  on finance_budget_periods (profile_id, start_date desc);

create table if not exists finance_budget_limits (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  category_id uuid not null references finance_categories(id) on delete cascade,
  period_id uuid not null references finance_budget_periods(id) on delete cascade,
  limit_amount numeric(14, 2) not null check (limit_amount >= 0),
  warning_threshold numeric(5, 2) not null default 80 check (warning_threshold > 0 and warning_threshold <= 100),
  created_at timestamptz not null default now(),
  unique (period_id, category_id)
);

create index if not exists finance_budget_limits_period_idx
  on finance_budget_limits (period_id);

create table if not exists finance_transactions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  type text not null check (type in ('income', 'expense')),
  title text not null,
  description text not null default '',
  amount numeric(14, 2) not null check (amount > 0),
  currency text not null default 'IDR',
  category_id uuid references finance_categories(id) on delete set null,
  payment_method_id uuid references finance_payment_methods(id) on delete set null,
  transaction_date date not null default (current_date),
  period_id uuid references finance_budget_periods(id) on delete set null,
  recurring boolean not null default false,
  tags text[] not null default '{}',
  attachment_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists finance_transactions_profile_date_idx
  on finance_transactions (profile_id, transaction_date desc);

create index if not exists finance_transactions_period_idx
  on finance_transactions (period_id);

create index if not exists finance_transactions_category_idx
  on finance_transactions (category_id);

create table if not exists finance_subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  amount numeric(14, 2) not null check (amount > 0),
  currency text not null default 'IDR',
  billing_cycle text not null default 'monthly' check (billing_cycle in ('weekly', 'monthly', 'yearly')),
  next_payment_date date not null,
  category_id uuid references finance_categories(id) on delete set null,
  payment_method_id uuid references finance_payment_methods(id) on delete set null,
  auto_renew boolean not null default true,
  active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists finance_subscriptions_profile_idx
  on finance_subscriptions (profile_id, next_payment_date);

-- Future PDF import queue (no parser yet)
create table if not exists finance_import_jobs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  source text not null check (source in ('gopay', 'bank', 'shopeepay', 'other')),
  file_url text,
  storage_path text,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  error_message text,
  parsed_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table finance_categories enable row level security;
alter table finance_payment_methods enable row level security;
alter table finance_budget_periods enable row level security;
alter table finance_budget_limits enable row level security;
alter table finance_transactions enable row level security;
alter table finance_subscriptions enable row level security;
alter table finance_import_jobs enable row level security;

-- Admin-only (same pattern as gear write)
drop policy if exists "admin_manage_finance_categories" on finance_categories;
create policy "admin_manage_finance_categories" on finance_categories for all
  using ((auth.jwt() ->> 'email') = 'putuagisna@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'putuagisna@gmail.com');

drop policy if exists "admin_manage_finance_payment_methods" on finance_payment_methods;
create policy "admin_manage_finance_payment_methods" on finance_payment_methods for all
  using ((auth.jwt() ->> 'email') = 'putuagisna@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'putuagisna@gmail.com');

drop policy if exists "admin_manage_finance_budget_periods" on finance_budget_periods;
create policy "admin_manage_finance_budget_periods" on finance_budget_periods for all
  using ((auth.jwt() ->> 'email') = 'putuagisna@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'putuagisna@gmail.com');

drop policy if exists "admin_manage_finance_budget_limits" on finance_budget_limits;
create policy "admin_manage_finance_budget_limits" on finance_budget_limits for all
  using ((auth.jwt() ->> 'email') = 'putuagisna@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'putuagisna@gmail.com');

drop policy if exists "admin_manage_finance_transactions" on finance_transactions;
create policy "admin_manage_finance_transactions" on finance_transactions for all
  using ((auth.jwt() ->> 'email') = 'putuagisna@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'putuagisna@gmail.com');

drop policy if exists "admin_manage_finance_subscriptions" on finance_subscriptions;
create policy "admin_manage_finance_subscriptions" on finance_subscriptions for all
  using ((auth.jwt() ->> 'email') = 'putuagisna@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'putuagisna@gmail.com');

drop policy if exists "admin_manage_finance_import_jobs" on finance_import_jobs;
create policy "admin_manage_finance_import_jobs" on finance_import_jobs for all
  using ((auth.jwt() ->> 'email') = 'putuagisna@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'putuagisna@gmail.com');
