create extension if not exists pgcrypto;

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text,
  term text,
  created_at timestamptz not null default now()
);

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid references public.courses(id) on delete set null,
  title text not null,
  due_at timestamptz,
  status text not null default 'todo' check (status in ('todo', 'done', 'completed')),
  difficulty text check (difficulty in ('easy', 'medium', 'hard')),
  estimated_minutes integer check (estimated_minutes is null or estimated_minutes >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.course_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  document_type text not null check (document_type in ('syllabus')),
  file_name text not null,
  storage_path text not null unique,
  mime_type text not null check (
    mime_type in (
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )
  ),
  file_size bigint check (file_size is null or file_size >= 0),
  uploaded_at timestamptz not null default now()
);

create index if not exists courses_user_id_idx
  on public.courses (user_id);

create index if not exists assignments_user_id_idx
  on public.assignments (user_id);

create index if not exists assignments_course_id_idx
  on public.assignments (course_id);

create index if not exists assignments_due_at_idx
  on public.assignments (due_at);

create index if not exists course_documents_user_id_idx
  on public.course_documents (user_id);

create index if not exists course_documents_course_id_idx
  on public.course_documents (course_id);

alter table public.courses enable row level security;
alter table public.assignments enable row level security;
alter table public.course_documents enable row level security;

drop policy if exists "courses_select_own" on public.courses;
create policy "courses_select_own"
on public.courses
for select
using (auth.uid() = user_id);

drop policy if exists "courses_insert_own" on public.courses;
create policy "courses_insert_own"
on public.courses
for insert
with check (auth.uid() = user_id);

drop policy if exists "courses_update_own" on public.courses;
create policy "courses_update_own"
on public.courses
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "courses_delete_own" on public.courses;
create policy "courses_delete_own"
on public.courses
for delete
using (auth.uid() = user_id);

drop policy if exists "assignments_select_own" on public.assignments;
create policy "assignments_select_own"
on public.assignments
for select
using (auth.uid() = user_id);

drop policy if exists "assignments_insert_own" on public.assignments;
create policy "assignments_insert_own"
on public.assignments
for insert
with check (auth.uid() = user_id);

drop policy if exists "assignments_update_own" on public.assignments;
create policy "assignments_update_own"
on public.assignments
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "assignments_delete_own" on public.assignments;
create policy "assignments_delete_own"
on public.assignments
for delete
using (auth.uid() = user_id);

drop policy if exists "course_documents_select_own" on public.course_documents;
create policy "course_documents_select_own"
on public.course_documents
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "course_documents_insert_own" on public.course_documents;
create policy "course_documents_insert_own"
on public.course_documents
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.courses
    where courses.id = course_documents.course_id
      and courses.user_id = auth.uid()
  )
);

drop policy if exists "course_documents_update_own" on public.course_documents;
create policy "course_documents_update_own"
on public.course_documents
for update
to authenticated
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.courses
    where courses.id = course_documents.course_id
      and courses.user_id = auth.uid()
  )
);

drop policy if exists "course_documents_delete_own" on public.course_documents;
create policy "course_documents_delete_own"
on public.course_documents
for delete
to authenticated
using (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('course-documents', 'course-documents', false)
on conflict (id) do nothing;

drop policy if exists "course_documents_bucket_select_own" on storage.objects;
create policy "course_documents_bucket_select_own"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'course-documents'
  and owner_id = (select auth.uid()::text)
);

drop policy if exists "course_documents_bucket_insert_own" on storage.objects;
create policy "course_documents_bucket_insert_own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'course-documents'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists "course_documents_bucket_update_own" on storage.objects;
create policy "course_documents_bucket_update_own"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'course-documents'
  and owner_id = (select auth.uid()::text)
)
with check (
  bucket_id = 'course-documents'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists "course_documents_bucket_delete_own" on storage.objects;
create policy "course_documents_bucket_delete_own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'course-documents'
  and owner_id = (select auth.uid()::text)
);

select id, email
from auth.users
order by created_at desc;

-- Replace YOUR_USER_ID_HERE and COURSE_ID_HERE before running these seed inserts.
insert into public.courses (user_id, name, color, term)
values ('YOUR_USER_ID_HERE', 'Biology 101', '#22c55e', 'Fall 2026');

insert into public.assignments (
  user_id,
  course_id,
  title,
  due_at,
  status,
  difficulty,
  estimated_minutes
)
values (
  'YOUR_USER_ID_HERE',
  'COURSE_ID_HERE',
  'Read Chapter 4',
  now() + interval '2 days',
  'todo',
  'medium',
  90
);
