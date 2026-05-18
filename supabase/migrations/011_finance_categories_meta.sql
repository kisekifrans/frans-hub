-- Optional metadata for finance categories (migration-safe)

alter table finance_categories
  add column if not exists is_default boolean not null default false;

-- Mark seeded defaults (best-effort; custom names unaffected)
update finance_categories
set is_default = true
where lower(trim(name)) in (
  'food', 'drinks', 'steam / gaming', 'subscription', 'transport',
  'shopping', 'rent', 'internet', 'investment', 'other',
  'salary', 'steam trading', 'freelance', 'other income'
);
