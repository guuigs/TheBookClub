"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { BookCard } from "./BookCard";
import type { Book } from "@/types";

type SortOption = "recent" | "rating";

interface ProfileBooksFilterProps {
  books: Book[];
  ratingMap: Map<string, number>;
  ratingDatesMap?: Map<string, string>;
}

export function ProfileBooksFilter({ books, ratingMap, ratingDatesMap }: ProfileBooksFilterProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recent");

  const filteredAndSortedBooks = useMemo(() => {
    let result = [...books];

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((book) =>
        book.title.toLowerCase().includes(query)
      );
    }

    // Sort
    if (sortBy === "recent" && ratingDatesMap) {
      result.sort((a, b) => {
        const dateA = ratingDatesMap.get(a.id) ?? "";
        const dateB = ratingDatesMap.get(b.id) ?? "";
        return dateB.localeCompare(dateA);
      });
    } else if (sortBy === "rating") {
      result.sort((a, b) => {
        const ratingA = ratingMap.get(a.id) ?? 0;
        const ratingB = ratingMap.get(b.id) ?? 0;
        return ratingB - ratingA;
      });
    }

    return result;
  }, [books, searchQuery, sortBy, ratingMap, ratingDatesMap]);

  if (books.length === 0) {
    return (
      <p className="text-body text-gray text-center py-10">
        Aucun livre noté pour le moment.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 w-full sm:max-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray" />
          <input
            type="text"
            placeholder="Rechercher un livre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray/10 text-dark placeholder:text-gray border border-gray/20 rounded-lg text-small tracking-tight focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Sort */}
        <div className="flex items-center gap-3">
          <span className="text-small text-gray">Trier par :</span>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy("recent")}
              className={`px-3 py-1.5 text-small font-medium rounded-lg transition-colors ${
                sortBy === "recent"
                  ? "bg-primary text-white"
                  : "bg-gray/10 text-dark hover:bg-gray/20"
              }`}
            >
              Récent
            </button>
            <button
              onClick={() => setSortBy("rating")}
              className={`px-3 py-1.5 text-small font-medium rounded-lg transition-colors ${
                sortBy === "rating"
                  ? "bg-primary text-white"
                  : "bg-gray/10 text-dark hover:bg-gray/20"
              }`}
            >
              Ma note
            </button>
          </div>
        </div>
      </div>

      {filteredAndSortedBooks.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {filteredAndSortedBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              size="md"
              showTitle
              myRating={ratingMap.get(book.id) ?? null}
            />
          ))}
        </div>
      ) : (
        <p className="text-body text-gray text-center py-10">
          Aucun livre ne correspond à votre recherche.
        </p>
      )}
    </div>
  );
}
