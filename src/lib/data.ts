// ============================================
// THE BOOK CLUB - Local Mock Data Store
// ============================================

import type { Book, Author, User, Comment, BookList, MemberBadge } from "@/types";

// ============================================
// AUTHORS
// ============================================

export const authors: Author[] = [
  {
    id: "1",
    name: "Pierre Choderlos de Laclos",
    bio: "Pierre Ambroise François Choderlos de Laclos, né à Amiens le 18 octobre 1741 et mort à Tarente le 5 septembre 1803, est un écrivain et officier militaire français, surtout connu pour son roman épistolaire Les Liaisons dangereuses.",
    photoUrl: "/images/authors/laclos.jpg",
    booksCount: 3,
  },
  {
    id: "2",
    name: "Victor Hugo",
    bio: "Victor Hugo est un poète, dramaturge, écrivain, romancier et dessinateur romantique français, né le 26 février 1802 à Besançon et mort le 22 mai 1885 à Paris.",
    photoUrl: "/images/authors/hugo.jpg",
    booksCount: 15,
  },
  {
    id: "3",
    name: "Alexandre Dumas",
    bio: "Alexandre Dumas, dit aussi Alexandre Dumas père, né le 24 juillet 1802 à Villers-Cotterêts et mort le 5 décembre 1870 à Puys, est un écrivain français.",
    photoUrl: "/images/authors/dumas.jpg",
    booksCount: 22,
  },
  {
    id: "4",
    name: "Émile Zola",
    bio: "Émile Zola est un écrivain et journaliste français, né le 2 avril 1840 à Paris et mort le 29 septembre 1902 dans la même ville.",
    photoUrl: "/images/authors/zola.jpg",
    booksCount: 20,
  },
  {
    id: "5",
    name: "Gustave Flaubert",
    bio: "Gustave Flaubert est un écrivain français né à Rouen le 12 décembre 1821 et mort à Croisset, lieu-dit de la commune de Canteleu, le 8 mai 1880.",
    photoUrl: "/images/authors/flaubert.jpg",
    booksCount: 5,
  },
];

// ============================================
// USERS
// ============================================

export const users: User[] = [
  {
    id: "1",
    username: "Ekko",
    displayName: "Ekkoplus",
    avatarUrl: "/images/avatars/ekko.jpg",
    badge: "honorary" as MemberBadge,
    booksRead: 142,
    listsCount: 12,
    followersCount: 1249,
    followingCount: 89,
    joinDate: "16 janvier 2026",
  },
  {
    id: "2",
    username: "Marie",
    displayName: "Marie L.",
    avatarUrl: "/images/avatars/marie.jpg",
    badge: "member" as MemberBadge,
    booksRead: 56,
    listsCount: 3,
    followersCount: 234,
    followingCount: 120,
    joinDate: "23 février 2026",
  },
  {
    id: "3",
    username: "Jean",
    displayName: "Jean-Pierre",
    avatarUrl: "/images/avatars/jean.jpg",
    badge: "benefactor" as MemberBadge,
    booksRead: 312,
    listsCount: 25,
    followersCount: 2567,
    followingCount: 45,
    joinDate: "5 décembre 2025",
  },
  {
    id: "4",
    username: "Sophie",
    displayName: "Sophie",
    avatarUrl: "/images/avatars/sophie.jpg",
    badge: "honor" as MemberBadge,
    booksRead: 89,
    listsCount: 8,
    followersCount: 567,
    followingCount: 156,
    joinDate: "10 janvier 2026",
  },
  {
    id: "5",
    username: "Lucas",
    displayName: "Lucas",
    avatarUrl: "/images/avatars/lucas.jpg",
    badge: "member" as MemberBadge,
    booksRead: 23,
    listsCount: 2,
    followersCount: 45,
    followingCount: 78,
    joinDate: "1 mars 2026",
  },
];

// Current logged-in user
export const currentUser = users[0];

// ============================================
// BOOKS
// ============================================

