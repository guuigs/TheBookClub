"use client";

import { useState, useMemo } from "react";
import { Plus, Minus } from "lucide-react";
import { HomeCommentCard } from "./HomeCommentCard";
import type { Comment, Book } from "@/types";

type SortOption = "recent" | "popular";
type SortDirection = "asc" | "desc";

interface ProfileCommentsWithBooksProps {
  comments: { comment: Comment; book: Book }[];
}

export function ProfileCommentsWithBooks({ comments }: ProfileCommentsWithBooksProps) {
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const sortedComments = useMemo(() => {
    const sorted = [...comments];
    sorted.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "recent") {
        comparison = b.comment.createdAt.getTime() - a.comment.createdAt.getTime();
      } else if (sortBy === "popular") {
        comparison = b.comment.likesCount - a.comment.likesCount;
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

  if (comments.length === 0) {
    return (
      <p className="text-body text-gray text-center py-10">
        Aucune critique pour le moment.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <span className="text-small text-gray">Trier par :</span>
        <div className="flex gap-2">
          <button
            onClick={() => handleSortChange("recent")}
            className={`flex items-center gap-1 px-3 py-1.5 text-small font-medium rounded-lg transition-colors ${
              sortBy === "recent"
                ? "bg-dark text-white"
                : "bg-gray/10 text-dark hover:bg-gray/20"
            }`}
          >
            Recent
            {sortBy === "recent" &&
              (sortDirection === "desc" ? (
                <Plus className="w-3.5 h-3.5" />
              ) : (
                <Minus className="w-3.5 h-3.5" />
              ))}
          </button>
          <button
            onClick={() => handleSortChange("popular")}
            className={`flex items-center gap-1 px-3 py-1.5 text-small font-medium rounded-lg transition-colors ${
              sortBy === "popular"
                ? "bg-dark text-white"
                : "bg-gray/10 text-dark hover:bg-gray/20"
            }`}
          >
            Populaire
            {sortBy === "popular" &&
              (sortDirection === "desc" ? (
                <Plus className="w-3.5 h-3.5" />
              ) : (
                <Minus className="w-3.5 h-3.5" />
              ))}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {sortedComments.map(({ comment, book }) => (
          <HomeCommentCard key={comment.id} comment={comment} book={book} />
        ))}
      </div>
    </div>
  );
}
