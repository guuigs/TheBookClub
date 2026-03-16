import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import { BookCard, SectionHeader } from "@/components/features";
import { createClient } from "@/lib/supabase/server";
import type { Book, Author } from "@/types";

export default async function AuthorBooksPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: authorData } = await supabase
    .from("authors")
    .select("id, name, bio, photo_url, books_count")
    .eq("id", id)
    .single();

  if (!authorData) {
    notFound();
  }

  const author: Author = {
    id: authorData.id,
    name: authorData.name,
    bio: authorData.bio ?? undefined,
    photoUrl: authorData.photo_url ?? undefined,
    booksCount: authorData.books_count ?? 0,
  };

  const { data: booksData } = await supabase
    .from("books_with_stats")
    .select("*")
    .eq("author_id", id)
    .order("total_votes", { ascending: false });

  const authorBooks: Book[] = (booksData ?? []).map((b) => ({
    id: b.id,
    title: b.title,
    coverUrl: b.cover_url ?? "",
    description: b.description ?? "",
    publishedYear: b.published_year ?? 0,
    genre: b.genre ?? "",
    averageRating: Number(b.average_rating ?? 0),
    totalVotes: Number(b.total_votes ?? 0),
    ratingDistribution: [],
    author: {
      id: b.author_id ?? "",
      name: b.author_name ?? author.name,
      bio: b.author_bio ?? undefined,
      photoUrl: b.author_photo_url ?? undefined,
      booksCount: 0,
    },
  }));

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 w-full max-w-[900px] mx-auto px-5 py-[120px]">
        {/* Author Header (simplified) */}
        <div className="flex items-center gap-5 mb-10">
          <div className="relative w-[80px] h-[80px] bg-cream rounded-full overflow-hidden shrink-0">
            {author.photoUrl ? (
              <Image
                src={author.photoUrl}
                alt={author.name}
                fill
                className="object-cover"
                sizes="80px"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display text-t3 text-gray">
                  {author.name.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <div>
            <Link href={`/authors/${id}`}>
              <h1 className="font-display text-t2 text-dark tracking-tight hover:text-primary transition-colors">
                {author.name}
              </h1>
            </Link>
            <p className="text-body text-gray">Auteur</p>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex gap-10 mb-[60px]">
          <Link href={`/authors/${id}`} className="text-t4 font-semibold text-dark hover:text-primary transition-colors">
            Biographie
          </Link>
          <span className="text-t4 font-semibold text-primary cursor-pointer">
            Livres
          </span>
        </div>

        {/* Books Grid */}
        <section className="flex flex-col gap-7">
          <SectionHeader title={`Tous les livres (${authorBooks.length})`} />
          {authorBooks.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
              {authorBooks.map((book) => (
                <BookCard key={book.id} book={book} size="md" showTitle />
              ))}
            </div>
          ) : (
            <p className="text-body text-gray text-center py-10">
              Aucun livre de cet auteur n&apos;est encore répertorié.
            </p>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
