/**
 * Centralized data mappers for Supabase row -> Domain type transformations
 * Use these instead of defining mappers in individual pages
 */

import type { Book, Comment, BookList, User, MemberBadge } from "@/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = Record<string, any>;

/**
 * Maps a Supabase book row (from books_with_stats view) to Book type
 */
export function mapBook(row: AnyRow): Book {
  return {
    id: row.id,
    title: row.title,
    author: {
      id: row.author_id ?? "",
      name: row.author_name ?? "Auteur inconnu",
      bio: row.author_bio ?? undefined,
      photoUrl: row.author_photo_url ?? undefined,
      booksCount: 0,
    },
    coverUrl: row.cover_url ?? "",
    description: row.description ?? "",
    publishedYear: row.published_year ?? 0,
    genre: row.genre ?? "",
    averageRating: Number(row.average_rating ?? 0),
    totalVotes: Number(row.total_votes ?? 0),
    ratingDistribution: [],
  };
}

/**
 * Creates an empty/minimal Book object (useful as fallback)
 */
export function createEmptyBook(id: string = ""): Book {
  return {
    id,
    title: "",
    author: { id: "", name: "", booksCount: 0 },
    coverUrl: "",
    description: "",
    publishedYear: 0,
    genre: "",
    averageRating: 0,
    totalVotes: 0,
    ratingDistribution: [],
  };
}

/**
 * Maps a Supabase comment row to Comment type
 */
export function mapComment(row: AnyRow): Comment {
  const user = row.user ?? {};
  return {
    id: row.id,
    user: mapUserFromProfile(user),
    bookId: row.book_id,
    content: row.content,
    createdAt: new Date(row.created_at),
    likesCount: Number(row.likes_count?.[0]?.count ?? 0),
    isLikedByCurrentUser: false,
    rating: row.rating ?? undefined,
  };
}

/**
 * Maps a comment row with its associated book
 */
export function mapCommentWithBook(row: AnyRow): { comment: Comment; book: Book } {
  return {
    comment: mapComment(row),
    book: row.book
      ? {
          id: row.book.id,
          title: row.book.title,
          author: { id: "", name: "", booksCount: 0 },
          coverUrl: row.book.cover_url ?? "",
          description: "",
          publishedYear: 0,
          genre: "",
          averageRating: 0,
          totalVotes: 0,
          ratingDistribution: [],
        }
      : createEmptyBook(row.book_id),
  };
}

/**
 * Maps a Supabase book_lists row to BookList type
 */
export function mapList(row: AnyRow): BookList {
  const author = row.author ?? {};
  const items = row.items ?? [];

  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    author: mapUserFromProfile(author),
    books: items.map((item: AnyRow) => {
      const book = item.book ?? {};
      return {
        id: book.id ?? "",
        title: book.title ?? "",
        author: { id: "", name: "", booksCount: 0 },
        coverUrl: book.cover_url ?? "",
        description: "",
        publishedYear: 0,
        genre: "",
        averageRating: 0,
        totalVotes: 0,
        ratingDistribution: [],
      };
    }),
    booksCount: Number(row.books_count?.[0]?.count ?? 0),
    likesCount: Number(row.likes_count?.[0]?.count ?? 0),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at ?? row.created_at),
  };
}

/**
 * Maps a Supabase profiles row to User type
 */
export function mapUser(row: AnyRow): User {
  return {
    id: row.id,
    username: row.username ?? "",
    displayName: row.display_name ?? "",
    avatarUrl: row.avatar_url ?? undefined,
    badge: (row.badge as MemberBadge) ?? "member",
    booksRead: Number(row.books_rated ?? row.books_read ?? 0),
    listsCount: Number(row.lists_count ?? 0),
    followersCount: Number(row.followers_count ?? 0),
    followingCount: Number(row.following_count ?? 0),
  };
}

/**
 * Maps a nested profile object (from joins) to User type
 */
export function mapUserFromProfile(profile: AnyRow): User {
  return {
    id: profile.id ?? "",
    username: profile.username ?? "",
    displayName: profile.display_name ?? "Inconnu",
    avatarUrl: profile.avatar_url ?? undefined,
    badge: (profile.badge as MemberBadge) ?? "member",
    booksRead: 0,
    listsCount: 0,
    followersCount: 0,
    followingCount: 0,
  };
}
