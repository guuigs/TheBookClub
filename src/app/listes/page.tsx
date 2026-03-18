"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { Plus as PlusIcon, Minus, Heart } from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { ListCard } from "@/components/features";
import { Button } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/browser";
import { mapList } from "@/lib/mappers";
import type { BookList } from "@/types";

type SortOption = "popular" | "recent";
type SortDirection = "asc" | "desc";
type ListFilter = "all" | "mine" | "favorites";

const filterLabels: Record<ListFilter, string> = {
  all: "Toutes",
  mine: "Mes listes",
  favorites: "Listes suivies",
};

// Use explicit FK names to avoid "multiple relationships" error
const LIST_SELECT = `
  id, title, description, author_id, created_at, updated_at,
  author:profiles!book_lists_author_id_fkey(id, username, display_name, avatar_url, badge),
  items:book_list_items(book:books(id, title, cover_url, author_id)),
  likes_count:list_likes(count),
  books_count:book_list_items(count)
`;

function ListsContent() {
  const { user } = useAuth();
  const [lists, setLists] = useState<BookList[]>([]);
  const [likedListIds, setLikedListIds] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [activeFilter, setActiveFilter] = useState<ListFilter>("all");

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("book_lists")
      .select(LIST_SELECT)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error("[ListsPage] Fetch error:", error.message);
        } else if (data) {
          setLists(data.map(mapList));
        }
      });
  }, []);

  // Fetch user's liked lists
  useEffect(() => {
    if (!user) {
      setLikedListIds(new Set());
      return;
    }
    const supabase = createClient();
    supabase
      .from("list_likes")
      .select("list_id")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (data) {
          setLikedListIds(new Set(data.map(l => l.list_id)));
        }
      });
  }, [user]);

  const sortedLists = useMemo(() => {
    let filtered = [...lists];

    if (activeFilter === "mine" && user) {
      filtered = filtered.filter((l) => l.author.id === user.id);
    } else if (activeFilter === "favorites" && user) {
      filtered = filtered.filter((l) => likedListIds.has(l.id));
    }

    return filtered.sort((a, b) => {
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
  }, [lists, sortBy, sortDirection, activeFilter, user, likedListIds]);

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

  const listFilters: ListFilter[] = ["all", "mine", "favorites"];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main id="main-content" className="flex-1 w-full max-w-[1500px] mx-auto px-5 py-10 lg:py-[80px]">
        <h1 className="sr-only">Listes de lecture</h1>

        <div className="flex flex-wrap items-center gap-3 mb-10" role="toolbar" aria-label="Filtres et tri des listes">
          {listFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              aria-pressed={activeFilter === filter}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium tracking-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                activeFilter === filter
                  ? "bg-dark text-white"
                  : "bg-gray/10 text-dark hover:bg-gray/20"
              }`}
            >
              {filter === "favorites" && <Heart className="w-3.5 h-3.5" aria-hidden="true" />}
              {filterLabels[filter]}
            </button>
          ))}

          <div className="w-px h-5 bg-gray/30 mx-1" aria-hidden="true" />

          <span className="text-sm font-medium text-gray" aria-hidden="true">Trier :</span>
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSortChange(option.value)}
              aria-pressed={sortBy === option.value}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium tracking-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                sortBy === option.value
                  ? "bg-dark text-white"
                  : "bg-gray/10 text-dark hover:bg-gray/20"
              }`}
            >
              {option.label}
              {sortBy === option.value &&
                (sortDirection === "desc" ? (
                  <PlusIcon className="w-3.5 h-3.5" aria-hidden="true" />
                ) : (
                  <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                ))}
            </button>
          ))}

          <div className="w-px h-5 bg-gray/30 mx-1" aria-hidden="true" />

          <Link href="/listes/create">
            <Button variant="primary" size="sm">
              <PlusIcon className="w-4 h-4 mr-1" aria-hidden="true" />
              Créer une liste
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" aria-live="polite">
          {sortedLists.map((list) => (
            <ListCard key={list.id} list={list} />
          ))}
        </div>

        {sortedLists.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4" role="status" aria-live="polite">
            <p className="text-t3 font-semibold text-dark">Aucune liste trouvée</p>
            {activeFilter === "mine" && (
              <Link href="/listes/create">
                <Button variant="primary" size="sm">
                  <PlusIcon className="w-4 h-4 mr-1" aria-hidden="true" />
                  Créer ma première liste
                </Button>
              </Link>
            )}
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
