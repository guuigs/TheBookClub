"use client";

import Image from "next/image";
import type { MemberBadge } from "@/types";

export interface AvatarProps {
  src?: string;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  badge?: MemberBadge;
  className?: string;
}

const sizeClasses = {
  sm: "w-7 h-7",
  md: "w-8 h-8",
  lg: "w-20 h-20",
  xl: "w-24 h-24",
};

const badgeIcons: Record<MemberBadge, string> = {
  member: "👤",
  honorary: "⭐",
  benefactor: "💎",
  honor: "👑",
};

export function Avatar({
  src,
  alt,
  size = "md",
  badge,
  className = "",
}: AvatarProps) {
  const sizeClass = sizeClasses[size];

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        className={`${sizeClass} rounded-full overflow-hidden bg-cream flex items-center justify-center`}
      >
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
            sizes={size === "xl" ? "96px" : size === "lg" ? "80px" : "32px"}
          />
        ) : (
          <span className="text-gray text-sm font-medium">
            {alt.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      {badge && (
        <span
          className="absolute -bottom-0.5 -right-0.5 text-xs"
          title={getBadgeLabel(badge)}
        >
          {badgeIcons[badge]}
        </span>
      )}
    </div>
  );
}

function getBadgeLabel(badge: MemberBadge): string {
  const labels: Record<MemberBadge, string> = {
    member: "Membre du club",
    honorary: "Membre honoraire",
    benefactor: "Membre bienfaiteur",
    honor: "Membre d'honneur",
  };
  return labels[badge];
}
