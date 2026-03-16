"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import Image from "next/image";
import { Header, Footer } from "@/components/layout";
import {
  BookCard,
  HomeCommentCard,
  ListCard,
  MemberCard,
  SectionHeader,
} from "@/components/features";
import { createClient } from "@/lib/supabase/browser";
import type { Book, Comment, BookList, User, MemberBadge } from "@/types";

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
function mapComment(row: any): { comment: Comment; book: Book } {
  const user = row.user ?? {};
  return {
    comment: {
      id: row.id,
      user: {
        id: user.id ?? "",
        username: user.username ?? "",
        displayName: user.display_name ?? "",
        avatarUrl: user.avatar_url ?? undefined,
        badge: user.badge ?? "member",
        booksRead: 0,
        listsCount: 0,
        followersCount: 0,
        followingCount: 0,
      },
      bookId: row.book_id,
      content: row.content,
      createdAt: new Date(row.created_at),
      likesCount: Number(row.likes_count?.[0]?.count ?? 0),
    },
    book: row.book
      ? {
          id: row.book.id,
          title: row.book.title,
          author: { id: "", name: "", booksCount: 0 },
          coverUrl: row.book.cover_url ?? "",
          description: "",
          publishedYear: 0,
          genre: "",
          averageRating: 0,
          totalVotes: 0,
          ratingDistribution: [],
        }
      : {
          id: row.book_id,
          title: "",
          author: { id: "", name: "", booksCount: 0 },
          coverUrl: "",
          description: "",
          publishedYear: 0,
          genre: "",
          averageRating: 0,
          totalVotes: 0,
          ratingDistribution: [],
        },
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapProfile(row: any): User {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    avatarUrl: row.avatar_url ?? undefined,
    badge: (row.badge as MemberBadge) ?? "member",
    booksRead: Number(row.books_rated ?? 0),
    listsCount: Number(row.lists_count ?? 0),
    followersCount: Number(row.followers_count ?? 0),
    followingCount: Number(row.following_count ?? 0),
  };
}

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [popularBooks, setPopularBooks] = useState<Book[]>([]);
  const [recentComments, setRecentComments] = useState<{ comment: Comment; book: Book }[]>([]);
  const [popularLists, setPopularLists] = useState<BookList[]>([]);
  const [featuredMembers, setFeaturedMembers] = useState<User[]>([]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Function to fetch all homepage data
  const fetchData = async () => {
    const supabase = createClient();

    // Popular books
    const { data: booksData } = await supabase
      .from("books_with_stats")
      .select("*")
      .order("total_votes", { ascending: false })
      .limit(4);
    if (booksData) setPopularBooks(booksData.map(mapBook));

    // Recent comments with book info
    const { data: commentsData } = await supabase
      .from("comments")
      .select(
        `*, user:profiles(id, username, display_name, avatar_url, badge),
         book:books(id, title, cover_url),
         likes_count:comment_likes(count)`
      )
      .order("created_at", { ascending: false })
      .limit(6);
    if (commentsData) setRecentComments(commentsData.map(mapComment));

    // Popular lists
    const { data: listsData } = await supabase
      .from("book_lists")
      .select(
        `id, title, description, author_id, created_at, updated_at,
         author:profiles(id, username, display_name, avatar_url, badge),
         items:book_list_items(book:books(id, title, cover_url, author_id)),
         likes_count:list_likes(count),
         books_count:book_list_items(count)`
      )
      .limit(4);
    if (listsData) {
      const sorted = listsData
        .map(mapList)
        .sort((a, b) => b.likesCount - a.likesCount);
      setPopularLists(sorted);
    }

    // Featured members
    const { data: membersData } = await supabase
      .from("profiles_with_stats")
      .select("*")
      .order("followers_count", { ascending: false })
      .limit(5);
    if (membersData) setFeaturedMembers(membersData.map(mapProfile));
  };

  // Fetch on mount
  useEffect(() => {
    fetchData();
  }, []);

  // Refetch when page becomes visible (user returns from another page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchData();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main id="main-content" className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[600px] w-full overflow-hidden" aria-label="Présentation">
          <div
            className="absolute inset-0 bg-cover bg-center"
            aria-hidden="true"
            style={{
              backgroundImage: "url('/images/homepage-herosection-background.png')",
            }}
          >
            <div className="absolute inset-0 bg-black/30" />
          </div>

          <div className="relative h-full flex flex-col items-center justify-center text-white px-5">
            <p className="font-display italic text-[20px] md:text-[24px] mb-6">
              since 2026
            </p>
            <Image src="/images/logo.svg" alt="The Book Club" width={220} height={142} className="object-contain invert" priority />
            <p className="font-display italic text-[18px] md:text-[24px] mt-6">
              your books, your reviews
            </p>
          </div>
        </section>

        <div className="flex flex-col items-center gap-[60px] md:gap-[80px] py-[40px] md:py-[60px]">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="w-full max-w-[550px] px-5">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray" aria-hidden="true" />
              <input
                type="text"
                aria-label="Rechercher un livre"
                placeholder="Rechercher un livre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-5 py-3 bg-gray/10 text-dark placeholder:text-gray border border-gray/20 rounded-lg text-body tracking-tight focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </form>

          {/* Popular Books */}
          {popularBooks.length > 0 && (
            <section className="w-full max-w-[1100px] px-5 mx-auto">
              <div className="flex flex-col gap-10">
                <SectionHeader title="Livres populaires en ce moment" seeMoreHref="/books?sort=popular" className="text-t3" />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 justify-items-center">
                  {popularBooks.map((book) => (
                    <BookCard key={book.id} book={book} size="lg" showTitle showAuthor />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Comments */}
          {recentComments.length > 0 && (
            <section className="w-full max-w-[1100px] px-5 mx-auto">
              <div className="flex flex-col gap-10">
                <SectionHeader title="Les commentaires de la semaine" seeMoreHref="/comments" className="text-t3" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {recentComments.map(({ comment, book }) => (
                    <HomeCommentCard key={comment.id} comment={comment} book={book} />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Popular Lists */}
          {popularLists.length > 0 && (
            <section className="w-full max-w-[1100px] px-5 mx-auto">
              <div className="flex flex-col gap-10">
                <SectionHeader title="Listes populaires en ce moment" seeMoreHref="/lists" className="text-t3" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {popularLists.map((list) => (
                    <ListCard key={list.id} list={list} />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Members */}
          {featuredMembers.length > 0 && (
            <section className="w-full max-w-[1100px] px-5 mx-auto">
              <div className="flex flex-col gap-10">
                <SectionHeader title="Les membres du club à suivre" seeMoreHref="/members" className="text-t3" />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 justify-items-center">
                  {featuredMembers.map((member) => (
                    <MemberCard key={member.id} user={member} />
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
