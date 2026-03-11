"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { BookCard } from "@/components/features";
import { books, currentUser } from "@/lib/data";

type SortOption = "popular" | "rating" | "recent";
type SortDirection = "asc" | "desc";

function BooksContent() {
  const searchParams = useSearchParams();
  const initialSort = (searchParams.get("sort") as SortOption) || "popular";

  const [sortBy, setSortBy] = useState<SortOption>(initialSort);
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const sortedBooks = useMemo(() => {
    const sorted = [...books].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "popular":
          comparison = b.totalVotes - a.totalVotes;
          break;
        case "rating":
          comparison = b.averageRating - a.averageRating;
          break;
        case "recent":
          comparison = b.publishedYear - a.publishedYear;
          break;
      }
      return sortDirection === "desc" ? comparison : -comparison;
    });
    return sorted;
  }, [sortBy, sortDirection]);

  const toggleDirection = () => {
    setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"));
  };

  const handleSortChange = (newSort: SortOption) => {
    if (newSort === sortBy) {
      toggleDirection();
    } else {
      setSortBy(newSort);
      setSortDirection("desc");
    }
  };

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "popular", label: "Popularité" },
    { value: "rating", label: "Note" },
    { value: "recent", label: "Année" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header user={currentUser} />

      <main className="flex-1 w-full max-w-[1500px] mx-auto px-5 py-10 lg:py-[80px]">
        {/* Sort Options */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          <span className="text-body font-medium text-gray">Trier par :</span>
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSortChange(option.value)}
              className={`flex items-center gap-1 px-4 py-2 rounded-lg text-body font-medium tracking-tight transition-colors ${
                sortBy === option.value
                  ? "bg-dark text-white"
                  : "bg-gray/10 text-dark hover:bg-gray/20"
              }`}
            >
              {option.label}
              {sortBy === option.value && (
                sortDirection === "desc" ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronUp className="w-4 h-4" />
                )
              )}
            </button>
          ))}
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {sortedBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              size="md"
              showTitle
              showAuthor
            />
          ))}
        </div>

        {sortedBooks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <p className="text-t3 font-semibold text-dark">
              Aucun livre trouvé
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function BooksPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col bg-white">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-body text-gray">Chargement...</p>
        </div>
      </div>
    }>
      <BooksContent />
    </Suspense>
  );
}
