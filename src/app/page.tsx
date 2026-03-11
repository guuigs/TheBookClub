"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Header, Footer } from "@/components/layout";
import {
  HomeBookCard,
  HomeCommentCard,
  ListCard,
  MemberCard,
  SectionHeader,
} from "@/components/features";
import {
  books,
  bookLists,
  comments,
  users,
  currentUser,
  getBookById,
} from "@/lib/data";

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Get popular books
  const popularBooks = [...books]
    .sort((a, b) => b.totalVotes - a.totalVotes)
    .slice(0, 4);

  // Get recent comments with their books
  const recentComments = comments.slice(0, 6).map((comment) => ({
    comment,
    book: getBookById(comment.bookId)!,
  }));

  // Get popular lists
  const popularLists = [...bookLists]
    .sort((a, b) => b.likesCount - a.likesCount)
    .slice(0, 4);

  // Get featured members
  const featuredMembers = users.slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header user={currentUser} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[600px] w-full overflow-hidden">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('/images/hero-bg.jpg')",
            }}
          >
            <div className="absolute inset-0 bg-black/30" />
          </div>

          {/* Hero Content */}
          <div className="relative h-full flex flex-col items-center justify-center text-white px-5">
            <p className="font-display italic text-[20px] md:text-[24px] mb-6">
              since 2026
            </p>
            <div className="flex flex-col items-center gap-3 md:gap-5 text-center">
              <span className="font-display text-[40px] md:text-[50px]">
                The
              </span>
              <span className="font-sans font-normal text-[70px] md:text-[100px] leading-none">
                BOOK
              </span>
              <span className="font-display text-[40px] md:text-[50px]">
                Club
              </span>
            </div>
            <p className="font-display italic text-[18px] md:text-[24px] mt-6">
              your books, your reviews
            </p>
          </div>
        </section>

        {/* Main Content */}
        <div className="flex flex-col items-center gap-[80px] md:gap-[120px] py-[80px] md:py-[120px]">
          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="w-full max-w-[550px] px-5"
          >
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray" />
              <input
                type="text"
                placeholder="Rechercher un livre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-5 py-3 bg-dark text-white placeholder:text-gray rounded-lg text-body tracking-tight focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </form>

          {/* Popular Books Section */}
          <section className="w-full max-w-[1100px] px-5 mx-auto">
            <div className="flex flex-col gap-10">
              <SectionHeader
                title="Livres populaires en ce moment"
                seeMoreHref="/books?sort=popular"
                className="text-t3"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 justify-items-center">
                {popularBooks.map((book) => (
                  <HomeBookCard
                    key={book.id}
                    book={book}
                    commentsCount={
                      comments.filter((c) => c.bookId === book.id).length
                    }
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Comments Section */}
          <section className="w-full max-w-[1100px] px-5 mx-auto">
            <div className="flex flex-col gap-10">
              <SectionHeader
                title="Les commentaires de la semaine"
                seeMoreHref="/comments"
                className="text-t3"
              />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {recentComments.map(({ comment, book }) => (
                  <HomeCommentCard
                    key={comment.id}
                    comment={comment}
                    book={book}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Popular Lists Section */}
          <section className="w-full max-w-[1100px] px-5 mx-auto">
            <div className="flex flex-col gap-10">
              <SectionHeader
                title="Listes populaires en ce moment"
                seeMoreHref="/lists"
                className="text-t3"
              />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {popularLists.map((list) => (
                  <ListCard key={list.id} list={list} />
                ))}
              </div>
            </div>
          </section>

          {/* Members Section */}
          <section className="w-full max-w-[1100px] px-5 mx-auto">
            <div className="flex flex-col gap-10">
              <SectionHeader
                title="Les membres du club à suivre"
                seeMoreHref="/members"
                className="text-t3"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 justify-items-center">
                {featuredMembers.map((user) => (
                  <MemberCard key={user.id} user={user} />
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
