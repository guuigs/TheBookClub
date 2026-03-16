# TheBookClub - Project Status

## Overview
Application web type Letterboxd pour les livres.

## Stack Technique
- **Framework**: Next.js 16.1.6 (App Router + Turbopack)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4
- **Fonts**: Manrope (Google Fonts) + Mediamoure (local)
- **Icons**: Lucide React

## Figma Reference
- **File**: https://www.figma.com/design/6Qno7E9UFyzxNORSWJB1Ac/The-Book-Club--TBC-
- **Frame "Pour Claude"**: node-id=155-3815 (contient les éléments de design)

## Design System

### Couleurs
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-primary` | #e85d04 | Accent principal (orange) |
| `--color-primary-light` | #f48c06 | Orange clair |
| `--color-primary-dark` | #dc2f02 | Orange foncé |
| `--color-dark` | #1a0303 | Texte principal, boutons |
| `--color-gray` | #a9a9a9 | Texte secondaire |
| `--color-cream` | #f8e0b6 | Fond secondaire |

### Typographie
| Token | Desktop | Mobile |
|-------|---------|--------|
| T1 | 48px SemiBold | 36px |
| T2 | 36px SemiBold | 28px |
| T3 | 28px SemiBold | 24px |
| T4 | 22px SemiBold | 20px |
| Body | 18px Medium | 16px |
| Small | 14px Medium | 12px |

### Fonts
- **Sans (body)**: Manrope (Medium 500, SemiBold 600)
- **Display (titres déco)**: Mediamoure

## Structure des Dossiers (Mise à jour)
```
src/
├── app/                         # Pages Next.js (App Router)
│   ├── authors/[id]/            # Page auteur
│   ├── books/                   # Liste des livres
│   │   └── [id]/                # Page détail livre
│   │       ├── comments/        # Tous les commentaires
│   │       ├── friends/         # Activité amis
│   │       │   └── comments/    # Commentaires amis
│   │       └── lists/           # Listes contenant ce livre
│   ├── lists/                   # Page liste des listes
│   │   ├── [id]/                # Page détail liste
│   │   │   └── edit/            # Edition liste
│   │   └── create/              # Page création liste
│   ├── login/                   # Page connexion
│   ├── profile/[id]/            # Page profil utilisateur
│   ├── search/                  # Page recherche
│   ├── globals.css              # Design system tokens
│   ├── layout.tsx               # Root layout avec fonts
│   └── page.tsx                 # Homepage
├── components/
│   ├── ui/                      # Composants atomiques (5)
│   │   ├── Avatar.tsx
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── RatingStars.tsx
│   │   └── index.ts
│   ├── layout/                  # Header, Footer (2)
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── index.ts
│   └── features/                # Composants métier (13)
│       ├── BookCard.tsx         # + variant BookCardOverlay
│       ├── BookCoverSelect.tsx
│       ├── CommentCard.tsx
│       ├── CommentModal.tsx
│       ├── FriendActivityCard.tsx
│       ├── HomeBookCard.tsx
│       ├── HomeCommentCard.tsx
│       ├── ListCard.tsx
│       ├── MemberCard.tsx
│       ├── RatingBlock.tsx
│       ├── RatingModal.tsx
│       ├── SectionHeader.tsx
│       └── index.ts
├── fonts/                       # Mediamoure font files
├── lib/
│   └── data.ts                  # Mock data (13KB)
├── media/                       # Images locales
│   ├── book-cover-*.jpg
│   ├── homepage-herosection-background.png
│   └── profil-picture.jpg
├── tasks/                       # Gestion de projet
│   ├── todo.md                  # Plan d'action
│   └── lessons.md               # Leçons apprises
└── types/
    └── index.ts                 # TypeScript types complets
