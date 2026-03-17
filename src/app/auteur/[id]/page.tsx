import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import { BookCard, SectionHeader } from "@/components/features";
import { createClient } from "@/lib/supabase/server";
import type { Book } from "@/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapBook(row: any): Book {
  return {
    id: row.id,
    title: row.title,
    author: {
      id: row.author_id ?? "",
      name: row.author_name ?? "",
      booksCount: 0,
    },
    coverUrl: row.cover_url ?? "",
    description: row.description ?? "",
    publishedYear: row.published_year ?? 0,
    genre: row.genre ?? "",
    averageRating: Number(row.average_rating ?? 0),
    totalVotes: Number(row.total_votes ?? 0),
    ratingDistribution: [],
  };
}

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: author } = await supabase
    .from("authors")
    .select("*")
    .eq("id", id)
    .single();

  if (!author) notFound();

  const { data: booksData } = await supabase
    .from("books_with_stats")
    .select("*")
    .eq("author_id", id);

  const authorBooks = (booksData ?? []).map(mapBook);

  // Get user ratings for these books
  const { data: { user } } = await supabase.auth.getUser();
  let userRatings = new Map<string, number>();
  if (user && authorBooks.length > 0) {
    const { data: ratingsData } = await supabase
      .from("ratings")
      .select("book_id, score")
      .eq("user_id", user.id)
      .in("book_id", authorBooks.map(b => b.id));
    if (ratingsData) {
      userRatings = new Map(ratingsData.map(r => [r.book_id, r.score]));
    }
  }

  const avgRating =
    authorBooks.length > 0
      ? (
          authorBooks.reduce((sum, b) => sum + b.averageRating, 0) /
          authorBooks.length
        ).toFixed(1)
      : "N/A";

  const topRatedBooks = [...authorBooks]
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 w-full max-w-[900px] mx-auto px-5 py-[120px]">
        <div className="flex flex-col md:flex-row items-start gap-10 mb-[60px]">
          <div className="relative w-[150px] h-[150px] bg-cream rounded-full overflow-hidden shrink-0">
            {author.photo_url ? (
              <Image
                src={author.photo_url}
                alt={author.name}
                fill
                className="object-cover"
                sizes="150px"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display text-t1 text-gray">{author.name.charAt(0)}</span>
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col gap-5">
            <h1 className="font-display text-[56px] text-dark tracking-tight leading-none">
              {author.name}
            </h1>
            <p className="text-t4 font-semibold text-dark">Auteur</p>
            <div className="flex flex-wrap items-center gap-5 text-small text-gray">
              <span>{authorBooks.length} livres</span>
              <span>{avgRating}/10 note moyenne</span>
            </div>
            {author.bio && (
              <p className="text-body text-gray leading-relaxed max-w-[600px]">{author.bio}</p>
            )}
          </div>
        </div>

        <div className="flex gap-10 mb-[80px]">
          <span className="text-t4 font-semibold text-primary cursor-pointer">Biographie</span>
          <Link href={`/auteur/${id}/books`} className="text-t4 font-semibold text-dark hover:text-primary transition-colors">
            Livres
          </Link>
        </div>

        <div className="flex flex-col gap-10">
          {topRatedBooks.length > 0 && (
            <section className="flex flex-col gap-7">
              <SectionHeader title="Meilleurs livres" />
              <div className="flex gap-5 overflow-x-auto pb-2">
                {topRatedBooks.map((book) => (
                  <BookCard key={book.id} book={book} size="md" myRating={userRatings.get(book.id) ?? null} />
                ))}
              </div>
            </section>
          )}

          <section className="flex flex-col gap-7">
            <SectionHeader
              title={`Tous les livres (${authorBooks.length})`}
              seeMoreHref={`/auteur/${id}/books`}
            />
            {authorBooks.length > 0 ? (
              <div className="flex gap-5 overflow-x-auto pb-2">
                {authorBooks.map((book) => (
                  <BookCard key={book.id} book={book} size="md" myRating={userRatings.get(book.id) ?? null} />
                ))}
              </div>
            ) : (
              <p className="text-body text-gray text-center py-10">
                Aucun livre de cet auteur n&apos;est encore répertorié.
              </p>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
