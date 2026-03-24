-- Migration: Restreindre INSERT sur authors et books aux utilisateurs authentifiés
-- Date: 2026-03-24
-- Sévérité: HAUTE
-- Description: Les politiques actuelles permettent à anonymous d'insérer des auteurs/livres

-- ============================================
-- 1. Supprimer les anciennes politiques INSERT
-- ============================================

DROP POLICY IF EXISTS "authors_insert" ON public.authors;
DROP POLICY IF EXISTS "books_insert" ON public.books;

-- ============================================
-- 2. Créer les nouvelles politiques restrictives
-- ============================================

-- Seuls les utilisateurs authentifiés peuvent ajouter des auteurs
CREATE POLICY "authors_insert_authenticated" ON public.authors
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Seuls les utilisateurs authentifiés peuvent ajouter des livres
CREATE POLICY "books_insert_authenticated" ON public.books
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- ============================================
-- 3. Révoquer les droits INSERT pour anonymous
-- ============================================

REVOKE INSERT ON public.authors FROM anon;
REVOKE INSERT ON public.books FROM anon;

-- ============================================
-- 4. Vérification
-- ============================================

-- Pour vérifier que les politiques sont bien en place:
-- SELECT tablename, policyname, permissive, roles, cmd
-- FROM pg_policies
-- WHERE schemaname = 'public' AND tablename IN ('authors', 'books');
