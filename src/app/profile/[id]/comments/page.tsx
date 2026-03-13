import Link from "next/link";
import { notFound } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import { CommentCard, SectionHeader } from "@/components/features";
import { Avatar, Badge } from "@/components/ui";
import { getProfileById } from "@/lib/db/profiles";
import { createClient } from "@/lib/supabase/server";
import type { Comment, MemberBadge } from "@/types";

const badgeLabels: Record<string, string> = {
  member: "membre du club",
  honorary: "membre honoraire",
  benefactor: "membre bienfaiteur",
  honor: "membre d'honneur",
};

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
  };
}

export default async function ProfileCommentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [profile, supabase] = await Promise.all([
    getProfileById(id),
    createClient(),
  ]);

  if (!profile) notFound();

  const { data: { user: authUser } } = await supabase.auth.getUser();
  const isOwnProfile = authUser?.id === id;

  const { data: commentsData } = await supabase
    .from("comments")
    .select(
      `*, user:profiles(id, username, display_name, avatar_url, badge),
       likes_count:comment_likes(count)`
    )
    .eq("user_id", id)
    .order("created_at", { ascending: false });

  const userComments = (commentsData ?? []).map(mapComment);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 w-full max-w-[900px] mx-auto px-5 py-[120px]">
        <div className="flex items-center gap-5 mb-10">
          <div className="relative">
            <Avatar src={profile.avatarUrl} alt={profile.displayName} size="lg" className="w-[80px] h-[80px]" />
            <div className="absolute -top-1 -left-2">
              <Badge type={profile.badge} size="md" />
            </div>
          </div>
          <div>
            <Link href={`/profile/${id}`}>
              <h1 className="font-display text-t2 text-dark tracking-tight hover:text-primary transition-colors">
                {profile.displayName}
              </h1>
            </Link>
            <p className="text-body text-gray">{badgeLabels[profile.badge]}</p>
          </div>
        </div>

        <div className="flex gap-10 mb-[60px]">
          <Link href={`/profile/${id}`} className="text-t4 font-semibold text-dark hover:text-primary transition-colors">Profil</Link>
          <Link href={`/profile/${id}/books`} className="text-t4 font-semibold text-dark hover:text-primary transition-colors">Livres</Link>
          <span className="text-t4 font-semibold text-primary cursor-pointer">Critiques</span>
          <Link href={`/profile/${id}/lists`} className="text-t4 font-semibold text-dark hover:text-primary transition-colors">Listes</Link>
        </div>

        <section className="flex flex-col gap-7">
          <SectionHeader
            title={isOwnProfile ? "Mes critiques" : `Critiques de ${profile.displayName}`}
          />
          {userComments.length > 0 ? (
            <div className="flex flex-col gap-5">
              {userComments.map((comment) => (
                <CommentCard key={comment.id} comment={comment} showBookInfo />
              ))}
            </div>
          ) : (
            <p className="text-body text-gray text-center py-10">
              Aucune critique pour le moment.
            </p>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
