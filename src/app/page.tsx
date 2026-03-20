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
import { mapBook, mapCommentWithBook, mapList, mapUser } from "@/lib/mappers";
import type { Book, Comment, BookList, User } from "@/types";

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [popularBooks, setPopularBooks] = useState<Book[]>([]);
  const [recentComments, setRecentComments] = useState<{ comment: Comment; book: Book }[]>([]);
  const [popularLists, setPopularLists] = useState<BookList[]>([]);
  const [featuredMembers, setFeaturedMembers] = useState<User[]>([]);
  const [userRatings, setUserRatings] = useState<Map<string, number>>(new Map());

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Function to fetch all homepage data
  const fetchData = async () => {
    const supabase = createClient();

    // Get current user for ratings
    const { data: { user } } = await supabase.auth.getUser();

    // Popular books
    const { data: booksData } = await supabase
      .from("books_with_stats")
      .select("*")
      .order("total_votes", { ascending: false })
      .limit(4);
    if (booksData) setPopularBooks(booksData.map(mapBook));

    // Fetch user ratings if logged in
    if (user && booksData) {
      const bookIds = booksData.map(b => b.id);
      const { data: ratingsData } = await supabase
        .from("ratings")
        .select("book_id, score")
        .eq("user_id", user.id)
        .in("book_id", bookIds);
      if (ratingsData) {
        setUserRatings(new Map(ratingsData.map(r => [r.book_id, r.score])));
      }
    }

    // Recent comments with book info
    // Use explicit FK names to avoid "multiple relationships" error
    const { data: commentsData, error: commentsError } = await supabase
      .from("comments")
      .select(
        `*, user:profiles!comments_user_id_fkey(id, username, display_name, avatar_url, badge),
         book:books!comments_book_id_fkey(id, title, cover_url),
         likes_count:comment_likes(count)`
      )
      .order("created_at", { ascending: false })
      .limit(6);
    if (commentsError) {
      console.error("[Homepage] Comments fetch error:", commentsError.message);
    } else if (commentsData) {
      // Check which comments are liked by current user
      let likedCommentIds = new Set<string>();
      if (user) {
        const { data: likesData } = await supabase
          .from("comment_likes")
          .select("comment_id")
          .eq("user_id", user.id)
          .in("comment_id", commentsData.map(c => c.id));
        if (likesData) {
          likedCommentIds = new Set(likesData.map(l => l.comment_id));
        }
      }
      const mapped = commentsData.map(mapCommentWithBook);
      // Enrich with isLikedByCurrentUser
      mapped.forEach(item => {
        item.comment.isLikedByCurrentUser = likedCommentIds.has(item.comment.id);
      });
      setRecentComments(mapped);
    }

    // Popular lists
    // Use explicit FK names to avoid "multiple relationships" error
    const { data: listsData, error: listsError } = await supabase
      .from("book_lists")
      .select(
        `id, title, description, author_id, created_at, updated_at,
         author:profiles!book_lists_author_id_fkey(id, username, display_name, avatar_url, badge),
         items:book_list_items(book:books(id, title, cover_url, author_id)),
         likes_count:list_likes(count),
         books_count:book_list_items(count)`
      )
      .limit(4);
    if (listsError) {
      console.error("[Homepage] Lists fetch error:", listsError.message);
    } else if (listsData) {
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
    if (membersData) setFeaturedMembers(membersData.map(mapUser));
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
            <p className="font-display italic text-body tablet:text-t4 mb-6">
              since 2026
            </p>
            <Image src="/images/logo.svg" alt="The Book Club" width={220} height={142} className="object-contain invert" priority />
            <p className="font-display italic text-body tablet:text-t4 mt-6">
              your books, your reviews
            </p>
          </div>
        </section>

        <div className="flex flex-col items-center gap-[60px] tablet:gap-[80px] py-[40px] tablet:py-[60px]">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="w-[320px] tablet:w-[700px] desktop:w-[1200px]">
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
            <section className="w-[320px] tablet:w-[700px] desktop:w-[1200px]">
              <div className="flex flex-col gap-10">
                <SectionHeader title="Livres populaires en ce moment" seeMoreHref="/livres" className="text-t3" />
                <div className="grid grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-4 gap-5 justify-items-center">
                  {popularBooks.map((book) => (
                    <BookCard key={book.id} book={book} size="lg" showTitle showAuthor myRating={userRatings.get(book.id) ?? null} />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Comments */}
          <section className="w-[320px] tablet:w-[700px] desktop:w-[1200px]">
            <div className="flex flex-col gap-10">
              <SectionHeader title="Les commentaires de la semaine" seeMoreHref="/comments" className="text-t3" />
              {recentComments.length > 0 ? (
                <div className="grid grid-cols-1 tablet:grid-cols-2 gap-5">
                  {recentComments.map(({ comment, book }) => (
                    <HomeCommentCard key={comment.id} comment={comment} book={book} />
                  ))}
                </div>
              ) : (
                <p className="text-body text-gray text-center py-10">Aucun commentaire pour le moment.</p>
              )}
            </div>
          </section>

          {/* Popular Lists */}
          <section className="w-[320px] tablet:w-[700px] desktop:w-[1200px]">
            <div className="flex flex-col gap-10">
              <SectionHeader title="Listes populaires en ce moment" seeMoreHref="/listes" className="text-t3" />
              {popularLists.length > 0 ? (
                <div className="grid grid-cols-1 tablet:grid-cols-2 gap-5">
                  {popularLists.map((list) => (
                    <ListCard key={list.id} list={list} />
                  ))}
                </div>
              ) : (
                <p className="text-body text-gray text-center py-10">Aucune liste pour le moment.</p>
              )}
            </div>
          </section>

          {/* Members */}
          {featuredMembers.length > 0 && (
            <section className="w-[320px] tablet:w-[700px] desktop:w-[1200px]">
              <div className="flex flex-col gap-10">
                <SectionHeader title="Les membres du club à suivre" seeMoreHref="/membres" className="text-t3" />
                <div className="grid grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-4 gap-5 justify-items-center">
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
