"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import { Button, InteractiveStarRating } from "@/components/ui";
import {
  RatingBlock,
  CommentCard,
  BookCard,
  SectionHeader,
} from "@/components/features";
import { createClient } from "@/lib/supabase/browser";
import { upsertRating, getUserRating } from "@/lib/db/ratings";
import { createComment } from "@/lib/db/comments";
import type { Book, Comment, MemberBadge } from "@/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapBook(row: any): Book {
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
    publishedYear: row.published_year ?? 0,
    genre: row.genre ?? "",
    averageRating: Number(row.average_rating ?? 0),
    totalVotes: Number(row.total_votes ?? 0),
    ratingDistribution: [],
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapComment(row: any): Comment {
  const user = row.user ?? {};
  return {
    id: row.id,
    user: {
      id: user.id ?? "",
      username: user.username ?? "",
      displayName: user.display_name ?? "",
      avatarUrl: user.avatar_url ?? undefined,
      badge: (user.badge as MemberBadge) ?? "member",
      booksRead: 0,
      listsCount: 0,
      followersCount: 0,
      followingCount: 0,
    },
    bookId: row.book_id,
    content: row.content,
    createdAt: new Date(row.created_at),
    likesCount: Number(row.likes_count?.[0]?.count ?? 0),
    isLikedByCurrentUser: false,
  };
}

