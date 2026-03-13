"use client";

import { useState, useMemo, use, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { ListCard } from "@/components/features";
import { createClient } from "@/lib/supabase/browser";
import type { BookList } from "@/types";

type SortOption = "popular" | "recent";
type SortDirection = "asc" | "desc";

interface BookData {
  id: string;
  title: string;
}

interface ListData {
  id: string;
  title: string;
  likesCount: number;
  updatedAt: Date;
  [key: string]: unknown;
}

export default function BookListsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [book, setBook] = useState<BookData | null>(null);
  const [relatedLists, setRelatedLists] = useState<ListData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function fetchData() {
      setLoading(true);
      // Fetch book
      const { data: bookData } = await supabase
        .from("books")
        .select("id, title")
        .eq("id", id)
        .single();
      setBook(bookData ?? null);

      // Fetch lists containing this book
      const { data: listsData } = await supabase
        .from("list_books")
        .select("list:lists(id, title, likes_count, updated_at)")
        .eq("book_id", id);

      if (listsData) {
        const mapped: ListData[] = listsData
          .map((row: { list: unknown }) => {
            const l = row.list as Record<string, unknown> | null;
            if (!l) return null;
            return {
              ...l,
              id: l.id as string,
              title: l.title as string,
              likesCount: (l.likes_count as number) ?? 0,
              updatedAt: new Date((l.updated_at as string) ?? Date.now()),
            };
          })
          .filter((x): x is ListData => x !== null);
        setRelatedLists(mapped);
      }

      setLoading(false);
    }

    fetchData();
  }, [id]);

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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-body text-gray">Chargement...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-t3 text-dark">Livre non trouvé</p>
        </main>
        <Footer />
      </div>
    );
  }

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "popular", label: "Populaire" },
    { value: "recent", label: "Récent" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

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
              Listes associées
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
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium tracking-tight transition-colors ${
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
        </div>

        {/* Lists Grid */}
        {sortedLists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedLists.map((list) => (
              <ListCard key={list.id} list={list as unknown as BookList} />
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
