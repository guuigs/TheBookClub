# TheBookClub - Structure Actuelle du Code

> Document mis a jour le 17 mars 2026
> **Ce document reflete l'etat reel du code.**

---

## 1. Arborescence des Routes (`src/app/`)

```
src/app/
├── page.tsx                          # Homepage
├── layout.tsx                        # Layout global (AuthProvider, fonts)
├── not-found.tsx                     # Page 404
│
├── livres/
│   ├── page.tsx                      # Liste des livres + filtres + pagination
│   └── [id]/
│       ├── page.tsx                  # Detail d'un livre
│       ├── comments/page.tsx         # Tous les commentaires du livre
│       ├── lists/page.tsx            # Listes contenant ce livre
│       └── friends/
│           ├── page.tsx              # Notes des amis (fetch depuis follows + ratings)
│           └── comments/page.tsx     # Commentaires des amis (fetch depuis follows + comments)
│
├── listes/
│   ├── page.tsx                      # Liste des listes + filtres
│   ├── create/page.tsx               # Creation de liste
│   └── [id]/
│       ├── page.tsx                  # Detail d'une liste
│       └── edit/page.tsx             # Edition d'une liste
│
├── membres/
│   ├── page.tsx                      # Liste des membres
│   └── [id]/page.tsx                 # REDIRECT vers /account/[id]
│
├── account/
│   └── [id]/
│       ├── page.tsx                  # Profil (coups de coeur + derniers livres)
│       ├── livres/page.tsx           # Livres notes par l'utilisateur
│       ├── critiques/page.tsx        # Critiques de l'utilisateur
│       └── listes/page.tsx           # Listes de l'utilisateur
│
├── auteur/
│   └── [id]/
│       ├── page.tsx                  # Page auteur (bio + livres)
│       └── books/page.tsx            # Tous les livres de l'auteur
│
├── formulaire-modification/
│   └── [id]/page.tsx                 # Suggerer modification d'un livre
│
├── login/page.tsx                    # Connexion
├── register/page.tsx                 # Inscription
├── forgot-password/page.tsx          # Mot de passe oublie
├── settings/page.tsx                 # Parametres du compte
├── search/page.tsx                   # Resultats de recherche
├── contact/page.tsx                  # Page contact
├── support/page.tsx                  # Page soutien
├── librairies/page.tsx               # Librairies affiliees
├── comments/page.tsx                 # Tous les commentaires (global)
└── design-review/page.tsx            # Page de test design (dev only)
```

---

## 2. Composants (`src/components/`)

### 2.1 Layout
```
components/layout/
├── Header.tsx      # Navigation principale + dropdown user + recherche
└── Footer.tsx      # Liens navigation + message soutien
```

### 2.2 Features (Composants metier)
```
components/features/
├── BookCard.tsx              # Carte livre (3 tailles: sm/md/lg)
├── CommentCard.tsx           # Carte commentaire (avec like, edit, delete)
├── ListCard.tsx              # Carte liste (covers + stats)
├── MemberCard.tsx            # Carte membre (avatar + stats)
├── ProfileCardWithRating.tsx # MemberCard + note affichee (utilise dans /friends)
├── HomeCommentCard.tsx       # Variante commentaire pour homepage
│
├── SectionHeader.tsx         # Titre section + lien "see more"
├── RatingBlock.tsx           # Bloc notation (moyenne + distribution)
│
├── ProfileTabs.tsx           # Onglets profil (Profil/Livres/Critiques/Listes)
├── ProfileBooksFilter.tsx    # Filtres page livres profil
├── ProfileCommentsFilter.tsx # Filtres page critiques profil
├── ProfileListsFilter.tsx    # Filtres page listes profil
│
├── FavoritesSection.tsx      # Section coups de coeur (editable)
├── FavoritesManager.tsx      # Modal selection coups de coeur
├── FavoriteButton.tsx        # Bouton toggle favori
│
├── BookStatusButton.tsx      # Bouton "A lire" / "Lu"
├── BookCoverSelect.tsx       # Selection livre par cover (creation liste)
│
├── FollowButton.tsx          # Bouton suivre/ne plus suivre
├── ListActions.tsx           # Actions liste (like, edit, delete, share)
│
├── RatingModal.tsx           # Modal notation
└── CommentModal.tsx          # Modal commentaire
```

### 2.3 UI (Composants generiques)
```
components/ui/
├── Avatar.tsx                # Avatar utilisateur
├── Badge.tsx                 # Badge membre (member/honorary/benefactor/honor)
├── Button.tsx                # Bouton (primary/secondary/discrete)
├── Input.tsx                 # Champ texte
├── RatingStars.tsx           # Etoiles de notation (affichage)
├── InteractiveStarRating.tsx # Etoiles de notation (cliquables)
├── Pagination.tsx            # Pagination (utilise dans /livres/page.tsx)
└── Toast.tsx                 # Notifications toast + useToast hook
```

---

## 3. Base de donnees (Supabase)

