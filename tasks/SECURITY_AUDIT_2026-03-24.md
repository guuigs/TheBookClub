# Audit de Sécurité Expert - TheBookClub

**Date**: 24 mars 2026
**Niveau**: Expert
**Statut**: En cours d'analyse

---

## Résumé Exécutif

L'audit a révélé **2 vulnérabilités critiques** dans les routes API, ainsi que plusieurs problèmes de configuration Supabase identifiés par le linter de sécurité.

### Tableau des Risques

| Sévérité | Description | Impact |
|----------|-------------|--------|
| **CRITIQUE** | Routes API admin sans authentification | Prise de contrôle partielle |
| **CRITIQUE** | Route ajout livre sans authentification | Spam, pollution données |
| **HAUTE** | RLS permet INSERT anonymous sur authors/books | Injection de données |
| **MOYENNE** | Vues SECURITY DEFINER | Bypass potentiel RLS |
| **BASSE** | Fonctions sans search_path fixé | Injection de schéma |
| **BASSE** | Leaked password protection désactivée | Comptes compromis |

---

## 1. Vulnérabilités Routes API

### 1.1 CRITIQUE - Route Admin Sans Auth

**Fichier**: `src/app/api/admin/update-covers/route.ts`

```typescript
// Ligne 28 - Aucune vérification d'authentification
export async function POST() {
  const supabase = await createClient()
  // ... modifie directement les covers de TOUS les livres
```

**Impact**:
- N'importe qui peut appeler cette route
- Modification en masse des données
- Potentiel DoS (boucle sur tous les livres)

**Remède**:
```typescript
export async function POST() {
  const supabase = await createClient()

  // Vérifier l'authentification
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  // Vérifier que c'est un admin (badge = 'honor' ou liste whitelist)
  const { data: profile } = await supabase
    .from('profiles')
    .select('badge')
    .eq('id', user.id)
    .single()

  if (profile?.badge !== 'honor') {
    return NextResponse.json({ error: 'Accès admin requis' }, { status: 403 })
  }
  // ... reste du code
```

---

### 1.2 CRITIQUE - Route Ajout Livre Sans Auth

**Fichier**: `src/app/api/books/add-by-volume/route.ts`

```typescript
// Ligne 93 - Aucune vérification d'authentification
export async function POST(request: NextRequest) {
  const { volumeId } = await request.json()
  // ... ajoute directement livres et auteurs
```

**Impact**:
- Spam de livres/auteurs par bots
- Pollution de la base de données
- Combiné avec RLS permissif = injection massive possible

**Remède**:
```typescript
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // Authentification requise pour ajouter un livre
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Connexion requise' }, { status: 401 })
  }

  const { volumeId } = await request.json()
  // ... reste du code
```

---

### 1.3 Routes Sécurisées (OK)

| Route | Méthode | Auth | Statut |
|-------|---------|------|--------|
| `/api/user/delete-account` | DELETE | ✅ | Sécurisé |
| `/api/user/export-data` | GET | ✅ | Sécurisé |
| `/api/user/check-username` | GET | ❌ | OK (public) |
| `/api/books/search-google` | GET | ❌ | OK (recherche) |

---

## 2. Vulnérabilités Supabase (Linter)

### 2.1 HAUTE - RLS INSERT Trop Permissif

**Tables concernées**: `authors`, `books`

```sql
-- Politique actuelle (DANGEREUSE)
CREATE POLICY "authors_insert" ON public.authors
  FOR INSERT WITH CHECK (true);  -- N'importe qui peut insérer !

CREATE POLICY "books_insert" ON public.books
  FOR INSERT WITH CHECK (true);  -- N'importe qui peut insérer !
```

**Impact**: Même sans les routes API, un attaquant avec la clé anon peut insérer directement via l'API Supabase.

**Remède**:
```sql
-- Migration: restrict_insert_authors_books.sql

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "authors_insert" ON public.authors;
DROP POLICY IF EXISTS "books_insert" ON public.books;

-- Nouvelles politiques restrictives
CREATE POLICY "authors_insert_authenticated" ON public.authors
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "books_insert_authenticated" ON public.books
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Retirer le droit anon
REVOKE INSERT ON public.authors FROM anon;
REVOKE INSERT ON public.books FROM anon;
```

