"use client";

import { useState, use, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpDown, ArrowUp, ArrowDown, Check } from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { Input, Button, useToast } from "@/components/ui";
import { createClient } from "@/lib/supabase/browser";
import { updateList, updateListBooks } from "@/lib/db/lists";
import Image from "next/image";

type SortOption = "alpha" | "rating" | "popularity";
type SortDirection = "asc" | "desc";

interface BookItem {
  id: string;
  title: string;
  coverUrl: string;
  authorName: string;
  averageRating: number;
  totalVotes: number;
}

const sortLabels: Record<SortOption, string> = {
  alpha: "A-Z",
  rating: "Note",
  popularity: "Popularité",
};

export default function EditListPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const toast = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedBookIds, setSelectedBookIds] = useState<Set<string>>(new Set());
  const [allBooks, setAllBooks] = useState<BookItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("alpha");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  useEffect(() => {
    const supabase = createClient();

    async function fetchData() {
      setLoading(true);

      // Step 1: Fetch list metadata
      const { data: listData, error: listError } = await supabase
        .from("book_lists")
        .select("id, title, description, author_id")
        .eq("id", id)
        .single();

      if (listError) {
        console.error("[edit page] Error fetching list:", listError);
        setNotFound(true);
        setLoading(false);
        return;
      }

      if (!listData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setTitle(listData.title ?? "");
      setDescription(listData.description ?? "");

      // Step 2: Fetch book IDs currently in the list
      const { data: itemsData, error: itemsError } = await supabase
        .from("book_list_items")
        .select("book_id")
        .eq("list_id", id);

      if (itemsError) {
        console.error("[edit page] Error fetching list items:", itemsError);
      }

      const bookIdsInList = new Set<string>(
        (itemsData ?? []).map((item) => item.book_id)
      );
      setSelectedBookIds(bookIdsInList);

      // Step 3: Fetch all books with stats
      const { data: booksData, error: booksError } = await supabase
        .from("books_with_stats")
        .select("id, title, cover_url, author_name, average_rating, total_votes");

      if (booksError) {
        console.error("[edit page] Error fetching books:", booksError);
      }

      const books: BookItem[] = (booksData ?? []).map((b) => ({
        id: b.id,
        title: b.title ?? "",
        coverUrl: b.cover_url ?? "",
        authorName: b.author_name ?? "Auteur inconnu",
        averageRating: Number(b.average_rating ?? 0),
        totalVotes: Number(b.total_votes ?? 0),
      }));

      setAllBooks(books);
      setLoading(false);
    }

    fetchData();
  }, [id]);

  // Sort and filter books
  const filteredAndSortedBooks = useMemo(() => {
    let filtered = allBooks;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = allBooks.filter(
        (book) =>
          book.title.toLowerCase().includes(query) ||
          book.authorName.toLowerCase().includes(query)
      );
    }

    // Sort books
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "alpha":
          comparison = a.title.localeCompare(b.title, "fr");
          break;
        case "rating":
          comparison = b.averageRating - a.averageRating;
          break;
        case "popularity":
          comparison = b.totalVotes - a.totalVotes;
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [allBooks, searchQuery, sortBy, sortDirection]);

  const handleSortChange = (newSort: SortOption) => {
    if (newSort === sortBy) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(newSort);
      setSortDirection(newSort === "alpha" ? "asc" : "desc");
    }
  };

  const toggleBook = (bookId: string) => {
    setSelectedBookIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(bookId)) {
        newSet.delete(bookId);
      } else {
        newSet.add(bookId);
      }
      return newSet;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // Update list metadata
    const { error: listError } = await updateList(
      id,
      title.trim(),
      description.trim() || undefined
    );
    if (listError) {
      toast.error(listError);
      setSaving(false);
      return;
    }

    // Update list books
    const { error: booksError } = await updateListBooks(
      id,
      Array.from(selectedBookIds)
    );
    if (booksError) {
      toast.error(booksError);
      setSaving(false);
      return;
    }

    toast.success("Liste mise à jour avec succès !");
    router.push(`/listes/${id}`);
  };

  const sortOptions: SortOption[] = ["alpha", "rating", "popularity"];

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

      <main className="flex-1 w-[320px] tablet:w-[700px] desktop:w-[1200px] mx-auto py-10 desktop:py-[80px]">
        <h1 className="font-display text-t1 text-dark tracking-tight mb-10">
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
              maxLength={200}
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
              rows={3}
              maxLength={1000}
              className="w-full px-4 py-3 bg-white border border-gray rounded-lg text-dark placeholder:text-gray focus:border-primary focus:ring-1 focus:ring-primary font-medium text-body tracking-tight resize-none"
            />
          </div>

          {/* Books Selection */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <label className="text-body font-medium text-dark tracking-tight">
                Livres sélectionnés ({selectedBookIds.size})
              </label>
            </div>

            {/* Search and Sort */}
            <div className="flex flex-col tablet:flex-row gap-4">
              <div className="flex-1">
                <Input
                  variant="search"
                  placeholder="Rechercher un livre..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray">Trier :</span>
                {sortOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleSortChange(option)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium tracking-tight transition-colors ${
                      sortBy === option
                        ? "bg-dark text-white"
                        : "bg-gray/10 text-dark hover:bg-gray/20"
                    }`}
                  >
                    {sortLabels[option]}
                    {sortBy === option &&
                      (sortDirection === "asc" ? (
                        <ArrowUp className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowDown className="w-3.5 h-3.5" />
                      ))}
                    {sortBy !== option && (
                      <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Books Grid with Checkboxes */}
            <div className="grid grid-cols-3 tablet:grid-cols-5 desktop:grid-cols-8 gap-4">
              {filteredAndSortedBooks.map((book) => {
                const isSelected = selectedBookIds.has(book.id);
                return (
                  <button
                    key={book.id}
                    type="button"
                    onClick={() => toggleBook(book.id)}
                    className={`relative group rounded-lg overflow-hidden transition-all ${
                      isSelected
                        ? "ring-2 ring-primary ring-offset-2"
                        : "hover:ring-2 hover:ring-gray/30 hover:ring-offset-2"
                    }`}
                  >
                    {/* Book Cover */}
                    <div className="aspect-[2/3] bg-cream relative">
                      {book.coverUrl ? (
                        <Image
                          src={book.coverUrl}
                          alt={book.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 699px) 90px, 120px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center p-2">
                          <span className="text-xs text-gray text-center line-clamp-3">
                            {book.title}
                          </span>
                        </div>
                      )}

                      {/* Selection Indicator */}
                      {isSelected && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                            <Check className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Book Title */}
                    <div className="p-2 bg-white">
                      <p className="text-xs font-medium text-dark line-clamp-2 text-left">
                        {book.title}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {filteredAndSortedBooks.length === 0 && (
              <p className="text-body text-gray text-center py-8">
                Aucun livre trouvé.
              </p>
            )}
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray/20">
            <Link href={`/listes/${id}`}>
              <Button type="button" variant="secondary">
                Annuler
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              disabled={!title.trim() || saving}
            >
              {saving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
