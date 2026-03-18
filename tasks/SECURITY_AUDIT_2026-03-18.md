# Audit de Securite Supabase - TheBookClub

**Date**: 18 mars 2026
**Statut**: Migrations creees, en attente de deploiement

---

## Resume Executif

L'audit a revele des **vulnerabilites critiques** dans la configuration RLS (Row Level Security) du projet. Sur 11 tables utilisees, seule 1 avait des politiques RLS documentees.

### Risques Identifies

| Severite | Description |
|----------|-------------|
| **CRITIQUE** | Tables sans RLS = donnees accessibles a tous |
| **HAUTE** | Ratings et user_books exposes sans protection |
| **MOYENNE** | Politique user_favorites trop permissive |
| **BASSE** | Absence d'audit logging et rate limiting |

---

## Vulnerabilites Detaillees

### 1. Tables Sans RLS (CRITIQUE)

Les tables suivantes n'avaient **aucune politique RLS documentee**:

- `profiles` - Donnees utilisateur
- `ratings` - Notes privees des utilisateurs
- `user_books` - Statut de lecture (prive)
- `comments` - Commentaires publics
- `comment_likes` - Likes de commentaires
- `book_lists` - Listes de livres
- `book_list_items` - Contenu des listes
- `list_likes` - Likes de listes
- `follows` - Relations de suivi

**Impact**: Sans RLS, un attaquant peut:
- Lire les notes de tous les utilisateurs
- Voir ce que chaque utilisateur lit
- Modifier/supprimer les donnees d'autres utilisateurs via API directe

### 2. Politique user_favorites Trop Permissive (MOYENNE)

```sql
-- Ancienne politique
CREATE POLICY "Users can view all favorites" ON user_favorites
  FOR SELECT USING (true);
```

**Impact**: N'importe qui peut voir les favoris de tous les utilisateurs.

### 3. Validations Cote Client Insuffisantes (HAUTE)

Le code TypeScript verifie l'ownership, mais ces verifications peuvent etre contournees par des appels API directs a Supabase.

Exemple dans `comments.ts:165-172`:
```typescript
// Cette verification cote client est bypassable
if (!comment || comment.user_id !== user.id) {
  return { error: 'Vous ne pouvez modifier que vos propres commentaires.' }
}
```

---

## Migrations Creees

### 002_complete_rls_security.sql

Active RLS et cree des politiques pour toutes les tables:

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| profiles | Public | Owner | Owner | Non |
| ratings | Owner | Owner | Owner | Owner |
| user_books | Owner | Owner | Owner | Owner |
| comments | Public | Owner | Owner | Owner |
| comment_likes | Public | Owner | - | Owner |
| book_lists | Public | Owner | Owner | Owner |
| book_list_items | Public | List Owner | List Owner | List Owner |
| list_likes | Public | Owner | - | Owner |
| follows | Public | Follower | - | Follower |
| books | Public | Non | Non | Non |

### 003_secure_views_and_functions.sql

Cree des fonctions SECURITY DEFINER pour l'acces controle:

- `get_user_favorites(user_id)` - Afficher favoris sur profil public
- `get_book_rating_distribution(book_id)` - Stats agregees sans exposer notes individuelles
- `get_book_rating_stats(book_id)` - Moyenne et total votes
- `get_friends_ratings(book_id)` - Notes des amis
- `get_friends_comments(book_id)` - Commentaires des amis

### 004_storage_security.sql

Securise le bucket avatars:

- Lecture publique (pour affichage profil)
- Upload/Update/Delete uniquement pour ses propres fichiers
- Pattern: `avatars/{user_id}-{timestamp}.{ext}`

---

## Plan de Deploiement

### Etape 1: Backup (OBLIGATOIRE)

```bash
# Via Supabase Dashboard > Settings > Database > Backups
# OU
pg_dump -h db.jtgdtydqekakkrvoekqs.supabase.co -U postgres > backup_2026-03-18.sql
```

### Etape 2: Deployer les Migrations

**Ordre d'execution** (respecter strictement):

