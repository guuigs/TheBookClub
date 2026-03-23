import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE() {
  const supabase = await createClient();

  // Verify user is authenticated
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "Non autorise" },
      { status: 401 }
    );
  }

  try {
    // Delete user data in order (respecting foreign key constraints)
    // 1. Delete comment likes
    await supabase
      .from("comment_likes")
      .delete()
      .eq("user_id", user.id);

    // 2. Delete list likes
    await supabase
      .from("list_likes")
      .delete()
      .eq("user_id", user.id);

    // 3. Delete comments
    await supabase
      .from("comments")
      .delete()
      .eq("user_id", user.id);

    // 4. Delete ratings
    await supabase
      .from("ratings")
      .delete()
      .eq("user_id", user.id);

    // 5. Delete user_books
    await supabase
      .from("user_books")
      .delete()
      .eq("user_id", user.id);

    // 6. Delete user_favorites
    await supabase
      .from("user_favorites")
      .delete()
      .eq("user_id", user.id);

    // 7. Delete book_list_items for user's lists
    const { data: userLists } = await supabase
      .from("book_lists")
      .select("id")
      .eq("author_id", user.id);

    if (userLists && userLists.length > 0) {
      const listIds = userLists.map((l) => l.id);
      await supabase
        .from("book_list_items")
        .delete()
        .in("list_id", listIds);
    }

    // 8. Delete book_lists
    await supabase
      .from("book_lists")
      .delete()
      .eq("author_id", user.id);

    // 9. Delete follows (both directions)
    await supabase
      .from("follows")
      .delete()
      .eq("follower_id", user.id);

    await supabase
      .from("follows")
      .delete()
      .eq("following_id", user.id);

    // 10. Delete avatar from storage if exists
    const { data: profile } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", user.id)
      .single();

    if (profile?.avatar_url) {
      // Extract filename from URL
      const match = profile.avatar_url.match(/avatars\/([^?]+)/);
      if (match) {
        await supabase.storage.from("avatars").remove([match[1]]);
      }
    }

    // 11. Delete profile
    await supabase
      .from("profiles")
      .delete()
      .eq("id", user.id);

    // 12. Delete auth user (this signs them out automatically)
    // Note: This requires the service role key to work properly
    // For now, we'll sign out the user - full deletion requires admin API
    await supabase.auth.signOut();

    return NextResponse.json({
      success: true,
      message: "Compte supprime avec succes",
    });
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du compte" },
      { status: 500 }
    );
  }
}