export default function BookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [book, setBook] = useState<Book | null>(null);
  const [bookNotFound, setBookNotFound] = useState(false);
  const [authorBooks, setAuthorBooks] = useState<Book[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isSynopsisExpanded, setIsSynopsisExpanded] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [myRating, setMyRating] = useState<number | null>(null);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase
      .from("books_with_stats")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        if (!data) {
          setBookNotFound(true);
        } else {
          const b = mapBook(data);
          setBook(b);

          supabase
            .from("books_with_stats")
            .select("*")
            .eq("author_id", b.author.id)
            .neq("id", id)
            .limit(4)
            .then(({ data: ab }) => {
              if (ab) setAuthorBooks(ab.map(mapBook));
            });
        }
      });

    supabase
      .from("comments")
      .select(
        `*, user:profiles(id, username, display_name, avatar_url, badge),
         likes_count:comment_likes(count)`
      )
      .eq("book_id", id)
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }) => {
        if (data) setComments(data.map(mapComment));
      });

    getUserRating(id).then(setMyRating);
  }, [id]);

  const handleRatingChange = async (rating: number) => {
    setMyRating(rating);
    await upsertRating(id, rating);
    const supabase = createClient();
    const { data } = await supabase
      .from("books_with_stats")
      .select("average_rating, total_votes")
      .eq("id", id)
      .single();
    if (data && book) {
      setBook({
        ...book,
        averageRating: Number(data.average_rating),
        totalVotes: Number(data.total_votes),
      });
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;
    setIsSubmittingComment(true);
    const { error } = await createComment(id, commentText.trim());
    if (!error) {
      setCommentText("");
      setShowCommentModal(false);
      const supabase = createClient();
      const { data } = await supabase
        .from("comments")
        .select(
          `*, user:profiles(id, username, display_name, avatar_url, badge),
           likes_count:comment_likes(count)`
        )
        .eq("book_id", id)
        .order("created_at", { ascending: false })
        .limit(10);
      if (data) setComments(data.map(mapComment));
    }
    setIsSubmittingComment(false);
  };

  if (bookNotFound) notFound();

  if (!book) {
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

  const maxSynopsisLength = 300;
  const shouldTruncate = book.description.length > maxSynopsisLength;
  const displayedSynopsis =
    shouldTruncate && !isSynopsisExpanded
      ? book.description.slice(0, maxSynopsisLength) + "..."
      : book.description;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 w-full px-5 py-10 lg:py-[120px]">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-20 max-w-[1100px] mx-auto">
          {/* Left Sidebar */}
          <aside className="lg:sticky lg:top-[80px] lg:self-start flex flex-col gap-10 w-full lg:w-[220px] shrink-0 order-2 lg:order-1">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <p className="text-[10px] font-semibold text-gray tracking-widest uppercase">Ma note</p>
                <InteractiveStarRating
                  value={myRating}
                  onChange={handleRatingChange}
                  size="md"
                />
              </div>
              <div className="w-full h-px bg-gray/20" />
              <div className="flex flex-col gap-2">
                <p className="text-[10px] font-semibold text-gray tracking-widest uppercase">Moyenne publique</p>
                <RatingBlock
                  averageRating={book.averageRating}
                  totalVotes={book.totalVotes}
                  ratingDistribution={book.ratingDistribution}
                />
              </div>
            </div>

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
          <div className="flex flex-col gap-[60px] flex-1 order-1 lg:order-2">
            <section className="flex flex-col gap-6">
              <h1 className="font-display text-t2 md:text-t1 text-dark tracking-tight">
                {book.title}
              </h1>
              <div className="flex flex-col gap-2 items-start">
                <p className="text-body font-medium text-dark tracking-tight leading-relaxed">
                  {displayedSynopsis}
                </p>
                {shouldTruncate && (
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

            <section className="flex flex-wrap items-center gap-3 md:gap-4">
              <button
                onClick={() => setShowCommentModal(true)}
                className="px-5 py-2.5 bg-dark text-white rounded-lg text-body font-medium tracking-tight hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dark focus-visible:ring-offset-2"
              >
                Commenter
              </button>
              <button
                onClick={() => setShowShareModal(true)}
                className="px-5 py-2.5 bg-white text-dark border border-dark rounded-lg text-body font-medium tracking-tight hover:bg-cream transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dark focus-visible:ring-offset-2"
              >
                Partager
              </button>
              <Link
                href="/contact?subject=modification"
                className="text-body font-medium text-gray underline underline-offset-2 hover:text-dark transition-colors"
              >
                Signaler une erreur
              </Link>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-[70px]">
              <div className="flex flex-col gap-7">
                <div className="flex flex-col gap-3 items-start">
                  <span className="text-body font-medium text-gray tracking-tight">Auteur</span>
                  <Link href={`/authors/${book.author.id}`} className="text-body font-medium text-dark tracking-tight hover:text-primary transition-colors">
                    {book.author.name}
                  </Link>
                </div>
                <div className="flex flex-col gap-3 items-start">
                  <span className="text-body font-medium text-gray tracking-tight">Date de parution</span>
                  <span className="text-body font-medium text-dark tracking-tight">{book.publishedYear}</span>
                </div>
                <div className="flex flex-col gap-3 items-start">
                  <span className="text-body font-medium text-gray tracking-tight">Genre</span>
                  <span className="text-body font-medium text-dark tracking-tight">{book.genre}</span>
                </div>
              </div>

              <div className="flex flex-col gap-7">
                <div className="flex flex-col gap-3 items-start">
                  <span className="text-body font-medium text-gray tracking-tight">Lecture en ligne gratuite</span>
                  <div className="flex flex-col gap-2 items-start">
                    <Button variant="discrete" size="sm">pdf 1</Button>
                    <Button variant="discrete" size="sm">pdf 2</Button>
                  </div>
                </div>
                <div className="flex flex-col gap-3 items-start">
                  <span className="text-body font-medium text-gray tracking-tight">Acheter le livre</span>
                  <Button variant="discrete" size="sm">lien 1</Button>
                </div>
              </div>

              <div className="flex flex-col gap-3 items-start">
                <span className="text-body font-medium text-gray tracking-tight">Les librairies du club</span>
                <p className="text-small font-medium text-gray tracking-tight leading-relaxed">
                  Le Book Club est affilié à une série de librairies indépendantes partout en France.
                  Achetez vos livres là-bas et profitez d&apos;une réduction de 5% à l&apos;achat.
                </p>
                <Button variant="discrete" size="sm">voir les librairies affiliées</Button>
              </div>
            </section>

            {comments.length > 0 && (
              <section className="flex flex-col gap-7">
                <SectionHeader title="Commentaires populaires" seeMoreHref={`/books/${id}/comments`} />
                <div className="flex flex-col gap-5">
                  {comments.slice(0, 4).map((comment) => (
                    <CommentCard key={comment.id} comment={comment} />
                  ))}
                </div>
              </section>
            )}

            {authorBooks.length > 0 && (
              <section className="flex flex-col gap-7">
                <SectionHeader title="Du même auteur" seeMoreHref={`/authors/${book.author.id}`} />
                <div className="flex gap-5 overflow-x-auto pb-2">
                  {authorBooks.map((relatedBook) => (
                    <BookCard key={relatedBook.id} book={relatedBook} size="md" />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* Comment Modal */}
      {showCommentModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-5"
          onClick={() => setShowCommentModal(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="comment-modal-title"
            className="bg-white rounded-xl p-8 w-full max-w-[500px] flex flex-col gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="comment-modal-title" className="font-display text-t2 text-dark tracking-tight">Commenter</h2>
            <p className="text-body text-gray font-medium">{book.title}</p>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value.slice(0, 2000))}
              placeholder="Partagez votre avis sur ce livre..."
              rows={5}
              maxLength={2000}
              className="w-full px-4 py-3 bg-gray/10 border border-gray/20 rounded-lg text-body text-dark placeholder:text-gray focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowCommentModal(false)} className="px-4 py-2 text-sm font-medium text-gray hover:text-dark transition-colors">
                Annuler
              </button>
              <button
                onClick={handleSubmitComment}
                disabled={!commentText.trim() || isSubmittingComment}
                className="px-5 py-2.5 bg-dark text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isSubmittingComment ? "Publication..." : "Publier"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-5"
          onClick={() => setShowShareModal(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-modal-title"
            className="bg-white rounded-xl p-8 w-full max-w-[400px] flex flex-col gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="share-modal-title" className="font-display text-t2 text-dark tracking-tight">Partager</h2>
            <p className="text-body text-gray font-medium">{book.title}</p>
            <div className="flex items-center gap-3 p-3 bg-gray/10 rounded-lg">
              <span className="text-sm font-medium text-dark flex-1 truncate">
                thebookclub.fr/books/{book.id}
              </span>
              <button
                onClick={() => navigator.clipboard.writeText(`thebookclub.fr/books/${book.id}`)}
                className="px-3 py-1.5 bg-dark text-white rounded-lg text-xs font-medium hover:opacity-90 transition-opacity shrink-0"
              >
                Copier
              </button>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowShareModal(false)} className="px-4 py-2 text-sm font-medium text-gray hover:text-dark transition-colors">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
