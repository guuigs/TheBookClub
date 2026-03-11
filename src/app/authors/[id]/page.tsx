import Image from "next/image";
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

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header user={currentUser} />

      <main className="flex-1 w-full max-w-[1500px] mx-auto px-5 py-10 lg:py-[80px]">
        {/* Author Header */}
        <div className="flex flex-col md:flex-row items-start gap-10 mb-[60px]">
          {/* Author Photo */}
          <div className="relative w-[200px] h-[200px] bg-cream rounded-full overflow-hidden shrink-0">
            {author.photoUrl ? (
              <Image
                src={author.photoUrl}
                alt={author.name}
                fill
                className="object-cover"
                sizes="200px"
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
            <h1 className="font-display text-t1 text-dark tracking-tight">
              {author.name}
            </h1>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-t4 font-semibold text-dark">
                  {author.booksCount}
                </span>
                <span className="text-body text-gray">livres</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-t4 font-semibold text-primary">
                  {avgRating}/10
                </span>
                <span className="text-body text-gray">note moyenne</span>
              </div>
            </div>

            {/* Bio */}
            {author.bio && (
              <p className="text-body text-dark leading-relaxed max-w-[800px]">
                {author.bio}
              </p>
            )}
          </div>
        </div>

        {/* Author's Books */}
        <section className="flex flex-col gap-7">
          <SectionHeader
            title={`Livres de ${author.name} (${authorBooks.length})`}
          />

          {authorBooks.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
              {authorBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  size="md"
                  showTitle
                />
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
