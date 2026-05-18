-- Deduplicate finance seed data and enforce unique category/method names per profile

-- Categories: point FKs at canonical row, then delete duplicates
with ranked as (
  select
    id,
    first_value(id) over (
      partition by profile_id, lower(trim(name)), type
      order by created_at asc, id asc
    ) as keep_id,
    row_number() over (
      partition by profile_id, lower(trim(name)), type
      order by created_at asc, id asc
    ) as rn
  from finance_categories
),
dups as (
  select id, keep_id from ranked where rn > 1
)
update finance_budget_limits bl
set category_id = d.keep_id
from dups d
where bl.category_id = d.id;

with ranked as (
  select
    id,
    first_value(id) over (
      partition by profile_id, lower(trim(name)), type
      order by created_at asc, id asc
    ) as keep_id,
    row_number() over (
      partition by profile_id, lower(trim(name)), type
      order by created_at asc, id asc
    ) as rn
  from finance_categories
),
dups as (
  select id, keep_id from ranked where rn > 1
)
update finance_transactions t
set category_id = d.keep_id
from dups d
where t.category_id = d.id;

with ranked as (
  select
    id,
    first_value(id) over (
      partition by profile_id, lower(trim(name)), type
      order by created_at asc, id asc
    ) as keep_id,
    row_number() over (
      partition by profile_id, lower(trim(name)), type
      order by created_at asc, id asc
    ) as rn
  from finance_categories
),
dups as (
  select id, keep_id from ranked where rn > 1
)
update finance_subscriptions s
set category_id = d.keep_id
from dups d
where s.category_id = d.id;

with ranked as (
  select
    id,
    row_number() over (
      partition by profile_id, lower(trim(name)), type
      order by created_at asc, id asc
    ) as rn
  from finance_categories
)
delete from finance_categories
where id in (select id from ranked where rn > 1);

-- Payment methods dedupe
with ranked as (
  select
    id,
    first_value(id) over (
      partition by profile_id, lower(trim(name))
      order by created_at asc, id asc
    ) as keep_id,
    row_number() over (
      partition by profile_id, lower(trim(name))
      order by created_at asc, id asc
    ) as rn
  from finance_payment_methods
),
dups as (
  select id, keep_id from ranked where rn > 1
)
update finance_transactions t
set payment_method_id = d.keep_id
from dups d
where t.payment_method_id = d.id;

with ranked as (
  select
    id,
    first_value(id) over (
      partition by profile_id, lower(trim(name))
      order by created_at asc, id asc
    ) as keep_id,
    row_number() over (
      partition by profile_id, lower(trim(name))
      order by created_at asc, id asc
    ) as rn
  from finance_payment_methods
),
dups as (
  select id, keep_id from ranked where rn > 1
)
update finance_subscriptions s
set payment_method_id = d.keep_id
from dups d
where s.payment_method_id = d.id;

with ranked as (
  select
    id,
    row_number() over (
      partition by profile_id, lower(trim(name))
      order by created_at asc, id asc
    ) as rn
  from finance_payment_methods
)
delete from finance_payment_methods
where id in (select id from ranked where rn > 1);

create unique index if not exists finance_categories_profile_name_type_uidx
  on finance_categories (profile_id, lower(trim(name)), type);

create unique index if not exists finance_payment_methods_profile_name_uidx
  on finance_payment_methods (profile_id, lower(trim(name)));
