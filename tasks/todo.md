# Todo - TheBookClub

> **Derniere mise a jour**: 16 mars 2026
> **Session active**: Retours utilisateur post-audit UX

---

## CRITIQUE - Bugs bloquants

### 1. BUG: Creation de liste donne erreur 404
- [ ] Diagnostiquer l'erreur (route, API, Supabase?)
- [ ] Corriger et tester

### 2. BUG: Commentaires ne se mettent pas a jour
- [ ] Verifier cote Supabase (RLS, permissions)
- [ ] Verifier le code client (mutation, refresh)

---

## HAUTE - Coherence UX

### 3. Uniformiser affichage "ma note" (etoiles orange)
**Probleme**: Sur certaines pages (profil) les etoiles de ma note sont orange, sur d'autres (accueil, livres) non.
- [ ] Passer `myRating` a tous les `BookCard` sur toutes les pages
- [ ] Verifier: accueil, /books, /search, /lists/[id]

### 4. Coups de coeur: gerer uniquement depuis profil
**Changement UX**: L'utilisateur doit aller sur son profil pour choisir ses 4 coups de coeur (experience intentionnelle).
- [ ] Retirer `FavoriteButton` de `/books/[id]/page.tsx`
- [ ] Ajouter interface de gestion des favoris sur `/profile/[id]` (si own profile)
- [ ] Garder la limite de 4 livres

### 5. Creer 4 profils fictifs pour tests
**Objectif**: Tester toutes les fonctionnalites sociales (follow, amis, commentaires, notes).
- [ ] Profil 1: Actif (beaucoup de notes, commentaires, listes)
- [ ] Profil 2: Ami du user actuel (pour tester "notes de mes amis")
- [ ] Profil 3: Nouveau membre (peu d'activite)
- [ ] Profil 4: Membre bienfaiteur (badge special)

---

## MOYENNE - Fonctionnalites

### 6. Accueil: section "Commentaires populaires cette semaine"
- [ ] Query: commentaires les plus likes des 7 derniers jours
- [ ] Afficher section sur la homepage

### 7. Creer page "Membres remercies" + lien footer
**Contexte**: La page /support mentionne des contreparties mais pas de page dediee.
- [ ] Creer `/supporters` ou `/thanks`
- [ ] Lister les membres bienfaiteurs/honoraires
- [ ] Ajouter lien dans le footer

### 8. Page livre: ajouter notations et critiques des amis
- [ ] Section "Vos amis ont note ce livre" (si applicable)
- [ ] Section "Critiques de vos amis" (si applicable)
- [ ] Section "Commentaires populaires" (top likes)

### 9. Filtres dans "Mes livres notes" (profil)
- [ ] Reprendre les filtres de /books (genre, note, recherche)
- [ ] Appliquer a `/profile/[id]/books`

### 10. Filtres ferres a gauche (pages livres/listes/membres)
- [ ] Aligner les filtres a gauche au lieu de centres
- [ ] Pages concernees: /books, /lists, /members

### 11. Page membres: enlever le titre
- [ ] Retirer "Membres du club", arriver direct aux filtres

### 12. Filtres livres: renommer "annee" en "recent"
- [ ] Changer le label du filtre

---

## BASSE - Polish visuel

### 13. Footer: reduire taille globale et boutons
- [ ] Reduire padding/spacing du footer
- [ ] Reduire taille des boutons (passer en `sm` ou `xs`)

### 14. Badges profil: +2 taille, positionner a gauche
- [ ] Augmenter la taille du badge de 2 niveaux
- [ ] Positionner a gauche de l'avatar (au lieu de droite/dessus)

### 15. Page livre: retirer icon du bouton "Ajouter a ma liste"
- [ ] Enlever l'icone, garder juste le texte

### 16. Page livre: "Signaler une erreur" -> "Suggerer une modification"
- [ ] Renommer le lien
- [ ] Deplacer en bas de page

### 17. Page livre: reduire espacement infos pratiques par 2
- [ ] Reduire gap entre label (Auteur) et valeur (Victor Hugo)
- [ ] Actuellement trop espace

### 18. Page livre: repartition des votes avec donnees reelles
- [ ] Verifier si mock data ou vraie requete
- [ ] Connecter a la vraie distribution des notes

---

## HISTORIQUE - Completions session 16 mars 2026

### Audit UX initial - TERMINE
- [x] UX-C1: Settings sauvegarde fonctionnelle
- [x] UX-C2: Upload avatar Supabase Storage
- [x] UX-C3: Redirect creation liste vers /lists/{id}
- [x] UX-C4: Modal changement mot de passe
- [x] UX-H1: Boutons uniformises (variants xs, danger, isLoading)
- [x] UX-H2: Menu dropdown avatar avec liens rapides
- [x] UX-H3: Systeme coups de coeur (FavoriteButton, favorites.ts)
- [x] UX-M1: Toasts de feedback (Toast.tsx, ToastProvider)
- [x] UX-M4: ProfileTabs avec underline actif
- [x] UX-B1: Placeholders masques (pdf, liens)
- [x] UX-B4: Page 404 personnalisee
- [x] Migration SQL user_favorites appliquee

### Audit fonctionnel initial - TERMINE
- [x] C1+C2: Edit liste corrige (bon nom de table, sauvegarde)
- [x] C3: Boutons page liste connectes (ListActions component)
- [x] C4: Bouton follow connecte (FollowButton component)
- [x] H1+H5: Logique coups de coeur et derniers livres notes

---

*Fichier maintenu pour continuite entre sessions*
