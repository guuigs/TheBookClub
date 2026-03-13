"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { FriendActivityCard } from "@/components/features";
import { createClient } from "@/lib/supabase/browser";
import type { User } from "@/types";

interface BookData {
  id: string;
  title: string;
}


export default function BookFriendsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [book, setBook] = useState<BookData | null>(null);
  const [friendsActivity, setFriendsActivity] = useState<User[]>([]);
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

      // Friends activity - secondary page, return empty for now
      setFriendsActivity([]);
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
          <p className="text-t3 text-dark">Livre non trouvé</p>
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
          href={`/books/${id}`}
          className="inline-flex items-center gap-2 text-body font-medium text-gray hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour au livre
        </Link>

        {/* Header */}
        <div className="flex flex-col gap-2 mb-10">
          <h1 className="text-t2 font-semibold text-dark">
            Activité de mes amis
          </h1>
          <p className="text-body text-gray font-display">
            {book.title}
          </p>
        </div>

        {/* Friends List */}
        {friendsActivity.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {friendsActivity.map((friend, index) => (
              <FriendActivityCard
                key={friend.id}
                user={friend}
                rating={6 + index * 2}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <p className="text-t3 font-semibold text-dark">
              Aucune activité
            </p>
            <p className="text-body text-gray">
              Vos amis n&apos;ont pas encore noté ce livre
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
