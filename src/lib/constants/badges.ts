/**
 * Centralized badge configuration
 * Single source of truth for badge labels, icons, and descriptions
 */

import type { MemberBadge } from "@/types";

export interface BadgeConfig {
  icon: string;
  label: string;
  description: string;
}

export const BADGE_CONFIG: Record<MemberBadge, BadgeConfig> = {
  member: {
    icon: "/images/badges/member.svg",
    label: "Membre du club",
    description:
      "Adherent gratuit au Book Club. Ce membre lit, note, consulte les avis du club.",
  },
  honorary: {
    icon: "/images/badges/honorary.svg",
    label: "Membre honoraire",
    description:
      "Membre connu pour sa participation au Book Club, rajout de livres encore inconnus, notation, critique.",
  },
  benefactor: {
    icon: "/images/badges/benefactor.svg",
    label: "Membre bienfaiteur",
    description:
      "Le bienfaiteur est reconnu pour avoir aide financierement The Book Club.",
  },
  honor: {
    icon: "/images/badges/honor.svg",
    label: "Membre d'honneur",
    description:
      "La direction decide d'honorer particulierement une personne selon son implication, son aide financiere particulierement elevee, son travail de promotion du club, etc.",
  },
};

/**
 * Get badge label for a given badge type
 */
export function getBadgeLabel(badge: MemberBadge): string {
  return BADGE_CONFIG[badge]?.label ?? "Membre";
}

/**
 * Get badge icon path for a given badge type
 */
export function getBadgeIcon(badge: MemberBadge): string {
  return BADGE_CONFIG[badge]?.icon ?? "/images/badges/member.svg";
}

/**
 * Get badge description for a given badge type
 */
export function getBadgeDescription(badge: MemberBadge): string {
  return BADGE_CONFIG[badge]?.description ?? "";
}
