"use client";

import Link from "next/link";
import { Avatar, RatingStars, Badge } from "@/components/ui";
import type { User } from "@/types";

export interface ProfileCardWithRatingProps {
  user: User;
  rating: number;
  className?: string;
}

/**
 * ProfileCardWithRating: MemberCard variant with a rating displayed below.
 * Used for "Notes de mes amis" section on book pages.
 */
export function ProfileCardWithRating({
  user,
  rating,
  className = "",
}: ProfileCardWithRatingProps) {
  return (
    <Link
      href={`/account/${user.id}`}
      className={`group flex flex-col items-center gap-3 w-[140px] ${className}`}
    >
      {/* Avatar with badge */}
      <div className="relative">
        <Avatar
          src={user.avatarUrl}
          alt={user.displayName || user.username}
          size="lg"
        />
        <div className="absolute -top-1 -right-1">
          <Badge type={user.badge} size="sm" />
        </div>
      </div>

      {/* Username */}
      <p className="font-display text-[18px] text-dark text-center tracking-tight group-hover:text-primary transition-colors line-clamp-1">
        {user.displayName || user.username}
      </p>

      {/* Rating */}
      <div className="flex flex-col items-center gap-1">
        <RatingStars rating={rating} size="sm" />
        <span className="text-small font-medium text-dark">{rating}/10</span>
      </div>
    </Link>
  );
}
