"use client";

import Image from "next/image";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { RatingStars } from "@/components/ui";
import type { Book } from "@/types";

export type BookCardVariant = "default" | "overlay" | "featured";
export type BookCardSize = "sm" | "md" | "lg" | "xl";

export interface BookCardProps {
  book: Book;
  /** Visual variant:
   * - default: hover shows my rating + average rating
   * - overlay: hover shows title only
   * - featured: permanent rating bar at bottom (for homepage)
   */
  variant?: BookCardVariant;
  /** Size preset */
  size?: BookCardSize;
  /** Show title below card */
  showTitle?: boolean;
  /** Show author below card */
  showAuthor?: boolean;
  /** User's personal rating (shows orange stars on hover) */
  myRating?: number | null;
  /** Comments count (for featured variant) */
  commentsCount?: number;
  /** Show "read" badge (for featured variant) */
  isRead?: boolean;
  className?: string;
}

const sizeConfig: Record<BookCardSize, { width: number; height: number; containerClass: string }> = {
  sm: { width: 140, height: 210, containerClass: "w-[140px]" },
  md: { width: 185, height: 278, containerClass: "w-[185px]" },
  lg: { width: 220, height: 330, containerClass: "w-[220px]" },
  xl: { width: 260, height: 390, containerClass: "w-[260px]" },
};

/**
 * Unified BookCard component
 * Replaces: BookCard, BookCardOverlay, HomeBookCard
 */
export function BookCard({
  book,
  variant = "default",
  size = "md",
  showTitle = false,
  showAuthor = false,
  myRating = null,
  commentsCount = 0,
  isRead = false,
  className = "",
}: BookCardProps) {
  const config = sizeConfig[size];

  return (
    <Link
      href={`/livres/${book.id}`}
      className={`group flex flex-col gap-3 ${config.containerClass} ${className}`}
    >
      {/* Cover Container */}
      <div
        className={`relative bg-cream overflow-hidden ${
          variant === "default" ? "rounded-sm transition-transform group-hover:scale-[1.02]" : ""
        }`}
        style={{ width: config.width, height: config.height }}
      >
        {/* Cover Image or Placeholder */}
        {book.coverUrl ? (
          <Image
            src={book.coverUrl}
            alt={`Couverture de ${book.title}`}
            fill
            className="object-cover"
            sizes={`${config.width}px`}
          />
        ) : (
          <BookPlaceholder title={book.title} size={size} />
        )}

        {/* Variant-specific overlays */}
        {variant === "default" && (
          <DefaultOverlay book={book} myRating={myRating} />
        )}

        {variant === "overlay" && (
          <TitleOverlay title={book.title} />
        )}

        {variant === "featured" && (
          <>
            {isRead && myRating && (
              <ReadBadge rating={myRating} />
            )}
            <FeaturedOverlay rating={book.averageRating} commentsCount={commentsCount} />
          </>
        )}
      </div>

      {/* Book Info (below card) */}
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

// Sub-components for cleaner code organization

function BookPlaceholder({ title, size }: { title: string; size: BookCardSize }) {
  const textSize = size === "xl" ? "text-lg" : size === "lg" ? "text-base" : "text-sm";
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-cream">
      <p className={`font-display ${textSize} text-gray text-center px-3 leading-tight`}>
        {title}
      </p>
    </div>
  );
}

function DefaultOverlay({ book, myRating }: { book: Book; myRating: number | null }) {
  return (
    <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
      <div className="absolute bottom-3 left-3 right-3 flex flex-col gap-2">
        {/* My Rating */}
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-semibold tracking-widest uppercase text-white/50">
            Ma note
          </span>
          {myRating ? (
            <div className="flex items-center gap-2">
              <RatingStars
                rating={myRating}
                size="sm"
                variant="light"
                className="[&_svg]:text-primary [&_svg]:fill-primary [&_svg]:stroke-primary"
              />
              <span className="text-primary font-semibold text-[14px] leading-none">
                {myRating}/10
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <svg
                  key={i}
                  className="w-4 h-4 text-white/25"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
              <span className="text-white/40 text-[11px] font-medium">—</span>
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="w-full h-px bg-white/20" />

        {/* Average Rating */}
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-semibold tracking-widest uppercase text-white/50">
            Moyenne
          </span>
          <div className="flex items-center gap-2">
            <RatingStars rating={book.averageRating} size="sm" variant="light" />
            <span className="text-white font-semibold text-[13px] leading-none">
              {book.averageRating}/10
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TitleOverlay({ title }: { title: string }) {
  return (
    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-dark/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
      <div className="absolute bottom-3 left-3 right-3">
        <p className="text-small font-medium text-white line-clamp-2">
          {title}
        </p>
      </div>
    </div>
  );
}

function ReadBadge({ rating }: { rating: number }) {
  return (
    <div className="absolute top-3 right-3 bg-dark/90 text-white px-3 py-1.5 rounded-full z-10">
      <span className="text-small font-medium tracking-tight">
        lu - {rating}/10
      </span>
    </div>
  );
}

function FeaturedOverlay({ rating, commentsCount }: { rating: number; commentsCount: number }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-primary/90 px-5 py-3">
      <div className="flex flex-col gap-1">
        <RatingStars rating={rating} size="lg" variant="light" />
        <div className="flex items-center gap-2 text-white">
          <MessageSquare className="w-5 h-5" />
          <span className="text-body font-medium tracking-tight">
            {commentsCount} commentaire{commentsCount !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </div>
  );
}

// Legacy export for backwards compatibility during migration
export { BookCard as BookCardOverlay };
