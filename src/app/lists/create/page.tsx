"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { Input, Button } from "@/components/ui";
import { BookCoverSelect } from "@/components/features";
import { books, currentUser } from "@/lib/data";
import type { Book } from "@/types";

export default function CreateListPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedBooks, setSelectedBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  // Filter available books based on search
  const availableBooks = books.filter(
    (book) =>
      !selectedBooks.some((selected) => selected.id === book.id) &&
      (book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const addBook = (book: Book) => {
    setSelectedBooks([...selectedBooks, book]);
    setSearchQuery("");
    setShowSearch(false);
  };

  const removeBook = (bookId: string) => {
    setSelectedBooks(selectedBooks.filter((book) => book.id !== bookId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Save list to backend
    alert("Liste créée avec succès !");
    router.push("/lists");
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header user={currentUser} />

      <main className="flex-1 w-full max-w-[800px] mx-auto px-5 py-10 lg:py-[80px]">
        <h1 className="font-display text-t1 text-dark tracking-tight mb-10">
          Créer une liste
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
                Aucun livre ajouté. Cliquez sur &quot;Ajouter un livre&quot;
                pour commencer.
              </p>
            )}
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray/20">
            <Link href="/lists">
              <Button type="button" variant="secondary">
                Annuler
              </Button>
            </Link>
            <Button type="submit" variant="primary" disabled={!title}>
              Créer la liste
            </Button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
