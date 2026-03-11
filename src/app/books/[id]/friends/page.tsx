"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { FriendActivityCard } from "@/components/features";
import { getBookById, getFriendsActivity, currentUser } from "@/lib/data";

export default function BookFriendsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const book = getBookById(id);
  const friendsActivity = getFriendsActivity(currentUser.id);

  if (!book) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header user={currentUser} />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-t3 text-dark">Livre non trouv&eacute;</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header user={currentUser} />

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
            Activit&eacute; de mes amis
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
              Aucune activit&eacute;
            </p>
            <p className="text-body text-gray">
              Vos amis n&apos;ont pas encore not&eacute; ce livre
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
