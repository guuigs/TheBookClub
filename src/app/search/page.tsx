"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { Input } from "@/components/ui";
import { BookCard, ListCard } from "@/components/features";
import { books, bookLists, currentUser } from "@/lib/data";

type SearchTab = "books" | "lists" | "users";
type SortOption = "popular" | "rating" | "recent";
type SortDirection = "asc" | "desc";

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<SearchTab>("books");
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  // Search filter including synopsis
  const filteredBooks = useMemo(() => {
    const lowerQuery = query.toLowerCase();
    return books.filter(
      (book) =>
        book.title.toLowerCase().includes(lowerQuery) ||
        book.author.name.toLowerCase().includes(lowerQuery) ||
        book.genre.toLowerCase().includes(lowerQuery) ||
        book.description.toLowerCase().includes(lowerQuery)
    );
  }, [query]);

  // Sort filtered books
  const sortedBooks = useMemo(() => {
    const sorted = [...filteredBooks].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "popular":
          comparison = b.totalVotes - a.totalVotes;
          break;
        case "rating":
          comparison = b.averageRating - a.averageRating;
          break;
        case "recent":
          comparison = b.publishedYear - a.publishedYear;
          break;
      }
      return sortDirection === "desc" ? comparison : -comparison;
    });
    return sorted;
  }, [filteredBooks, sortBy, sortDirection]);

  const filteredLists = bookLists.filter(
    (list) =>
      list.title.toLowerCase().includes(query.toLowerCase()) ||
      list.description?.toLowerCase().includes(query.toLowerCase())
  );

  const handleSortChange = (newSort: SortOption) => {
    if (newSort === sortBy) {
      setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"));
    } else {
      setSortBy(newSort);
      setSortDirection("desc");
    }
  };

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "popular", label: "Popularit&eacute;" },
    { value: "rating", label: "Note" },
    { value: "recent", label: "R&eacute;cent" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header user={currentUser} />

      <main className="flex-1 w-full max-w-[1500px] mx-auto px-5 py-10 lg:py-[80px]">
        {/* Search Header */}
        <div className="flex flex-col gap-8 mb-10">
          {/* Search Input */}
          <div className="max-w-[600px] mx-auto w-full">
            <Input
              variant="search"
              placeholder="Rechercher un livre, une liste, un auteur..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {/* Tabs */}
          <div className="flex justify-center gap-5 border-b border-gray/20">
            <button
              onClick={() => setActiveTab("books")}
              className={`pb-3 text-body font-medium tracking-tight transition-colors ${
                activeTab === "books"
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray hover:text-dark"
              }`}
            >
              Livres ({filteredBooks.length})
            </button>
            <button
              onClick={() => setActiveTab("lists")}
              className={`pb-3 text-body font-medium tracking-tight transition-colors ${
                activeTab === "lists"
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray hover:text-dark"
              }`}
            >
              Listes ({filteredLists.length})
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`pb-3 text-body font-medium tracking-tight transition-colors ${
                activeTab === "users"
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray hover:text-dark"
              }`}
            >
              Utilisateurs
            </button>
          </div>

          {/* Sort Options (only for books) */}
          {activeTab === "books" && (
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="text-body font-medium text-gray">Trier par :</span>
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg text-body font-medium tracking-tight transition-colors ${
                    sortBy === option.value
                      ? "bg-dark text-white"
                      : "bg-gray/10 text-dark hover:bg-gray/20"
                  }`}
                >
                  <span dangerouslySetInnerHTML={{ __html: option.label }} />
                  {sortBy === option.value && (
                    sortDirection === "desc" ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronUp className="w-4 h-4" />
                    )
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Results */}
        {activeTab === "books" && (
          <div className="flex flex-col gap-8">
            {sortedBooks.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                {sortedBooks.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    size="md"
                    showTitle
                    showAuthor
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <p className="text-t3 font-semibold text-dark">
                  Aucun livre trouv&eacute;
                </p>
                <p className="text-body text-gray">
                  Essayez avec d&apos;autres mots-cl&eacute;s
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "lists" && (
          <div className="flex flex-col gap-8">
            {filteredLists.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredLists.map((list) => (
                  <ListCard key={list.id} list={list} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <p className="text-t3 font-semibold text-dark">
                  Aucune liste trouv&eacute;e
                </p>
                <p className="text-body text-gray">
                  Essayez avec d&apos;autres mots-cl&eacute;s
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "users" && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <p className="text-t3 font-semibold text-dark">
              Recherche d&apos;utilisateurs
            </p>
            <p className="text-body text-gray">
              Cette fonctionnalit&eacute; arrive bient&ocirc;t
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col bg-white">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-body text-gray">Chargement...</p>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
