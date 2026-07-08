/*
# Storage Bucket Policies for Attachments and Avatars

## Overview
Adds RLS policies to the `attachments` and `avatars` storage buckets so authenticated
users can upload and read their own files.

## Policies

### attachments bucket (private)
- SELECT: users can read files in their own folder (user_id prefix) OR staff can read all
- INSERT: users can upload to their own folder
- UPDATE: users can update files in their own folder OR staff
- DELETE: users can delete files in their own folder OR staff

### avatars bucket (public)
- SELECT: anyone can read (public bucket)
- INSERT: users can upload to their own folder
- UPDATE: users can update their own folder
- DELETE: users can delete their own folder

## Important Notes
1. Files are organized by user_id prefix: `{user_id}/{ticket_id}/{filename}`
2. Staff (admin/technician) can read all attachments for ticket investigation
3. Avatars are public so they can be displayed in the UI without signed URLs
*/

-- Attachments bucket policies
DROP POLICY IF EXISTS "attachments_select_own_or_staff" ON storage.objects;
CREATE POLICY "attachments_select_own_or_staff" ON storage.objects FOR SELECT
  TO authenticated USING (
    bucket_id = 'attachments' AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.is_staff()
    )
  );

DROP POLICY IF EXISTS "attachments_insert_own" ON storage.objects;
CREATE POLICY "attachments_insert_own" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (
    bucket_id = 'attachments' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "attachments_update_own" ON storage.objects;
CREATE POLICY "attachments_update_own" ON storage.objects FOR UPDATE
  TO authenticated USING (
    bucket_id = 'attachments' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "attachments_delete_own_or_staff" ON storage.objects;
CREATE POLICY "attachments_delete_own_or_staff" ON storage.objects FOR DELETE
  TO authenticated USING (
    bucket_id = 'attachments' AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.is_staff()
    )
  );

-- Avatars bucket policies (public read)
DROP POLICY IF EXISTS "avatars_select_all" ON storage.objects;
CREATE POLICY "avatars_select_all" ON storage.objects FOR SELECT
  TO authenticated USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "avatars_insert_own" ON storage.objects;
CREATE POLICY "avatars_insert_own" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "avatars_update_own" ON storage.objects;
CREATE POLICY "avatars_update_own" ON storage.objects FOR UPDATE
  TO authenticated USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "avatars_delete_own" ON storage.objects;
CREATE POLICY "avatars_delete_own" ON storage.objects FOR DELETE
  TO authenticated USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
