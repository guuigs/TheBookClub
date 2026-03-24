-- Migration: Optimisation de la recherche avec Full-Text Search
-- Date: 2026-03-24
-- Objectif: Performance optimale pour 10000+ livres et 100000+ membres

-- ============================================
-- 1. Activer l'extension pg_trgm pour la recherche floue
-- ============================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- ============================================
-- 2. Créer une configuration de recherche française
-- ============================================

-- Configuration pour le français avec gestion des accents
CREATE TEXT SEARCH CONFIGURATION IF NOT EXISTS french_unaccent (COPY = french);

ALTER TEXT SEARCH CONFIGURATION french_unaccent
  ALTER MAPPING FOR hword, hword_part, word
  WITH unaccent, french_stem;

-- ============================================
-- 3. Ajouter la colonne search_vector à books
-- ============================================

ALTER TABLE public.books
  ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- ============================================
-- 4. Créer la fonction de mise à jour du search_vector
-- ============================================

CREATE OR REPLACE FUNCTION books_search_vector_update()
RETURNS trigger AS $$
DECLARE
  author_name text;
BEGIN
  -- Récupérer le nom de l'auteur
  SELECT name INTO author_name
  FROM authors
  WHERE id = NEW.author_id;

  -- Construire le vecteur de recherche
  NEW.search_vector :=
    setweight(to_tsvector('french_unaccent', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('french_unaccent', COALESCE(author_name, '')), 'A') ||
    setweight(to_tsvector('french_unaccent', COALESCE(NEW.genre, '')), 'B') ||
    setweight(to_tsvector('french_unaccent', COALESCE(NEW.description, '')), 'C');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public, pg_temp;

-- ============================================
-- 5. Créer le trigger pour books
-- ============================================

DROP TRIGGER IF EXISTS books_search_vector_trigger ON public.books;

CREATE TRIGGER books_search_vector_trigger
  BEFORE INSERT OR UPDATE OF title, author_id, genre, description
  ON public.books
  FOR EACH ROW
  EXECUTE FUNCTION books_search_vector_update();

-- ============================================
-- 6. Mettre à jour les livres existants
-- ============================================

UPDATE public.books SET search_vector =
  setweight(to_tsvector('french_unaccent', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('french_unaccent', COALESCE(
    (SELECT name FROM authors WHERE id = books.author_id), ''
  )), 'A') ||
  setweight(to_tsvector('french_unaccent', COALESCE(genre, '')), 'B') ||
  setweight(to_tsvector('french_unaccent', COALESCE(description, '')), 'C');

-- ============================================
-- 7. Créer l'index GIN pour la recherche rapide
-- ============================================

CREATE INDEX IF NOT EXISTS idx_books_search_vector
  ON public.books USING GIN (search_vector);

-- Index supplémentaires pour les tris fréquents
CREATE INDEX IF NOT EXISTS idx_books_created_at
  ON public.books (created_at DESC);

-- ============================================
-- 8. Index pg_trgm pour la recherche floue (typos)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_books_title_trgm
  ON public.books USING GIN (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_authors_name_trgm
  ON public.authors USING GIN (name gin_trgm_ops);

-- ============================================
-- 9. Fonction RPC de recherche optimisée
-- ============================================

CREATE OR REPLACE FUNCTION search_books_fts(
  search_query text,
  result_limit int DEFAULT 20,
  result_offset int DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  title text,
  cover_url text,
  description text,
  genre text,
  created_at timestamptz,
  free_read_link text,
  buy_link text,
  author_id uuid,
  author_name text,
  author_photo_url text,
  average_rating numeric,
  rating_count int,
  comment_count int,
  rank real
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
  ts_query tsquery;
BEGIN
  -- Convertir la requête en tsquery avec gestion des espaces
  ts_query := plainto_tsquery('french_unaccent', search_query);

  RETURN QUERY
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
    COUNT(DISTINCT c.id)::int AS comment_count,
    ts_rank(b.search_vector, ts_query) AS rank
  FROM books b
  LEFT JOIN authors a ON b.author_id = a.id
  LEFT JOIN ratings r ON r.book_id = b.id
  LEFT JOIN comments c ON c.book_id = b.id AND c.is_private = false
  WHERE b.search_vector @@ ts_query
     OR b.title ILIKE '%' || search_query || '%'
     OR a.name ILIKE '%' || search_query || '%'
  GROUP BY b.id, a.id
  ORDER BY rank DESC, rating_count DESC
  LIMIT result_limit
  OFFSET result_offset;
END;
$$;

-- Accorder les permissions
GRANT EXECUTE ON FUNCTION search_books_fts TO anon, authenticated;

-- ============================================
-- 10. Index pour les profils (recherche membres)
-- ============================================

-- Index pour recherche rapide sur username et display_name
CREATE INDEX IF NOT EXISTS idx_profiles_username_trgm
  ON public.profiles USING GIN (username gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_profiles_display_name_trgm
  ON public.profiles USING GIN (display_name gin_trgm_ops);

-- ============================================
-- 11. Fonction RPC de recherche de membres
-- ============================================

CREATE OR REPLACE FUNCTION search_members(
  search_query text,
  result_limit int DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  username text,
  display_name text,
  avatar_url text,
  badge text,
  rating_count bigint,
  follower_count bigint
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.username,
    p.display_name,
    p.avatar_url,
    p.badge,
    (SELECT COUNT(*) FROM ratings WHERE user_id = p.id) AS rating_count,
    (SELECT COUNT(*) FROM follows WHERE following_id = p.id) AS follower_count
  FROM profiles p
  WHERE p.username ILIKE '%' || search_query || '%'
     OR p.display_name ILIKE '%' || search_query || '%'
  ORDER BY
    CASE WHEN p.username ILIKE search_query || '%' THEN 0 ELSE 1 END,
    follower_count DESC
  LIMIT result_limit;
END;
$$;

-- Accorder les permissions
GRANT EXECUTE ON FUNCTION search_members TO anon, authenticated;

-- ============================================
-- VÉRIFICATION
-- ============================================

-- Pour tester la recherche:
-- SELECT * FROM search_books_fts('victor hugo', 10, 0);
-- SELECT * FROM search_members('john', 10);
