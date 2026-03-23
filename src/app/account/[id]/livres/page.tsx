import { notFound } from "next/navigation";
import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import { SectionHeader, ProfileTabs, ProfileBooksFilter } from "@/components/features";
import { Avatar, Badge } from "@/components/ui";
import { getProfileById } from "@/lib/db/profiles";
import { getBooks } from "@/lib/db/books";
import { createClient } from "@/lib/supabase/server";
import { getBadgeLabel } from "@/lib/constants/badges";

interface UserRating {
  book_id: string;
  score: number;
  created_at: string;
}

export default async function ProfileBooksPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const [profile, allBooks] = await Promise.all([
    getProfileById(id, supabase),
    getBooks(supabase),
  ]);

  if (!profile) notFound();

  const { data: { user: authUser } } = await supabase.auth.getUser();
  const isOwnProfile = authUser?.id === id;

  // Use RPC function to bypass RLS when viewing other users' profiles
  const { data: userRatings } = await supabase
    .rpc("get_user_ratings", { target_user_id: id }) as { data: UserRating[] | null };

  const ratingMap = new Map(
    (userRatings ?? []).map((r: UserRating) => [r.book_id, r.score])
  );

  const ratingDatesMap = new Map(
    (userRatings ?? []).map((r: UserRating) => [r.book_id, r.created_at])
  );

  const ratedBooks = allBooks.filter((b) => ratingMap.has(b.id));

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 w-full max-w-[900px] mx-auto px-5 py-[120px]">
        <div className="flex items-center gap-5 mb-10">
          <div className="relative">
            <Avatar src={profile.avatarUrl} alt={profile.displayName} size="lg" className="w-[80px] h-[80px]" />
            <div className="absolute -top-1 -right-2">
              <Badge type={profile.badge} size="md" />
            </div>
          </div>
          <div>
            <Link href={`/account/${id}`}>
              <h1 className="font-display text-t2 text-dark tracking-tight hover:text-primary transition-colors">
                {profile.displayName}
              </h1>
            </Link>
            <p className="text-body text-gray">{getBadgeLabel(profile.badge)}</p>
          </div>
        </div>

        <ProfileTabs profileId={id} />

        <section className="flex flex-col gap-7">
          <SectionHeader
            title={isOwnProfile ? "Mes livres notés" : `Livres notés par ${profile.displayName}`}
          />
          <ProfileBooksFilter
            books={ratedBooks}
            ratingMap={ratingMap}
            ratingDatesMap={ratingDatesMap}
          />
        </section>
      </main>

      <Footer />
    </div>
  );
}
