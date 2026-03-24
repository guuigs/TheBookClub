# Todo - TheBookClub

> **Dernière mise à jour**: 24 mars 2026
> **Session active**: Audit sécurité + Corrections + Analytics

---

## FAIT - Session 24 mars 2026

### Corrections de sécurité

- [x] **CRITIQUE**: Bug mobile - notation sans auth
  - `InteractiveStarRating` : ajout props `disabled` et `onDisabledClick`
  - Page livre : désactivation si non connecté
  - Gestion d'erreur dans `performRatingChange`

- [x] **CRITIQUE**: Routes API sans authentification
  - `/api/admin/update-covers` : auth admin (badge='honor')
  - `/api/books/add-by-volume` : auth utilisateur

- [x] **HAUTE**: RLS INSERT trop permissif
  - Migration appliquée : restrict_insert_authors_books

- [x] **MOYENNE**: Vues SECURITY DEFINER
  - Migration appliquée : fix_security_definer_views

- [x] **BASSE**: Fonctions sans search_path
  - Migration appliquée : fix_function_search_path

### Optimisations

- [x] Full-text search PostgreSQL
  - Index GIN pg_trgm sur books, authors, profiles
  - Migration appliquée : fulltext_search_optimization

- [x] Filtre langue française Google Books API
  - Paramètre `langRestrict=fr` ajouté

- [x] Détection couvertures "image not available"
  - Vérification taille minimum 2KB

### Intégrations

- [x] Vercel Analytics
  - Package `@vercel/analytics` ajouté
  - Composant `<Analytics />` dans layout

- [x] Mentions légales mises à jour
  - Section Analytics ajoutée à `/privacy`
  - Section Cookies mise à jour dans `/mentions-legales`

---

## NON APPLICABLE

- [ ] ~~Leaked password protection~~ (Option Pro Supabase uniquement)

---

## FAIT - Session 24 mars 2026 (suite)

### Détection fiable couvertures Google Books

- [x] **Problème identifié**: La détection par taille d'image (2KB) ne fonctionne pas
  - Images "not available" peuvent faire jusqu'à 81KB selon le zoom
  - Méthode non fiable car basée sur le contenu téléchargé

- [x] **Solution implémentée**: Détection via métadonnées API
  - Livres AVEC couverture: API retourne `extraLarge`, `large`, `medium`, `small`
  - Livres SANS couverture: API retourne seulement `thumbnail`, `smallThumbnail`
  - Testé sur 5 volumes: 100% fiable
  - Aucune requête HTTP supplémentaire nécessaire

- [x] **Fichiers modifiés**:
  - `/api/books/add-by-volume/route.ts`: Nouvelle fonction `getBestCover()`
  - `/api/admin/update-covers/route.ts`: Nouvelle logique via API Google Books

---

## EN ATTENTE - Changements majeurs

### 1. Avatar: remplacer upload par gradient généré
- [ ] Créer fonction `generateGradient(userId)`
- [ ] Ajouter effet grain léger
- [ ] Supprimer logique d'upload
- [ ] Mettre à jour Avatar.tsx

### 2. Page livre: restaurer sections liens
- [ ] Schema DB: table `book_links`
- [ ] Afficher "Non disponible" si aucun lien

---

## RAPPORTS

- `tasks/SECURITY_AUDIT_2026-03-24.md` - Audit complet

---

*Fichier maintenu pour continuité entre sessions*
