import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
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
    // Fetch all user data in parallel
    const [
      profileResult,
      booksResult,
      ratingsResult,
      commentsResult,
      listsResult,
      favoritesResult,
      followersResult,
      followingResult,
      commentLikesResult,
      listLikesResult,
    ] = await Promise.all([
      // Profile
      supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single(),

      // User books (reading list)
      supabase
        .from("user_books")
        .select(`
          status,
          added_at,
          books (
            id,
            title,
            author
          )
        `)
        .eq("user_id", user.id),

      // Ratings
      supabase
        .from("ratings")
        .select(`
          score,
          created_at,
          books (
            id,
            title,
            author
          )
        `)
        .eq("user_id", user.id),

      // Comments
      supabase
        .from("comments")
        .select(`
          content,
          created_at,
          books (
            id,
            title,
            author
          )
        `)
        .eq("user_id", user.id),

      // Book lists
      supabase
        .from("book_lists")
        .select(`
          id,
          title,
          description,
          is_private,
          created_at,
          book_list_items (
            books (
              id,
              title,
              author
            )
          )
        `)
        .eq("author_id", user.id),

      // Favorites
      supabase
        .from("user_favorites")
        .select(`
          position,
          books (
            id,
            title,
            author
          )
        `)
        .eq("user_id", user.id),

      // Followers
      supabase
        .from("follows")
        .select(`
          created_at,
          follower:profiles!follows_follower_id_fkey (
            username,
            display_name
          )
        `)
        .eq("following_id", user.id),

      // Following
      supabase
        .from("follows")
        .select(`
          created_at,
          following:profiles!follows_following_id_fkey (
            username,
            display_name
          )
        `)
        .eq("follower_id", user.id),

      // Comment likes
      supabase
        .from("comment_likes")
        .select("comment_id, created_at")
        .eq("user_id", user.id),

      // List likes
      supabase
        .from("list_likes")
        .select("list_id, created_at")
        .eq("user_id", user.id),
    ]);

    // Compile all data
    const exportData = {
      exported_at: new Date().toISOString(),
      user: {
        email: user.email,
        created_at: user.created_at,
      },
      profile: profileResult.data,
      books_in_library: booksResult.data || [],
      ratings: ratingsResult.data || [],
      comments: commentsResult.data || [],
      book_lists: listsResult.data || [],
      favorites: favoritesResult.data || [],
      followers: followersResult.data || [],
      following: followingResult.data || [],
      comment_likes: commentLikesResult.data || [],
      list_likes: listLikesResult.data || [],
    };

    // Return as JSON file
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="the-book-club-data-${user.id}.json"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'export des donnees" },
      { status: 500 }
    );
  }
}
