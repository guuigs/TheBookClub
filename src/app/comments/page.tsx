"use client";

import { useState, useMemo, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { HomeCommentCard } from "@/components/features";
import { createClient } from "@/lib/supabase/browser";
import { mapCommentWithBook } from "@/lib/mappers";
import type { Comment, Book } from "@/types";

type SortOption = "popular" | "recent";
type SortDirection = "asc" | "desc";

export default function CommentsPage() {
  const [items, setItems] = useState<{ comment: Comment; book: Book }[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("comments")
      .select(
        `*, user:profiles(id, username, display_name, avatar_url, badge),
         book:books(id, title, cover_url),
         likes_count:comment_likes(count)`
      )
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setItems(data.map(mapCommentWithBook));
      });
  }, []);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "popular":
          comparison = b.comment.likesCount - a.comment.likesCount;
          break;
        case "recent":
          comparison = b.comment.createdAt.getTime() - a.comment.createdAt.getTime();
          break;
      }
      return sortDirection === "desc" ? comparison : -comparison;
    });
  }, [items, sortBy, sortDirection]);

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
    { value: "recent", label: "Recent" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 w-full max-w-[1500px] mx-auto px-5 py-10 lg:py-[80px]">
        <h1 className="font-display text-t1 text-dark tracking-tight mb-[60px]">
          Commentaires populaires
        </h1>

        <div className="flex flex-wrap items-center gap-3 mb-10">
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
              {sortBy === option.value &&
                (sortDirection === "desc" ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronUp className="w-3.5 h-3.5" />
                ))}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {sortedItems.map(({ comment, book }) => (
            <HomeCommentCard key={comment.id} comment={comment} book={book} />
          ))}
        </div>

        {sortedItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <p className="text-t3 font-semibold text-dark">Aucun commentaire trouve</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
