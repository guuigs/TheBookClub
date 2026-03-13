"use client";

import { useState, useMemo, use, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { CommentCard } from "@/components/features";
import { createClient } from "@/lib/supabase/browser";
import type { Comment } from "@/types";

type SortOption = "recent" | "rating";
type SortDirection = "asc" | "desc";

interface BookData {
  id: string;
  title: string;
}

export default function BookFriendsCommentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [book, setBook] = useState<BookData | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function fetchData() {
      setLoading(true);

      // Fetch book info
      const { data: bookData } = await supabase
        .from("books")
        .select("id, title")
        .eq("id", id)
        .single();
      setBook(bookData ?? null);

      // Friends comments - secondary page, return empty for now
      setComments([]);
      setLoading(false);
    }

    fetchData();
  }, [id]);

  const sortedComments = useMemo(() => {
    const sorted = [...comments].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "recent":
          comparison = b.createdAt.getTime() - a.createdAt.getTime();
          break;
        case "rating":
          comparison = (b.rating || 0) - (a.rating || 0);
          break;
      }
      return sortDirection === "desc" ? comparison : -comparison;
    });
    return sorted;
  }, [comments, sortBy, sortDirection]);

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
    { value: "recent", label: "Récent" },
    { value: "rating", label: "Note" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 w-full max-w-[800px] mx-auto px-5 py-10 lg:py-[80px]">
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
              Commentaires de mes amis
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

        {/* Comments List */}
        {sortedComments.length > 0 ? (
          <div className="flex flex-col gap-6">
            {sortedComments.map((comment) => (
              <CommentCard key={comment.id} comment={comment} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <p className="text-t3 font-semibold text-dark">
              Aucun commentaire
            </p>
            <p className="text-body text-gray">
              Vos amis n&apos;ont pas encore commenté ce livre
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