export const books: Book[] = [
  {
    id: "1",
    title: "Les liaisons dangereuses",
    author: authors[0],
    coverUrl: "/images/books/liaisons-dangereuses.jpg",
    description: `Les Liaisons dangereuses est un roman épistolaire de 175 lettres, écrit par Pierre Choderlos de Laclos et publié en 1782. Cette œuvre littéraire majeure du XVIIIe siècle, qui narre le duo pervers du vicomte de Valmont et de la marquise de Merteuil, manipulateurs experts dans l'art de la séduction et de l'intrigue.

Le roman explore les thèmes de la manipulation, de la vengeance et de l'amour à travers les correspondances de ses personnages. Considéré comme un chef-d'œuvre de la littérature française, il a été adapté de nombreuses fois au théâtre et au cinéma.`,
    publishedYear: 1782,
    genre: "Roman épistolaire",
    averageRating: 7,
    totalVotes: 153,
    ratingDistribution: [14, 44, 21, 29, 14, 6, 21, 44, 29, 6],
  },
  {
    id: "2",
    title: "Notre-Dame de Paris",
    author: authors[1],
    coverUrl: "/images/books/notre-dame.jpg",
    description: `Notre-Dame de Paris est un roman de l'écrivain français Victor Hugo, publié en 1831. Le titre fait référence à la cathédrale Notre-Dame de Paris, qui est un des lieux principaux de l'intrigue du roman.

L'histoire se déroule à Paris en 1482 et raconte l'amour du bossu Quasimodo pour la belle Esmeralda.`,
    publishedYear: 1831,
    genre: "Roman historique",
    averageRating: 8.5,
    totalVotes: 2341,
    ratingDistribution: [12, 23, 45, 89, 156, 234, 456, 567, 489, 270],
  },
  {
    id: "3",
    title: "Les Misérables",
    author: authors[1],
    coverUrl: "/images/books/miserables.jpg",
    description: `Les Misérables est un roman de Victor Hugo publié en 1862. Ce roman, un des plus populaires de la littérature française, a donné lieu à de nombreuses adaptations au cinéma.

Dans ce chef-d'œuvre, Hugo retrace la vie de plusieurs personnages dans la France du XIXe siècle, principalement Jean Valjean, ancien forçat.`,
    publishedYear: 1862,
    genre: "Roman",
    averageRating: 9,
    totalVotes: 4521,
    ratingDistribution: [5, 12, 23, 45, 89, 156, 345, 678, 1234, 1934],
  },
  {
    id: "4",
    title: "Le Comte de Monte-Cristo",
    author: authors[2],
    coverUrl: "/images/books/monte-cristo.jpg",
    description: `Le Comte de Monte-Cristo est un roman d'Alexandre Dumas, écrit avec la collaboration d'Auguste Maquet et publié en 1844-1846.

C'est l'histoire d'Edmond Dantès, un jeune marin accusé à tort de trahison, qui s'évade de prison et trouve un trésor.`,
    publishedYear: 1844,
    genre: "Roman d'aventure",
    averageRating: 9.2,
    totalVotes: 3456,
    ratingDistribution: [3, 8, 15, 34, 67, 123, 289, 567, 1023, 1327],
  },
  {
    id: "5",
    title: "Germinal",
    author: authors[3],
    coverUrl: "/images/books/germinal.jpg",
    description: `Germinal est un roman d'Émile Zola publié en 1885. Ce treizième roman de la série des Rougon-Macquart est considéré comme le chef-d'œuvre de Zola.

Le roman décrit les conditions de vie des mineurs du nord de la France au XIXe siècle.`,
    publishedYear: 1885,
    genre: "Roman naturaliste",
    averageRating: 8.3,
    totalVotes: 1876,
    ratingDistribution: [8, 15, 34, 56, 89, 156, 234, 456, 512, 316],
  },
  {
    id: "6",
    title: "Madame Bovary",
    author: authors[4],
    coverUrl: "/images/books/bovary.jpg",
    description: `Madame Bovary est un roman de Gustave Flaubert publié en 1857. L'histoire est celle d'Emma Bovary, une femme qui cherche à échapper à l'ennui de sa vie de province.

Ce roman est considéré comme un des chefs-d'œuvre du réalisme français.`,
    publishedYear: 1857,
    genre: "Roman",
    averageRating: 7.8,
    totalVotes: 2134,
    ratingDistribution: [12, 23, 45, 78, 123, 234, 345, 456, 512, 306],
  },
  {
    id: "7",
    title: "Les Trois Mousquetaires",
    author: authors[2],
    coverUrl: "/images/books/mousquetaires.jpg",
    description: `Les Trois Mousquetaires est un roman de cape et d'épée d'Alexandre Dumas, publié en 1844.

L'histoire suit les aventures de d'Artagnan et de ses amis Athos, Porthos et Aramis.`,
    publishedYear: 1844,
    genre: "Roman de cape et d'épée",
    averageRating: 8.7,
    totalVotes: 2876,
    ratingDistribution: [5, 12, 23, 45, 89, 156, 345, 567, 823, 811],
  },
  {
    id: "8",
    title: "L'Éducation sentimentale",
    author: authors[4],
    coverUrl: "/images/books/education.jpg",
    description: `L'Éducation sentimentale est un roman de Gustave Flaubert publié en 1869.

Ce roman retrace la vie de Frédéric Moreau, un jeune homme qui monte à Paris pour faire ses études.`,
    publishedYear: 1869,
    genre: "Roman",
    averageRating: 7.2,
    totalVotes: 987,
    ratingDistribution: [15, 23, 45, 67, 89, 123, 156, 189, 167, 113],
  },
];

