# Audit UX/UI - TheBookClub

> **Date**: 16 mars 2026
> **Derniere mise a jour**: 16 mars 2026
> **Objectif**: Identifier et corriger les problemes d'experience utilisateur

---

## RESUME DES CORRECTIONS

| Severite | Total | Corriges | Restants |
|----------|-------|----------|----------|
| CRITIQUE | 4 | 4 | 0 |
| HAUTE | 6 | 4 | 2 |
| MOYENNE | 8 | 3 | 5 |
| BASSE | 5 | 2 | 3 |

---

## CRITIQUE - Fonctionnalites cassees

### UX-C1. Page Settings ne sauvegarde pas - CORRIGE
**Fichier**: `src/app/settings/page.tsx`
**Correction**:
- [x] Implementer `updateProfile()` dans lib/db/profiles.ts
- [x] Connecter le formulaire a la fonction
- [x] Ajouter feedback visuel (toast success/error)

---

### UX-C2. Upload photo de profil non fonctionnel - CORRIGE
**Fichier**: `src/app/settings/page.tsx`
**Correction**:
- [x] Implementer upload vers Supabase Storage (`uploadAvatar()` dans profiles.ts)
- [x] Connecter le bouton au file picker
- [x] Mettre a jour `avatar_url` dans profiles

---

### UX-C3. Creation de liste redirige vers /lists au lieu de la liste creee - CORRIGE
**Fichier**: `src/app/lists/create/page.tsx`
**Correction**:
- [x] Rediriger vers `/lists/${id}` apres creation

---

### UX-C4. Mot de passe - bouton non fonctionnel - CORRIGE
**Fichier**: `src/app/settings/page.tsx`
**Correction**:
- [x] Implementer modal de changement de mot de passe (PasswordChangeModal)
- [x] Utiliser `supabase.auth.updateUser()`

---

## HAUTE - Incoherences d'interface

### UX-H1. Boutons avec tailles et styles differents - CORRIGE
**Correction**:
- [x] Remplacer tous les boutons inline par `<Button>` component
- [x] Ajouter variant `xs` au Button pour les micro-boutons
- [x] Ajouter variant `danger` pour les actions de suppression
- [x] Ajouter prop `isLoading` avec spinner
- [x] Uniformiser: actions principales = `md`, actions secondaires = `sm`

---

### UX-H2. Pas d'acces direct a "Mes listes" dans la navigation - CORRIGE
**Correction** (fichier: `Header.tsx`):
- [x] Ajouter menu dropdown sur avatar avec liens rapides:
  - Mon profil
  - Mes livres
  - Mes listes
  - Parametres
  - Deconnexion

---

### UX-H3. Systeme de "Coups de coeur" non explicite - CORRIGE
**Correction**:
- [x] Creer `FavoriteButton` component avec bouton coeur
- [x] Creer fonctions dans `lib/db/favorites.ts`
- [x] Migration SQL pour table `user_favorites(user_id, book_id, position)`
- [x] Limiter a 4 favoris max
- [x] Page profil affiche favoris explicites (avec fallback sur top-rated)

---

### UX-H4. Navigation profil - onglets non accessibles sur mobile
**Probleme**: Les onglets (Profil, Livres, Critiques, Listes) sont difficiles a voir sur mobile.

- [ ] Rendre les onglets scrollables horizontalement
- [ ] Ou utiliser un menu dropdown sur mobile

---

### UX-H5. Liens "voir plus" vs boutons - inconsistance
**Probleme**: Parfois liens discrets, parfois boutons, parfois rien.

**SectionHeader** utilise `seeMoreHref` mais le style varie.

- [ ] Uniformiser: tous les "voir plus" = lien discret style fleche

---

### UX-H6. Modales non consistantes
**Probleme**: Les modales ont des styles differents:
- CommentModal: design different de ListActions modal
- Share modals: varient selon la page

- [ ] Creer composant `Modal` reutilisable
- [ ] Uniformiser header, spacing, boutons

---

## MOYENNE - UX incomplete

### UX-M1. Pas de feedback apres actions - CORRIGE
**Correction**:
- [x] Creer composant `Toast` et `ToastProvider` dans `components/ui/Toast.tsx`
- [x] Ajouter notifications apres: notation, commentaire, follow, favoris, settings

---

### UX-M2. Etats de chargement manquants
**Probleme**: Beaucoup de boutons n'ont pas de spinner pendant l'action.

- [ ] Ajouter prop `isLoading` a Button (deja present mais pas utilise partout)
- [ ] Afficher spinner pendant les requetes

