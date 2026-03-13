"use client";

import { useState, use, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { Input, Button } from "@/components/ui";
import { BookCoverSelect } from "@/components/features";
import { createClient } from "@/lib/supabase/browser";
import type { Book } from "@/types";

export default function EditListPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedBooks, setSelectedBooks] = useState<Book[]>([]);
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function fetchData() {
      setLoading(true);

      // Fetch existing list
      const { data: listData } = await supabase
        .from("lists")
        .select("id, title, description, list_books(book:books(id, title, cover_url, description, published_year, genre, average_rating, total_votes, rating_distribution, author:authors(id, name, bio, photo_url, books_count)))")
        .eq("id", id)
        .single();

      if (!listData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setTitle(listData.title ?? "");
      setDescription(listData.description ?? "");

      const listBooks: Book[] = ((listData.list_books as Array<{ book: unknown }>) ?? [])
        .map((lb) => {
          const b = lb.book as Record<string, unknown> | null;
          if (!b) return null;
          const a = b.author as Record<string, unknown> | null;
          return {
            id: b.id as string,
            title: b.title as string,
            coverUrl: (b.cover_url as string) ?? "",
            description: (b.description as string) ?? "",
            publishedYear: (b.published_year as number) ?? 0,
            genre: (b.genre as string) ?? "",
            averageRating: (b.average_rating as number) ?? 0,
            totalVotes: (b.total_votes as number) ?? 0,
            ratingDistribution: (b.rating_distribution as number[]) ?? [],
            author: a
              ? {
                  id: a.id as string,
                  name: a.name as string,
                  bio: (a.bio as string) ?? undefined,
                  photoUrl: (a.photo_url as string) ?? undefined,
                  booksCount: (a.books_count as number) ?? 0,
                }
              : { id: "", name: "Auteur inconnu", booksCount: 0 },
          } as Book;
        })
        .filter((b): b is Book => b !== null);

      setSelectedBooks(listBooks);

      // Fetch all books for search
      const { data: booksData } = await supabase
        .from("books")
        .select("id, title, cover_url, description, published_year, genre, average_rating, total_votes, rating_distribution, author:authors(id, name, bio, photo_url, books_count)");

      const books: Book[] = (booksData ?? []).map((b) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rawAuthor = b.author as any;
        const a: Record<string, unknown> | null = Array.isArray(rawAuthor) ? (rawAuthor[0] ?? null) : (rawAuthor ?? null);
        return {
          id: b.id,
          title: b.title,
          coverUrl: b.cover_url ?? "",
          description: b.description ?? "",
          publishedYear: b.published_year ?? 0,
          genre: b.genre ?? "",
          averageRating: b.average_rating ?? 0,
          totalVotes: b.total_votes ?? 0,
          ratingDistribution: (b.rating_distribution as number[]) ?? [],
          author: a
            ? {
                id: a.id as string,
                name: a.name as string,
                bio: (a.bio as string) ?? undefined,
                photoUrl: (a.photo_url as string) ?? undefined,
                booksCount: (a.books_count as number) ?? 0,
              }
            : { id: "", name: "Auteur inconnu", booksCount: 0 },
        } as Book;
      });
      setAllBooks(books);
      setLoading(false);
    }

    fetchData();
  }, [id]);

  // Filter available books based on search
  const availableBooks = allBooks.filter(
    (book) =>
      !selectedBooks.some((selected) => selected.id === book.id) &&
      (book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const addBook = (book: Book) => {
    setSelectedBooks([...selectedBooks, book]);
    setSearchQuery("");
  };

  const removeBook = (bookId: string) => {
    setSelectedBooks(selectedBooks.filter((book) => book.id !== bookId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Save list to backend
    alert("Liste mise à jour avec succès !");
    router.push(`/lists/${id}`);
  };

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

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-t3 text-dark">Liste non trouvée</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 w-full max-w-[800px] mx-auto px-5 py-10 lg:py-[80px]">
        <h1 className="font-display text-t1 text-dark tracking-tight mb-10 text-center md:text-left">
          Modifier la liste
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {/* Title */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="title"
              className="text-body font-medium text-dark tracking-tight"
            >
              Titre de la liste *
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Mes classiques préférés"
              required
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="description"
              className="text-body font-medium text-dark tracking-tight"
            >
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez votre liste..."
              rows={4}
              className="w-full px-4 py-3 bg-white border border-gray rounded-lg text-dark placeholder:text-gray focus:border-primary focus:ring-1 focus:ring-primary font-medium text-body tracking-tight resize-none"
            />
          </div>

          {/* Selected Books */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <label className="text-body font-medium text-dark tracking-tight">
                Livres ({selectedBooks.length})
              </label>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowSearch(!showSearch)}
              >
                <Plus className="w-5 h-5 mr-2" />
                Ajouter un livre
              </Button>
            </div>

            {/* Search for books */}
            {showSearch && (
              <div className="flex flex-col gap-4 p-4 bg-cream/30 rounded-lg">
                <Input
                  variant="search"
                  placeholder="Rechercher un livre..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-5 max-h-[300px] overflow-y-auto">
                    {availableBooks.slice(0, 8).map((book) => (
                      <BookCoverSelect
                        key={book.id}
                        book={book}
                        onSelect={() => addBook(book)}
                        size="sm"
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Selected books grid */}
            {selectedBooks.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-5">
                {selectedBooks.map((book) => (
                  <div key={book.id} className="relative group">
                    <BookCoverSelect
                      book={book}
                      isSelected
                      onSelect={() => removeBook(book.id)}
                      size="sm"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-body text-gray text-center py-8">
                Aucun livre dans cette liste.
              </p>
            )}
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray/20">
            <Link href={`/lists/${id}`}>
              <Button type="button" variant="secondary">
                Annuler
              </Button>
            </Link>
            <Button type="submit" variant="primary" disabled={!title}>
              Enregistrer
            </Button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
