import Link from "next/link";
import { notFound } from "next/navigation";
import { Settings } from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { Button, Avatar, Badge } from "@/components/ui";
import { BookCard, SectionHeader, FollowButton, ProfileTabs } from "@/components/features";
import { getProfileById } from "@/lib/db/profiles";
import { getBooks } from "@/lib/db/books";
import { createClient } from "@/lib/supabase/server";

const badgeLabels: Record<string, string> = {
  member: "membre du club",
  honorary: "membre honoraire",
  benefactor: "membre bienfaiteur",
  honor: "membre d'honneur",
};

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [profile, allBooks, supabase] = await Promise.all([
    getProfileById(id),
    getBooks(),
    createClient(),
  ]);

  if (!profile) {
    notFound();
  }

  const { data: { user: currentAuthUser } } = await supabase.auth.getUser();
  const isOwnProfile = currentAuthUser?.id === id;

  // Check if current user is following this profile
  let isFollowingProfile = false;
  if (currentAuthUser && !isOwnProfile) {
    const { data: followData } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", currentAuthUser.id)
      .eq("following_id", id)
      .single();
    isFollowingProfile = !!followData;
  }

  // Get ratings for this user (including created_at for sorting)
  const { data: userRatings } = await supabase
    .from("ratings")
    .select("book_id, score, created_at")
    .eq("user_id", id);

  const ratingMap = new Map(
    (userRatings ?? []).map((r) => [r.book_id, { score: r.score, createdAt: r.created_at }])
  );

  const ratedBooks = allBooks.filter((b) => ratingMap.has(b.id));

  // Get explicit favorites from user_favorites table
  const { data: explicitFavorites } = await supabase
    .from("user_favorites")
    .select("book_id")
    .eq("user_id", id)
    .order("position", { ascending: true })
    .limit(4);

  const favoriteBookIds = new Set((explicitFavorites ?? []).map(f => f.book_id));

  // Coups de coeur: use explicit favorites if any, otherwise fall back to top-rated
  let favoriteBooks = allBooks.filter(b => favoriteBookIds.has(b.id));

  // If no explicit favorites, fall back to top-rated books
  if (favoriteBooks.length === 0) {
    favoriteBooks = [...ratedBooks]
      .sort((a, b) => {
        const scoreA = ratingMap.get(a.id)?.score ?? 0;
        const scoreB = ratingMap.get(b.id)?.score ?? 0;
        return scoreB - scoreA;
      })
      .slice(0, 4);
  }

  // Derniers livres notés: triés par date de notation (plus récent en premier)
  const recentRatedBooks = [...ratedBooks]
    .sort((a, b) => {
      const dateA = ratingMap.get(a.id)?.createdAt ?? "";
      const dateB = ratingMap.get(b.id)?.createdAt ?? "";
      return dateB.localeCompare(dateA);
    })
    .slice(0, 4);

  // Comment count
  const { count: commentsCount } = await supabase
    .from("comments")
    .select("*", { count: "exact", head: true })
    .eq("user_id", id);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 w-full max-w-[900px] mx-auto px-5 py-[120px]">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-start gap-10 mb-[60px]">
          <div className="relative shrink-0">
            <Avatar
              src={profile.avatarUrl}
              alt={profile.displayName}
              size="xl"
              className="w-[150px] h-[150px]"
            />
            <div className="absolute -top-2 -left-3">
              <Badge type={profile.badge} size="lg" />
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-5">
            <h1 className="font-display text-[56px] text-dark tracking-tight leading-none">
              {profile.displayName}
            </h1>

            <p className="text-t4 font-semibold text-dark">
              {badgeLabels[profile.badge] || "membre"}
            </p>

            {profile.joinDate && (
              <p className="text-body text-gray">
                membre depuis le {profile.joinDate}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-5 text-small text-gray">
              <span>{profile.followingCount} suivis</span>
              <span>{profile.followersCount} abonnés</span>
              <span>{ratedBooks.length} livres notés</span>
              <span>{commentsCount ?? 0} critiques rédigées</span>
            </div>

            {!isOwnProfile ? (
              <FollowButton
                targetUserId={id}
                initialIsFollowing={isFollowingProfile}
              />
            ) : (
              <Link href="/settings">
                <Button variant="secondary" className="w-fit">
                  <Settings className="w-4 h-4 mr-2" />
                  Paramètres
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Tabs */}
        <ProfileTabs profileId={id} />

        <div className="flex flex-col gap-10">
          {favoriteBooks.length > 0 && (
            <section className="flex flex-col gap-7">
              <SectionHeader title="Coups de coeur" />
              <div className="flex gap-5 overflow-x-auto pb-2">
                {favoriteBooks.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    size="md"
                    myRating={ratingMap.get(book.id)?.score ?? null}
                  />
                ))}
              </div>
            </section>
          )}

          {recentRatedBooks.length > 0 && (
            <section className="flex flex-col gap-7">
              <SectionHeader
                title="Derniers livres notés"
                seeMoreHref={`/profile/${id}/books`}
              />
              <div className="flex gap-5 overflow-x-auto pb-2">
                {recentRatedBooks.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    size="md"
                    myRating={ratingMap.get(book.id)?.score ?? null}
                  />
                ))}
              </div>
            </section>
          )}

          {ratedBooks.length === 0 && (
            <p className="text-body text-gray text-center py-10">
              Aucun livre noté pour l&apos;instant.
            </p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
