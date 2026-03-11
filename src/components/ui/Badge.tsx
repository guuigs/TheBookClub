"use client";

import Image from "next/image";
import type { MemberBadge } from "@/types";

export interface BadgeProps {
  type: MemberBadge;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const badgeConfig: Record<
  MemberBadge,
  {
    icon: string;
    label: string;
    description: string;
  }
> = {
  member: {
    icon: "/images/badges/member.svg",
    label: "membre du club",
    description:
      "Adhérent gratuit au Book Club. Ce membre lit, note, consulte les avis du club.",
  },
  honorary: {
    icon: "/images/badges/honorary.svg",
    label: "membre honoraire",
    description:
      "Membre connu pour sa participation au Book Club, rajout de livres encore inconnus, notation, critique.",
  },
  benefactor: {
    icon: "/images/badges/benefactor.svg",
    label: "membre bienfaiteur",
    description:
      "Le bienfaiteur est reconnu pour avoir aidé financièrement le Book Club.",
  },
  honor: {
    icon: "/images/badges/honor.svg",
    label: "membre d'honneur",
    description:
      "La direction décide d'honorer particulièrement une personne selon son implication, son aide financière particulièrement élevée, son travail de promotion du club, etc.",
  },
};

const sizeConfig = {
  sm: 16,
  md: 20,
  lg: 32,
};

export function Badge({
  type,
  showLabel = false,
  size = "sm",
  className = "",
}: BadgeProps) {
  const config = badgeConfig[type];
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
