"use client";

import Image from "next/image";
import { getBadgeIcon, getBadgeLabel } from "@/lib/constants/badges";
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
        className={`${sizeClass} relative rounded-full overflow-hidden bg-cream flex items-center justify-center`}
      >
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover object-center"
            sizes={size === "xl" ? "150px" : size === "lg" ? "80px" : "32px"}
            quality={95}
            priority={size === "xl" || size === "lg"}
          />
        ) : (
          <span className="text-gray text-sm font-medium">
            {alt.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      {badge && (
        <div
          className="absolute -bottom-0.5 -right-0.5"
          title={getBadgeLabel(badge)}
        >
          <Image
            src={getBadgeIcon(badge)}
            alt={getBadgeLabel(badge)}
            width={16}
            height={16}
          />
        </div>
      )}
    </div>
  );
}
