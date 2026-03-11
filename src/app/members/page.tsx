import { Header, Footer } from "@/components/layout";
import { MemberCard, SectionHeader } from "@/components/features";
import { users, currentUser } from "@/lib/data";

export default function MembersPage() {
  // Sort users by followers count (most popular first)
  const sortedUsers = [...users].sort(
    (a, b) => b.followersCount - a.followersCount
  );

  // Group by badge type
  const honorMembers = sortedUsers.filter((u) => u.badge === "honor");
  const honoraryMembers = sortedUsers.filter((u) => u.badge === "honorary");
  const benefactorMembers = sortedUsers.filter((u) => u.badge === "benefactor");
  const regularMembers = sortedUsers.filter((u) => u.badge === "member");

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header user={currentUser} />

      <main className="flex-1 w-full max-w-[1500px] mx-auto px-5 py-10 lg:py-[80px]">
        <h1 className="font-display text-t1 text-dark tracking-tight mb-[60px]">
          Membres du Club
        </h1>

        {/* Honor Members */}
        {honorMembers.length > 0 && (
          <section className="flex flex-col gap-7 mb-[60px]">
            <SectionHeader title="Membres d'honneur" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
              {honorMembers.map((user) => (
                <MemberCard key={user.id} user={user} />
              ))}
            </div>
          </section>
        )}

        {/* Honorary Members */}
        {honoraryMembers.length > 0 && (
          <section className="flex flex-col gap-7 mb-[60px]">
            <SectionHeader title="Membres honoraires" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
              {honoraryMembers.map((user) => (
                <MemberCard key={user.id} user={user} />
              ))}
            </div>
          </section>
        )}

        {/* Benefactor Members */}
        {benefactorMembers.length > 0 && (
          <section className="flex flex-col gap-7 mb-[60px]">
            <SectionHeader title="Membres bienfaiteurs" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
              {benefactorMembers.map((user) => (
                <MemberCard key={user.id} user={user} />
              ))}
            </div>
          </section>
        )}

        {/* Regular Members */}
        {regularMembers.length > 0 && (
          <section className="flex flex-col gap-7">
            <SectionHeader title="Membres du club" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
              {regularMembers.map((user) => (
                <MemberCard key={user.id} user={user} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
