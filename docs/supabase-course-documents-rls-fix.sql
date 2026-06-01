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
