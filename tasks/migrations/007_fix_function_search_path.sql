-- Migration: Fixer search_path des fonctions
-- Date: 2026-03-24
-- Sévérité: BASSE
-- Description: Les fonctions sans search_path fixé peuvent être vulnérables à l'injection de schéma

-- ============================================
-- 1. Fixer create_default_reading_list
-- ============================================

ALTER FUNCTION public.create_default_reading_list()
  SET search_path = public, pg_temp;

-- ============================================
-- 2. Fixer get_user_ratings
-- ============================================

ALTER FUNCTION public.get_user_ratings(uuid)
  SET search_path = public, pg_temp;

-- ============================================
-- 3. Vérification
-- ============================================

-- Pour vérifier que le search_path est bien fixé:
-- SELECT proname, proconfig
-- FROM pg_proc
-- WHERE pronamespace = 'public'::regnamespace
-- AND proname IN ('create_default_reading_list', 'get_user_ratings');
