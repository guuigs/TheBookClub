"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Avatar, RatingStars, Badge, Button } from "@/components/ui";
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
  const formattedDate = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(comment.createdAt);

  // Truncate content
  const maxLength = 200;
  const isLong = comment.content.length > maxLength;
  const truncatedContent = isLong
    ? comment.content.slice(0, maxLength) + "..."
    : comment.content;

  return (
    <div className={`flex gap-4 w-full max-w-[540px] ${className}`}>
      {/* Book Cover */}
      <Link
        href={`/books/${book.id}`}
        className="relative w-[100px] h-[150px] bg-cream shrink-0 overflow-hidden"
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
            href={`/profile/${comment.user.id}`}
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
              href={`/profile/${comment.user.id}`}
              className="text-[16px] font-medium text-dark tracking-tight hover:text-primary transition-colors"
            >
              {comment.user.username}
            </Link>
            <Badge type={comment.user.badge} size="sm" className="ml-1" />
          </div>
          {comment.rating && (
            <RatingStars rating={comment.rating} size="sm" />
          )}
          <span className="text-[12px] text-gray tracking-tight">
            noté le {formattedDate}
          </span>
        </div>

        {/* Book Title */}
        <Link
          href={`/books/${book.id}`}
          className="font-display text-[22px] text-dark hover:text-primary transition-colors"
        >
          {book.title}
        </Link>

        {/* Comment Text */}
        <p className="text-[15px] font-medium text-dark tracking-tight leading-relaxed line-clamp-3">
          {truncatedContent}
        </p>

        {isLong && (
          <Link
            href={`/books/${book.id}`}
            className="text-[14px] font-medium text-primary underline tracking-tight hover:opacity-80"
          >
            voir plus
          </Link>
        )}

        {/* Likes */}
        <div className="flex items-center gap-1">
          <Heart className="w-3 h-3 text-dark" />
          <span className="text-[13px] font-normal text-dark">
            {comment.likesCount} like{comment.likesCount !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </div>
  );
}
