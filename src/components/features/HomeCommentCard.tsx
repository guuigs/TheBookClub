"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Avatar, RatingStars, Badge } from "@/components/ui";
import { toggleCommentLike } from "@/lib/db/comments";
import { formatDate } from "@/lib/utils/format";
import { useAuth } from "@/context/AuthContext";
import type { Comment, Book } from "@/types";

export interface HomeCommentCardProps {
  comment: Comment;
  book: Book;
  className?: string;
}

export function HomeCommentCard({
  comment,
  book,
  className = "",
}: HomeCommentCardProps) {
  const [isLiked, setIsLiked] = useState(comment.isLikedByCurrentUser ?? false);
  const [likesCount, setLikesCount] = useState(comment.likesCount);
  const [isLiking, setIsLiking] = useState(false);
  const { requireAuth } = useAuth();

  const formattedDate = formatDate(comment.createdAt);

  // Truncate content
  const maxLength = 200;
  const isLong = comment.content.length > maxLength;
  const truncatedContent = isLong
    ? comment.content.slice(0, maxLength) + "..."
    : comment.content;

  const performLike = async () => {
    if (isLiking) return;
    setIsLiking(true);

    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikesCount((prev) => (wasLiked ? prev - 1 : prev + 1));

    const { liked, error } = await toggleCommentLike(comment.id);
    if (error) {
      setIsLiked(wasLiked);
      setLikesCount((prev) => (wasLiked ? prev + 1 : prev - 1));
    } else {
      setIsLiked(liked);
    }

    setIsLiking(false);
  };

  const handleLike = () => {
    requireAuth(performLike);
  };

  return (
    <div className={`flex gap-4 w-full max-w-[540px] ${className}`}>
      {/* Book Cover — desktop only */}
      <Link
        href={`/livres/${book.id}`}
        className="hidden desktop:block relative w-[100px] h-[150px] bg-cream shrink-0 overflow-hidden"
      >
        {book.coverUrl ? (
          <Image
            src={book.coverUrl}
            alt={book.title}
            fill
            className="object-cover"
            sizes="100px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="font-display text-xs text-gray text-center px-2">
              {book.title}
            </p>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col gap-3 flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={`/account/${comment.user.id}`}
            className="flex items-center gap-1"
          >
            <Avatar
              src={comment.user.avatarUrl}
              alt={comment.user.username}
              size="sm"
            />
          </Link>
          <div className="flex items-center">
            <Link
              href={`/account/${comment.user.id}`}
              className="text-body font-medium text-dark tracking-tight hover:text-primary transition-colors"
            >
              {comment.user.username}
            </Link>
            <Badge type={comment.user.badge} size="sm" className="ml-1" />
          </div>
          {comment.rating && (
            <RatingStars rating={comment.rating} size="sm" />
          )}
          <span className="text-small text-gray tracking-tight">
            noté le {formattedDate}
          </span>
        </div>

        {/* Book Title */}
        <Link
          href={`/livres/${book.id}`}
          className="font-display text-t4 text-dark hover:text-primary transition-colors"
        >
          {book.title}
        </Link>

        {/* Comment Text */}
        <p className="text-body font-medium text-dark tracking-tight leading-relaxed line-clamp-3">
          {truncatedContent}
        </p>

        {isLong && (
          <Link
            href={`/livres/${book.id}`}
            className="text-small font-medium text-primary underline tracking-tight hover:opacity-80"
          >
            voir plus
          </Link>
        )}

        {/* Likes */}
        <button
          type="button"
          onClick={handleLike}
          aria-label={isLiked ? "Ne plus aimer ce commentaire" : "Aimer ce commentaire"}
          aria-pressed={isLiked}
          className="flex items-center gap-1 group w-fit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isLiked
                ? "fill-primary text-primary"
                : "text-dark group-hover:text-primary"
            }`}
            aria-hidden="true"
          />
          <span className="text-small font-medium text-dark group-hover:text-primary transition-colors">
            {likesCount} like{likesCount !== 1 ? "s" : ""}
          </span>
        </button>
      </div>
    </div>
  );
}
