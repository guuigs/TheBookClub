"use client";

import Link from "next/link";
import { Avatar, Badge } from "@/components/ui";
import type { User } from "@/types";

export interface MemberCardProps {
  user: User;
  className?: string;
}

export function MemberCard({ user, className = "" }: MemberCardProps) {
  const badgeLabels = {
    member: "membre du club",
    honorary: "membre honoraire",
    benefactor: "membre bienfaiteur",
    honor: "membre d'honneur",
  };

  return (
    <Link
      href={`/profile/${user.id}`}
      className={`group flex flex-col items-center gap-5 w-[260px] ${className}`}
    >
      {/* Avatar */}
      <div className="relative w-[180px] h-[180px]">
        <Avatar
          src={user.avatarUrl}
          alt={user.displayName}
          size="xl"
          className="w-full h-full"
        />
      </div>

      {/* Info */}
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex flex-col items-center gap-2">
          <h3 className="font-display text-t2 text-dark tracking-tight group-hover:text-primary transition-colors">
            {user.displayName}
          </h3>
          <p className="text-t4 font-medium text-dark tracking-tight">
            {badgeLabels[user.badge]}
          </p>
        </div>
        <p className="text-body font-medium text-gray tracking-tight">
          Suivi par {user.followersCount} membres du Club
        </p>
      </div>
    </Link>
  );
}
