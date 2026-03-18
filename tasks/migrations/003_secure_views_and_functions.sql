-- ============================================================================
-- Migration: Secure Views and Functions for Public Data Access
-- Date: 2026-03-18
-- Description: Creates secure views for data that needs controlled public access
-- ============================================================================

-- ============================================================================
-- 1. PUBLIC USER FAVORITES VIEW
-- ============================================================================
-- Allows viewing favorites on profile pages without exposing raw table
-- The view exposes book info for a given user_id (passed as parameter in query)

DROP VIEW IF EXISTS public_user_favorites;

CREATE VIEW public_user_favorites AS
SELECT
  uf.user_id,
  uf.book_id,
  uf.position,
  b.id as book_id_ref,
  b.title as book_title,
  b.cover_url as book_cover_url,
  b.author_id,
  a.name as author_name
FROM user_favorites uf
JOIN books b ON b.id = uf.book_id
LEFT JOIN authors a ON a.id = b.author_id;

-- Grant access to the view
GRANT SELECT ON public_user_favorites TO authenticated, anon;

-- ============================================================================
-- 2. SECURE FUNCTION: Get User Favorites By User ID
-- ============================================================================
-- This function allows fetching favorites for any user (public profile feature)
-- It bypasses RLS safely by using SECURITY DEFINER

