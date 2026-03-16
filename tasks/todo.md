# TheBookClub - Audit Fonctionnel Complet

> **Date**: 16 mars 2026
> **Statut**: Audit terminé - 27 problèmes identifiés
> **Priorité**: Corrections critiques avant mise en production

---

## SYNTHESE EXECUTIVE

| Sévérité | Problèmes | Impact |
|----------|-----------|--------|
| CRITIQUE | 4 | Fonctionnalités cassées, données perdues |
| HAUTE | 5 | Logique métier incorrecte |
| MOYENNE | 10 | Fonctionnalités incomplètes |
| BASSE | 8 | UX/Polish manquant |

---

## CRITIQUE - Fonctionnalités Cassées

### C1. Edition de liste non sauvegardée
**Fichier**: `src/app/lists/[id]/edit/page.tsx:136-140`
```js
// TODO: Save list to backend
alert("Liste mise à jour avec succès !");
```
**Problème**: Le bouton "Enregistrer" fait un alert et redirige SANS sauvegarder.
**Impact**: L'utilisateur pense avoir sauvegardé, mais rien n'est persisté.

- [ ] Implémenter `updateList(id, title, description)` dans `lib/db/lists.ts`
- [ ] Implémenter `updateListBooks(listId, bookIds[])` pour sync les livres
- [ ] Connecter le handleSubmit à ces fonctions

---

### C2. Mauvais nom de table dans edit list
**Fichier**: `src/app/lists/[id]/edit/page.tsx:39`
```js
.from("lists")  // ERREUR - la table s'appelle "book_lists"
```
**Impact**: La page d'édition ne charge jamais les données existantes.

- [ ] Remplacer `"lists"` par `"book_lists"`
- [ ] Remplacer `"list_books"` par `"book_list_items"`

---

### C3. Boutons non fonctionnels sur page liste
**Fichier**: `src/app/lists/[id]/page.tsx:73-92`
**Problème**: Les boutons "J'aime", "Partager", "Supprimer" n'ont pas de onClick handlers.

- [ ] Connecter bouton "J'aime" à `toggleListLike()` (existe dans lib/db/lists.ts)
- [ ] Ajouter state `isLiked` et `likesCount` avec refresh
- [ ] Implémenter `deleteList(id)` dans lib/db/lists.ts
- [ ] Connecter bouton Supprimer avec confirmation
- [ ] Implémenter modal de partage (copier URL)

---

### C4. Bouton S'abonner non fonctionnel
**Fichier**: `src/app/profile/[id]/page.tsx:100-102`
```jsx
<Button variant="primary" className="w-fit">
  s'abonner
</Button>
```
**Problème**: Pas de onClick, les fonctions `followUser/unfollowUser` existent mais ne sont pas connectées.

- [ ] Convertir en Client Component ou extraire le bouton
- [ ] Ajouter state `isFollowing` avec check initial via `isFollowing()`
- [ ] Connecter à `followUser()` / `unfollowUser()` selon état
- [ ] Rafraîchir le compteur followers après action

---

## HAUTE - Logique Métier Incorrecte

### H1. "Coups de coeur" = premiers livres au lieu des mieux notés
**Fichier**: `src/app/profile/[id]/page.tsx:49`
```js
const favoriteBooks = ratedBooks.slice(0, 4);  // Prend les 4 premiers
```
**Attendu**: Devrait être les livres avec les meilleures notes de l'utilisateur.

- [ ] Trier `ratedBooks` par score décroissant avant slice
- [ ] Ou filtrer les livres notés >= 8/10

---

### H2. Pas de "vraie" fonctionnalité coups de coeur
**Problème**: L'utilisateur ne peut pas définir explicitement ses coups de coeur.
**Attendu**: Table `user_favorites` ou flag dans `user_books`.

- [ ] Option A: Ajouter table `user_favorites(user_id, book_id, order)`
- [ ] Option B: Ajouter colonne `is_favorite` dans `user_books`
- [ ] Ajouter bouton coeur sur les livres pour toggle
- [ ] Afficher sur profil les favoris explicites

