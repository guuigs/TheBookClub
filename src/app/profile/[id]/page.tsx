import Link from "next/link";
import { notFound } from "next/navigation";
import { Settings } from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { Button, Avatar, Badge } from "@/components/ui";
import {
  BookCard,
  SectionHeader,
} from "@/components/features";
import {
  users,
  books,
  comments,
  currentUser,
} from "@/lib/data";

// Generate static params for all users
export async function generateStaticParams() {
  return users.map((user) => ({
    id: user.id,
  }));
}

// Badge label mapping
const badgeLabels: Record<string, string> = {
  member: "membre",
  honorary: "membre d'honneur",
  benefactor: "bienfaiteur",
  honor: "membre honoraire",
};

export default async function ProfilePage({
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
  const userComments = comments.filter((c) => c.user.id === id);

  // Mock data
  const favoriteBooks = books.slice(0, 4);
  const recentRatedBooks = books.slice(2, 6);
  const memberSince = "16 janvier 2026";

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header user={currentUser} />

      <main className="flex-1 w-full max-w-[900px] mx-auto px-5 py-[120px]">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-start gap-10 mb-[60px]">
          {/* Avatar with Badge */}
          <div className="relative shrink-0">
            <Avatar
              src={user.avatarUrl}
              alt={user.displayName}
              size="xl"
              className="w-[150px] h-[150px]"
            />
            <div className="absolute -top-2 -left-3">
              <Badge type={user.badge} size="lg" />
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1 flex flex-col gap-5">
            <h1 className="font-display text-[56px] text-dark tracking-tight leading-none">
              {user.displayName}
            </h1>

            <p className="text-t4 font-semibold text-dark">
              {badgeLabels[user.badge] || "membre"}
            </p>

            <p className="text-body text-gray">
              membre depuis le {memberSince}
            </p>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-5 text-small text-gray">
              <span>{user.followingCount} suivis</span>
              <span>{user.followersCount} abonnés</span>
              <span>{user.booksRead} livres notés</span>
              <span>{userComments.length} critiques rédigées</span>
            </div>

            {/* Actions */}
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

        {/* Tabs Navigation */}
        <div className="flex gap-10 mb-[80px]">
          <span className="text-t4 font-semibold text-primary cursor-pointer">
            Profil
          </span>
          <Link href={`/profile/${id}/books`} className="text-t4 font-semibold text-dark hover:text-primary transition-colors">
            Livres
          </Link>
          <Link href={`/profile/${id}/comments`} className="text-t4 font-semibold text-dark hover:text-primary transition-colors">
            Critiques
          </Link>
          <Link href={`/profile/${id}/lists`} className="text-t4 font-semibold text-dark hover:text-primary transition-colors">
            Listes
          </Link>
        </div>

        {/* Content Sections */}
        <div className="flex flex-col gap-10">
          {/* Coups de coeur */}
          <section className="flex flex-col gap-7">
            <SectionHeader title="Coups de coeur" />
            <div className="flex gap-5 overflow-x-auto pb-2">
              {favoriteBooks.map((book) => (
                <BookCard key={book.id} book={book} size="md" />
              ))}
            </div>
          </section>

          {/* Derniers livres notés */}
          <section className="flex flex-col gap-7">
            <SectionHeader
              title="Derniers livres notés"
              seeMoreHref={`/profile/${id}/books`}
            />
            <div className="flex gap-5 overflow-x-auto pb-2">
              {recentRatedBooks.map((book) => (
                <BookCard key={book.id} book={book} size="md" />
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
