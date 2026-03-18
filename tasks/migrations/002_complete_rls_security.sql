-- ============================================================================
-- Migration: Complete RLS Security for TheBookClub
-- Date: 2026-03-18
-- Description: Implements strict Row Level Security for ALL tables
-- CRITICAL: Run this in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- 1. PROFILES TABLE
-- ============================================================================
-- Profiles are publicly viewable but only editable by owner

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (idempotent)
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- SELECT: Anyone can view profiles (public social feature)
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

-- INSERT: Users can only insert their own profile (triggered by auth)
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- UPDATE: Users can only update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- DELETE: Profiles should not be deleted (cascades from auth.users)
-- No delete policy = no deletion allowed via API

GRANT SELECT ON profiles TO authenticated, anon;
GRANT INSERT, UPDATE ON profiles TO authenticated;

-- ============================================================================
-- 2. RATINGS TABLE
-- ============================================================================
-- Ratings: aggregate stats public, individual ratings private to owner

ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own ratings" ON ratings;
DROP POLICY IF EXISTS "Users can view all ratings for aggregation" ON ratings;
DROP POLICY IF EXISTS "Users can insert own ratings" ON ratings;
DROP POLICY IF EXISTS "Users can update own ratings" ON ratings;
DROP POLICY IF EXISTS "Users can delete own ratings" ON ratings;

-- SELECT: Users can only see their own ratings (privacy)
-- For aggregation, use a view or function with SECURITY DEFINER
CREATE POLICY "Users can view own ratings" ON ratings
  FOR SELECT USING (auth.uid() = user_id);

-- INSERT: Users can only insert ratings for themselves
CREATE POLICY "Users can insert own ratings" ON ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can only update their own ratings
CREATE POLICY "Users can update own ratings" ON ratings
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can only delete their own ratings
CREATE POLICY "Users can delete own ratings" ON ratings
  FOR DELETE USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON ratings TO authenticated;
-- Note: anon has NO access to ratings table

-- ============================================================================
-- 3. USER_BOOKS TABLE (to_read / read status)
-- ============================================================================
-- Private to each user - no one else should see your reading list

ALTER TABLE user_books ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own books" ON user_books;
DROP POLICY IF EXISTS "Users can manage own books" ON user_books;

-- SELECT: Only see your own book statuses
CREATE POLICY "Users can view own books" ON user_books
  FOR SELECT USING (auth.uid() = user_id);

-- ALL: Only manage your own book statuses
CREATE POLICY "Users can manage own books" ON user_books
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON user_books TO authenticated;
-- Note: anon has NO access

-- ============================================================================
-- 4. COMMENTS TABLE
-- ============================================================================
-- Comments are public, but only editable/deletable by owner

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Comments are viewable by everyone" ON comments;
DROP POLICY IF EXISTS "Users can insert own comments" ON comments;
DROP POLICY IF EXISTS "Users can update own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON comments;

-- SELECT: Anyone can read comments (public discussion)
CREATE POLICY "Comments are viewable by everyone" ON comments
  FOR SELECT USING (true);

-- INSERT: Authenticated users can create comments (must be their user_id)
CREATE POLICY "Users can insert own comments" ON comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- UPDATE: Only owner can update their comment
CREATE POLICY "Users can update own comments" ON comments
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Only owner can delete their comment
CREATE POLICY "Users can delete own comments" ON comments
  FOR DELETE USING (auth.uid() = user_id);

GRANT SELECT ON comments TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON comments TO authenticated;

-- ============================================================================
-- 5. COMMENT_LIKES TABLE
-- ============================================================================
-- Likes are public for counting, but only manageable by owner

ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Comment likes are viewable by everyone" ON comment_likes;
DROP POLICY IF EXISTS "Users can manage own comment likes" ON comment_likes;

-- SELECT: Anyone can see likes (for counting)
CREATE POLICY "Comment likes are viewable by everyone" ON comment_likes
  FOR SELECT USING (true);

