"use client";

import Link from "next/link";
import { Avatar, RatingStars } from "@/components/ui";
import type { User } from "@/types";

export interface FriendActivityCardProps {
  user: User;
  rating?: number;
  className?: string;
}

export function FriendActivityCard({
  user,
  rating,
  className = "",
}: FriendActivityCardProps) {
  return (
    <Link
      href={`/members/${user.id}`}
      className={`flex flex-col items-center gap-3 w-[140px] group ${className}`}
    >
      {/* Avatar */}
      <Avatar
        src={user.avatarUrl}
        alt={user.username}
        size="lg"
        badge={user.badge}
      />

      {/* Username */}
      <p className="font-display text-[20px] text-dark text-center tracking-tight group-hover:text-primary transition-colors">
        {user.displayName || user.username}
      </p>

      {/* Rating if provided */}
      {rating !== undefined && (
        <RatingStars rating={rating} size="sm" className="justify-center" />
      )}
    </Link>
  );
}