### 3.1 Tables principales (deduites du code)
```
profiles                    # Utilisateurs
├── id (uuid, PK)
├── username (unique)
├── display_name
├── avatar_url
├── badge (member/honorary/benefactor/honor)
├── bio
└── created_at

books                       # Livres
├── id (uuid, PK)
├── title
├── author_id (FK -> authors)
├── cover_url
├── description
├── published_year
└── genre

authors                     # Auteurs
├── id (uuid, PK)
├── name
├── bio
├── photo_url
└── books_count

ratings                     # Notes utilisateurs
├── user_id (FK -> profiles)
├── book_id (FK -> books)
├── score (1-10)
└── created_at

comments                    # Commentaires/Critiques
├── id (uuid, PK)
├── user_id (FK -> profiles)
├── book_id (FK -> books)
├── content
├── rating (optionnel)
└── created_at

book_lists                  # Listes de livres
├── id (uuid, PK)
├── title
├── description
├── author_id (FK -> profiles)
├── created_at
└── updated_at

book_list_items             # Livres dans les listes
├── list_id (FK -> book_lists)
└── book_id (FK -> books)

follows                     # Relations follow
├── follower_id (FK -> profiles)
└── following_id (FK -> profiles)

user_books                  # Statut lecture
├── user_id (FK -> profiles)
├── book_id (FK -> books)
├── status (to_read/read)
├── read_date
└── added_at

user_favorites              # Coups de coeur
├── user_id (FK -> profiles)
├── book_id (FK -> books)
└── position (1-4)

comment_likes               # Likes sur commentaires
├── user_id (FK -> profiles)
└── comment_id (FK -> comments)

list_likes                  # Likes sur listes
├── user_id (FK -> profiles)
└── list_id (FK -> book_lists)

book_modification_suggestions  # Suggestions de modification
├── id (uuid, PK)
├── book_id (FK -> books)
├── user_id (FK -> profiles)
├── field_name
├── current_value
├── suggested_value
└── reason
```

### 3.2 Vues Supabase (deduites du code)
```
books_with_stats            # Livres + stats calculees
├── (tous les champs de books)
├── author_name
├── author_bio
├── author_photo_url
├── average_rating
└── total_votes

profiles_with_stats         # Profils + stats calculees
├── (tous les champs de profiles)
├── books_rated
├── lists_count
├── followers_count
└── following_count
```

---

## 4. Logique Metier (`src/lib/`)

### 4.1 Database Functions (`src/lib/db/`)
```
books.ts      # getBooks, getBookById, getBooksByAuthorId, searchBooks
              # getBookStatus, setBookStatus, removeBookStatus

lists.ts      # getLists, getListById, getListsByUserId
              # createList, updateList, updateListBooks, deleteList
              # isListLikedByUser, toggleListLike

profiles.ts   # getProfiles, getProfileById, updateProfile, uploadAvatar

ratings.ts    # getUserRating, upsertRating, getRatingDistribution

comments.ts   # createComment, deleteComment, updateComment
              # toggleCommentLike

favorites.ts  # getFavorites, setFavorites

follows.ts    # isFollowing, toggleFollow
```

### 4.2 Utilitaires
```
mappers.ts              # mapBook, mapComment, mapList, mapUser, etc.
constants/badges.ts     # Labels des badges
utils/format.ts         # formatDate, truncateText
utils/auth.ts           # getAuthenticatedUser
supabase/browser.ts     # Client Supabase (client-side)
supabase/server.ts      # Client Supabase (server-side)
```

---

## 5. Contexte et Etat

### 5.1 AuthContext (`src/context/AuthContext.tsx`)
```typescript
interface AuthContextValue {
  user: User | null           // User Supabase Auth
  profile: Profile | null     // Profil depuis table profiles
  session: Session | null
  loading: boolean
  signIn(email, password)
  signUp(email, password, username, displayName)
  signOut()
  refreshProfile()
}
```

---

## 6. Types (`src/types/index.ts`)

```typescript
type BookStatus = "to_read" | "read" | null
type MemberBadge = "member" | "honorary" | "benefactor" | "honor"
type Rating = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

interface Book {
  id, title, author: Author, coverUrl, description,
  publishedYear, genre, averageRating, totalVotes, ratingDistribution[]
}

interface Author { id, name, bio?, photoUrl?, booksCount }

interface User {
  id, username, displayName, avatarUrl?, badge,
  booksRead, listsCount, followersCount, followingCount, joinDate?
}

interface Comment {
  id, user: User, bookId, rating?, content,
  createdAt, likesCount, isLikedByCurrentUser?
}

interface BookList {
  id, title, description?, author: User, books: Book[],
  booksCount, likesCount, createdAt, updatedAt
}
```

---

## 7. Flux de donnees typique

```
[Page]
  ↓ useEffect / Server Component
  ↓
[createClient()] → Supabase Browser/Server
  ↓
[Query] ex: supabase.from("books_with_stats").select("*")
  ↓
[Mapper] ex: data.map(mapBook)
  ↓
[State] useState ou props
  ↓
[Composant] <BookCard book={book} />
```

---

## 8. Authentification

```
[Layout]
  ↓ createClient().auth.getSession()
  ↓
[AuthProvider initialSession={session}]
  ↓
[useAuth()] → { user, profile, signIn, signOut, ... }
```

Le profil est fetch separement de `profiles` apres auth.

---

## 9. Navigation et liens internes

Toutes les routes et les liens internes utilisent le francais:

| Section | Route |
|---------|-------|
| Livres | `/livres`, `/livres/[id]` |
| Listes | `/listes`, `/listes/[id]` |
| Membres | `/membres` |
| Profil | `/account/[id]` |
| Sous-pages profil | `/account/[id]/livres`, `/account/[id]/critiques`, `/account/[id]/listes` |
| Auteur | `/auteur/[id]` |

---

## 10. Notes techniques

### 10.1 Table hypothetique
`book_modification_suggestions` - utilisee dans le formulaire mais creation de table a confirmer en DB.

### 10.2 Pages amis
Les pages `/livres/[id]/friends/` et `/livres/[id]/friends/comments/` utilisent la table `follows` pour identifier les amis (following_id) de l'utilisateur connecte, puis recuperent leurs notes/commentaires.

---

*Fin du document*