// ============================================
// COMMENTS
// ============================================

export const comments: Comment[] = [
  {
    id: "1",
    user: users[0],
    bookId: "1",
    rating: 8,
    content: "Livre exceptionnel, surement une des plus belles œuvres qui m'a été donné de lire dans ma vie. Mdr non je déconne, le livre est affreux c'est trop nul que Victor Hugo aille se rhabiller. Livre exceptionnel, surement une des plus belles œuvres qui m'a été donné de lire dans ma vie.",
    createdAt: new Date("2026-01-21"),
    likesCount: 1249,
  },
  {
    id: "2",
    user: users[1],
    bookId: "1",
    rating: 9,
    content: "Un classique incontournable de la littérature française. Les intrigues sont captivantes et les personnages sont d'une complexité remarquable. Je recommande vivement !",
    createdAt: new Date("2026-01-15"),
    likesCount: 856,
  },
  {
    id: "3",
    user: users[2],
    bookId: "1",
    rating: 7,
    content: "J'ai beaucoup aimé ce roman épistolaire. Le style est élégant et les manipulations des personnages sont fascinantes à suivre. Peut-être un peu long par moments.",
    createdAt: new Date("2026-01-10"),
    likesCount: 423,
  },
  {
    id: "4",
    user: users[3],
    bookId: "1",
    rating: 6,
    content: "Pas mal mais j'ai trouvé les personnages un peu trop détestables. C'est sans doute le but, mais ça m'a empêché de vraiment m'attacher à l'histoire.",
    createdAt: new Date("2026-01-05"),
    likesCount: 234,
  },
  {
    id: "5",
    user: users[4],
    bookId: "2",
    rating: 10,
    content: "Chef-d'œuvre absolu ! Hugo nous transporte dans le Paris médiéval avec une maestria incomparable. Quasimodo est un personnage inoubliable.",
    createdAt: new Date("2026-01-18"),
    likesCount: 1567,
  },
  {
    id: "6",
    user: users[0],
    bookId: "3",
    rating: 10,
    content: "Le plus grand roman de la littérature française. Jean Valjean est un héros universel qui m'a profondément touché.",
    createdAt: new Date("2026-01-20"),
    likesCount: 2341,
  },
];

// ============================================
// BOOK LISTS
// ============================================

