import { notFound } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import { BookCard } from "@/components/features";
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
    .select("id, name")
    .eq("id", id)
    .single();

  if (!author) notFound();

  const { data: booksData } = await supabase
    .from("books_with_stats")
    .select("*")
    .eq("author_id", id);

  const authorBooks = (booksData ?? []).map(mapBook);

  // User ratings
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

  const ratedBooks = authorBooks.filter(b => b.totalVotes > 0);
  const avgRating =
    ratedBooks.length > 0
      ? (ratedBooks.reduce((sum, b) => sum + b.averageRating, 0) / ratedBooks.length).toFixed(1)
      : null;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 w-[320px] tablet:w-[700px] desktop:w-[1200px] mx-auto py-16 desktop:py-[120px]">
        {/* Header */}
        <div className="flex flex-col gap-3 mb-[60px]">
          <h1 className="font-display text-t1 text-dark tracking-tight leading-none">
            {author.name}
          </h1>
          <div className="flex items-center gap-5 text-body text-gray">
            <span>{authorBooks.length} livre{authorBooks.length !== 1 ? "s" : ""}</span>
            {avgRating && <span>{avgRating}/10 note moyenne</span>}
          </div>
        </div>

        {/* Books grid */}
        {authorBooks.length > 0 ? (
          <div className="grid grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-4 gap-5 justify-items-center">
            {authorBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                size="lg"
                showTitle
                showAuthor={false}
                myRating={userRatings.get(book.id) ?? null}
              />
            ))}
          </div>
        ) : (
          <p className="text-body text-gray text-center py-10">
            Aucun livre de cet auteur n&apos;est encore répertorié.
          </p>
        )}
      </main>

      <Footer />
    </div>
  );
}
