"use client";

import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { RatingStars } from "@/components/ui";
import type { Book } from "@/types";

export interface BookCardProps {
  book: Book;
  size?: "sm" | "md" | "lg";
  showTitle?: boolean;
  showAuthor?: boolean;
  commentsCount?: number;
  className?: string;
}

const sizeConfig = {
  sm: {
    width: 140,
    height: 210,
    containerClass: "w-[140px]",
  },
  md: {
    width: 185,
    height: 278,
    containerClass: "w-[185px]",
  },
  lg: {
    width: 220,
    height: 330,
    containerClass: "w-[220px]",
  },
};

export function BookCard({
  book,
  size = "md",
  showTitle = false,
  showAuthor = false,
  commentsCount = 0,
  className = "",
}: BookCardProps) {
  const config = sizeConfig[size];

  return (
    <Link
      href={`/books/${book.id}`}
      className={`group flex flex-col gap-3 ${config.containerClass} ${className}`}
    >
      {/* Cover Image */}
      <div
        className="relative bg-cream rounded-sm overflow-hidden transition-transform group-hover:scale-[1.02]"
        style={{
          width: config.width,
          height: config.height,
        }}
      >
        {book.coverUrl ? (
          <Image
            src={book.coverUrl}
            alt={`Couverture de ${book.title}`}
            fill
            className="object-cover"
            sizes={`${config.width}px`}
          />
        ) : (
          // Placeholder when no cover
          <div className="absolute inset-0 flex items-center justify-center bg-cream">
            <div className="text-center px-3">
              <p className="font-display text-sm text-gray leading-tight">
                {book.title}
              </p>
            </div>
          </div>
        )}

        {/* Hover overlay with rating */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-dark/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-3 left-3 right-3 flex flex-col gap-2">
            <RatingStars rating={book.averageRating} size="sm" variant="light" />
            <div className="flex items-center gap-2 text-white text-small">
              <MessageCircle className="w-4 h-4" />
              <span>{commentsCount || book.totalVotes} avis</span>
            </div>
          </div>
        </div>
      </div>

      {/* Book Info */}
      {(showTitle || showAuthor) && (
        <div className="flex flex-col gap-1">
          {showTitle && (
            <p className="text-small font-medium text-dark line-clamp-2 leading-tight">
              {book.title}
            </p>
          )}
          {showAuthor && (
            <p className="text-small text-gray line-clamp-1">
              {book.author.name}
            </p>
          )}
        </div>
      )}
    </Link>
  );
}

// Variant for displaying in a list with overlay title (like in search results)
export function BookCardOverlay({
  book,
  size = "md",
  className = "",
}: Omit<BookCardProps, "showTitle" | "showAuthor">) {
  const config = sizeConfig[size];

  return (
    <Link
      href={`/books/${book.id}`}
      className={`group relative block ${config.containerClass} ${className}`}
    >
      <div
        className="relative bg-cream rounded-sm overflow-hidden"
        style={{
          width: config.width,
          height: config.height,
        }}
      >
        {book.coverUrl ? (
          <Image
            src={book.coverUrl}
            alt={`Couverture de ${book.title}`}
            fill
            className="object-cover"
            sizes={`${config.width}px`}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-cream">
            <p className="font-display text-sm text-gray text-center px-3">
              {book.title}
            </p>
          </div>
        )}

        {/* Gradient overlay with title */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-dark/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-3 left-3 right-3">
            <p className="text-small font-medium text-white line-clamp-2">
              {book.title}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
