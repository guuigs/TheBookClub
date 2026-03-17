"use client";

import { useState, useMemo } from "react";
import { CommentCard } from "./CommentCard";
import type { Comment } from "@/types";

type SortOption = "recent" | "popular";

interface ProfileCommentsFilterProps {
  comments: Comment[];
}

export function ProfileCommentsFilter({ comments }: ProfileCommentsFilterProps) {
  const [sortBy, setSortBy] = useState<SortOption>("recent");

  const sortedComments = useMemo(() => {
    const sorted = [...comments];
    if (sortBy === "recent") {
      sorted.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } else if (sortBy === "popular") {
      sorted.sort((a, b) => b.likesCount - a.likesCount);
    }
    return sorted;
  }, [comments, sortBy]);

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

      <div className="flex flex-col gap-5">
        {sortedComments.map((comment) => (
          <CommentCard key={comment.id} comment={comment} showBookInfo />
        ))}
      </div>
    </div>
  );
}
