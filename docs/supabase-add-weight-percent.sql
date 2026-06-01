alter table public.assignments
add column if not exists weight_percent numeric(5, 2)
check (weight_percent is null or (weight_percent >= 0 and weight_percent <= 100));
