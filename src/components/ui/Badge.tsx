"use client";

import Image from "next/image";
import { BADGE_CONFIG } from "@/lib/constants/badges";
import type { MemberBadge } from "@/types";

export interface BadgeProps {
  type: MemberBadge;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeConfig = {
  sm: 20,
  md: 28,
  lg: 40,
};

export function Badge({
  type,
  showLabel = false,
  size = "sm",
  className = "",
}: BadgeProps) {
  const config = BADGE_CONFIG[type];
  const iconSize = sizeConfig[size];

  return (
    <div
      className={`inline-flex items-center gap-2 ${className}`}
      title={config.description}
    >
      <Image
        src={config.icon}
        alt={config.label}
        width={iconSize}
        height={iconSize}
        className="shrink-0"
      />
      {showLabel && (
        <span className="text-small font-medium text-dark">
          {config.label}
        </span>
      )}
    </div>
  );
}