---

### UX-M3. Recherche header ne se vide pas apres navigation
**Fichier**: `src/components/layout/Header.tsx`
**Probleme**: Apres une recherche, le texte reste dans l'input.

- [ ] Vider searchQuery apres navigation
- [ ] Ou synchroniser avec URL params

---

### UX-M4. Onglet actif profil non evident visuellement - CORRIGE
**Correction**:
- [x] Creer composant `ProfileTabs` reutilisable
- [x] Ajouter underline (barre 3px primary) sous l'onglet actif
- [x] Border bottom sur toute la nav
- [x] Support scroll horizontal sur mobile

---

### UX-M5. Page auteur - pas de CTA pour les livres
**Fichier**: `src/app/authors/[id]/page.tsx`
**Probleme**: Sur la bio auteur, pas de lien clair vers ses livres.

- [ ] Ajouter bouton "Voir tous les livres" bien visible

---

### UX-M6. BookCard hover - info non accessible sur mobile
**Probleme**: Les infos de rating apparaissent au hover, impossible sur tactile.

- [ ] Afficher les ratings toujours visibles en option
- [ ] Ou tap pour afficher sur mobile

---

### UX-M7. Formulaire login/signup - pas de lien entre eux
**Probleme**: Sur /login, pas de lien vers inscription si compte inexistant.

- [ ] Ajouter "Pas de compte ? Inscrivez-vous"
- [ ] Ajouter "Deja un compte ? Connectez-vous" sur signup

---

### UX-M8. Avatar cliquable partout mais comportement inconsistant
**Probleme**: Parfois l'avatar amene au profil, parfois non.

- [ ] Tous les avatars doivent etre cliquables vers le profil

---

## BASSE - Polish

### UX-B1. Placeholder "pdf 1", "pdf 2", "lien 1" - CORRIGE
**Fichier**: `src/app/books/[id]/page.tsx`
**Correction**:
- [x] Commentaire HTML pour masquer la section jusqu'a implementation des vraies donnees
- [x] Grid passe de 3 a 2 colonnes

---

### UX-B2. Texte "since 2026" sur hero
**Fichier**: `src/app/page.tsx:241`
**Probleme**: Phrase marketing, mais "2026" est la date actuelle.

- [ ] Evaluer si pertinent ou remplacer par autre chose

---

### UX-B3. Footer minimal
**Probleme**: Le footer pourrait avoir plus de liens utiles.

- [ ] Ajouter liens: A propos, Contact, CGU, FAQ

---

### UX-B4. Pas de page 404 personnalisee - CORRIGE
**Correction**:
- [x] Creer `src/app/not-found.tsx` avec design coherent
- [x] Message humoristique lie au theme (bibliotheque)
- [x] Boutons d'action: Accueil, Parcourir les livres, Rechercher

---

### UX-B5. Animations de transition absentes
**Probleme**: Les changements de page sont abruptes.

- [ ] Ajouter transitions subtiles sur les cards
- [ ] Fade in/out sur les modales (deja partiellement fait)

---

## ORDRE DE PRIORITE

### Sprint 1 - Corrections critiques - TERMINE
1. [x] UX-C3: Redirection apres creation liste
2. [x] UX-H1: Uniformiser les boutons
3. [x] UX-H2: Menu dropdown avatar

### Sprint 2 - UX Core - TERMINE
4. [x] UX-H3: Systeme coups de coeur explicite
5. [x] UX-M1: Toasts de feedback
6. [x] UX-C1, C2, C4: Settings fonctionnel (profil, avatar, mot de passe)

### Sprint 3 - Polish - TERMINE
7. [x] UX-M4: Onglets actifs avec ProfileTabs
8. [x] UX-B1: Masquer placeholders
9. [x] UX-B4: Page 404 personnalisee

### Restant a faire (optionnel)
- UX-H4: Navigation profil onglets sur mobile
- UX-H5: Uniformiser liens "voir plus"
- UX-H6: Composant Modal reutilisable
- UX-M2: Etats de chargement partout
- UX-M3: Vider recherche apres navigation
- UX-M5: CTA livres sur page auteur
- UX-M6: Rating visible sur mobile (BookCard)
- UX-M7: Liens login/signup (deja fait)
- UX-M8: Avatars cliquables partout
- UX-B2: Texte "since 2026"
- UX-B3: Footer avec plus de liens
- UX-B5: Animations de transition

---

*Audit realise le 16 mars 2026*
*Mise a jour: 16 mars 2026 - Sprints 1-3 termines*
