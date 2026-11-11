-- Public cover images, with uploads restricted to current application admins.
-- Prisma uses the database owner; the browser may only read its own role.
alter table public."User" enable row level security;
revoke all on table public."User" from anon, authenticated;
grant select (id, role) on table public."User" to authenticated;

create policy "poster_upload_read_own_role" on public."User"
for select to authenticated using (id = (select auth.uid()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('anime-posters', 'anime-posters', true, 5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

create policy "admins_insert_anime_posters" on storage.objects
for insert to authenticated with check (
  bucket_id = 'anime-posters'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1 from public."User" as profile
    where profile.id = (select auth.uid()) and profile.role = 'ADMIN'
  )
);