---

### H3. Page d'accueil ne rafraîchit pas après rating
**Fichier**: `src/app/page.tsx` - useEffect avec `[]` dependencies
**Problème**: Un rating sur page livre ne se reflète pas sur homepage (cache client).

- [ ] Option A: Utiliser `router.refresh()` après rating
- [ ] Option B: Convertir homepage en Server Component avec revalidation
- [ ] Option C: Implémenter invalidation de cache via context

---

### H4. Pas de gestion des statuts "à lire" / "lu"
**Problème**: La table `user_books` existe avec `status` mais n'est jamais utilisée.
**Impact**: Fonctionnalité core de l'app manquante.

- [ ] Créer composant `BookStatusButton` (dropdown: à lire, lu, non défini)
- [ ] Implémenter `setBookStatus(bookId, status)` dans lib/db/books.ts
- [ ] Afficher sur page livre le statut actuel
- [ ] Filtrer par statut sur page profil/livres

---

### H5. "Derniers livres notés" identique aux "Coups de coeur"
**Fichier**: `src/app/profile/[id]/page.tsx:50`
```js
const recentRatedBooks = ratedBooks.slice(0, 4);  // Même que favoriteBooks !
```

- [ ] Trier par `created_at` DESC de la table `ratings` pour les récents
- [ ] Joindre ratings pour avoir la date de notation

---

## MOYENNE - Fonctionnalités Incomplètes

### M1. Onglet "Utilisateurs" non implémenté dans recherche
**Fichier**: `src/app/search/page.tsx:248-252`
```jsx
{activeTab === "users" && (
  <p>Cette fonctionnalité arrive bientôt</p>
)}
```

- [ ] Fetch `profiles_with_stats` avec recherche sur username/display_name
- [ ] Afficher liste de `MemberCard`
- [ ] Ajouter tri par followers

---

### M2. Like sur CommentCard non connecté
**Fichier**: `src/components/features/CommentCard.tsx`
**Problème**: Le bouton coeur existe mais n'appelle pas `toggleCommentLike()`.

- [ ] Ajouter props `onLike` et `isLiked`
- [ ] Connecter dans les pages qui affichent des commentaires
- [ ] Rafraîchir `likesCount` après toggle

---

### M3. Suppression de commentaires impossible
**Problème**: Pas de bouton/fonction pour supprimer ses propres commentaires.

- [ ] Implémenter `deleteComment(commentId)` dans lib/db/comments.ts
- [ ] Ajouter bouton poubelle sur ses propres commentaires
- [ ] Confirmation avant suppression

---

### M4. Edition de commentaires impossible
**Problème**: Pas moyen de modifier un commentaire existant.

- [ ] Implémenter `updateComment(commentId, content)` dans lib/db/comments.ts
- [ ] Ajouter mode édition dans CommentCard
- [ ] Limite de temps pour édition (ex: 15 min) ?

---

### M5. Suppression de liste impossible
**Fichier**: `src/app/lists/[id]/page.tsx:89-91`
```jsx
<Button variant="secondary">
  <Trash2 className="w-5 h-5" />
</Button>
```

- [ ] Implémenter `deleteList(listId)` dans lib/db/lists.ts
- [ ] Modal de confirmation
- [ ] Supprimer aussi les `book_list_items` associés

---

### M6. Pas de contrainte unique user_id+book_id sur ratings
**Problème**: `onConflict: 'user_id,book_id'` dans upsert suppose une contrainte.

- [ ] Vérifier/créer contrainte UNIQUE sur (user_id, book_id) dans ratings
- [ ] Idem pour user_books

---

### M7. Pas de validation ownership avant edit/delete
**Problème**: N'importe qui pourrait théoriquement éditer une liste d'un autre.

- [ ] Vérifier que `author_id === currentUser.id` avant update/delete liste
- [ ] Idem pour commentaires
- [ ] Retourner erreur 403 si pas owner

---

