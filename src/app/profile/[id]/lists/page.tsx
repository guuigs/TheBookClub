import Link from "next/link";
import { notFound } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import { ListCard, SectionHeader } from "@/components/features";
import { Avatar, Badge } from "@/components/ui";
import { getProfileById } from "@/lib/db/profiles";
import { getListsByUserId } from "@/lib/db/lists";
import { createClient } from "@/lib/supabase/server";

const badgeLabels: Record<string, string> = {
  member: "membre du club",
  honorary: "membre honoraire",
  benefactor: "membre bienfaiteur",
  honor: "membre d'honneur",
};

export default async function ProfileListsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [profile, userLists, supabase] = await Promise.all([
    getProfileById(id),
    getListsByUserId(id),
    createClient(),
  ]);

  if (!profile) notFound();

  const { data: { user: authUser } } = await supabase.auth.getUser();
  const isOwnProfile = authUser?.id === id;

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
          <Link href={`/profile/${id}/comments`} className="text-t4 font-semibold text-dark hover:text-primary transition-colors">Critiques</Link>
          <span className="text-t4 font-semibold text-primary cursor-pointer">Listes</span>
        </div>

        <section className="flex flex-col gap-7">
          <SectionHeader
            title={isOwnProfile ? "Mes listes" : `Listes de ${profile.displayName}`}
          />
          {userLists.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {userLists.map((list) => (
                <ListCard key={list.id} list={list} />
              ))}
            </div>
          ) : (
            <p className="text-body text-gray text-center py-10">
              Aucune liste créée pour le moment.
            </p>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