export const bookLists: BookList[] = [
  {
    id: "1",
    title: "Classiques pour se mettre à la lecture facilement",
    description: "Une sélection de classiques accessibles pour commencer ou reprendre la lecture.",
    author: users[0],
    books: [books[0], books[1], books[2], books[3]],
    booksCount: 84,
    likesCount: 1249,
    createdAt: new Date("2025-06-15"),
    updatedAt: new Date("2026-01-20"),
  },
  {
    id: "2",
    title: "Romans épistolaires incontournables",
    description: "Les meilleurs romans composés de lettres et correspondances.",
    author: users[1],
    books: [books[0], books[5], books[7]],
    booksCount: 32,
    likesCount: 567,
    createdAt: new Date("2025-08-20"),
    updatedAt: new Date("2026-01-15"),
  },
  {
    id: "3",
    title: "Victor Hugo : œuvre complète",
    description: "Tous les romans de Victor Hugo, du plus court au plus long.",
    author: users[2],
    books: [books[1], books[2]],
    booksCount: 15,
    likesCount: 2345,
    createdAt: new Date("2024-12-01"),
    updatedAt: new Date("2026-01-10"),
  },
  {
    id: "4",
    title: "Mes coups de cœur 2025",
    description: "Les livres qui m'ont le plus marqué cette année.",
    author: users[3],
    books: [books[3], books[4], books[6]],
    booksCount: 12,
    likesCount: 789,
    createdAt: new Date("2025-12-31"),
    updatedAt: new Date("2026-01-05"),
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getBookById(id: string): Book | undefined {
  return books.find((book) => book.id === id);
}

export function getAuthorById(id: string): Author | undefined {
  return authors.find((author) => author.id === id);
}

export function getUserById(id: string): User | undefined {
  return users.find((user) => user.id === id);
}

export function getCommentsByBookId(bookId: string): Comment[] {
  return comments.filter((comment) => comment.bookId === bookId);
}

export function getBooksByAuthorId(authorId: string): Book[] {
  return books.filter((book) => book.author.id === authorId);
}

export function getListsByUserId(userId: string): BookList[] {
  return bookLists.filter((list) => list.author.id === userId);
}

export function getListsContainingBook(bookId: string): BookList[] {
  return bookLists.filter((list) =>
    list.books.some((book) => book.id === bookId)
  );
}

export function getFriendsActivity(userId: string): User[] {
  // Mock: return some users as "friends who rated this book"
  return users.filter((user) => user.id !== userId).slice(0, 4);
}

export function getPopularBooks(limit: number = 8): Book[] {
  return [...books]
    .sort((a, b) => b.totalVotes - a.totalVotes)
    .slice(0, limit);
}

export function getRecentBooks(limit: number = 8): Book[] {
  return [...books]
    .sort((a, b) => b.publishedYear - a.publishedYear)
    .slice(0, limit);
}

export function searchBooks(query: string): Book[] {
  const lowerQuery = query.toLowerCase();
  return books.filter(
    (book) =>
      book.title.toLowerCase().includes(lowerQuery) ||
      book.author.name.toLowerCase().includes(lowerQuery) ||
      book.genre.toLowerCase().includes(lowerQuery)
  );
}

export function getTopRatedBooks(limit: number = 8): Book[] {
  return [...books]
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, limit);
}

// ============================================
// BADGE LABELS (single source of truth)
// ============================================

export const badgeLabels: Record<string, string> = {
  member: "membre du club",
  honorary: "membre honoraire",
  benefactor: "membre bienfaiteur",
  honor: "membre d'honneur",
};

// ============================================
// USER RATINGS (per-user personal ratings)
// ============================================

// userId → { bookId: rating }
export const allUserRatings: Record<string, Record<string, number>> = {
  "1": { "1": 7, "2": 9, "3": 10, "4": 8 },           // Ekko : 4 livres notés
  "2": { "5": 7, "6": 8 },                              // Marie : 2 livres notés
  "3": { "1": 9, "3": 10, "5": 8, "7": 9 },            // Jean-Pierre : 4 livres notés
  "4": { "2": 8, "4": 9, "6": 7 },                     // Sophie : 3 livres notés
  "5": { "7": 6, "8": 7 },                              // Lucas : 2 livres notés
};

// Shortcut for current user (backwards compat)
export const userRatings = allUserRatings[currentUser.id] ?? {};

export function getUserRatingForBook(bookId: string, userId: string = currentUser.id): number | null {
  return allUserRatings[userId]?.[bookId] ?? null;
}

export function getRatedBooksByUserId(userId: string): Book[] {
  const ratedIds = Object.keys(allUserRatings[userId] ?? {});
  return books.filter((b) => ratedIds.includes(b.id));
}
