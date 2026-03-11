"use client";

import { useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui";
import {
  RatingBlock,
  CommentCard,
  BookCard,
  ListCard,
  FriendActivityCard,
  SectionHeader,
} from "@/components/features";
import {
  books,
  getBookById,
  getCommentsByBookId,
  getBooksByAuthorId,
  getListsContainingBook,
  getFriendsActivity,
  currentUser,
} from "@/lib/data";

export default function BookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [isSynopsisExpanded, setIsSynopsisExpanded] = useState(false);

  // Get book data from local store
  const book = getBookById(id);

  if (!book) {
    notFound();
  }

  // Get related data
  const comments = getCommentsByBookId(id);
  const authorBooks = getBooksByAuthorId(book.author.id).filter(
    (b) => b.id !== id
  );
  const relatedLists = getListsContainingBook(id);
  const friendsActivity = getFriendsActivity(currentUser.id);

  // Synopsis truncation
  const maxSynopsisLength = 300;
  const shouldTruncateSynopsis = book.description.length > maxSynopsisLength;
  const displayedSynopsis =
    shouldTruncateSynopsis && !isSynopsisExpanded
      ? book.description.slice(0, maxSynopsisLength) + "..."
      : book.description;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header user={currentUser} />

      <main className="flex-1 w-full max-w-[1500px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-20 px-5 py-10 lg:py-[120px]">
          {/* Left Sidebar - Rating + Cover (sticky on desktop) */}
          <aside className="lg:sticky lg:top-[120px] lg:self-start flex flex-col gap-10 w-full lg:w-[220px] shrink-0 order-2 lg:order-1">
            {/* Rating Block */}
            <RatingBlock
              averageRating={book.averageRating}
              totalVotes={book.totalVotes}
              ratingDistribution={book.ratingDistribution}
            />

            {/* Book Cover */}
            <div className="relative w-[220px] h-[330px] bg-cream overflow-hidden mx-auto lg:mx-0">
              {book.coverUrl ? (
                <Image
                  src={book.coverUrl}
                  alt={`Couverture de ${book.title}`}
                  fill
                  className="object-cover"
                  sizes="220px"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-cream to-gray/20">
                  <p className="font-display text-lg text-dark text-center px-4 leading-tight">
                    {book.title}
                  </p>
                </div>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex flex-col gap-[60px] flex-1 max-w-[800px] order-1 lg:order-2 mx-auto lg:mx-0">
            {/* Title & Description */}
            <section className="flex flex-col gap-6">
              <h1 className="font-display text-t2 md:text-t1 text-dark tracking-tight">
                {book.title}
              </h1>
              <div className="flex flex-col gap-2 items-start">
                <p className="text-body font-medium text-dark tracking-tight leading-relaxed">
                  {displayedSynopsis}
                </p>
                {shouldTruncateSynopsis && (
                  <Button
                    variant="discrete"
                    size="sm"
                    onClick={() => setIsSynopsisExpanded(!isSynopsisExpanded)}
                  >
                    {isSynopsisExpanded ? "voir moins" : "voir plus"}
                  </Button>
                )}
              </div>
            </section>

            {/* Action Buttons */}
            <section className="flex flex-wrap gap-3 md:gap-5">
              <Button variant="primary">Noter</Button>
              <Button variant="primary">Ajouter à une liste</Button>
              <Button variant="primary">Modifier</Button>
              <Button variant="primary">Partager</Button>
            </section>

            {/* Book Info Grid */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-[70px]">
              {/* Column 1: Author, Date, Genre */}
              <div className="flex flex-col gap-7">
                <div className="flex flex-col gap-3 items-start">
                  <span className="text-body font-medium text-gray tracking-tight">
                    Auteur
                  </span>
                  <Link
                    href={`/authors/${book.author.id}`}
                    className="text-body font-medium text-dark tracking-tight hover:text-primary transition-colors"
                  >
                    {book.author.name}
                  </Link>
                </div>
                <div className="flex flex-col gap-3 items-start">
                  <span className="text-body font-medium text-gray tracking-tight">
                    Date de parution
                  </span>
                  <span className="text-body font-medium text-dark tracking-tight">
                    {book.publishedYear}
                  </span>
                </div>
                <div className="flex flex-col gap-3 items-start">
                  <span className="text-body font-medium text-gray tracking-tight">
                    Genre
                  </span>
                  <span className="text-body font-medium text-dark tracking-tight">
                    {book.genre}
                  </span>
                </div>
              </div>

              {/* Column 2: Free Reading, Buy */}
              <div className="flex flex-col gap-7">
                <div className="flex flex-col gap-3 items-start">
                  <span className="text-body font-medium text-gray tracking-tight">
                    Lecture en ligne gratuit
                  </span>
                  <div className="flex flex-col gap-2 items-start">
                    <Button variant="discrete" size="sm">
                      pdf 1
                    </Button>
                    <Button variant="discrete" size="sm">
                      pdf 2
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col gap-3 items-start">
                  <span className="text-body font-medium text-gray tracking-tight">
                    Acheter le livre
                  </span>
                  <div className="flex flex-col gap-2 items-start">
                    <Button variant="discrete" size="sm">
                      lien 1
                    </Button>
                  </div>
                </div>
              </div>

              {/* Column 3: Affiliated Bookstores */}
              <div className="flex flex-col gap-3 items-start">
                <span className="text-body font-medium text-gray tracking-tight">
                  Les librairies du club
                </span>
                <p className="text-small font-medium text-gray tracking-tight leading-relaxed">
                  Le Book Club est affilié à une série de librairies
                  indépendantes partout en France. Achetez vos livres là-bas et
                  profitez d&apos;une réduction de 5% à l&apos;achat.
                </p>
                <Button variant="discrete" size="sm">
                  voir les librairies affiliées
                </Button>
              </div>
            </section>

            {/* Friend Activity */}
            {friendsActivity.length > 0 && (
              <section className="flex flex-col gap-7">
                <SectionHeader
                  title="Activité de mes amis"
                  seeMoreHref={`/books/${id}/friends`}
                />
                <div className="flex gap-5 overflow-x-auto pb-2">
                  {friendsActivity.map((friend, index) => (
                    <FriendActivityCard
                      key={friend.id}
                      user={friend}
                      rating={6 + index * 2}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Friend Comments */}
            {comments.length > 0 && (
              <section className="flex flex-col gap-7">
                <SectionHeader
                  title="Commentaires de mes amis"
                  seeMoreHref={`/books/${id}/friends/comments`}
                />
                <CommentCard comment={comments[0]} />
              </section>
            )}

            {/* Popular Comments */}
            {comments.length > 0 && (
              <section className="flex flex-col gap-7">
                <SectionHeader
                  title="Commentaires populaires"
                  seeMoreHref={`/books/${id}/comments`}
                />
                <div className="flex flex-col gap-5">
                  {comments.slice(0, 4).map((comment) => (
                    <CommentCard key={comment.id} comment={comment} />
                  ))}
                </div>
              </section>
            )}

            {/* Same Author */}
            {authorBooks.length > 0 && (
              <section className="flex flex-col gap-7">
                <SectionHeader
                  title="Du même auteur"
                  seeMoreHref={`/authors/${book.author.id}`}
                />
                <div className="flex gap-5 overflow-x-auto pb-2">
                  {authorBooks.slice(0, 4).map((relatedBook) => (
                    <BookCard
                      key={relatedBook.id}
                      book={relatedBook}
                      size="md"
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Related Lists */}
            {relatedLists.length > 0 && (
              <section className="flex flex-col gap-7">
                <SectionHeader
                  title="Listes associées"
                  seeMoreHref={`/books/${id}/lists`}
                />
                <div className="flex flex-col md:flex-row gap-5 overflow-x-auto pb-2">
                  {relatedLists.slice(0, 2).map((list) => (
                    <ListCard key={list.id} list={list} />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