1. `002_complete_rls_security.sql` - Politiques RLS de base
2. `003_secure_views_and_functions.sql` - Vues et fonctions securisees
3. `004_storage_security.sql` - Politiques storage

**Methode**:
1. Ouvrir Supabase Dashboard
2. Aller dans SQL Editor
3. Copier/coller chaque fichier
4. Executer et verifier les resultats

### Etape 3: Verification

Executer ces requetes de verification:

```sql
-- Verifier RLS actif sur toutes les tables
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Lister toutes les politiques
SELECT tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Tester acces anonyme (doit echouer pour ratings)
SET ROLE anon;
SELECT * FROM ratings LIMIT 1; -- Doit retourner 0 lignes
RESET ROLE;
```

### Etape 4: Tests Fonctionnels

Apres deploiement, tester:

- [ ] Connexion/Deconnexion
- [ ] Consulter un profil utilisateur
- [ ] Voir les favoris sur un profil
- [ ] Noter un livre (connecte)
- [ ] Voir la distribution des notes d'un livre
- [ ] Ajouter un commentaire
- [ ] Liker un commentaire
- [ ] Creer/modifier/supprimer une liste
- [ ] Suivre/ne plus suivre un utilisateur
- [ ] Upload d'avatar
- [ ] Consulter les "notes de mes amis"

### Etape 5: Rollback (si necessaire)

```sql
-- Desactiver RLS (ATTENTION: expose les donnees)
ALTER TABLE ratings DISABLE ROW LEVEL SECURITY;
-- Repeter pour chaque table...

-- Supprimer les fonctions
DROP FUNCTION IF EXISTS get_user_favorites(UUID);
DROP FUNCTION IF EXISTS get_book_rating_distribution(UUID);
-- etc.
```

---

## Modifications Code Client

### ratings.ts

`getRatingDistribution()` utilise maintenant `rpc('get_book_rating_distribution')` au lieu d'un acces direct a la table.

### favorites.ts

- Nouvelle fonction `getUserFavoritesWithDetails()` avec details complets
- `getUserFavorites()` utilise maintenant `rpc('get_user_favorites')`

### comments.ts

`deleteComment()` utilise maintenant `rpc('delete_comment_with_likes')` pour supprimer en cascade les likes d'autres utilisateurs.

### lists.ts

`deleteList()` utilise maintenant `rpc('delete_list_with_cascade')` pour supprimer en cascade les items et likes d'autres utilisateurs.

---

## Recommandations Additionnelles

### Court Terme (a faire rapidement)

1. **Deployer les migrations** - Priorite absolue
2. **Activer email confirmation** - Supabase Auth > Settings
3. **Configurer rate limiting** - Via Supabase Edge Functions ou middleware

### Moyen Terme

1. **Audit logging** - Creer une table `audit_logs` avec triggers
2. **2FA optionnel** - Pour les comptes sensibles
3. **Rotation des cles API** - Regenerer anon/service keys

### Long Terme

1. **Penetration testing** - Faire auditer par un tiers
2. **Monitoring** - Alertes sur requetes suspectes
3. **Backup automatique** - Politique de retention

---

## Fichiers Concernes

```
tasks/migrations/
├── 001_create_user_favorites.sql  (existant)
├── 002_complete_rls_security.sql  (NOUVEAU)
├── 003_secure_views_and_functions.sql  (NOUVEAU)
└── 004_storage_security.sql  (NOUVEAU)

src/lib/db/
├── ratings.ts  (MODIFIE - utilise RPC)
└── favorites.ts  (MODIFIE - utilise RPC)
```

---

## Checklist Pre-Production

- [ ] Backup de la base de donnees
- [ ] Migration 002 executee et verifiee
- [ ] Migration 003 executee et verifiee
- [ ] Migration 004 executee et verifiee
- [ ] Tests fonctionnels passes
- [ ] Pas de regression visible
- [ ] Logs Supabase verifies (pas d'erreurs)

---

*Document genere le 18 mars 2026*
