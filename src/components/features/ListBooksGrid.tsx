"use client";

import { useState, useMemo } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { BookCard } from "@/components/features";
import type { Book } from "@/types";

type SortOption = "alpha" | "rating" | "popularity";
type SortDirection = "asc" | "desc";

interface ListBooksGridProps {
  books: Book[];
  userRatings: Record<string, number>;
}

const sortLabels: Record<SortOption, string> = {
  alpha: "Alphabétique",
  rating: "Note",
  popularity: "Popularité",
};

export function ListBooksGrid({ books, userRatings }: ListBooksGridProps) {
  const [sortBy, setSortBy] = useState<SortOption>("alpha");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const sortedBooks = useMemo(() => {
    const sorted = [...books].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "alpha":
          comparison = a.title.localeCompare(b.title, "fr");
          break;
        case "rating":
          comparison = (b.averageRating ?? 0) - (a.averageRating ?? 0);
          break;
        case "popularity":
          comparison = (b.totalVotes ?? 0) - (a.totalVotes ?? 0);
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
    return sorted;
  }, [books, sortBy, sortDirection]);

  const handleSortChange = (newSort: SortOption) => {
    if (newSort === sortBy) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(newSort);
      // Default directions
      if (newSort === "alpha") {
        setSortDirection("asc");
      } else {
        setSortDirection("desc");
      }
    }
  };

  const sortOptions: SortOption[] = ["alpha", "rating", "popularity"];

  if (books.length === 0) {
    return (
      <p className="text-body text-gray text-center py-10">
        Cette liste ne contient pas encore de livres.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Sort controls */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-gray">Trier par :</span>
        {sortOptions.map((option) => (
          <button
            key={option}
            onClick={() => handleSortChange(option)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium tracking-tight transition-colors ${
              sortBy === option
                ? "bg-dark text-white"
                : "bg-gray/10 text-dark hover:bg-gray/20"
            }`}
          >
            {sortLabels[option]}
            {sortBy === option && (
              sortDirection === "asc" ? (
                <ArrowUp className="w-3.5 h-3.5" />
              ) : (
                <ArrowDown className="w-3.5 h-3.5" />
              )
            )}
            {sortBy !== option && <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />}
          </button>
        ))}
      </div>

      {/* Books grid */}
      <div className="grid grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-5 gap-5">
        {sortedBooks.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            size="md"
            showTitle
            showAuthor
            myRating={userRatings[book.id] ?? null}
          />
        ))}
      </div>
    </div>
  );
}
