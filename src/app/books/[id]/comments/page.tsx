"use client";

import { useState, useMemo, useEffect, use } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { CommentCard } from "@/components/features";
import { createClient } from "@/lib/supabase/browser";
import type { Book, Comment, MemberBadge } from "@/types";

type SortOption = "recent" | "likes";
type SortDirection = "asc" | "desc";

export default function BookCommentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [book, setBook] = useState<Book | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  useEffect(() => {
    const supabase = createClient();

    supabase
      .from("books_with_stats")
      .select("id, title")
      .eq("id", id)
      .single()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then(({ data }) => {
        if (data) {
          setBook({
            id: data.id,
            title: data.title,
            author: { id: "", name: "", booksCount: 0 },
            coverUrl: "",
            description: "",
            publishedYear: 0,
            genre: "",
            averageRating: 0,
            totalVotes: 0,
            ratingDistribution: [],
          });
        }
      });

    supabase
      .from("comments")
      .select(
        `*, user:profiles(id, username, display_name, avatar_url, badge),
         likes_count:comment_likes(count)`
      )
      .eq("book_id", id)
      .order("created_at", { ascending: false })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then(({ data }) => {
        if (data) {
          setComments(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data.map((row: any) => ({
              id: row.id,
              user: {
                id: row.user?.id ?? "",
                username: row.user?.username ?? "",
                displayName: row.user?.display_name ?? "",
                avatarUrl: row.user?.avatar_url ?? undefined,
                badge: (row.user?.badge as MemberBadge) ?? "member",
                booksRead: 0,
                listsCount: 0,
                followersCount: 0,
                followingCount: 0,
              },
              bookId: row.book_id,
              content: row.content,
              createdAt: new Date(row.created_at),
              likesCount: Number(row.likes_count?.[0]?.count ?? 0),
            }))
          );
        }
      });
  }, [id]);

  const sortedComments = useMemo(() => {
    return [...comments].sort((a, b) => {
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
  }, [comments, sortBy, sortDirection]);

  const handleSortChange = (newSort: SortOption) => {
    if (newSort === sortBy) {
      setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"));
    } else {
      setSortBy(newSort);
      setSortDirection("desc");
    }
  };

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "recent", label: "Récent" },
    { value: "likes", label: "Likes" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 w-full max-w-[800px] mx-auto px-5 py-10 lg:py-[80px]">
        <Link
          href={`/books/${id}`}
          className="inline-flex items-center gap-2 text-body font-medium text-gray hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour au livre
        </Link>

        <div className="flex flex-col gap-6 mb-10">
          <div className="flex flex-col gap-2">
            <h1 className="text-t2 font-semibold text-dark">Commentaires</h1>
            {book && (
              <p className="text-body text-gray font-display">{book.title}</p>
            )}
          </div>

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
                {sortBy === option.value &&
                  (sortDirection === "desc" ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronUp className="w-4 h-4" />
                  ))}
              </button>
            ))}
          </div>
        </div>

        {sortedComments.length > 0 ? (
          <div className="flex flex-col gap-6">
            {sortedComments.map((comment) => (
              <CommentCard key={comment.id} comment={comment} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <p className="text-t3 font-semibold text-dark">Aucun commentaire</p>
            <p className="text-body text-gray">Soyez le premier à donner votre avis !</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
