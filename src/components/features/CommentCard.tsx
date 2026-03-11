"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Avatar, RatingStars, Badge, Button } from "@/components/ui";
import type { Comment } from "@/types";

export interface CommentCardProps {
  comment: Comment;
  showBookInfo?: boolean;
  truncate?: boolean;
  maxLines?: number;
  className?: string;
}

export function CommentCard({
  comment,
  showBookInfo = false,
  truncate = true,
  maxLines = 3,
  className = "",
}: CommentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(comment.isLikedByCurrentUser ?? false);
  const [likesCount, setLikesCount] = useState(comment.likesCount);

  const formattedDate = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(comment.createdAt);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
    // TODO: API call to toggle like
  };

  // Calculate if text needs truncation (300 chars)
  const shouldTruncate = truncate && comment.content.length > 300;

  return (
    <div className={`flex gap-4 w-full ${className}`}>
      {/* Avatar */}
      <Link href={`/members/${comment.user.id}`} className="shrink-0">
        <Avatar
          src={comment.user.avatarUrl}
          alt={comment.user.username}
          size="sm"
        />
      </Link>

      {/* Content */}
      <div className="flex flex-col gap-3 flex-1 min-w-0">
        {/* Header: Username, Badge, Rating, Date */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center">
            <Link
              href={`/members/${comment.user.id}`}
              className="text-body font-medium text-dark tracking-tight hover:text-primary transition-colors"
            >
              {comment.user.username}
            </Link>
            <Badge type={comment.user.badge} size="sm" className="ml-1" />
          </div>

          {comment.rating && (
            <RatingStars rating={comment.rating} size="sm" />
          )}

          <span className="text-small text-gray tracking-tight">
            noté le {formattedDate}
          </span>
        </div>

        {/* Comment Text */}
        <div>
          <p
            className={`text-body font-medium text-dark tracking-tight leading-relaxed ${
              shouldTruncate && !isExpanded ? `line-clamp-${maxLines}` : ""
            }`}
            style={
              shouldTruncate && !isExpanded
                ? {
                    display: "-webkit-box",
                    WebkitLineClamp: maxLines,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }
                : undefined
            }
          >
            {comment.content}
          </p>

          {shouldTruncate && (
            <Button
              variant="discrete"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2"
            >
              {isExpanded ? "voir moins" : "voir plus"}
            </Button>
          )}
        </div>

        {/* Likes */}
        <button
          type="button"
          onClick={handleLike}
          className="flex items-center gap-1 group w-fit"
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              isLiked
                ? "fill-primary text-primary"
                : "text-dark group-hover:text-primary"
            }`}
          />
          <span className="text-body font-medium text-dark tracking-tight group-hover:text-primary transition-colors">
            {likesCount} like{likesCount > 1 ? "s" : ""}
          </span>
        </button>
      </div>
    </div>
  );
}
