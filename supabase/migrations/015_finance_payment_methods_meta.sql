-- Payment methods: color, type, favorites, defaults (mirrors categories meta)

alter table finance_payment_methods
  add column if not exists color text not null default '#8b5cf6',
  add column if not exists method_type text not null default 'other'
    check (method_type in ('cash', 'bank', 'ewallet', 'crypto', 'card', 'other')),
  add column if not exists is_favorite boolean not null default false,
  add column if not exists is_default boolean not null default false;

-- Backfill known seeded / common methods
update finance_payment_methods set
  color = case lower(trim(name))
    when 'cash' then '#22c55e'
    when 'bca' then '#3b82f6'
    when 'gopay' then '#22c55e'
    when 'ovo' then '#8b5cf6'
    when 'dana' then '#0ea5e9'
    when 'shopeepay' then '#f97316'
    when 'qris' then '#06b6d4'
    when 'steam wallet' then '#8b5cf6'
    when 'crypto' then '#71717a'
    else color
  end,
  method_type = case lower(trim(name))
    when 'cash' then 'cash'
    when 'bca' then 'bank'
    when 'gopay' then 'ewallet'
    when 'ovo' then 'ewallet'
    when 'dana' then 'ewallet'
    when 'shopeepay' then 'ewallet'
    when 'qris' then 'card'
    when 'steam wallet' then 'ewallet'
    when 'crypto' then 'crypto'
    else method_type
  end,
  is_default = lower(trim(name)) in (
    'cash', 'bca', 'gopay', 'ovo', 'dana', 'shopeepay', 'qris', 'steam wallet', 'crypto'
  )
where color = '#8b5cf6' or method_type = 'other' or is_default = false;

-- Best-effort: link transactions still missing payment_method_id (text in notes/title/description)
update finance_transactions t
set payment_method_id = pm.id
from finance_payment_methods pm
where t.payment_method_id is null
  and t.profile_id = pm.profile_id
  and length(trim(pm.name)) >= 3
  and (
    lower(coalesce(t.notes, '')) like '%' || lower(trim(pm.name)) || '%'
    or lower(coalesce(t.description, '')) like '%' || lower(trim(pm.name)) || '%'
    or lower(coalesce(t.title, '')) like '%' || lower(trim(pm.name)) || '%'
  );

update finance_subscriptions s
set payment_method_id = pm.id
from finance_payment_methods pm
where s.payment_method_id is null
  and s.profile_id = pm.profile_id
  and length(trim(pm.name)) >= 3
  and (
    lower(coalesce(s.notes, '')) like '%' || lower(trim(pm.name)) || '%'
    or lower(trim(s.name)) like '%' || lower(trim(pm.name)) || '%'
  );
