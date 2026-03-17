"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface ProfileTabsProps {
  profileId: string;
}

export function ProfileTabs({ profileId }: ProfileTabsProps) {
  const pathname = usePathname();

  const tabs = [
    { label: "Profil", href: `/account/${profileId}`, exact: true },
    { label: "Livres", href: `/account/${profileId}/livres`, exact: false },
    { label: "Critiques", href: `/account/${profileId}/critiques`, exact: false },
    { label: "Listes", href: `/account/${profileId}/listes`, exact: false },
  ];

  const isActive = (tab: typeof tabs[0]) => {
    if (tab.exact) {
      return pathname === tab.href;
    }
    return pathname.startsWith(tab.href);
  };

  return (
    <nav className="flex gap-6 md:gap-10 mb-[80px] border-b border-gray/20 overflow-x-auto">
      {tabs.map((tab) => {
        const active = isActive(tab);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`
              relative text-t4 font-semibold pb-4 whitespace-nowrap transition-colors
              ${active
                ? "text-primary"
                : "text-dark hover:text-primary"}
            `}
          >
            {tab.label}
            {active && (
              <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-t-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