CREATE OR REPLACE FUNCTION get_user_favorites(target_user_id UUID)
RETURNS TABLE (
  book_id UUID,
  position INTEGER,
  book_title TEXT,
  book_cover_url TEXT,
  author_id UUID,
  author_name TEXT
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    uf.book_id,
    uf.position,
    b.title,
    b.cover_url,
    b.author_id,
    COALESCE(a.name, 'Auteur inconnu')
  FROM user_favorites uf
  JOIN books b ON b.id = uf.book_id
  LEFT JOIN authors a ON a.id = b.author_id
  WHERE uf.user_id = target_user_id
  ORDER BY uf.position ASC;
$$;

GRANT EXECUTE ON FUNCTION get_user_favorites(UUID) TO authenticated, anon;

-- ============================================================================
-- 3. SECURE FUNCTION: Get Rating Distribution for a Book
-- ============================================================================
-- Returns aggregated rating counts without exposing individual user ratings

CREATE OR REPLACE FUNCTION get_book_rating_distribution(book_uuid UUID)
RETURNS TABLE (score INTEGER, vote_count BIGINT)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    r.score::INTEGER,
    COUNT(*)::BIGINT as vote_count
  FROM ratings r
  WHERE r.book_id = book_uuid
  GROUP BY r.score
  ORDER BY r.score ASC;
$$;

GRANT EXECUTE ON FUNCTION get_book_rating_distribution(UUID) TO authenticated, anon;

-- ============================================================================
-- 4. SECURE FUNCTION: Get Book Average Rating
-- ============================================================================
-- Returns average rating and total votes for a book

CREATE OR REPLACE FUNCTION get_book_rating_stats(book_uuid UUID)
RETURNS TABLE (average_rating NUMERIC, total_votes BIGINT)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    COALESCE(AVG(score), 0)::NUMERIC(3,2),
    COUNT(*)::BIGINT
  FROM ratings
  WHERE book_id = book_uuid;
$$;

GRANT EXECUTE ON FUNCTION get_book_rating_stats(UUID) TO authenticated, anon;

-- ============================================================================
-- 5. SECURE FUNCTION: Get Friends' Ratings for a Book
-- ============================================================================
-- Returns ratings from users the current user follows (for "Notes de mes amis")
-- Only works for authenticated users

CREATE OR REPLACE FUNCTION get_friends_ratings(book_uuid UUID)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  display_name TEXT,
  avatar_url TEXT,
  badge TEXT,
  score INTEGER
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    p.id,
    p.username,
    p.display_name,
    p.avatar_url,
    p.badge,
    r.score::INTEGER
  FROM ratings r
  JOIN profiles p ON p.id = r.user_id
  JOIN follows f ON f.following_id = r.user_id AND f.follower_id = auth.uid()
  WHERE r.book_id = book_uuid;
$$;

GRANT EXECUTE ON FUNCTION get_friends_ratings(UUID) TO authenticated;

-- ============================================================================
-- 6. SECURE FUNCTION: Get Friends' Comments for a Book
-- ============================================================================
-- Returns comments from users the current user follows

CREATE OR REPLACE FUNCTION get_friends_comments(book_uuid UUID)
RETURNS TABLE (
  comment_id UUID,
  user_id UUID,
  username TEXT,
  display_name TEXT,
  avatar_url TEXT,
  badge TEXT,
  content TEXT,
  created_at TIMESTAMPTZ,
  likes_count BIGINT
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    c.id,
    p.id,
    p.username,
    p.display_name,
    p.avatar_url,
    p.badge,
    c.content,
    c.created_at,
    (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c.id)
  FROM comments c
  JOIN profiles p ON p.id = c.user_id
  JOIN follows f ON f.following_id = c.user_id AND f.follower_id = auth.uid()
  WHERE c.book_id = book_uuid
  ORDER BY c.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION get_friends_comments(UUID) TO authenticated;

-- ============================================================================
-- 7. SECURE VIEW: Books with Stats (replaces direct table access)
-- ============================================================================
-- This view calculates stats from ratings table securely

CREATE OR REPLACE VIEW books_with_stats AS
SELECT
  b.*,
  COALESCE(a.name, 'Auteur inconnu') as author_name,
  a.bio as author_bio,
  a.photo_url as author_photo_url,
  COALESCE(rs.avg_rating, 0) as average_rating,
  COALESCE(rs.total_votes, 0) as total_votes
FROM books b
LEFT JOIN authors a ON a.id = b.author_id
LEFT JOIN LATERAL (
  SELECT
    AVG(score)::NUMERIC(3,2) as avg_rating,
    COUNT(*)::BIGINT as total_votes
  FROM ratings r
  WHERE r.book_id = b.id
) rs ON true;

GRANT SELECT ON books_with_stats TO authenticated, anon;

-- ============================================================================
-- 8. SECURE VIEW: Profiles with Stats
-- ============================================================================
-- Aggregates profile statistics securely

CREATE OR REPLACE VIEW profiles_with_stats AS
SELECT
  p.*,
  COALESCE(br.count, 0) as books_rated,
  COALESCE(lc.count, 0) as lists_count,
  COALESCE(fc.followers, 0) as followers_count,
  COALESCE(fc.following, 0) as following_count
FROM profiles p
LEFT JOIN LATERAL (
  SELECT COUNT(*)::BIGINT as count FROM ratings WHERE user_id = p.id
) br ON true
LEFT JOIN LATERAL (
  SELECT COUNT(*)::BIGINT as count FROM book_lists WHERE author_id = p.id
) lc ON true
LEFT JOIN LATERAL (
  SELECT
    (SELECT COUNT(*) FROM follows WHERE following_id = p.id)::BIGINT as followers,
    (SELECT COUNT(*) FROM follows WHERE follower_id = p.id)::BIGINT as following
) fc ON true;

GRANT SELECT ON profiles_with_stats TO authenticated, anon;

-- ============================================================================
-- 9. SECURE FUNCTION: Delete Comment with Cascade
-- ============================================================================
-- Deletes a comment and all its likes (owner only)
-- Required because RLS prevents deleting other users' likes

CREATE OR REPLACE FUNCTION delete_comment_with_likes(comment_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  comment_owner UUID;
BEGIN
  -- Get the comment owner
  SELECT user_id INTO comment_owner
  FROM comments
  WHERE id = comment_uuid;

  -- Verify ownership
  IF comment_owner IS NULL THEN
    RAISE EXCEPTION 'Comment not found';
  END IF;

  IF comment_owner != auth.uid() THEN
    RAISE EXCEPTION 'You can only delete your own comments';
  END IF;

  -- Delete all likes on this comment (bypasses RLS)
  DELETE FROM comment_likes WHERE comment_id = comment_uuid;

  -- Delete the comment
  DELETE FROM comments WHERE id = comment_uuid;

  RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION delete_comment_with_likes(UUID) TO authenticated;

-- ============================================================================
-- 10. SECURE FUNCTION: Delete List with Cascade
-- ============================================================================
-- Deletes a list, its items, and all its likes (owner only)

CREATE OR REPLACE FUNCTION delete_list_with_cascade(list_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  list_owner UUID;
BEGIN
  -- Get the list owner
  SELECT author_id INTO list_owner
  FROM book_lists
  WHERE id = list_uuid;

  -- Verify ownership
  IF list_owner IS NULL THEN
    RAISE EXCEPTION 'List not found';
  END IF;

  IF list_owner != auth.uid() THEN
    RAISE EXCEPTION 'You can only delete your own lists';
  END IF;

  -- Delete all items (bypasses RLS check for performance)
  DELETE FROM book_list_items WHERE list_id = list_uuid;

  -- Delete all likes on this list (bypasses RLS)
  DELETE FROM list_likes WHERE list_id = list_uuid;

  -- Delete the list
  DELETE FROM book_lists WHERE id = list_uuid;

  RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION delete_list_with_cascade(UUID) TO authenticated;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
