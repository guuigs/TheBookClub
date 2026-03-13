import Link from "next/link";
import { notFound } from "next/navigation";
import { Settings } from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { Button, Avatar, Badge } from "@/components/ui";
import { BookCard, SectionHeader } from "@/components/features";
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

  // Get ratings for this user
  const { data: userRatings } = await supabase
    .from("ratings")
    .select("book_id, score")
    .eq("user_id", id);

  const ratingMap = new Map(
    (userRatings ?? []).map((r) => [r.book_id, r.score])
  );

  const ratedBooks = allBooks.filter((b) => ratingMap.has(b.id));
  const favoriteBooks = ratedBooks.slice(0, 4);
  const recentRatedBooks = ratedBooks.slice(0, 4);

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
              <Button variant="primary" className="w-fit">
                s&apos;abonner
              </Button>
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
        <div className="flex gap-10 mb-[80px]">
          <span className="text-t4 font-semibold text-primary cursor-pointer">Profil</span>
          <Link href={`/profile/${id}/books`} className="text-t4 font-semibold text-dark hover:text-primary transition-colors">Livres</Link>
          <Link href={`/profile/${id}/comments`} className="text-t4 font-semibold text-dark hover:text-primary transition-colors">Critiques</Link>
          <Link href={`/profile/${id}/lists`} className="text-t4 font-semibold text-dark hover:text-primary transition-colors">Listes</Link>
        </div>

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
                    myRating={ratingMap.get(book.id) ?? null}
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
                    myRating={ratingMap.get(book.id) ?? null}
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
