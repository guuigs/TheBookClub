import Link from "next/link";
import { notFound } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import { BookCard, SectionHeader } from "@/components/features";
import { Avatar, Badge } from "@/components/ui";
import { users, books, currentUser } from "@/lib/data";

// Generate static params for all users
export async function generateStaticParams() {
  return users.map((user) => ({
    id: user.id,
  }));
}

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
  const user = users.find((u) => u.id === id);

  if (!user) {
    notFound();
  }

  const isOwnProfile = user.id === currentUser.id;

  // Mock: All books rated by user
  const ratedBooks = books;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header user={currentUser} />

      <main className="flex-1 w-full max-w-[900px] mx-auto px-5 py-[120px]">
        {/* Profile Header (simplified) */}
        <div className="flex items-center gap-5 mb-10">
          <div className="relative">
            <Avatar
              src={user.avatarUrl}
              alt={user.displayName}
              size="lg"
              className="w-[80px] h-[80px]"
            />
            <div className="absolute -top-1 -left-2">
              <Badge type={user.badge} size="md" />
            </div>
          </div>
          <div>
            <Link href={`/profile/${id}`}>
              <h1 className="font-display text-t2 text-dark tracking-tight hover:text-primary transition-colors">
                {user.displayName}
              </h1>
            </Link>
            <p className="text-body text-gray">{badgeLabels[user.badge]}</p>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex gap-10 mb-[60px]">
          <Link href={`/profile/${id}`} className="text-t4 font-semibold text-dark hover:text-primary transition-colors">
            Profil
          </Link>
          <span className="text-t4 font-semibold text-primary cursor-pointer">
            Livres
          </span>
          <Link href={`/profile/${id}/comments`} className="text-t4 font-semibold text-dark hover:text-primary transition-colors">
            Critiques
          </Link>
          <Link href={`/profile/${id}/lists`} className="text-t4 font-semibold text-dark hover:text-primary transition-colors">
            Listes
          </Link>
        </div>

        {/* Books Grid */}
        <section className="flex flex-col gap-7">
          <SectionHeader
            title={isOwnProfile ? "Mes livres notés" : `Livres notés par ${user.displayName}`}
          />
          {ratedBooks.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
              {ratedBooks.map((book) => (
                <BookCard key={book.id} book={book} size="md" showTitle />
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
