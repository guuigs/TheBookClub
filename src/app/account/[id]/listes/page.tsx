import Link from "next/link";
import { Lock } from "lucide-react";
import { notFound } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import { SectionHeader, ProfileTabs, ProfileListsFilter, ListCard } from "@/components/features";
import { Avatar, Badge } from "@/components/ui";
import { getProfileById } from "@/lib/db/profiles";
import { getListsByUserId } from "@/lib/db/lists";
import { createClient } from "@/lib/supabase/server";
import { getBadgeLabel } from "@/lib/constants/badges";

export default async function ProfileListsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const [profile, allLists] = await Promise.all([
    getProfileById(id, supabase),
    getListsByUserId(id, supabase),
  ]);

  if (!profile) notFound();

  const { data: { user: authUser } } = await supabase.auth.getUser();
  const isOwnProfile = authUser?.id === id;

  // Separate private "À lire" list from public lists
  const privateList = allLists.find((l) => l.isPrivate);
  const publicLists = allLists.filter((l) => !l.isPrivate);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 w-[320px] tablet:w-[700px] desktop:w-[1200px] mx-auto py-16 desktop:py-[120px]">
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

        <div className="flex flex-col gap-12">
          {/* Private "À lire" list — only visible to owner */}
          {isOwnProfile && privateList && (
            <section className="flex flex-col gap-7">
              <div className="flex items-center gap-2">
                <h2 className="text-t3 font-semibold text-dark tracking-tight">À lire</h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray/10 text-small text-gray font-medium">
                  <Lock className="w-3 h-3" />
                  Privée
                </span>
              </div>
              <ListCard list={privateList} />
            </section>
          )}

          {/* Public lists */}
          <section className="flex flex-col gap-7">
            <SectionHeader
              title={isOwnProfile ? "Mes listes publiques" : `Listes de ${profile.displayName}`}
            />
            <ProfileListsFilter lists={publicLists} />
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
