import Link from "next/link";
import { notFound } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import { SectionHeader, ProfileTabs, ProfileCommentsWithBooks } from "@/components/features";
import { Avatar, Badge } from "@/components/ui";
import { getProfileById } from "@/lib/db/profiles";
import { createClient } from "@/lib/supabase/server";
import { mapCommentWithBook } from "@/lib/mappers";
import { getBadgeLabel } from "@/lib/constants/badges";

export default async function ProfileCommentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const profile = await getProfileById(id, supabase);

  if (!profile) notFound();

  const { data: { user: authUser } } = await supabase.auth.getUser();
  const isOwnProfile = authUser?.id === id;

  const { data: commentsData } = await supabase
    .from("comments")
    .select(
      `*, user:profiles!comments_user_id_fkey(id, username, display_name, avatar_url, badge),
       book:books!comments_book_id_fkey(id, title, cover_url),
       likes_count:comment_likes(count)`
    )
    .eq("user_id", id)
    .order("created_at", { ascending: false });

  const userComments = (commentsData ?? []).map(mapCommentWithBook);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 w-full max-w-[900px] mx-auto px-5 py-[120px]">
        <div className="flex items-center gap-5 mb-10">
          <div className="relative">
            <Avatar src={profile.avatarUrl} alt={profile.displayName} size="lg" className="w-[80px] h-[80px]" />
            <div className="absolute -top-1 -right-2">
              <Badge type={profile.badge} size="md" />
            </div>
          </div>
          <div>
            <Link href={`/account/${id}`}>
              <h1 className="font-display text-t2 text-dark tracking-tight hover:text-primary transition-colors">
                {profile.displayName}
              </h1>
            </Link>
            <p className="text-body text-gray">{getBadgeLabel(profile.badge)}</p>
          </div>
        </div>

        <ProfileTabs profileId={id} />

        <section className="flex flex-col gap-7">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <SectionHeader
              title={isOwnProfile ? "Mes critiques" : `Critiques de ${profile.displayName}`}
            />
          </div>
          <ProfileCommentsWithBooks comments={userComments} />
        </section>
      </main>

      <Footer />
    </div>
  );
}
