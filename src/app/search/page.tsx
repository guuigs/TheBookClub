"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { Input } from "@/components/ui";
import { BookCard, ListCard, MemberCard } from "@/components/features";
import { createClient } from "@/lib/supabase/browser";
import type { Book, BookList, User, MemberBadge } from "@/types";

type SearchTab = "books" | "lists" | "users";
type SortOption = "popular" | "rating" | "recent";
type SortDirection = "asc" | "desc";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapBook(row: any): Book {
  return {
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
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapUser(row: any): User {
  return {
    id: row.id,
    username: row.username ?? "",
    displayName: row.display_name ?? "",
    avatarUrl: row.avatar_url ?? undefined,
    badge: (row.badge as MemberBadge) ?? "member",
    booksRead: Number(row.books_rated ?? 0),
    listsCount: Number(row.lists_count ?? 0),
    followersCount: Number(row.followers_count ?? 0),
    followingCount: Number(row.following_count ?? 0),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapList(row: any): BookList {
  const author = row.author ?? {};
  const items = row.items ?? [];
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    author: {
      id: author.id ?? "",
      username: author.username ?? "",
      displayName: author.display_name ?? "Inconnu",
      avatarUrl: author.avatar_url ?? undefined,
      badge: (author.badge as MemberBadge) ?? "member",
      booksRead: 0,
      listsCount: 0,
      followersCount: 0,
      followingCount: 0,
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    books: items.map((item: any) => ({
      id: item.book?.id ?? "",
      title: item.book?.title ?? "",
      author: { id: "", name: "", booksCount: 0 },
      coverUrl: item.book?.cover_url ?? "",
      description: "",
      publishedYear: 0,
      genre: "",
      averageRating: 0,
      totalVotes: 0,
      ratingDistribution: [],
    })),
    booksCount: Number(row.books_count?.[0]?.count ?? 0),
    likesCount: Number(row.likes_count?.[0]?.count ?? 0),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at ?? row.created_at),
  };
}

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [allLists, setAllLists] = useState<BookList[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<SearchTab>("books");
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  useEffect(() => {
    const supabase = createClient();
    supabase.from("books_with_stats").select("*").then(({ data }) => {
      if (data) setAllBooks(data.map(mapBook));
    });
    supabase
      .from("book_lists")
      .select(
        `id, title, description, author_id, created_at, updated_at,
         author:profiles(id, username, display_name, avatar_url, badge),
         items:book_list_items(book:books(id, title, cover_url, author_id)),
         likes_count:list_likes(count),
         books_count:book_list_items(count)`
      )
      .then(({ data }) => {
        if (data) setAllLists(data.map(mapList));
      });
    supabase
      .from("profiles_with_stats")
      .select("*")
      .then(({ data }) => {
        if (data) setAllUsers(data.map(mapUser));
      });
  }, []);

  const filteredBooks = useMemo(() => {
    if (!query.trim()) return allBooks;
    const q = query.toLowerCase();
    return allBooks.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.author.name.toLowerCase().includes(q) ||
        b.genre.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q)
    );
  }, [allBooks, query]);

  const sortedBooks = useMemo(() => {
    return [...filteredBooks].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "popular": comparison = b.totalVotes - a.totalVotes; break;
        case "rating":  comparison = b.averageRating - a.averageRating; break;
        case "recent":  comparison = b.publishedYear - a.publishedYear; break;
      }
      return sortDirection === "desc" ? comparison : -comparison;
    });
  }, [filteredBooks, sortBy, sortDirection]);

  const filteredLists = useMemo(() => {
    if (!query.trim()) return allLists;
    const q = query.toLowerCase();
    return allLists.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.description?.toLowerCase().includes(q)
    );
  }, [allLists, query]);

  const filteredUsers = useMemo(() => {
    if (!query.trim()) return allUsers;
    const q = query.toLowerCase();
    return allUsers.filter(
      (u) =>
        u.displayName.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q)
    );
  }, [allUsers, query]);

  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => b.followersCount - a.followersCount);
  }, [filteredUsers]);

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

      <main id="main-content" className="flex-1 w-full max-w-[1500px] mx-auto px-5 py-10 lg:py-[80px]">
        <h1 className="sr-only">Recherche</h1>

        <div className="flex flex-col gap-8 mb-10">
          <div className="max-w-[600px] mx-auto w-full">
            <Input
              variant="search"
              placeholder="Rechercher un livre, une liste, un auteur..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Rechercher un livre, une liste ou un auteur"
            />
          </div>

          <div role="tablist" className="flex justify-center gap-5 border-b border-gray/20">
            {(["books", "lists", "users"] as SearchTab[]).map((tab) => (
              <button
                key={tab}
                role="tab"
                aria-selected={activeTab === tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-body font-medium tracking-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm ${
                  activeTab === tab
                    ? "text-primary border-b-2 border-primary"
                    : "text-gray hover:text-dark"
                }`}
              >
                {tab === "books" && `Livres (${filteredBooks.length})`}
                {tab === "lists" && `Listes (${filteredLists.length})`}
                {tab === "users" && `Utilisateurs (${filteredUsers.length})`}
              </button>
            ))}
          </div>

          {activeTab === "books" && (
            <div className="flex flex-wrap items-center justify-center gap-3" role="toolbar">
              <span className="text-body font-medium text-gray" aria-hidden="true">Trier par :</span>
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
                  aria-pressed={sortBy === option.value}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium tracking-tight transition-colors ${
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
        </div>

        {activeTab === "books" && (
          sortedBooks.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
              {sortedBooks.map((book) => (
                <BookCard key={book.id} book={book} size="md" showTitle showAuthor />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <p className="text-t3 font-semibold text-dark">Aucun livre trouvé</p>
              <p className="text-body text-gray">Essayez avec d&apos;autres mots-clés</p>
            </div>
          )
        )}

        {activeTab === "lists" && (
          filteredLists.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredLists.map((list) => (
                <ListCard key={list.id} list={list} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <p className="text-t3 font-semibold text-dark">Aucune liste trouvée</p>
              <p className="text-body text-gray">Essayez avec d&apos;autres mots-clés</p>
            </div>
          )
        )}

        {activeTab === "users" && (
          sortedUsers.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
              {sortedUsers.map((user) => (
                <MemberCard key={user.id} user={user} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <p className="text-t3 font-semibold text-dark">Aucun utilisateur trouvé</p>
              <p className="text-body text-gray">Essayez avec d&apos;autres mots-clés</p>
            </div>
          )
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
