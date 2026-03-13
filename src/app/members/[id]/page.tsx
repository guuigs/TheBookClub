import { redirect } from "next/navigation";

export default async function MemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Redirect to profile page
  redirect(`/profile/${id}`);
}
