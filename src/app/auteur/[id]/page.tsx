"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, notFound } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { BookCard } from "@/components/features";
import { createClient } from "@/lib/supabase/browser";
import type { Book } from "@/types";

type SortOption = "rating" | "popular";
type SortDirection = "asc" | "desc";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapBook(row: any): Book {
  return {
    id: row.id,
    title: row.title,
    author: {
      id: row.author_id ?? "",
      name: row.author_name ?? "",
      booksCount: 0,
    },
    coverUrl: row.cover_url ?? "",
    description: row.description ?? "",
    genre: row.genre ?? "",
    averageRating: Number(row.average_rating ?? 0),
    totalVotes: Number(row.total_votes ?? 0),
    ratingDistribution: [],
  };
}

interface Author {
  id: string;
  name: string;
}

export default function AuthorPage() {
  const params = useParams();
  const id = params.id as string;

  const [author, setAuthor] = useState<Author | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [userRatings, setUserRatings] = useState<Map<string, number>>(new Map());
  const [sortBy, setSortBy] = useState<SortOption>("rating");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function fetchData() {
      // Fetch author
      const { data: authorData } = await supabase
        .from("authors")
        .select("id, name")
        .eq("id", id)
        .single();

      if (!authorData) {
        setLoading(false);
        return;
      }

      setAuthor(authorData);

      // Fetch books
      const { data: booksData } = await supabase
        .from("books_with_stats")
        .select("*")
        .eq("author_id", id);

      const authorBooks = (booksData ?? []).map(mapBook);
      setBooks(authorBooks);

      // Fetch user ratings
      const { data: { user } } = await supabase.auth.getUser();
      if (user && authorBooks.length > 0) {
        const { data: ratingsData } = await supabase
          .from("ratings")
          .select("book_id, score")
          .eq("user_id", user.id)
          .in("book_id", authorBooks.map(b => b.id));
        if (ratingsData) {
          setUserRatings(new Map(ratingsData.map(r => [r.book_id, r.score])));
        }
      }

      setLoading(false);
    }

    fetchData();
  }, [id]);

  const sortedBooks = useMemo(() => {
    return [...books].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "rating":
          comparison = b.averageRating - a.averageRating;
          break;
        case "popular":
          comparison = b.totalVotes - a.totalVotes;
          break;
      }
      return sortDirection === "desc" ? comparison : -comparison;
    });
  }, [books, sortBy, sortDirection]);

  const handleSortChange = (newSort: SortOption) => {
    if (newSort === sortBy) {
      setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"));
    } else {
      setSortBy(newSort);
      setSortDirection("desc");
    }
  };

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "rating", label: "Note" },
    { value: "popular", label: "Popularité" },
  ];

  const ratedBooks = books.filter(b => b.totalVotes > 0);
  const avgRating =
    ratedBooks.length > 0
      ? (ratedBooks.reduce((sum, b) => sum + b.averageRating, 0) / ratedBooks.length).toFixed(1)
      : null;

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

  if (!author) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 w-[320px] tablet:w-[700px] desktop:w-[1200px] mx-auto py-16 desktop:py-[120px]">
        {/* Header */}
        <div className="flex flex-col gap-3 mb-10">
          <h1 className="font-display text-t1 text-dark tracking-tight leading-none">
            {author.name}
          </h1>
          <div className="flex items-center gap-5 text-body text-gray">
            <span>{books.length} livre{books.length !== 1 ? "s" : ""}</span>
            {avgRating && <span>{avgRating}/10 note moyenne</span>}
          </div>
        </div>

        {/* Sort options */}
        {books.length > 1 && (
          <div className="flex flex-wrap items-center gap-3 mb-10" role="toolbar" aria-label="Options de tri">
            <span className="text-body font-medium text-gray" aria-hidden="true">Trier par :</span>
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSortChange(option.value)}
                aria-pressed={sortBy === option.value}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium tracking-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                  sortBy === option.value
                    ? "bg-dark text-white"
                    : "bg-gray/10 text-dark hover:bg-gray/20"
                }`}
              >
                {option.label}
                {sortBy === option.value &&
                  (sortDirection === "desc" ? (
                    <ChevronDown className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <ChevronUp className="w-4 h-4" aria-hidden="true" />
                  ))}
              </button>
            ))}
          </div>
        )}

        {/* Books grid */}
        {sortedBooks.length > 0 ? (
          <div className="grid grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-4 gap-5 justify-items-center">
            {sortedBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                size="lg"
                showTitle
                showAuthor={false}
                myRating={userRatings.get(book.id) ?? null}
              />
            ))}
          </div>
        ) : (
          <p className="text-body text-gray text-center py-10">
            Aucun livre de cet auteur n&apos;est encore répertorié.
          </p>
        )}
      </main>

      <Footer />
    </div>
  );
}
