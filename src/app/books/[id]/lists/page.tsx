"use client";

import { useState, useMemo, use } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { ListCard } from "@/components/features";
import { getBookById, getListsContainingBook, currentUser } from "@/lib/data";

type SortOption = "popular" | "recent";
type SortDirection = "asc" | "desc";

export default function BookListsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const book = getBookById(id);
  const relatedLists = getListsContainingBook(id);

  const sortedLists = useMemo(() => {
    const sorted = [...relatedLists].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "popular":
          comparison = b.likesCount - a.likesCount;
          break;
        case "recent":
          comparison = b.updatedAt.getTime() - a.updatedAt.getTime();
          break;
      }
      return sortDirection === "desc" ? comparison : -comparison;
    });
    return sorted;
  }, [relatedLists, sortBy, sortDirection]);

  const handleSortChange = (newSort: SortOption) => {
    if (newSort === sortBy) {
      setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"));
    } else {
      setSortBy(newSort);
      setSortDirection("desc");
    }
  };

  if (!book) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header user={currentUser} />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-t3 text-dark">Livre non trouv&eacute;</p>
        </main>
        <Footer />
      </div>
    );
  }

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "popular", label: "Populaire" },
    { value: "recent", label: "R&eacute;cent" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header user={currentUser} />

      <main className="flex-1 w-full max-w-[1200px] mx-auto px-5 py-10 lg:py-[80px]">
        {/* Back link */}
        <Link
          href={`/books/${id}`}
          className="inline-flex items-center gap-2 text-body font-medium text-gray hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour au livre
        </Link>

        {/* Header */}
        <div className="flex flex-col gap-6 mb-10">
          <div className="flex flex-col gap-2">
            <h1 className="text-t2 font-semibold text-dark">
              Listes associ&eacute;es
            </h1>
            <p className="text-body text-gray font-display">
              {book.title}
            </p>
          </div>

          {/* Sort Options */}
          <div className="flex flex-wrap items-center gap-3">
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
                <span dangerouslySetInnerHTML={{ __html: option.label }} />
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
        </div>

        {/* Lists Grid */}
        {sortedLists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedLists.map((list) => (
              <ListCard key={list.id} list={list} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <p className="text-t3 font-semibold text-dark">
              Aucune liste
            </p>
            <p className="text-body text-gray">
              Ce livre n&apos;apparait dans aucune liste
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
