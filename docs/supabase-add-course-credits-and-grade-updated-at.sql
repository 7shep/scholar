alter table public.courses
add column if not exists credits integer not null default 3;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'courses_credits_check'
  ) then
    alter table public.courses
    add constraint courses_credits_check check (credits in (3, 6));
  end if;
end $$;

alter table public.assignments
add column if not exists grade_updated_at timestamptz;
