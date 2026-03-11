"use client";

import Image from "next/image";
import { Check } from "lucide-react";
import type { Book } from "@/types";

export interface BookCoverSelectProps {
  book: Book;
  isSelected?: boolean;
  onSelect?: () => void;
  size?: "sm" | "md";
  className?: string;
}

const sizeConfig = {
  sm: {
    width: 100,
    height: 150,
  },
  md: {
    width: 140,
    height: 210,
  },
};

export function BookCoverSelect({
  book,
  isSelected = false,
  onSelect,
  size = "sm",
  className = "",
}: BookCoverSelectProps) {
  const config = sizeConfig[size];

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative block cursor-pointer group ${className}`}
      style={{ width: config.width, height: config.height }}
    >
      {/* Cover Image */}
      <div className="relative w-full h-full bg-cream overflow-hidden rounded-sm">
        {book.coverUrl ? (
          <Image
            src={book.coverUrl}
            alt={`Couverture de ${book.title}`}
            fill
            className="object-cover"
            sizes={`${config.width}px`}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="font-display text-xs text-gray text-center px-2">
              {book.title}
            </p>
          </div>
        )}

        {/* Hover/Selected overlay */}
        <div
          className={`absolute inset-0 transition-all ${
            isSelected
              ? "bg-primary/40"
              : "bg-transparent group-hover:bg-dark/20"
          }`}
        />

        {/* Selected checkmark */}
        {isSelected && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      {/* Title */}
      <p className="mt-2 text-small text-dark text-center line-clamp-2 leading-tight">
        {book.title}
      </p>
    </button>
  );
}
