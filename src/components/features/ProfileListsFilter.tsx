"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { ListCard } from "./ListCard";
import type { BookList } from "@/types";

type SortOption = "recent" | "popular";

interface ProfileListsFilterProps {
  lists: BookList[];
}

export function ProfileListsFilter({ lists }: ProfileListsFilterProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recent");

  const filteredAndSortedLists = useMemo(() => {
    let result = [...lists];

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((list) =>
        list.title.toLowerCase().includes(query)
      );
    }

    // Sort
    if (sortBy === "recent") {
      result.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    } else if (sortBy === "popular") {
      result.sort((a, b) => b.likesCount - a.likesCount);
    }

    return result;
  }, [lists, searchQuery, sortBy]);

  if (lists.length === 0) {
    return (
      <p className="text-body text-gray text-center py-10">
        Aucune liste créée pour le moment.
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
            placeholder="Rechercher une liste..."
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
              onClick={() => setSortBy("popular")}
              className={`px-3 py-1.5 text-small font-medium rounded-lg transition-colors ${
                sortBy === "popular"
                  ? "bg-primary text-white"
                  : "bg-gray/10 text-dark hover:bg-gray/20"
              }`}
            >
              Populaire
            </button>
          </div>
        </div>
      </div>

      {filteredAndSortedLists.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredAndSortedLists.map((list) => (
            <ListCard key={list.id} list={list} />
          ))}
        </div>
      ) : (
        <p className="text-body text-gray text-center py-10">
          Aucune liste ne correspond à votre recherche.
        </p>
      )}
    </div>
  );
}
