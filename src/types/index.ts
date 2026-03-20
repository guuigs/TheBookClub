// ============================================
// THE BOOK CLUB - TypeScript Types
// ============================================

// Book Status
export type BookStatus = "to_read" | "read" | null;

// Member Badge Types
export type MemberBadge =
  | "member"
  | "honorary"
  | "benefactor"
  | "honor";

// Rating (1-10)
export type Rating = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

// Book
export interface Book {
  id: string;
  title: string;
  author: Author;
  coverUrl: string;
  description: string;
  genre: string;
  averageRating: number;
  totalVotes: number;
  ratingDistribution: number[]; // Array of 10 values (votes per rating 1-10)
  freeReadLink?: string;
  buyLink?: string;
}

// Author
export interface Author {
  id: string;
  name: string;
  bio?: string;
  photoUrl?: string;
  booksCount: number;
}

// User
export interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  badge: MemberBadge;
  booksRead: number;
  listsCount: number;
  followersCount: number;
  followingCount: number;
  joinDate?: string;
}

// Comment/Review
export interface Comment {
  id: string;
  user: User;
  bookId: string;
  rating?: Rating;
  content: string;
  createdAt: Date;
  likesCount: number;
  isLikedByCurrentUser?: boolean;
}

// List
export interface BookList {
  id: string;
  title: string;
  description?: string;
  author: User;
  books: Book[];
  booksCount: number;
  likesCount: number;
  createdAt: Date;
  updatedAt: Date;
  isPrivate?: boolean;
  isPinned?: boolean;
}

// User's Book Entry (in their library)
export interface UserBook {
  bookId: string;
  book: Book;
  status: BookStatus;
  rating?: Rating;
  review?: string;
  readDate?: Date;
  addedAt: Date;
}

// Activity Feed Item
export interface ActivityItem {
  id: string;
  user: User;
  type: "rated" | "reviewed" | "added_to_list" | "wants_to_read";
  book: Book;
  rating?: Rating;
  createdAt: Date;
}

// Component Props Types
export interface ButtonProps {
  variant?: "primary" | "secondary" | "discrete";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
}

export interface AvatarProps {
  src?: string;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  badge?: MemberBadge;
  className?: string;
}

export interface BookCardProps {
  book: Book;
  size?: "sm" | "md" | "lg";
  showRating?: boolean;
  className?: string;
}

export interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRatingChange?: (rating: Rating) => void;
}

export interface CommentCardProps {
  comment: Comment;
  showBookInfo?: boolean;
  truncate?: boolean;
}

export interface ListCardProps {
  list: BookList;
  className?: string;
}
