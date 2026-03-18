"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { Input, Button, useToast } from "@/components/ui";
import { BookCoverSelect } from "@/components/features";
import { createClient } from "@/lib/supabase/browser";
import { createList, updateListBooks } from "@/lib/db/lists";
import type { Book } from "@/types";

export default function CreateListPage() {
  const router = useRouter();
  const toast = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedBooks, setSelectedBooks] = useState<Book[]>([]);
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("books_with_stats")
      .select("*")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then(({ data }) => {
        if (data) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setAllBooks(data.map((row: any) => ({
            id: row.id,
            title: row.title,
            author: { id: row.author_id ?? "", name: row.author_name ?? "", booksCount: 0 },
            coverUrl: row.cover_url ?? "",
            description: row.description ?? "",
            publishedYear: row.published_year ?? 0,
            genre: row.genre ?? "",
            averageRating: Number(row.average_rating ?? 0),
            totalVotes: Number(row.total_votes ?? 0),
            ratingDistribution: [],
          })));
        }
      });
  }, []);

  const availableBooks = allBooks.filter(
    (book) =>
      !selectedBooks.some((s) => s.id === book.id) &&
      (book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const addBook = (book: Book) => {
    setSelectedBooks([...selectedBooks, book]);
    setSearchQuery("");
    setShowSearch(false);
  };

  const removeBook = (bookId: string) => {
    setSelectedBooks(selectedBooks.filter((b) => b.id !== bookId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { id, error } = await createList(title.trim(), description.trim() || undefined);
    if (error || !id) {
      toast.error(error ?? "Erreur lors de la création de la liste");
      setIsLoading(false);
      return;
    }

    // Add books to the list using the proper function
    if (selectedBooks.length > 0) {
      const bookIds = selectedBooks.map((b) => b.id);
      const { error: booksError } = await updateListBooks(id, bookIds);
      if (booksError) {
        toast.error("Liste créée mais erreur lors de l'ajout des livres");
      }
    }

    toast.success("Liste créée avec succès !");
    // Navigate to the new list
    router.push(`/listes/${id}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 w-full max-w-[800px] mx-auto px-5 py-10 lg:py-[80px]">
        <h1 className="font-display text-t1 text-dark tracking-tight mb-10">
          Créer une liste
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <label htmlFor="title" className="text-body font-medium text-dark tracking-tight">
              Titre de la liste *
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Mes classiques préférés"
              required
              maxLength={200}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="description" className="text-body font-medium text-dark tracking-tight">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez votre liste..."
              rows={4}
              maxLength={1000}
              className="w-full px-4 py-3 bg-white border border-gray rounded-lg text-dark placeholder:text-gray focus:border-primary focus:ring-1 focus:ring-primary font-medium text-body tracking-tight resize-none"
            />
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <label className="text-body font-medium text-dark tracking-tight">
                Livres ({selectedBooks.length})
              </label>
              <Button type="button" variant="secondary" onClick={() => setShowSearch(!showSearch)}>
                <Plus className="w-5 h-5 mr-2" />
                Ajouter un livre
              </Button>
            </div>

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
                      <BookCoverSelect key={book.id} book={book} onSelect={() => addBook(book)} size="sm" />
                    ))}
                  </div>
                )}
              </div>
            )}

            {selectedBooks.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-5">
                {selectedBooks.map((book) => (
                  <div key={book.id} className="relative group">
                    <BookCoverSelect book={book} isSelected onSelect={() => removeBook(book.id)} size="sm" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-body text-gray text-center py-8">
                Aucun livre ajouté. Cliquez sur &quot;Ajouter un livre&quot; pour commencer.
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray/20">
            <Link href="/lists">
              <Button type="button" variant="secondary">Annuler</Button>
            </Link>
            <Button type="submit" variant="primary" disabled={!title.trim() || isLoading}>
              {isLoading ? "Création..." : "Créer la liste"}
            </Button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
