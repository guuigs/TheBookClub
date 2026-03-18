"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import { Button, InteractiveStarRating, useToast } from "@/components/ui";
import {
  RatingBlock,
  CommentCard,
  BookCard,
  SectionHeader,
  BookStatusButton,
  ProfileCardWithRating,
} from "@/components/features";
import { createClient } from "@/lib/supabase/browser";
import { upsertRating, getUserRating, getRatingDistribution } from "@/lib/db/ratings";
import { createComment } from "@/lib/db/comments";
import { useAuth } from "@/context/AuthContext";
import type { Book, Comment, MemberBadge, User } from "@/types";

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
  const toast = useToast();
  const { requireAuth } = useAuth();

  const [book, setBook] = useState<Book | null>(null);
  const [bookNotFound, setBookNotFound] = useState(false);
  const [authorBooks, setAuthorBooks] = useState<Book[]>([]);
  const [authorBooksRatings, setAuthorBooksRatings] = useState<Map<string, number>>(new Map());
  const [comments, setComments] = useState<Comment[]>([]);
  const [isSynopsisExpanded, setIsSynopsisExpanded] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [myRating, setMyRating] = useState<number | null>(null);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [ratingDistribution, setRatingDistribution] = useState<number[]>(Array(10).fill(0));
  const [friendsRatings, setFriendsRatings] = useState<{ user: User; rating: number }[]>([]);
  const [friendsComments, setFriendsComments] = useState<Comment[]>([]);

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
            .then(async ({ data: ab }) => {
              if (ab) {
                const books = ab.map(mapBook);
                setAuthorBooks(books);

                // Fetch user ratings for these books
                const { data: { user } } = await supabase.auth.getUser();
                if (user && books.length > 0) {
                  const { data: ratings } = await supabase
                    .from("ratings")
                    .select("book_id, score")
                    .eq("user_id", user.id)
                    .in("book_id", books.map(book => book.id));
                  if (ratings) {
                    setAuthorBooksRatings(new Map(ratings.map(r => [r.book_id, r.score])));
                  }
                }
              }
            });
        }
      });

    supabase
      .from("comments")
      .select(
        `*, user:profiles!comments_user_id_fkey(id, username, display_name, avatar_url, badge),
         likes_count:comment_likes(count)`
      )
      .eq("book_id", id)
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }) => {
        if (data) setComments(data.map(mapComment));
      });

    getUserRating(id).then(setMyRating);
    getRatingDistribution(id).then(setRatingDistribution);

    // Fetch friends' ratings and comments for this book
    async function fetchFriendsData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get list of friends (users this user follows)
      const { data: followingData } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", user.id);

      if (!followingData || followingData.length === 0) return;

      const friendIds = followingData.map(f => f.following_id);

      // Get friends' ratings for this book
      const { data: friendsRatingsData } = await supabase
        .from("ratings")
        .select(`score, user:profiles!ratings_user_id_fkey(id, username, display_name, avatar_url, badge)`)
        .eq("book_id", id)
        .in("user_id", friendIds)
        .limit(4);

      if (friendsRatingsData) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapped = friendsRatingsData.map((r: any) => ({
          user: {
            id: r.user?.id ?? "",
            username: r.user?.username ?? "",
            displayName: r.user?.display_name ?? "",
            avatarUrl: r.user?.avatar_url ?? undefined,
            badge: (r.user?.badge as MemberBadge) ?? "member",
            booksRead: 0,
            listsCount: 0,
            followersCount: 0,
            followingCount: 0,
          },
          rating: r.score,
        }));
        setFriendsRatings(mapped);
      }

      // Get friends' comments for this book
      const { data: friendsCommentsData } = await supabase
        .from("comments")
        .select(`*, user:profiles!comments_user_id_fkey(id, username, display_name, avatar_url, badge), likes_count:comment_likes(count)`)
        .eq("book_id", id)
        .in("user_id", friendIds)
        .order("created_at", { ascending: false })
        .limit(4);

      if (friendsCommentsData) {
        setFriendsComments(friendsCommentsData.map(mapComment));
      }
    }

    fetchFriendsData();
  }, [id]);

  const performRatingChange = async (rating: number) => {
    setMyRating(rating);
    await upsertRating(id, rating);
    toast.success(`Note de ${rating}/10 enregistree`);
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
    // Refresh rating distribution
    getRatingDistribution(id).then(setRatingDistribution);
  };

  const handleRatingChange = (rating: number) => {
    requireAuth(() => performRatingChange(rating));
  };

  const handleOpenCommentModal = () => {
    requireAuth(() => setShowCommentModal(true));
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;
    setIsSubmittingComment(true);
    const { data: newComment, error } = await createComment(id, commentText.trim());
    if (!error && newComment) {
      setCommentText("");
      setShowCommentModal(false);
      toast.success("Commentaire publié !");
      // Add new comment at the top of the list
      setComments((prev) => [newComment, ...prev]);
    } else {
      toast.error(error ?? "Erreur lors de la publication");
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
                  ratingDistribution={ratingDistribution}
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
              <BookStatusButton bookId={id} />
              <Button variant="primary" size="md" onClick={handleOpenCommentModal}>
                Commenter
              </Button>
              <Button variant="secondary" size="md" onClick={() => setShowShareModal(true)}>
                Partager
              </Button>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-[70px]">
              <div className="flex flex-col gap-7">
                <div className="flex flex-col gap-1 items-start">
                  <span className="text-body font-medium text-gray tracking-tight">Auteur</span>
                  <Link href={`/auteur/${book.author.id}`} className="text-body font-medium text-dark tracking-tight hover:text-primary transition-colors">
                    {book.author.name}
                  </Link>
                </div>
                <div className="flex flex-col gap-1 items-start">
                  <span className="text-body font-medium text-gray tracking-tight">Date de parution</span>
                  <span className="text-body font-medium text-dark tracking-tight">{book.publishedYear}</span>
                </div>
                <div className="flex flex-col gap-1 items-start">
                  <span className="text-body font-medium text-gray tracking-tight">Genre</span>
                  <span className="text-body font-medium text-dark tracking-tight">{book.genre}</span>
                </div>
              </div>

              {/* External links section - hidden until real data is available
              <div className="flex flex-col gap-7">
                <div className="flex flex-col gap-3 items-start">
                  <span className="text-body font-medium text-gray tracking-tight">Lecture en ligne gratuite</span>
                  <div className="flex flex-col gap-2 items-start">
                    <Button variant="discrete" size="sm">pdf 1</Button>
                  </div>
                </div>
                <div className="flex flex-col gap-3 items-start">
                  <span className="text-body font-medium text-gray tracking-tight">Acheter le livre</span>
                  <Button variant="discrete" size="sm">lien 1</Button>
                </div>
              </div>
              */}

              <div className="flex flex-col gap-3 items-start">
                <span className="text-body font-medium text-gray tracking-tight">Les librairies du club</span>
                <p className="text-small font-medium text-gray tracking-tight leading-relaxed">
                  Le Book Club est affilié à une série de librairies indépendantes partout en France.
                  Achetez vos livres là-bas et profitez d&apos;une réduction de 5% à l&apos;achat.
                </p>
                <Link href="/librairies">
                  <Button variant="discrete" size="sm">voir les librairies affiliées</Button>
                </Link>
              </div>
            </section>

            {authorBooks.length > 0 && (
              <section className="flex flex-col gap-7">
                <SectionHeader title="Du même auteur" seeMoreHref={`/auteur/${book.author.id}`} />
                <div className="flex gap-5 overflow-x-auto pb-2">
                  {authorBooks.map((relatedBook) => (
                    <BookCard
                      key={relatedBook.id}
                      book={relatedBook}
                      size="md"
                      myRating={authorBooksRatings.get(relatedBook.id) ?? null}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Notes de mes amis */}
            <section className="flex flex-col gap-7">
              <SectionHeader
                title="Notes de mes amis"
                seeMoreHref={`/livres/${id}/friends`}
              />
              {friendsRatings.length > 0 ? (
                <div className="flex gap-5 overflow-x-auto pb-2">
                  {friendsRatings.slice(0, 4).map((item) => (
                    <ProfileCardWithRating
                      key={item.user.id}
                      user={item.user}
                      rating={item.rating}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-body text-gray">
                  Pas encore de note de mes amis.
                </p>
              )}
            </section>

            {/* Critiques de mes amis */}
            <section className="flex flex-col gap-7">
              <SectionHeader
                title="Critiques de mes amis"
                seeMoreHref={`/livres/${id}/friends/comments`}
              />
              {friendsComments.length > 0 ? (
                <div className="flex flex-col gap-5">
                  {friendsComments.slice(0, 4).map((comment) => (
                    <CommentCard
                      key={comment.id}
                      comment={comment}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-body text-gray">
                  Pas encore de critique de mes amis.
                </p>
              )}
            </section>

            {/* Critiques populaires */}
            <section className="flex flex-col gap-7">
              <SectionHeader title="Critiques populaires" seeMoreHref={`/livres/${id}/comments`} />
              {comments.length > 0 ? (
                <div className="flex flex-col gap-5">
                  {comments.slice(0, 4).map((comment) => (
                    <CommentCard
                      key={comment.id}
                      comment={comment}
                      onDeleted={() => setComments(comments.filter(c => c.id !== comment.id))}
                      onUpdated={(newContent) => setComments(comments.map(c => c.id === comment.id ? { ...c, content: newContent } : c))}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-body text-gray">
                  Pas encore de critique.
                </p>
              )}
            </section>

            <div className="pt-10 border-t border-gray/20">
              <Link
                href={`/formulaire-modification/${id}`}
                className="text-small font-medium text-gray underline underline-offset-2 hover:text-dark transition-colors"
              >
                Suggérer une modification
              </Link>
            </div>
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
              <Button variant="discrete" size="sm" onClick={() => setShowCommentModal(false)}>
                Annuler
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSubmitComment}
                disabled={!commentText.trim()}
                isLoading={isSubmittingComment}
              >
                Publier
              </Button>
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
                thebookclub.fr/livres/{book.id}
              </span>
              <Button
                variant="primary"
                size="xs"
                onClick={() => navigator.clipboard.writeText(`thebookclub.fr/livres/${book.id}`)}
              >
                Copier
              </Button>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="discrete" size="sm" onClick={() => setShowShareModal(false)}>
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
