"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { ProfileCardWithRating } from "@/components/features";
import { createClient } from "@/lib/supabase/browser";
import type { User, MemberBadge } from "@/types";

interface BookData {
  id: string;
  title: string;
}

interface FriendRating {
  user: User;
  rating: number;
}

export default function BookFriendsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [book, setBook] = useState<BookData | null>(null);
  const [friendsRatings, setFriendsRatings] = useState<FriendRating[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function fetchData() {
      setLoading(true);

      // Fetch book info
      const { data: bookData } = await supabase
        .from("books")
        .select("id, title")
        .eq("id", id)
        .single();
      setBook(bookData ?? null);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Get friends' ratings using secure RPC function (bypasses RLS)
      const { data: ratingsData } = await supabase
        .rpc("get_friends_ratings", { book_uuid: id });

      if (ratingsData) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapped: FriendRating[] = ratingsData.map((r: any) => ({
          user: {
            id: r.user_id ?? "",
            username: r.username ?? "",
            displayName: r.display_name ?? "",
            avatarUrl: r.avatar_url ?? undefined,
            badge: (r.badge as MemberBadge) ?? "member",
            booksRead: 0,
            listsCount: 0,
            followersCount: 0,
            followingCount: 0,
          },
          rating: r.score,
        }));
        setFriendsRatings(mapped);
      }

      setLoading(false);
    }

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-body text-gray">Chargement...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-t3 text-dark">Livre non trouve</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 w-full max-w-[800px] mx-auto px-5 py-10 lg:py-[80px]">
        {/* Back link */}
        <Link
          href={`/livres/${id}`}
          className="inline-flex items-center gap-2 text-body font-medium text-gray hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour au livre
        </Link>

        {/* Header */}
        <div className="flex flex-col gap-2 mb-10">
          <h1 className="text-t2 font-semibold text-dark">
            Notes de mes amis
          </h1>
          <p className="text-body text-gray font-display">
            {book.title}
          </p>
        </div>

        {/* Friends List */}
        {friendsRatings.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {friendsRatings.map((item) => (
              <ProfileCardWithRating
                key={item.user.id}
                user={item.user}
                rating={item.rating}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <p className="text-t3 font-semibold text-dark">
              Aucune note
            </p>
            <p className="text-body text-gray">
              Vos amis n&apos;ont pas encore note ce livre
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
