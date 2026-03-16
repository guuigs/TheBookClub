"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui";
import type { User } from "@/types";

export interface MemberCardProps {
  user: User;
  onFollow?: () => void;
  showFollowButton?: boolean;
  className?: string;
}

const badgeLabels = {
  member: "membre du club",
  honorary: "membre honoraire",
  benefactor: "membre bienfaiteur",
  honor: "membre d'honneur",
};

const badgeIcons: Record<string, string> = {
  member: "/images/badges/member.svg",
  honorary: "/images/badges/honorary.svg",
  benefactor: "/images/badges/benefactor.svg",
  honor: "/images/badges/honor.svg",
};

export function MemberCard({ user, onFollow, showFollowButton = false, className = "" }: MemberCardProps) {
  return (
    <div className={`group flex flex-col items-center gap-3 w-[160px] ${className}`}>
      <Link href={`/profile/${user.id}`} className="flex flex-col items-center gap-3 w-full">
        {/* Avatar with badge top-right */}
        <div className="relative w-[110px] h-[110px]">
          <div className="relative w-full h-full rounded-full overflow-hidden bg-cream">
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={user.displayName}
                fill
                className="object-cover object-center"
                sizes="110px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-gray text-xl font-medium">
                  {user.displayName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          {/* Badge: top-right, slightly offset, z-10 */}
          <div className="absolute -top-1 -right-1 z-10">
            <Image
              src={badgeIcons[user.badge]}
              alt={badgeLabels[user.badge]}
              width={24}
              height={24}
            />
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col items-center gap-1 text-center">
          <h3 className="font-display text-[16px] text-dark tracking-tight group-hover:text-primary transition-colors line-clamp-1">
            {user.displayName}
          </h3>
          <p className="text-[11px] font-medium text-gray tracking-tight">
            {user.followersCount} abonnés
          </p>
        </div>
      </Link>

      {showFollowButton && (
        <Button
          variant="primary"
          size="xs"
          onClick={onFollow}
          aria-label={`Suivre ${user.displayName}`}
        >
          Suivre
        </Button>
      )}
    </div>
  );
}
