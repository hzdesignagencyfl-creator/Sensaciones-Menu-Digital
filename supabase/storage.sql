-- ============================================================================
-- Storage policies for dish photos & videos
-- Run AFTER schema.sql. The seed script creates the "dish-photos" bucket, but
-- you can also create buckets manually in Dashboard → Storage.
-- ============================================================================

-- Create public buckets (id = name). Safe to re-run.
insert into storage.buckets (id, name, public)
values ('dish-photos', 'dish-photos', true)
on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public)
values ('dish-videos', 'dish-videos', true)
on conflict (id) do update set public = true;

-- Public read for both buckets.
drop policy if exists "public read dish media" on storage.objects;
create policy "public read dish media" on storage.objects
  for select using (bucket_id in ('dish-photos', 'dish-videos'));

-- Authenticated admin can upload / update / delete media.
drop policy if exists "admin write dish media" on storage.objects;
create policy "admin write dish media" on storage.objects
  for all to authenticated
  using (bucket_id in ('dish-photos', 'dish-videos'))
  with check (bucket_id in ('dish-photos', 'dish-videos'));
