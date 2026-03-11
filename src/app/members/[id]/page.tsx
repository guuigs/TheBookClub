import { redirect } from "next/navigation";
import { users } from "@/lib/data";

// Generate static params for all users
export async function generateStaticParams() {
  return users.map((user) => ({
    id: user.id,
  }));
}

export default async function MemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Redirect to profile page
  redirect(`/profile/${id}`);
}
