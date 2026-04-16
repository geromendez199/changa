-- ============================================================
-- WHY: Persist profile avatars in Supabase Storage and sync them across devices.
-- CHANGED: YYYY-MM-DD
-- ============================================================

alter table profiles
add column if not exists avatar_url text;

insert into storage.buckets (id, name, public)
values ('profile-avatars', 'profile-avatars', true)
on conflict (id) do update set public = true;

drop policy if exists "profile avatars public read" on storage.objects;
create policy "profile avatars public read"
on storage.objects
for select
using (bucket_id = 'profile-avatars');

drop policy if exists "profile avatars owner insert" on storage.objects;
create policy "profile avatars owner insert"
on storage.objects
for insert
with check (
  bucket_id = 'profile-avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "profile avatars owner update" on storage.objects;
create policy "profile avatars owner update"
on storage.objects
for update
using (
  bucket_id = 'profile-avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'profile-avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "profile avatars owner delete" on storage.objects;
create policy "profile avatars owner delete"
on storage.objects
for delete
using (
  bucket_id = 'profile-avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);
