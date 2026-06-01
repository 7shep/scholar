alter table public.assignments
add column if not exists completed_at timestamptz,
add column if not exists grade_type text check (grade_type is null or grade_type in ('number', 'letter')),
add column if not exists grade_number numeric(6, 2) check (grade_number is null or grade_number >= 0),
add column if not exists grade_letter text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'assignments_grade_value_consistency_check'
  ) then
    alter table public.assignments
    add constraint assignments_grade_value_consistency_check check (
      (
        grade_type is null and
        grade_number is null and
        grade_letter is null
      ) or (
        grade_type = 'number' and
        grade_number is not null and
        grade_letter is null
      ) or (
        grade_type = 'letter' and
        grade_letter is not null and
        grade_number is null
      )
    );
  end if;
end $$;
