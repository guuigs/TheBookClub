"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { BookCard, AddBookModal } from "@/components/features";
import { Pagination } from "@/components/ui";
import { createClient } from "@/lib/supabase/browser";
import type { Book } from "@/types";

type SortOption = "popular" | "rating" | "recent";
type SortDirection = "asc" | "desc";

interface BookWithDate extends Book {
  createdAt: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapBookRow(row: any): BookWithDate {
  return {
    id: row.id,
    title: row.title,
    author: {
      id: row.author_id ?? "",
      name: row.author_name ?? "Auteur inconnu",
      bio: row.author_bio ?? undefined,
      photoUrl: row.author_photo_url ?? undefined,
      booksCount: 0,
    },
    coverUrl: row.cover_url ?? "",
    description: row.description ?? "",
    genre: row.genre ?? "",
    averageRating: Number(row.average_rating ?? 0),
    totalVotes: Number(row.total_votes ?? 0),
    ratingDistribution: [],
    createdAt: row.created_at ?? "",
  };
}

function BooksContent() {
  const searchParams = useSearchParams();
  const initialSort = (searchParams.get("sort") as SortOption) || "popular";

  const [books, setBooks] = useState<BookWithDate[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>(initialSort);
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [userRatings, setUserRatings] = useState<Map<string, number>>(new Map());
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const ITEMS_PER_PAGE = 24;

  useEffect(() => {
    const supabase = createClient();

    async function fetchData() {
      const { data } = await supabase
        .from("books_with_stats")
        .select("*");
      if (data) {
        setBooks(data.map(mapBookRow));

        // Fetch user ratings
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: ratingsData } = await supabase
            .from("ratings")
            .select("book_id, score")
            .eq("user_id", user.id);
          if (ratingsData) {
            setUserRatings(new Map(ratingsData.map(r => [r.book_id, r.score])));
          }
        }
      }
    }

    fetchData();
  }, []);

  const sortedBooks = useMemo(() => {
    return [...books].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "popular":
          comparison = b.totalVotes - a.totalVotes;
          break;
        case "rating":
          comparison = b.averageRating - a.averageRating;
          break;
        case "recent":
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          break;
      }
      return sortDirection === "desc" ? comparison : -comparison;
    });
  }, [books, sortBy, sortDirection]);

  const totalPages = Math.ceil(sortedBooks.length / ITEMS_PER_PAGE);
  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedBooks.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedBooks, currentPage]);

  // Reset to page 1 when sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy, sortDirection]);

  const handleSortChange = (newSort: SortOption) => {
    if (newSort === sortBy) {
      setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"));
    } else {
      setSortBy(newSort);
      setSortDirection("desc");
    }
  };

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "popular", label: "Popularité" },
    { value: "rating", label: "Note" },
    { value: "recent", label: "Récent" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main id="main-content" className="flex-1 w-[320px] tablet:w-[700px] desktop:w-[1200px] mx-auto py-10 desktop:py-[80px]">
        <h1 className="sr-only">Livres</h1>

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

        <div className="grid grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-4 gap-5" aria-live="polite">
          {paginatedBooks.map((book) => (
            <BookCard key={book.id} book={book} size="md" showTitle showAuthor myRating={userRatings.get(book.id) ?? null} />
          ))}
        </div>

        {sortedBooks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4" role="status" aria-live="polite">
            <p className="text-t3 font-semibold text-dark">Aucun livre trouvé</p>
          </div>
        )}

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            className="mt-10"
          />
        )}

        <div className="flex justify-center pt-8 mt-4 border-t border-gray/10">
          <button
            onClick={() => setIsAddBookOpen(true)}
            className="text-body text-gray hover:text-dark transition-colors underline underline-offset-4"
          >
            Vous ne trouvez pas votre livre ? Ajoutez-le
          </button>
        </div>
      </main>

      <AddBookModal isOpen={isAddBookOpen} onClose={() => setIsAddBookOpen(false)} />

      <Footer />
    </div>
  );
}

export default function BooksPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col bg-white">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-body text-gray">Chargement...</p>
        </div>
      </div>
    }>
      <BooksContent />
    </Suspense>
  );
}