---

### 2.2 MOYENNE - Vues SECURITY DEFINER

**Vues concernées**: `books_with_stats`, `profiles_with_stats`

Ces vues s'exécutent avec les permissions du créateur (superuser), pas de l'utilisateur appelant. Cela peut bypasser les politiques RLS.

**Remède**:
```sql
-- Option 1: Recréer sans SECURITY DEFINER
DROP VIEW IF EXISTS public.books_with_stats;
CREATE VIEW public.books_with_stats AS
  SELECT ... -- même requête
WITH (security_invoker = true);

-- Option 2: Si SECURITY DEFINER est nécessaire, ajouter des contrôles
```

---

### 2.3 BASSE - Fonctions Sans search_path

**Fonctions concernées**:
- `create_default_reading_list`
- `get_user_ratings`

**Risque**: Un attaquant pourrait créer un schéma malicieux avec des tables/fonctions du même nom.

**Remède**:
```sql
ALTER FUNCTION public.create_default_reading_list()
  SET search_path = public, pg_temp;

ALTER FUNCTION public.get_user_ratings(uuid)
  SET search_path = public, pg_temp;
```

---

### 2.4 BASSE - Leaked Password Protection

La protection contre les mots de passe compromis (HaveIBeenPwned) est désactivée.

**Remède**:
1. Aller dans Supabase Dashboard
2. Authentication > Settings > Security
3. Activer "Leaked password protection"

---

## 3. Analyse Code Client

### 3.1 XSS - Pas de dangerouslySetInnerHTML Trouvé ✅

Aucune utilisation de `dangerouslySetInnerHTML` détectée. Le code utilise `stripHtmlTags()` pour nettoyer les descriptions Google Books.

### 3.2 Gestion des Tokens ✅

Les tokens sont gérés par `@supabase/ssr` via cookies httpOnly. Pas d'exposition côté client.

### 3.3 Redirections ✅

Les redirections utilisent `router.push()` avec des chemins relatifs hardcodés. Pas de risque d'open redirect.

---

## 4. État Actuel Supabase

### 4.1 RLS Activé sur Toutes les Tables ✅

| Table | RLS | Rows |
|-------|-----|------|
| profiles | ✅ | 4 |
| authors | ✅ | 122 |
| books | ✅ | 118 |
| ratings | ✅ | 11 |
| comments | ✅ | 3 |
| comment_likes | ✅ | 3 |
| user_books | ✅ | 0 |
| book_lists | ✅ | 5 |
| book_list_items | ✅ | 7 |
| list_likes | ✅ | 0 |
| follows | ✅ | 3 |
| user_favorites | ✅ | 4 |

### 4.2 Migrations Appliquées

19 migrations appliquées, dont les correctifs RLS du 18 mars.

---

## 5. Plan de Remédiation

### Priorité 1 - CRITIQUE (À faire immédiatement)

1. [ ] Sécuriser `/api/admin/update-covers` avec auth admin
2. [ ] Sécuriser `/api/books/add-by-volume` avec auth utilisateur
3. [ ] Restreindre INSERT sur authors/books aux users authentifiés

### Priorité 2 - HAUTE (Cette semaine)

4. [ ] Corriger les vues SECURITY DEFINER

### Priorité 3 - BASSE (Planifié)

5. [ ] Fixer search_path des fonctions
6. [ ] Activer leaked password protection

---

## 6. Tests de Validation

Après remédiation, exécuter ces tests :

```bash
# Test 1: Route admin sans auth (doit échouer)
curl -X POST https://thebookclub.cafe/api/admin/update-covers
# Attendu: 401 Unauthorized

# Test 2: Route add-by-volume sans auth (doit échouer)
curl -X POST https://thebookclub.cafe/api/books/add-by-volume \
  -H "Content-Type: application/json" \
  -d '{"volumeId": "test123"}'
# Attendu: 401 Unauthorized

# Test 3: INSERT direct via Supabase anon (doit échouer)
# Via Supabase client avec clé anon, tenter d'insérer un auteur
# Attendu: RLS policy violation
```

---

*Document généré le 24 mars 2026*
