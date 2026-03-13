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
  myRating?: number | null;
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
  myRating = null,
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

        {/* Hover overlay — Option C */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-3 left-3 right-3 flex flex-col gap-2">
            {/* Ma note — top block */}
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-semibold tracking-widest uppercase text-white/50">Ma note</span>
              {myRating ? (
                <div className="flex items-center gap-2">
                  <RatingStars rating={myRating} size="sm" variant="light" className="[&_svg]:text-primary [&_svg]:fill-primary [&_svg]:stroke-primary" />
                  <span className="text-primary font-semibold text-[14px] leading-none">{myRating}/10</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {[1,2,3,4,5].map((i) => (
                    <svg key={i} className="w-4 h-4 text-white/25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  ))}
                  <span className="text-white/40 text-[11px] font-medium">—</span>
                </div>
              )}
            </div>
            {/* Separator */}
            <div className="w-full h-px bg-white/20" />
            {/* Moyenne — bottom block */}
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-semibold tracking-widest uppercase text-white/50">Moyenne</span>
              <div className="flex items-center gap-2">
                <RatingStars rating={book.averageRating} size="sm" variant="light" />
                <span className="text-white font-semibold text-[13px] leading-none">{book.averageRating}/10</span>
              </div>
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