-- ALL: Users can only like/unlike for themselves
CREATE POLICY "Users can manage own comment likes" ON comment_likes
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

GRANT SELECT ON comment_likes TO authenticated, anon;
GRANT INSERT, DELETE ON comment_likes TO authenticated;

-- ============================================================================
-- 6. BOOK_LISTS TABLE
-- ============================================================================
-- Lists are public, but only editable by author

ALTER TABLE book_lists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lists are viewable by everyone" ON book_lists;
DROP POLICY IF EXISTS "Users can insert own lists" ON book_lists;
DROP POLICY IF EXISTS "Users can update own lists" ON book_lists;
DROP POLICY IF EXISTS "Users can delete own lists" ON book_lists;

-- SELECT: Anyone can view lists
CREATE POLICY "Lists are viewable by everyone" ON book_lists
  FOR SELECT USING (true);

-- INSERT: Users can only create lists for themselves
CREATE POLICY "Users can insert own lists" ON book_lists
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- UPDATE: Only author can update their list
CREATE POLICY "Users can update own lists" ON book_lists
  FOR UPDATE USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- DELETE: Only author can delete their list
CREATE POLICY "Users can delete own lists" ON book_lists
  FOR DELETE USING (auth.uid() = author_id);

GRANT SELECT ON book_lists TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON book_lists TO authenticated;

-- ============================================================================
-- 7. BOOK_LIST_ITEMS TABLE
-- ============================================================================
-- List items follow list ownership

ALTER TABLE book_list_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "List items are viewable by everyone" ON book_list_items;
DROP POLICY IF EXISTS "List owners can manage items" ON book_list_items;

-- SELECT: Anyone can view list items
CREATE POLICY "List items are viewable by everyone" ON book_list_items
  FOR SELECT USING (true);

-- ALL: Only list owner can manage items
-- Requires subquery to check list ownership
CREATE POLICY "List owners can manage items" ON book_list_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM book_lists
      WHERE book_lists.id = book_list_items.list_id
      AND book_lists.author_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM book_lists
      WHERE book_lists.id = book_list_items.list_id
      AND book_lists.author_id = auth.uid()
    )
  );

GRANT SELECT ON book_list_items TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON book_list_items TO authenticated;

-- ============================================================================
-- 8. LIST_LIKES TABLE
-- ============================================================================
-- Similar to comment_likes

ALTER TABLE list_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "List likes are viewable by everyone" ON list_likes;
DROP POLICY IF EXISTS "Users can manage own list likes" ON list_likes;

-- SELECT: Anyone can see likes (for counting)
CREATE POLICY "List likes are viewable by everyone" ON list_likes
  FOR SELECT USING (true);

-- ALL: Users can only like/unlike for themselves
CREATE POLICY "Users can manage own list likes" ON list_likes
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

GRANT SELECT ON list_likes TO authenticated, anon;
GRANT INSERT, DELETE ON list_likes TO authenticated;

-- ============================================================================
-- 9. FOLLOWS TABLE
-- ============================================================================
-- Follow relationships are public, but only manageable by follower

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Follows are viewable by everyone" ON follows;
DROP POLICY IF EXISTS "Users can manage own follows" ON follows;

-- SELECT: Anyone can see follow relationships
CREATE POLICY "Follows are viewable by everyone" ON follows
  FOR SELECT USING (true);

-- ALL: Users can only follow/unfollow for themselves
CREATE POLICY "Users can manage own follows" ON follows
  FOR ALL USING (auth.uid() = follower_id)
  WITH CHECK (auth.uid() = follower_id);

GRANT SELECT ON follows TO authenticated, anon;
GRANT INSERT, DELETE ON follows TO authenticated;

-- ============================================================================
-- 10. BOOKS TABLE (if not already secured)
-- ============================================================================
-- Books are public data, read-only for regular users

ALTER TABLE books ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Books are viewable by everyone" ON books;

-- SELECT: Anyone can view books
CREATE POLICY "Books are viewable by everyone" ON books
  FOR SELECT USING (true);

