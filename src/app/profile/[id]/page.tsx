import Link from "next/link";
import { notFound } from "next/navigation";
import { Settings, UserPlus, UserMinus } from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { Button, Avatar, Badge } from "@/components/ui";
import {
  BookCard,
  ListCard,
  CommentCard,
  SectionHeader,
} from "@/components/features";
import {
  users,
  books,
  bookLists,
  comments,
  currentUser,
  getListsByUserId,
} from "@/lib/data";

// Generate static params for all users
export async function generateStaticParams() {
  return users.map((user) => ({
    id: user.id,
  }));
}

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
  const userLists = getListsByUserId(id);
  const userComments = comments.filter((c) => c.user.id === id);

  // Mock: Recent books read (would come from user's library)
  const recentBooks = books.slice(0, 6);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header user={currentUser} />

      <main className="flex-1 w-full max-w-[1500px] mx-auto px-5 py-10 lg:py-[80px]">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-start gap-8 mb-[60px]">
          {/* Avatar */}
          <Avatar
            src={user.avatarUrl}
            alt={user.displayName}
            size="xl"
            className="w-[120px] h-[120px]"
          />

          {/* User Info */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <h1 className="font-display text-t1 text-dark tracking-tight">
                  {user.displayName}
                </h1>
                <Badge type={user.badge} showLabel size="md" />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 sm:ml-auto">
                {isOwnProfile ? (
                  <Link href="/settings">
                    <Button variant="secondary">
                      <Settings className="w-5 h-5 mr-2" />
                      Paramètres
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Button variant="primary">
                      <UserPlus className="w-5 h-5 mr-2" />
                      Suivre
                    </Button>
                    <Button variant="secondary">Message</Button>
                  </>
                )}
              </div>
            </div>

            <p className="text-body text-gray">@{user.username}</p>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-t4 font-semibold text-dark">
                  {user.booksRead}
                </span>
                <span className="text-body text-gray">livres lus</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-t4 font-semibold text-dark">
                  {user.listsCount}
                </span>
                <span className="text-body text-gray">listes</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-t4 font-semibold text-dark">
                  {user.followersCount}
                </span>
                <span className="text-body text-gray">abonnés</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-t4 font-semibold text-dark">
                  {user.followingCount}
                </span>
                <span className="text-body text-gray">abonnements</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Books */}
        <section className="flex flex-col gap-7 mb-[60px]">
          <SectionHeader
            title={isOwnProfile ? "Mes dernières lectures" : "Dernières lectures"}
            seeMoreHref={`/profile/${id}/books`}
          />
          <div className="flex gap-5 overflow-x-auto pb-2">
            {recentBooks.map((book) => (
              <BookCard key={book.id} book={book} size="md" showTitle />
            ))}
          </div>
        </section>

        {/* User Lists */}
        {userLists.length > 0 && (
          <section className="flex flex-col gap-7 mb-[60px]">
            <SectionHeader
              title={isOwnProfile ? "Mes listes" : `Listes de ${user.displayName}`}
              seeMoreHref={`/profile/${id}/lists`}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {userLists.slice(0, 3).map((list) => (
                <ListCard key={list.id} list={list} />
              ))}
            </div>
          </section>
        )}

        {/* User Comments */}
        {userComments.length > 0 && (
          <section className="flex flex-col gap-7">
            <SectionHeader
              title={isOwnProfile ? "Mes critiques" : "Critiques récentes"}
              seeMoreHref={`/profile/${id}/comments`}
            />
            <div className="flex flex-col gap-5 max-w-[800px]">
              {userComments.slice(0, 3).map((comment) => (
                <CommentCard key={comment.id} comment={comment} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
