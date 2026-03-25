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
        <section className="flex flex-col items-center px-5 pt-8 tablet:pt-12 desktop:pt-16" aria-label="Présentation">
          {/* Title + Stars */}
          <div className="flex flex-col items-center gap-5 tablet:gap-6 desktop:gap-7 mb-10 tablet:mb-12 desktop:mb-[60px]">
            <h1 className="text-[22px] tablet:text-[36px] desktop:text-[48px] font-semibold text-dark tracking-[-0.02em] text-center">
              vos livres, vos avis
            </h1>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <svg
                  key={i}
                  className="w-5 h-5 tablet:w-6 tablet:h-6 desktop:w-[30px] desktop:h-[30px] text-primary"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
            </div>
          </div>

          {/* Image with Search Bar - respects 3 widths */}
          <div className="relative w-[320px] tablet:w-[700px] desktop:w-[1200px] h-[200px] tablet:h-[300px] desktop:h-[400px] rounded-lg overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center"
              aria-hidden="true"
              style={{
                backgroundImage: "url('/images/homepage-herosection-background.png')",
              }}
            >
              <div className="absolute inset-0 bg-black/20" />
            </div>

            {/* Search Bar centered in image */}
            <div className="relative h-full flex items-center justify-center px-5">
              <form onSubmit={handleSearch} className="w-full max-w-[280px] tablet:max-w-[400px] desktop:max-w-[517px]">
                <div className="relative flex items-center gap-2 bg-[#f0f0f0] border border-[#d5d5d5] rounded-lg px-5 py-3 tablet:py-4">
                  <Search className="w-5 h-5 text-gray shrink-0" aria-hidden="true" />
                  <input
                    type="text"
                    aria-label="Rechercher un livre"
                    placeholder="Rechercher un livre..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent text-dark placeholder:text-[#a7a7a7] text-body tablet:text-[18px] font-semibold tracking-tight focus:outline-none"
                  />
                </div>
              </form>
            </div>
          </div>
        </section>

        <div className="flex flex-col items-center gap-[60px] tablet:gap-[80px] py-[40px] tablet:py-[60px]">

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
