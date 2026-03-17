"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Badge } from "@/components/ui";
import type { BookList } from "@/types";

export interface ListCardProps {
  list: BookList;
  className?: string;
}

export function ListCard({ list, className = "" }: ListCardProps) {
  // Get first 3 books for the preview
  const previewBooks = list.books.slice(0, 3);

  return (
    <Link
      href={`/listes/${list.id}`}
      className={`group flex flex-col gap-3 w-[390px] ${className}`}
    >
      {/* Book Covers Preview - Overlapping */}
      <div className="flex items-start pr-[55px]">
        {previewBooks.map((book, index) => (
          <div
            key={book.id}
            className="relative w-[167px] h-[250px] bg-cream overflow-hidden shrink-0 transition-transform group-hover:scale-[1.02]"
            style={{
              marginRight: index < previewBooks.length - 1 ? "-55px" : 0,
              zIndex: previewBooks.length - index,
            }}
          >
            {book.coverUrl ? (
              <Image
                src={book.coverUrl}
                alt={`Couverture de ${book.title}`}
                fill
                className="object-cover"
                sizes="167px"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="font-display text-sm text-gray text-center px-2">
                  {book.title}
                </p>
              </div>
            )}
          </div>
        ))}

        {/* Placeholder if less than 3 books */}
        {previewBooks.length < 3 &&
          Array.from({ length: 3 - previewBooks.length }).map((_, index) => (
            <div
              key={`placeholder-${index}`}
              className="relative w-[167px] h-[250px] bg-cream/50 shrink-0"
              style={{
                marginRight:
                  index < 3 - previewBooks.length - 1 ? "-55px" : 0,
                zIndex: 3 - previewBooks.length - index,
              }}
            />
          ))}
      </div>

      {/* List Title */}
      <h3 className="text-t4 font-semibold text-dark tracking-tight line-clamp-2 group-hover:text-primary transition-colors">
        {list.title}
      </h3>

      {/* Stats: Book count + Likes */}
      <div className="flex items-center gap-3">
        <span className="text-body font-medium text-dark tracking-tight">
          {list.books.length} livre{list.books.length > 1 ? "s" : ""}
        </span>
        <div className="flex items-center gap-1">
          <Heart className="w-4 h-4 text-dark" aria-hidden="true" />
          <span className="text-body font-medium text-dark tracking-tight">
            {list.likesCount} like{list.likesCount > 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Author */}
      <div className="flex items-center gap-1">
        <span className="text-body font-medium text-dark tracking-tight">
          par
        </span>
        <span className="text-body font-medium text-dark tracking-tight">
          {list.author.username}
        </span>
        <Badge type={list.author.badge} size="sm" />
      </div>
    </Link>
  );
}
