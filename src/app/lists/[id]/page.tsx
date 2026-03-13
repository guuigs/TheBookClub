import { notFound } from "next/navigation";
import Link from "next/link";
import { Heart, Share2, Edit, Trash2 } from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { Button, Avatar, Badge } from "@/components/ui";
import { BookCard } from "@/components/features";
import { getListById } from "@/lib/db/lists";
import { createClient } from "@/lib/supabase/server";

export default async function ListDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [list, supabase] = await Promise.all([
    getListById(id),
    createClient(),
  ]);

  if (!list) notFound();

  const { data: { user } } = await supabase.auth.getUser();
  const isOwner = user?.id === list.author.id;

  const formattedDate = list.updatedAt.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 w-full max-w-[1500px] mx-auto px-5 py-10 lg:py-[80px]">
        <div className="flex flex-col gap-6 mb-10">
          <h1 className="font-display text-t1 text-dark tracking-tight">
            {list.title}
          </h1>

          {list.description && (
            <p className="text-body text-gray max-w-[800px]">{list.description}</p>
          )}

          <div className="flex items-center gap-3">
            <Link
              href={`/profile/${list.author.id}`}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Avatar src={list.author.avatarUrl} alt={list.author.displayName} size="md" />
              <span className="text-body font-medium text-dark">{list.author.displayName}</span>
              <Badge type={list.author.badge} size="sm" />
            </Link>
            <span className="text-body text-gray">· Mise à jour le {formattedDate}</span>
          </div>

          <div className="flex flex-wrap items-center gap-5">
            <div className="flex items-center gap-2 text-body text-dark">
              <span className="font-semibold">{list.booksCount}</span>
              <span className="text-gray">livres</span>
            </div>
            <div className="flex items-center gap-2 text-body text-dark">
              <Heart className="w-5 h-5 text-primary" />
              <span className="font-semibold">{list.likesCount}</span>
              <span className="text-gray">likes</span>
            </div>

            <div className="flex-1" />

            <div className="flex items-center gap-3">
              <Button variant="primary">
                <Heart className="w-5 h-5 mr-2" />
                J&apos;aime
              </Button>
              <Button variant="secondary">
                <Share2 className="w-5 h-5 mr-2" />
                Partager
              </Button>
              {isOwner && (
                <>
                  <Link href={`/lists/${id}/edit`}>
                    <Button variant="secondary">
                      <Edit className="w-5 h-5 mr-2" />
                      Modifier
                    </Button>
                  </Link>
                  <Button variant="secondary">
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="w-full h-px bg-gray/20 mb-10" />

        <section>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {list.books.map((book) => (
              <BookCard key={book.id} book={book} size="md" showTitle showAuthor />
            ))}
          </div>
          {list.books.length === 0 && (
            <p className="text-body text-gray text-center py-10">
              Cette liste ne contient pas encore de livres.
            </p>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
