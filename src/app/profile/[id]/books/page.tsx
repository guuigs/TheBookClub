import { notFound } from "next/navigation";
import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import { BookCard, SectionHeader, ProfileTabs } from "@/components/features";
import { Avatar, Badge } from "@/components/ui";
import { getProfileById } from "@/lib/db/profiles";
import { getBooks } from "@/lib/db/books";
import { createClient } from "@/lib/supabase/server";

const badgeLabels: Record<string, string> = {
  member: "membre du club",
  honorary: "membre honoraire",
  benefactor: "membre bienfaiteur",
  honor: "membre d'honneur",
};

export default async function ProfileBooksPage({
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

  if (!profile) notFound();

  const { data: { user: authUser } } = await supabase.auth.getUser();
  const isOwnProfile = authUser?.id === id;

  const { data: userRatings } = await supabase
    .from("ratings")
    .select("book_id, score")
    .eq("user_id", id);

  const ratingMap = new Map(
    (userRatings ?? []).map((r) => [r.book_id, r.score])
  );

  const ratedBooks = allBooks.filter((b) => ratingMap.has(b.id));

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 w-full max-w-[900px] mx-auto px-5 py-[120px]">
        <div className="flex items-center gap-5 mb-10">
          <div className="relative">
            <Avatar src={profile.avatarUrl} alt={profile.displayName} size="lg" className="w-[80px] h-[80px]" />
            <div className="absolute -top-1 -left-2">
              <Badge type={profile.badge} size="md" />
            </div>
          </div>
          <div>
            <Link href={`/profile/${id}`}>
              <h1 className="font-display text-t2 text-dark tracking-tight hover:text-primary transition-colors">
                {profile.displayName}
              </h1>
            </Link>
            <p className="text-body text-gray">{badgeLabels[profile.badge]}</p>
          </div>
        </div>

        <ProfileTabs profileId={id} />

        <section className="flex flex-col gap-7">
          <SectionHeader
            title={isOwnProfile ? "Mes livres notés" : `Livres notés par ${profile.displayName}`}
          />
          {ratedBooks.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
              {ratedBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  size="md"
                  showTitle
                  myRating={ratingMap.get(book.id) ?? null}
                />
              ))}
            </div>
          ) : (
            <p className="text-body text-gray text-center py-10">
              Aucun livre noté pour le moment.
            </p>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
