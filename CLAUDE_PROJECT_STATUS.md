# TheBookClub - Project Status

## Overview
Application web type Letterboxd pour les livres.

## Stack Technique
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
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

## Structure des Dossiers
```
src/
├── app/                    # Pages Next.js (App Router)
│   ├── authors/[id]/       # Page auteur
│   ├── books/[id]/         # Page détail livre
│   ├── lists/              # Page liste des listes
│   │   ├── [id]/           # Page détail liste
│   │   └── create/         # Page création liste
│   ├── profile/[id]/       # Page profil utilisateur
│   ├── search/             # Page recherche
│   ├── globals.css         # Design system tokens
│   ├── layout.tsx          # Root layout avec fonts
│   └── page.tsx            # Homepage
├── components/
│   ├── ui/                 # Composants atomiques
│   │   ├── Avatar.tsx
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── RatingStars.tsx
│   │   └── index.ts
│   ├── layout/             # Header, Footer
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── index.ts
│   └── features/           # Composants métier
│       ├── BookCard.tsx
│       ├── CommentCard.tsx
│       ├── FriendActivityCard.tsx
│       ├── ListCard.tsx
│       ├── RatingBlock.tsx
│       ├── SectionHeader.tsx
│       └── index.ts
├── fonts/                  # Mediamoure font files
│   ├── mediamoure-regular.ttf
│   └── mediamoure-regularitalic.ttf
├── lib/                    # Utilitaires, helpers
└── types/
    └── index.ts            # TypeScript types
```

## Progression

### ✅ Complété
- [x] Initialisation Next.js 16 + TypeScript + Tailwind
- [x] Configuration fonts (Manrope + Mediamoure)
- [x] Design system (couleurs, typographie, tokens CSS)
- [x] Structure des dossiers
- [x] Composants UI: Button, Input, Avatar, RatingStars, Badge
- [x] Composant Header (responsive avec menu mobile)
- [x] Composant Footer
- [x] Composant BookCard (+ variant overlay)
- [x] Composant RatingBlock (histogramme des votes)
- [x] Composant CommentCard
- [x] Composant ListCard
- [x] Composant FriendActivityCard
- [x] Composant SectionHeader
- [x] Page Book (détail d'un livre) - avec generateStaticParams
- [x] Page Home (placeholder)
- [x] Page Search (recherche livres/listes avec tabs)
- [x] Page Lists (liste des listes + navigation)
- [x] Page List Detail (/lists/[id])
- [x] Page Create List (/lists/create)
- [x] Page Profile (/profile/[id]) - profil utilisateur
- [x] Page Author (/authors/[id]) - page auteur
- [x] Types TypeScript (Book, Author, User, Comment, BookList, etc.)

### 📋 Prochaines étapes
- [ ] Pages à concevoir (non maquettées):
  - [ ] Login/Register
  - [ ] Rating modal
  - [ ] Edit list (/lists/[id]/edit)
  - [ ] Settings / Edit profile
  - [ ] 404 Error page
- [ ] Connecter à l'API Google Books + Supabase

## Système de Statuts de Lecture
- **Aucun statut** = le livre n'est pas dans la bibliothèque
- **À lire** = ajouté à la liste "À lire"
- **Lu** = dans la bibliothèque, avec date + note + critique optionnelle

## Types de Membres
1. **Membre du club** - Adhérent gratuit de base
2. **Membre honoraire** - Participation active (critiques, ajouts de livres)
3. **Membre bienfaiteur** - Aide financière
4. **Membre d'honneur** - Distinction spéciale de la direction

## Notes Techniques
- Layout Desktop: 1500px max-width
- Content area: 800px
- Sidebar: 220px
- Responsive breakpoint mobile: 768px
- Build: ✅ Successful

## Commandes
```bash
npm run dev    # Démarrer le serveur de développement
npm run build  # Build production
npm run lint   # Linting
```

## Pour reprendre le projet
1. Lire ce fichier pour comprendre l'état actuel
2. Consulter le Figma (frame "Pour Claude" node-id=155-3815)
3. Vérifier les types dans `src/types/index.ts`
4. Continuer avec les pages restantes

---
*Dernière mise à jour: Session 2 - Toutes les pages principales créées (Search, Lists, Profile, Author)*
