"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Plus, Heart } from "lucide-react";
import { Button, useToast } from "@/components/ui";
import { BookCard } from "./BookCard";
import { SectionHeader } from "./SectionHeader";
import { removeFavorite, addFavorite } from "@/lib/db/favorites";
import type { Book } from "@/types";

interface FavoritesSectionProps {
  favorites: Book[];
  ratedBooks: Book[];
  ratingMap: Map<string, { score: number; createdAt: string }>;
  isOwnProfile: boolean;
}

export function FavoritesSection({
  favorites: initialFavorites,
  ratedBooks,
  ratingMap,
  isOwnProfile,
}: FavoritesSectionProps) {
  const [favorites, setFavorites] = useState(initialFavorites);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState<string | null>(null);
  const toast = useToast();

  const availableBooks = ratedBooks.filter(
    (book) => !favorites.some((f) => f.id === book.id)
  );

  const handleRemove = async (bookId: string) => {
    setIsRemoving(bookId);
    const { error } = await removeFavorite(bookId);
    if (error) {
      toast.error(error);
    } else {
      setFavorites(favorites.filter((f) => f.id !== bookId));
      toast.info("Retire des coups de coeur");
    }
    setIsRemoving(null);
  };

  const handleAdd = async (book: Book) => {
    if (favorites.length >= 4) {
      toast.error("Vous ne pouvez avoir que 4 coups de coeur.");
      return;
    }

    setIsAdding(book.id);
    const { error } = await addFavorite(book.id);
    if (error) {
      toast.error(error);
    } else {
      setFavorites([...favorites, book]);
      setShowAddModal(false);
      toast.success("Ajoute aux coups de coeur !");
    }
    setIsAdding(null);
  };

  if (favorites.length === 0 && !isOwnProfile) {
    return null;
  }

  return (
    <section className="flex flex-col gap-7">
      <div className="flex items-center justify-between">
        <SectionHeader title="Coups de coeur" />
        {isOwnProfile && (
          <Button
            variant="discrete"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "Terminer" : "Modifier"}
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            {favorites.map((book) => (
              <div key={book.id} className="relative group">
                <Link href={`/livres/${book.id}`}>
                  <div className="w-[100px] h-[150px] bg-cream rounded-sm overflow-hidden relative">
                    {book.coverUrl ? (
                      <Image
                        src={book.coverUrl}
                        alt={book.title}
                        fill
                        className="object-cover"
                        sizes="100px"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-xs text-gray text-center px-2">{book.title}</p>
                      </div>
                    )}
                  </div>
                </Link>
                <button
                  onClick={() => handleRemove(book.id)}
                  disabled={isRemoving === book.id}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
                  aria-label={`Retirer ${book.title} des coups de coeur`}
                >
                  {isRemoving === book.id ? (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}

            {favorites.length < 4 && (
              <button
                onClick={() => setShowAddModal(true)}
                className="w-[100px] h-[150px] border-2 border-dashed border-gray/30 rounded-sm flex flex-col items-center justify-center gap-2 text-gray hover:border-primary hover:text-primary transition-colors"
              >
                <Plus className="w-6 h-6" />
                <span className="text-xs font-medium">Ajouter</span>
              </button>
            )}
          </div>

          <p className="text-small text-gray">
            {favorites.length}/4 coups de coeur
          </p>
        </div>
      ) : (
        <div className="flex gap-5 overflow-x-auto pb-2">
          {favorites.length > 0 ? (
            favorites.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                size="md"
                myRating={ratingMap.get(book.id)?.score ?? null}
              />
            ))
          ) : (
            <p className="text-body text-gray">
              Aucun coup de coeur pour le moment.{" "}
              <button
                onClick={() => setIsEditing(true)}
                className="text-primary hover:underline"
              >
                Ajouter des favoris
              </button>
            </p>
          )}
        </div>
      )}

      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-5"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white rounded-xl p-6 w-full max-w-[500px] max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-t3 text-dark">
                Ajouter un coup de coeur
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray hover:text-dark"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-small text-gray mb-4">
              Choisissez parmi vos livres notes ({4 - favorites.length} place{4 - favorites.length > 1 ? "s" : ""} restante{4 - favorites.length > 1 ? "s" : ""})
            </p>

            <div className="flex-1 overflow-y-auto">
              {availableBooks.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {availableBooks.map((book) => (
                    <button
                      key={book.id}
                      onClick={() => handleAdd(book)}
                      disabled={isAdding === book.id}
                      className="relative group"
                    >
                      <div className="w-full aspect-[2/3] bg-cream rounded-sm overflow-hidden relative">
                        {book.coverUrl ? (
                          <Image
                            src={book.coverUrl}
                            alt={book.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                            sizes="100px"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <p className="text-xs text-gray text-center px-1">{book.title}</p>
                          </div>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-sm">
                        {isAdding === book.id ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Heart className="w-6 h-6 text-white fill-white" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-body text-gray text-center py-10">
                  Vous avez deja ajoute tous vos livres notes en coups de coeur, ou vous n&apos;avez pas encore note de livres.
                </p>
              )}
            </div>

            <div className="flex justify-end mt-4 pt-4 border-t border-gray/20">
              <Button variant="secondary" size="sm" onClick={() => setShowAddModal(false)}>
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
