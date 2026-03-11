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

export default async function AuthorBooksPage({
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

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header user={currentUser} />

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
