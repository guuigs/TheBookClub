import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import { BookCard, SectionHeader } from "@/components/features";
import { authors, getBooksByAuthorId, currentUser } from "@/lib/data";

// Generate static params for all authors
export async function generateStaticParams() {
  return authors.map((author) => ({
    id: author.id,
  }));
}

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const author = authors.find((a) => a.id === id);

  if (!author) {
    notFound();
  }

  const authorBooks = getBooksByAuthorId(id);

  // Calculate average rating for all author's books
  const avgRating =
    authorBooks.length > 0
      ? (
          authorBooks.reduce((sum, book) => sum + book.averageRating, 0) /
          authorBooks.length
        ).toFixed(1)
      : "N/A";

  // Get top rated books
  const topRatedBooks = [...authorBooks]
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header user={currentUser} />

      <main className="flex-1 w-full max-w-[900px] mx-auto px-5 py-[120px]">
        {/* Author Header */}
        <div className="flex flex-col md:flex-row items-start gap-10 mb-[60px]">
          {/* Author Photo */}
          <div className="relative w-[150px] h-[150px] bg-cream rounded-full overflow-hidden shrink-0">
            {author.photoUrl ? (
              <Image
                src={author.photoUrl}
                alt={author.name}
                fill
                className="object-cover"
                sizes="150px"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display text-t1 text-gray">
                  {author.name.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Author Info */}
          <div className="flex-1 flex flex-col gap-5">
            <h1 className="font-display text-[56px] text-dark tracking-tight leading-none">
              {author.name}
            </h1>

            <p className="text-t4 font-semibold text-dark">
              Auteur
            </p>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-5 text-small text-gray">
              <span>{author.booksCount} livres</span>
              <span>{avgRating}/10 note moyenne</span>
            </div>

            {/* Bio */}
            {author.bio && (
              <p className="text-body text-gray leading-relaxed max-w-[600px]">
                {author.bio}
              </p>
            )}
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex gap-10 mb-[80px]">
          <span className="text-t4 font-semibold text-primary cursor-pointer">
            Biographie
          </span>
          <Link href={`/authors/${id}/books`} className="text-t4 font-semibold text-dark hover:text-primary transition-colors">
            Livres
          </Link>
        </div>

        {/* Content Sections */}
        <div className="flex flex-col gap-10">
          {/* Top Rated Books */}
          {topRatedBooks.length > 0 && (
            <section className="flex flex-col gap-7">
              <SectionHeader title="Meilleurs livres" />
              <div className="flex gap-5 overflow-x-auto pb-2">
                {topRatedBooks.map((book) => (
                  <BookCard key={book.id} book={book} size="md" />
                ))}
              </div>
            </section>
          )}

          {/* All Books */}
          <section className="flex flex-col gap-7">
            <SectionHeader
              title={`Tous les livres (${authorBooks.length})`}
              seeMoreHref={`/authors/${id}/books`}
            />

            {authorBooks.length > 0 ? (
              <div className="flex gap-5 overflow-x-auto pb-2">
                {authorBooks.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    size="md"
                  />
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
