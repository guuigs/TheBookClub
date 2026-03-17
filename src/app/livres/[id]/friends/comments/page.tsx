"use client";

import { useState, useMemo, use, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { CommentCard } from "@/components/features";
import { createClient } from "@/lib/supabase/browser";
import { mapComment } from "@/lib/mappers";
import type { Comment } from "@/types";

type SortOption = "recent" | "likes";
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

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Get friends (users this user follows)
      const { data: followingData } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", user.id);

      if (!followingData || followingData.length === 0) {
        setLoading(false);
        return;
      }

      const friendIds = followingData.map(f => f.following_id);

      // Get friends' comments for this book
      const { data: commentsData } = await supabase
        .from("comments")
        .select(`*, user:profiles(id, username, display_name, avatar_url, badge), likes_count:comment_likes(count)`)
        .eq("book_id", id)
        .in("user_id", friendIds)
        .order("created_at", { ascending: false });

      if (commentsData) {
        setComments(commentsData.map(mapComment));
      }

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
        case "likes":
          comparison = b.likesCount - a.likesCount;
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
          <p className="text-t3 text-dark">Livre non trouve</p>
        </main>
        <Footer />
      </div>
    );
  }

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "recent", label: "Recent" },
    { value: "likes", label: "Populaire" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 w-full max-w-[800px] mx-auto px-5 py-10 lg:py-[80px]">
        {/* Back link */}
        <Link
          href={`/livres/${id}`}
          className="inline-flex items-center gap-2 text-body font-medium text-gray hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour au livre
        </Link>

        {/* Header */}
        <div className="flex flex-col gap-6 mb-10">
          <div className="flex flex-col gap-2">
            <h1 className="text-t2 font-semibold text-dark">
              Critiques de mes amis
            </h1>
            <p className="text-body text-gray font-display">
              {book.title}
            </p>
          </div>

          {/* Sort Options */}
          {comments.length > 0 && (
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
          )}
        </div>

        {/* Comments List */}
        {sortedComments.length > 0 ? (
          <div className="flex flex-col gap-6">
            {sortedComments.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                onDeleted={() => setComments(comments.filter(c => c.id !== comment.id))}
                onUpdated={(newContent) => setComments(comments.map(c => c.id === comment.id ? { ...c, content: newContent } : c))}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <p className="text-t3 font-semibold text-dark">
              Aucune critique
            </p>
            <p className="text-body text-gray">
              Vos amis n&apos;ont pas encore commente ce livre
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
