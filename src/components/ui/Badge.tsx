"use client";

import { Award, Heart, Crown, User } from "lucide-react";
import type { MemberBadge } from "@/types";

export interface BadgeProps {
  type: MemberBadge;
  showLabel?: boolean;
  size?: "sm" | "md";
  className?: string;
}

const badgeConfig: Record<
  MemberBadge,
  {
    icon: React.ElementType;
    label: string;
    description: string;
  }
> = {
  member: {
    icon: User,
    label: "membre du club",
    description:
      "Adhérent gratuit au Book Club. Ce membre lit, note, consulte les avis du club.",
  },
  honorary: {
    icon: Award,
    label: "membre honoraire",
    description:
      "Membre connu pour sa participation au Book Club, rajout de livres encore inconnus, notation, critique.",
  },
  benefactor: {
    icon: Heart,
    label: "membre bienfaiteur",
    description:
      "Le bienfaiteur est reconnu pour avoir aidé financièrement le Book Club.",
  },
  honor: {
    icon: Crown,
    label: "membre d'honneur",
    description:
      "La direction décide d'honorer particulièrement une personne selon son implication, son aide financière particulièrement élevée, son travail de promotion du club, etc.",
  },
};

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
};

export function Badge({
  type,
  showLabel = false,
  size = "sm",
  className = "",
}: BadgeProps) {
  const config = badgeConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-1 ${className}`}
      title={config.description}
    >
      <Icon className={`${sizeClasses[size]} text-primary`} />
      {showLabel && (
        <span className="text-small font-medium text-dark">
          {config.label}
        </span>
      )}
    </div>
  );
}
