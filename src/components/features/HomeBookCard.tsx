"use client";

import Image from "next/image";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { RatingStars } from "@/components/ui";
import type { Book } from "@/types";

export interface HomeBookCardProps {
  book: Book;
  commentsCount?: number;
  className?: string;
}

export function HomeBookCard({
  book,
  commentsCount = 0,
  className = "",
}: HomeBookCardProps) {
  return (
    <Link
      href={`/books/${book.id}`}
      className={`group relative block w-[260px] h-[390px] ${className}`}
    >
      {/* Cover Image */}
      <div className="relative w-full h-full bg-cream overflow-hidden">
        {book.coverUrl ? (
          <Image
            src={book.coverUrl}
            alt={`Couverture de ${book.title}`}
            fill
            className="object-cover"
            sizes="260px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-cream">
            <p className="font-display text-lg text-gray text-center px-4">
              {book.title}
            </p>
          </div>
        )}

        {/* Rating Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-primary/90 px-5 py-3">
          <div className="flex flex-col gap-1">
            <RatingStars rating={book.averageRating} size="lg" variant="light" />
            <div className="flex items-center gap-2 text-white">
              <MessageSquare className="w-5 h-5" />
              <span className="text-body font-medium tracking-tight">
                {commentsCount} commentaire{commentsCount !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
