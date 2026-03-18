-- ============================================================================
-- Migration: Storage Bucket Security Policies
-- Date: 2026-03-18
-- Description: Secures the avatars storage bucket
-- IMPORTANT: Run this in Supabase Dashboard > Storage > Policies
-- Or via SQL Editor with storage schema access
-- ============================================================================

-- ============================================================================
-- 1. AVATARS BUCKET CONFIGURATION
-- ============================================================================
-- First, ensure the bucket exists and is public for reading

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- ============================================================================
-- 2. DROP EXISTING POLICIES (clean slate)
-- ============================================================================

DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;

-- ============================================================================
-- 3. SELECT POLICY: Public Read Access
-- ============================================================================
-- Anyone can view avatars (needed for profile display)

CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- ============================================================================
-- 4. INSERT POLICY: Users Can Upload Own Avatar
-- ============================================================================
-- Users can only upload files that start with their user ID
-- Pattern: avatars/{user_id}-{timestamp}.{ext}

CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'avatars'
  AND (
    -- File name must start with user's ID
    SPLIT_PART(storage.filename(name), '-', 1) = auth.uid()::text
    OR
    -- Or be in a folder named with their ID
    (storage.foldername(name))[2] = auth.uid()::text
  )
);

-- ============================================================================
-- 5. UPDATE POLICY: Users Can Replace Own Avatar
-- ============================================================================

CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
  AND SPLIT_PART(storage.filename(name), '-', 1) = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars'
  AND SPLIT_PART(storage.filename(name), '-', 1) = auth.uid()::text
);

-- ============================================================================
-- 6. DELETE POLICY: Users Can Delete Own Avatar
-- ============================================================================

CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
  AND SPLIT_PART(storage.filename(name), '-', 1) = auth.uid()::text
);

-- ============================================================================
-- 7. FILE SIZE AND TYPE VALIDATION
-- ============================================================================
-- Note: Supabase handles this at the API level, but document expectations

-- Recommended client-side validation:
-- - Max file size: 2MB (2 * 1024 * 1024 bytes)
-- - Allowed types: image/jpeg, image/png, image/webp, image/gif
-- - Max dimensions: 500x500 (resize before upload for consistency)

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- To verify policies are applied:

-- SELECT * FROM storage.buckets WHERE id = 'avatars';

-- SELECT policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE tablename = 'objects' AND schemaname = 'storage';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
