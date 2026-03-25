"use client";

import Image from "next/image";

// Background images for generated covers (randomly selected based on title hash)
const COVER_BACKGROUNDS = [
  '/covers/cover-background1.png',
  '/covers/cover-background2.png',
  '/covers/cover-background3.png',
];

// Simple hash function to get consistent background per book
function getBackgroundIndex(title: string): number {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = ((hash << 5) - hash) + title.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % COVER_BACKGROUNDS.length;
}

export type BookPlaceholderSize = "sm" | "md" | "lg" | "xl";

export interface BookPlaceholderProps {
  title: string;
  author?: string;
  size?: BookPlaceholderSize;
}

/**
 * Placeholder cover for books without a cover image.
 * Displays one of 3 background images (deterministic based on title hash)
 * with the book title and author overlaid.
 */
export function BookPlaceholder({ title, author, size = "md" }: BookPlaceholderProps) {
  const bgIndex = getBackgroundIndex(title);
  const bgImage = COVER_BACKGROUNDS[bgIndex];

  const titleSize = size === "xl" ? "text-xl" : size === "lg" ? "text-lg" : size === "md" ? "text-base" : "text-sm";
  const authorSize = size === "xl" ? "text-base" : size === "lg" ? "text-sm" : "text-xs";
  const padding = size === "xl" || size === "lg" ? "p-4" : "p-3";
  const logoSize = size === "xl" || size === "lg" ? "w-8 h-8" : "w-6 h-6";

  return (
    <div className="absolute inset-0">
      {/* Background Image */}
      <Image
        src={bgImage}
        alt=""
        fill
        className="object-cover"
        sizes="260px"
      />
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/20" />

      {/* Content */}
      <div className={`absolute inset-0 flex flex-col justify-between ${padding} text-white`}>
        <div className="flex flex-col gap-2">
          <p className={`font-semibold ${titleSize} leading-tight line-clamp-4 drop-shadow-md`}>
            {title}
          </p>
          {author && (
            <p className={`${authorSize} opacity-90 line-clamp-2 drop-shadow-md`}>
              {author}
            </p>
          )}
        </div>

        {/* Logo */}
        <div className="flex justify-center">
          <Image
            src="/covers/icon-cover.svg"
            alt="The Book Club"
            width={32}
            height={32}
            className={`${logoSize} object-contain`}
          />
        </div>
      </div>
    </div>
  );
}
