"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Plus, Minus, Users } from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { MemberCard } from "@/components/features";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/browser";
import type { User, MemberBadge } from "@/types";

type SortOption = "popular" | "alpha";
type SortDirection = "asc" | "desc";
type BadgeFilter = "all" | MemberBadge;
type FollowFilter = "all" | "following";

const badgeFilterLabels: Record<BadgeFilter, string> = {
  all: "Tous",
  honor: "Membre d'honneur",
  honorary: "Membre honoraire",
  benefactor: "Membre bienfaiteur",
  member: "Membre du club",
};

function mapProfile(p: Record<string, unknown>): User {
  return {
    id: p.id as string,
    username: p.username as string,
    displayName: p.display_name as string,
    avatarUrl: (p.avatar_url as string) ?? undefined,
    badge: (p.badge as MemberBadge) ?? "member",
    booksRead: Number(p.books_rated ?? 0),
    listsCount: Number(p.lists_count ?? 0),
    followersCount: Number(p.followers_count ?? 0),
    followingCount: Number(p.following_count ?? 0),
    joinDate: p.created_at
      ? new Date(p.created_at as string).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : undefined,
  };
}

export default function MembersPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState<User[]>([]);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [badgeFilter, setBadgeFilter] = useState<BadgeFilter>("all");
  const [followFilter, setFollowFilter] = useState<FollowFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("profiles_with_stats")
      .select("*")
      .then(({ data }) => {
        if (data) setMembers(data.map(mapProfile));
      });
  }, []);

  // Fetch users I'm following
  useEffect(() => {
    if (!user) {
      setFollowingIds(new Set());
      return;
    }
    const supabase = createClient();
    supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", user.id)
      .then(({ data }) => {
        if (data) {
          setFollowingIds(new Set(data.map(f => f.following_id)));
        }
      });
  }, [user]);

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "popular", label: "Populaire" },
    { value: "alpha", label: "A → Z" },
  ];

  const badgeFilters: BadgeFilter[] = ["all", "honor", "honorary", "benefactor", "member"];

  const handleSortChange = (newSort: SortOption) => {
    if (newSort === sortBy) {
      setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"));
    } else {
      setSortBy(newSort);
      setSortDirection("desc");
    }
  };

  const filteredAndSorted = useMemo(() => {
    let result = [...members];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (u) =>
          u.displayName.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q)
      );
    }

    if (badgeFilter !== "all") {
      result = result.filter((u) => u.badge === badgeFilter);
    }

    if (followFilter === "following" && user) {
      result = result.filter((u) => followingIds.has(u.id));
    }

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "popular":
          comparison = b.followersCount - a.followersCount;
          break;
        case "alpha":
          comparison = a.displayName.localeCompare(b.displayName, "fr");
          break;
      }
      return sortDirection === "desc" ? comparison : -comparison;
    });

    return result;
  }, [members, searchQuery, badgeFilter, followFilter, sortBy, sortDirection, user, followingIds]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main id="main-content" className="flex-1 w-full max-w-[1500px] mx-auto px-5 py-10 lg:py-[80px]">
        <h1 className="sr-only">Membres du Club</h1>

        <div className="flex flex-col gap-4 mb-10">
          <div className="relative max-w-[400px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray" aria-hidden="true" />
            <input
              type="text"
              aria-label="Rechercher un membre"
              placeholder="Rechercher un membre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray/10 border border-gray/20 text-dark placeholder:text-gray rounded-lg text-sm tracking-tight focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3" role="toolbar" aria-label="Filtres et tri">
            {user && (
              <>
                <button
                  onClick={() => setFollowFilter(followFilter === "all" ? "following" : "all")}
                  aria-pressed={followFilter === "following"}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium tracking-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                    followFilter === "following"
                      ? "bg-dark text-white"
                      : "bg-gray/10 text-dark hover:bg-gray/20"
                  }`}
                >
                  <Users className="w-3.5 h-3.5" aria-hidden="true" />
                  Mes abonnements
                </button>
                <div className="w-px h-5 bg-gray/30 mx-1" aria-hidden="true" />
              </>
            )}

            <span className="text-sm font-medium text-gray" aria-hidden="true">Trier par :</span>
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSortChange(option.value)}
                aria-pressed={sortBy === option.value}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium tracking-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                  sortBy === option.value
                    ? "bg-dark text-white"
                    : "bg-gray/10 text-dark hover:bg-gray/20"
                }`}
              >
                {option.label}
                {sortBy === option.value &&
                  (sortDirection === "desc" ? (
                    <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                  ) : (
                    <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                  ))}
              </button>
            ))}

            <span className="text-sm font-medium text-gray ml-2" aria-hidden="true">Type :</span>
            {badgeFilters.map((filter) => (
              <button
                key={filter}
                onClick={() => setBadgeFilter(filter)}
                aria-pressed={badgeFilter === filter}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium tracking-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                  badgeFilter === filter
                    ? "bg-dark text-white"
                    : "bg-gray/10 text-dark hover:bg-gray/20"
                }`}
              >
                {badgeFilterLabels[filter]}
              </button>
            ))}
          </div>
        </div>

        {filteredAndSorted.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8 justify-items-center" aria-live="polite">
            {filteredAndSorted.map((member) => (
              <MemberCard
                key={member.id}
                user={member}
                showFollowButton={member.id !== user?.id}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 gap-4" role="status" aria-live="polite">
            <p className="text-t3 font-semibold text-dark">Aucun membre trouvé</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