### M8. Page auteur - sous-page livres cassée
**Fichier**: `src/app/authors/[id]/books/page.tsx`

- [ ] Vérifier que la requête fonctionne avec books_with_stats
- [ ] Ajouter pagination

---

### M9. Pagination manquante partout
**Pages concernées**: /books, /lists, /members, /comments, profil/*

- [ ] Créer composant `Pagination`
- [ ] Implémenter sur /books (priorité)
- [ ] Implémenter sur /lists
- [ ] Implémenter sur /members

---

### M10. Tri des listes incomplet
**Fichier**: `src/app/lists/page.tsx`
**Problème**: Pas de tri par popularité (likes) ou date.

- [ ] Ajouter options de tri comme sur /books
- [ ] Par défaut: les plus récentes

---

## BASSE - UX/Polish

### B1. Pas de feedback visuel après actions
**Problème**: Aucun toast/notification après rating, comment, follow, etc.

- [ ] Installer/créer système de toast (react-hot-toast ou custom)
- [ ] Ajouter toast success après chaque action
- [ ] Ajouter toast error si échec

---

### B2. Pas d'états de chargement sur boutons
**Problème**: Les boutons ne montrent pas qu'une action est en cours.

- [ ] Ajouter prop `isLoading` à Button
- [ ] Afficher spinner + disable pendant action

---

### B3. Pas de confirmation avant actions destructives
**Problème**: Supprimer liste/commentaire devrait demander confirmation.

- [ ] Créer composant `ConfirmModal`
- [ ] Utiliser avant delete

---

### B4. Liens PDF/Acheter sont des placeholders
**Fichier**: `src/app/books/[id]/page.tsx:300-308`

- [ ] Soit retirer ces sections
- [ ] Soit ajouter vraies URLs dans table books (external_links JSON?)

---

### B5. Pas de skeleton loaders
**Problème**: "Chargement..." texte au lieu de skeleton visuels.

- [ ] Créer composants Skeleton (BookCardSkeleton, etc.)
- [ ] Utiliser dans les pages pendant fetch

---

### B6. Header search ne clear pas après navigation
**Problème**: La recherche reste dans l'input après avoir navigué.

- [ ] Clear searchQuery après submit
- [ ] Ou utiliser le query param comme source de vérité

---

### B7. Mobile menu ne se ferme pas après action
**Fichier**: `src/components/layout/Header.tsx`
**Note**: Déjà partiellement géré, vérifier consistency

---

### B8. Pas de page 404 custom stylée
**Problème**: La 404 par défaut Next.js n'est pas brandée.

- [ ] Créer `src/app/not-found.tsx` avec design cohérent

---

## ORDRE DE PRIORITE RECOMMANDE

### Sprint 1 - Critiques (Jour 1)
1. C1 + C2: Réparer edit liste
2. C3: Connecter boutons page liste
3. C4: Connecter bouton follow

### Sprint 2 - Haute (Jour 2)
4. H1 + H5: Fixer logique coups de coeur
5. H4: Implémenter statuts à lire/lu
6. H3: Rafraîchissement après rating

### Sprint 3 - Moyenne (Jour 3-4)
7. M1: Recherche utilisateurs
8. M2 + M3: Like + delete commentaires
9. M5: Delete liste
10. M9: Pagination

### Sprint 4 - Polish (Jour 5)
11. B1: Toasts
12. B2: Loading states
13. B5: Skeletons

---

## NOTES TECHNIQUES

### Contraintes SQL à créer
```sql
-- Si pas déjà fait
ALTER TABLE ratings ADD CONSTRAINT ratings_user_book_unique UNIQUE (user_id, book_id);
ALTER TABLE user_books ADD CONSTRAINT user_books_pk PRIMARY KEY (user_id, book_id);
```

### Pattern pour refresh après mutation
```ts
// Option simple: router.refresh()
const handleAction = async () => {
  await doSomething();
  router.refresh(); // Force revalidation des Server Components
};
```

---
*Audit réalisé le 16 mars 2026*
