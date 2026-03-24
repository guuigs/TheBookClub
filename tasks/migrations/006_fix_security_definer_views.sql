-- Migration: Corriger les vues SECURITY DEFINER
-- Date: 2026-03-24
-- Sévérité: MOYENNE
-- Description: Les vues books_with_stats et profiles_with_stats utilisent SECURITY DEFINER
--              ce qui peut bypasser les politiques RLS

-- ============================================
-- 1. Recréer books_with_stats avec security_invoker
-- ============================================

-- D'abord, récupérer la définition actuelle
-- SELECT pg_get_viewdef('public.books_with_stats', true);

DROP VIEW IF EXISTS public.books_with_stats;

CREATE VIEW public.books_with_stats AS
SELECT
  b.id,
  b.title,
  b.cover_url,
  b.description,
  b.genre,
  b.created_at,
  b.free_read_link,
  b.buy_link,
  a.id AS author_id,
  a.name AS author_name,
  a.photo_url AS author_photo_url,
  COALESCE(AVG(r.score), 0)::numeric(3,1) AS average_rating,
  COUNT(DISTINCT r.id)::int AS rating_count,
  COUNT(DISTINCT c.id)::int AS comment_count
FROM books b
LEFT JOIN authors a ON b.author_id = a.id
LEFT JOIN ratings r ON r.book_id = b.id
LEFT JOIN comments c ON c.book_id = b.id AND c.is_private = false
GROUP BY b.id, a.id;

-- Désactiver security_definer (utiliser security_invoker par défaut)
-- Note: PostgreSQL 15+ supporte security_invoker explicitement
-- Pour les versions antérieures, ne pas utiliser SECURITY DEFINER suffit

-- ============================================
-- 2. Recréer profiles_with_stats avec security_invoker
-- ============================================

DROP VIEW IF EXISTS public.profiles_with_stats;

CREATE VIEW public.profiles_with_stats AS
SELECT
  p.id,
  p.username,
  p.display_name,
  p.avatar_url,
  p.badge,
  p.bio,
  p.created_at,
  COUNT(DISTINCT r.id)::int AS rating_count,
  COUNT(DISTINCT c.id)::int AS comment_count,
  COUNT(DISTINCT bl.id)::int AS list_count,
  (SELECT COUNT(*) FROM follows WHERE following_id = p.id)::int AS follower_count,
  (SELECT COUNT(*) FROM follows WHERE follower_id = p.id)::int AS following_count
FROM profiles p
LEFT JOIN ratings r ON r.user_id = p.id
LEFT JOIN comments c ON c.user_id = p.id AND c.is_private = false
LEFT JOIN book_lists bl ON bl.author_id = p.id AND bl.is_private = false
GROUP BY p.id;

-- ============================================
-- 3. Accorder les permissions de lecture
-- ============================================

GRANT SELECT ON public.books_with_stats TO anon, authenticated;
GRANT SELECT ON public.profiles_with_stats TO anon, authenticated;
