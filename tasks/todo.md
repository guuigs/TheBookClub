# Todo - TheBookClub

> **Derniere mise a jour**: 17 mars 2026
> **Session active**: Retours utilisateur - Round 2

---

## EN ATTENTE - Changements majeurs

### 1. Avatar: remplacer upload par gradient genere
**Changement majeur**: Plus d'upload de photo, generer un gradient unique par user.
- [ ] Creer fonction `generateGradient(userId)` - deterministe base sur l'ID
- [ ] Ajouter effet grain leger (CSS ou SVG filter)
- [ ] Supprimer la logique d'upload dans Settings
- [ ] Mettre a jour Avatar.tsx pour utiliser le gradient si pas de photo
- [ ] Migration: garder les photos existantes ou forcer gradient?

### 2. Page livre: restaurer sections "Lecture en ligne" et "Commander"
**Contexte**: Ces sections existaient mais ont ete masquees.
- [ ] Schema DB: ajouter `book_links` table (book_id, type, url, label)
  - Types: `reading_free`, `purchase`
  - Max 2 liens par type
- [ ] Afficher "Non disponible" si aucun lien
- [ ] Adapter le formulaire de suggestion de modification pour ces liens

---

## BASSE - Polish

### 3. Nettoyage code post-refactoring
- [ ] Supprimer imports inutilises
- [ ] Verifier coherence des noms de fonctions

---

## ARCHIVES - Taches precedemment completees

<details>
<summary>Session 17 mars 2026 - Restructuration architecture</summary>

**Routes renommees (conformite ARCHITECTURE.md):**
- [x] `/books` → `/livres`
- [x] `/lists` → `/listes`
- [x] `/members` → `/membres`
- [x] `/profile` → `/account`
- [x] `/authors` → `/auteur`
- [x] Tous les liens internes mis a jour (~30 fichiers)

**Nouveaux composants et pages:**
- [x] `/formulaire-modification/[id]` - page de suggestion de modification
- [x] `ProfileCardWithRating` - composant MemberCard + note
- [x] Sections "Notes de mes amis" et "Critiques de mes amis" sur page livre

</details>

<details>
<summary>Session 17 mars 2026 - Bugs et UX Round 2</summary>

**Bugs critiques corriges:**
- [x] BUG: Commentaires n'apparaissent pas apres creation
  - `createComment()` retourne maintenant le commentaire cree
  - Ajout direct au state local au lieu de refetch
- [x] BUG: Creation liste erreur 404 persistante
  - Ajout toast d'erreur pour feedback utilisateur
  - Ajout `router.refresh()` avant navigation
  - Meilleur logging dans `getListById()`
- [x] BUG: Etoiles orange non dynamiques dans BookCard
  - Page livre: section "Du meme auteur" - fetch des ratings utilisateur
  - Pages auteur: myRating passe au BookCard
  - Page auteur/books: myRating passe au BookCard

**UX ameliorations:**
- [x] Badge profil repositionne a droite de l'avatar (4 pages)
- [x] Homepage: sections commentaires/listes toujours visibles (message si vide)
- [x] Bouton "Modifier" coups de coeur: style discret, icone retiree
- [x] Page `/librairies` creee + lien dans le footer
- [x] Lien "voir les librairies affiliees" sur page livre

**Filtres pages profil:**
- [x] `/profile/[id]/comments` - tri Recent/Populaire
- [x] `/profile/[id]/books` - recherche + tri Recent/Ma note
- [x] `/profile/[id]/lists` - recherche + tri Recent/Populaire
- [x] Nouveaux composants: ProfileCommentsFilter, ProfileBooksFilter, ProfileListsFilter

</details>

<details>
<summary>Session 17 mars 2026 - Refactoring</summary>

- [x] `src/lib/mappers.ts` - centralisation mappers
- [x] `src/lib/constants/badges.ts` - centralisation badges
- [x] `src/lib/utils/format.ts` - formatDate, truncateText
- [x] `src/lib/utils/auth.ts` - getAuthenticatedUser
- [x] BookCard unifie (3 variants)
- [x] Suppression HomeBookCard.tsx
- [x] ~300 lignes de duplication eliminees

</details>

<details>
<summary>Session 17 mars 2026 - Corrections UX</summary>

- [x] Bug creation liste 404 (premier fix)
- [x] Bug commentaires non mis a jour (callbacks)
- [x] Etoiles orange uniformisees
- [x] Coups de coeur via profil
- [x] Filtres ferres a gauche
- [x] Page membres titre sr-only
- [x] "Annee" -> "Recent"
- [x] Footer taille reduite
- [x] Badges taille augmentee
- [x] Page livre: icone bouton retiree
- [x] Page livre: "Suggerer une modification" en bas
- [x] Page livre: espacement infos reduit
- [x] Page livre: repartition votes reelle

</details>

<details>
<summary>Session 16 mars 2026</summary>

- [x] Settings sauvegarde
- [x] Upload avatar Supabase Storage
- [x] Redirect creation liste
- [x] Modal mot de passe
- [x] Boutons uniformises
- [x] Menu dropdown avatar
- [x] Systeme coups de coeur
- [x] Toasts feedback
- [x] ProfileTabs underline
- [x] Page 404 personnalisee
- [x] ListActions, FollowButton

</details>

---

*Fichier maintenu pour continuite entre sessions*