```

## Audit Qualité (16 mars 2026)

### Scores par Catégorie
| Catégorie | Score | Détails |
|-----------|-------|---------|
| Pages | 7.3/10 | 15 pages, toutes fonctionnelles avec mock data |
| Composants UI | 10/10 | 5 composants production-ready |
| Composants Features | 9.6/10 | 13 composants, 1 bug mineur |
| Design System | 10/10 | Complet et responsive |
| Types | 10/10 | Couverture complète |

### Pages Détaillées
| Page | Score | Statut |
|------|-------|--------|
| Home | 8/10 | Fonctionnel, responsive |
| Book Detail | 9/10 | Excellent, layout complexe |
| Books Browse | 7.5/10 | Manque pagination |
| Author | 9/10 | Excellent avec SSG |
| Lists | 7.5/10 | Manque pagination |
| List Detail | 9/10 | Complet avec actions |
| List Create/Edit | 6.5/10 | Pas de persistence |
| Profile | 8.5/10 | Complet |
| Search | 8/10 | Manque onglet Users |
| Login | 4/10 | Placeholder uniquement |

### Bugs Identifiés
1. `CommentCard.tsx:81` - Dynamic Tailwind class ne fonctionne pas
2. `MemberCard.tsx` - Labels de badge dupliqués
3. `Header.tsx` - SearchInput dupliqué (desktop/mobile)

## Progression

### ✅ Complété (Session 1-2)
- [x] Initialisation Next.js 16 + TypeScript + Tailwind v4
- [x] Configuration fonts (Manrope + Mediamoure)
- [x] Design system complet (couleurs, typographie, tokens CSS)
- [x] Structure des dossiers
- [x] Composants UI: Button, Input, Avatar, RatingStars, Badge
- [x] Composants Layout: Header (responsive), Footer
- [x] Composants Features: 13 composants métier complets
- [x] Page Home (fonctionnelle avec sections)
- [x] Page Book Detail + sous-pages (comments, friends, lists)
- [x] Page Books Browse (avec tri)
- [x] Page Author
- [x] Page Search (tabs livres/listes)
- [x] Page Lists + Create + Edit
- [x] Page Profile
- [x] Page Login (placeholder)
- [x] Types TypeScript complets
- [x] Mock data (lib/data.ts)
- [x] Images locales (src/media/)

### 📋 Prochaine Phase: Backend (Priorité Haute)
Voir `tasks/todo.md` pour le plan détaillé.

1. **Configuration Supabase**
   - [ ] Installer et configurer client
   - [ ] Créer schéma DB (10 tables)
   - [ ] Variables d'environnement

2. **API Google Books**
   - [ ] Créer lib/googleBooks.ts
   - [ ] Recherche et détails livres

3. **Authentification**
   - [ ] Supabase Auth
   - [ ] Pages login/register fonctionnelles
   - [ ] Middleware routes protégées

4. **Server Actions**
   - [ ] CRUD reviews, lists, books
   - [ ] Follows, likes

### 📋 Pages Manquantes
- [ ] /register
- [ ] /profile/settings
- [ ] /not-found.tsx (404)

### 📋 Corrections à Faire
- [ ] Fixer bug Tailwind dans CommentCard
- [ ] Centraliser labels badges
- [ ] Ajouter pagination
- [ ] ARIA labels sur RatingStars

## Notes Techniques
- Layout Desktop: 1500px max-width
- Content area: 800px
- Sidebar: 220px
- Responsive breakpoint mobile: 768px
- Build: ✅ Successful (23 pages générées)

## Commandes
```bash
npm run dev    # Démarrer le serveur de développement
npm run build  # Build production
npm run lint   # Linting
```

## Pour reprendre le projet
1. Lire `tasks/todo.md` pour le plan d'action
2. Consulter `tasks/lessons.md` pour les patterns
3. Consulter le Figma (frame "Pour Claude" node-id=155-3815)
4. Vérifier les types dans `src/types/index.ts`
5. Commencer par la configuration Supabase

---
*Dernière mise à jour: Session 3 - Audit complet + Plan d'action backend (16 mars 2026)*
