"use client";

import { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui";
import { ListCard } from "@/components/features";
import { bookLists, currentUser } from "@/lib/data";

type SortOption = "popular" | "recent";
type SortDirection = "asc" | "desc";

function ListsContent() {
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const sortedLists = useMemo(() => {
    const sorted = [...bookLists].sort((a, b) => {
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
  }, [sortBy, sortDirection]);

  const handleSortChange = (newSort: SortOption) => {
    if (newSort === sortBy) {
      setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"));
    } else {
      setSortBy(newSort);
      setSortDirection("desc");
    }
  };

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "popular", label: "Populaire" },
    { value: "recent", label: "Récent" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header user={currentUser} />

      <main className="flex-1 w-full max-w-[1500px] mx-auto px-5 py-10 lg:py-[80px]">
        {/* Header with create button and filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-center gap-5 mb-10">
          <div className="flex flex-wrap items-center justify-center gap-3">
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

          <Link href="/lists/create">
            <Button variant="primary">
              <Plus className="w-5 h-5 mr-2" />
              Cr&eacute;er une liste
            </Button>
          </Link>
        </div>

        {/* Lists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedLists.map((list) => (
            <ListCard key={list.id} list={list} />
          ))}
        </div>

        {sortedLists.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <p className="text-t3 font-semibold text-dark">
              Aucune liste trouv&eacute;e
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function ListsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col bg-white">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-body text-gray">Chargement...</p>
        </div>
      </div>
    }>
      <ListsContent />
    </Suspense>
  );
}