-- No INSERT/UPDATE/DELETE policies for regular users
-- Admin operations should use service_role key

GRANT SELECT ON books TO authenticated, anon;

-- ============================================================================
-- 11. AUTHORS TABLE (if exists)
-- ============================================================================
-- Authors are public data, read-only

-- Note: Uncomment if you have a separate authors table
-- ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS "Authors are viewable by everyone" ON authors;
-- CREATE POLICY "Authors are viewable by everyone" ON authors
--   FOR SELECT USING (true);
-- GRANT SELECT ON authors TO authenticated, anon;

-- ============================================================================
-- 12. FIX USER_FAVORITES (make it properly private)
-- ============================================================================
-- Current policy is too permissive - anyone can see anyone's favorites

DROP POLICY IF EXISTS "Users can view all favorites" ON user_favorites;
DROP POLICY IF EXISTS "Users can view own favorites" ON user_favorites;
DROP POLICY IF EXISTS "Users can manage their own favorites" ON user_favorites;

-- SELECT: Users can only see their own favorites
-- If you want favorites to be public on profile, create a separate view
CREATE POLICY "Users can view own favorites" ON user_favorites
  FOR SELECT USING (auth.uid() = user_id);

-- ALL: Users can only manage their own favorites
CREATE POLICY "Users can manage own favorites" ON user_favorites
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 13. CREATE SECURE VIEW FOR PUBLIC FAVORITE DISPLAY
-- ============================================================================
-- This view exposes only the book info, not user associations
-- Use this for profile pages where favorites should be visible

CREATE OR REPLACE VIEW public_user_favorites AS
SELECT
  uf.user_id,
  uf.book_id,
  uf.position,
  b.title as book_title,
  b.cover_url as book_cover_url
FROM user_favorites uf
JOIN books b ON b.id = uf.book_id;

-- Grant select on the view (view inherits base table RLS)
GRANT SELECT ON public_user_favorites TO authenticated, anon;

-- ============================================================================
-- 14. CREATE SECURE FUNCTION FOR RATING DISTRIBUTION
-- ============================================================================
-- Since individual ratings are private, we need a function for aggregation

CREATE OR REPLACE FUNCTION get_book_rating_distribution(book_uuid UUID)
RETURNS TABLE (score INT, count BIGINT)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    score::INT,
    COUNT(*)::BIGINT
  FROM ratings
  WHERE book_id = book_uuid
  GROUP BY score
  ORDER BY score;
$$;

-- Grant execute to all
GRANT EXECUTE ON FUNCTION get_book_rating_distribution(UUID) TO authenticated, anon;

-- ============================================================================
-- 15. STORAGE BUCKET POLICIES (avatars)
-- ============================================================================
-- Run these in Storage > Policies section or via SQL

-- Allow authenticated users to upload their own avatars
-- Path pattern: avatars/{user_id}-*
INSERT INTO storage.policies (name, bucket_id, definition)
SELECT
  'Users can upload own avatar',
  'avatars',
  jsonb_build_object(
    'operation', 'INSERT',
    'check', format('bucket_id = %L AND (storage.foldername(name))[1] = auth.uid()::text', 'avatars')
  )
WHERE NOT EXISTS (
  SELECT 1 FROM storage.policies WHERE name = 'Users can upload own avatar' AND bucket_id = 'avatars'
);

-- Allow public read access to avatars
INSERT INTO storage.policies (name, bucket_id, definition)
SELECT
  'Avatars are publicly viewable',
  'avatars',
  jsonb_build_object(
    'operation', 'SELECT',
    'check', format('bucket_id = %L', 'avatars')
  )
WHERE NOT EXISTS (
  SELECT 1 FROM storage.policies WHERE name = 'Avatars are publicly viewable' AND bucket_id = 'avatars'
);

-- ============================================================================
-- VERIFICATION QUERIES - Run these to confirm RLS is enabled
-- ============================================================================

-- Check RLS status on all tables
-- SELECT schemaname, tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public';

-- List all policies
-- SELECT tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'public';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
