import { createClient as createBrowserClient } from '@/lib/supabase/browser'
import type { Comment } from '@/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCommentRow(row: any, currentUserId?: string): Comment {
  const user = row.user ?? row.profiles ?? {}
  return {
    id: row.id,
    user: {
      id: user.id ?? '',
      username: user.username ?? 'Inconnu',
      displayName: user.display_name ?? 'Inconnu',
      avatarUrl: user.avatar_url ?? undefined,
      badge: user.badge ?? 'member',
      booksRead: 0,
      listsCount: 0,
      followersCount: 0,
      followingCount: 0,
    },
    bookId: row.book_id,
    content: row.content,
    createdAt: new Date(row.created_at),
    likesCount: Number(row.likes_count ?? 0),
    isLikedByCurrentUser: currentUserId
      ? (row.liked_by_me ?? false)
      : false,
  }
}

export async function getCommentsByBookId(
  bookId: string,
  currentUserId?: string
): Promise<Comment[]> {
  const supabase = createBrowserClient()
  // Use explicit FK to avoid "multiple relationships" error
  const { data } = await supabase
    .from('comments')
    .select(
      `*, user:profiles!comments_user_id_fkey(id, username, display_name, avatar_url, badge),
       likes_count:comment_likes(count)`
    )
    .eq('book_id', bookId)
    .order('created_at', { ascending: false })

  if (!data) return []

  // Check liked-by-me for each comment
  let likedIds = new Set<string>()
  if (currentUserId) {
    const { data: likes } = await supabase
      .from('comment_likes')
      .select('comment_id')
      .eq('user_id', currentUserId)
      .in(
        'comment_id',
        data.map((c) => c.id)
      )
    likedIds = new Set((likes ?? []).map((l) => l.comment_id))
  }

  return data.map((row) => ({
    ...mapCommentRow(row, currentUserId),
    likesCount: row.likes_count?.[0]?.count ?? 0,
    isLikedByCurrentUser: likedIds.has(row.id),
  }))
}

export async function createComment(
  bookId: string,
  content: string
): Promise<{ data: Comment | null; error: string | null }> {
  const supabase = createBrowserClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Vous devez être connecté pour commenter.' }

  // Get user profile for the comment
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, badge')
    .eq('id', user.id)
    .single()

  // Insert comment and get back the created row
  const { data: insertedComment, error } = await supabase
    .from('comments')
    .insert({
      book_id: bookId,
      user_id: user.id,
      content: content.slice(0, 2000),
    })
    .select('id, book_id, content, created_at')
    .single()

  if (error || !insertedComment) {
    return { data: null, error: error?.message ?? 'Erreur lors de la création du commentaire.' }
  }

  // Build the complete comment object
  const comment: Comment = {
    id: insertedComment.id,
    user: {
      id: profile?.id ?? user.id,
      username: profile?.username ?? '',
      displayName: profile?.display_name ?? 'Utilisateur',
      avatarUrl: profile?.avatar_url ?? undefined,
      badge: profile?.badge ?? 'member',
      booksRead: 0,
      listsCount: 0,
      followersCount: 0,
      followingCount: 0,
    },
    bookId: insertedComment.book_id,
    content: insertedComment.content,
    createdAt: new Date(insertedComment.created_at),
    likesCount: 0,
    isLikedByCurrentUser: false,
  }

  return { data: comment, error: null }
}

export async function toggleCommentLike(
  commentId: string
): Promise<{ liked: boolean; error: string | null }> {
  const supabase = createBrowserClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { liked: false, error: 'Non connecté.' }

  const { data: existing } = await supabase
    .from('comment_likes')
    .select('comment_id')
    .eq('user_id', user.id)
    .eq('comment_id', commentId)
    .single()

  if (existing) {
    const { error } = await supabase
      .from('comment_likes')
      .delete()
      .eq('user_id', user.id)
      .eq('comment_id', commentId)
    return { liked: false, error: error?.message ?? null }
  } else {
    const { error } = await supabase
      .from('comment_likes')
      .insert({ user_id: user.id, comment_id: commentId })
    return { liked: true, error: error?.message ?? null }
  }
}

export async function updateComment(
  commentId: string,
  content: string
): Promise<{ error: string | null }> {
  const supabase = createBrowserClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Vous devez être connecté.' }

  // Verify ownership
  const { data: comment } = await supabase
    .from('comments')
    .select('user_id')
    .eq('id', commentId)
    .single()

  if (!comment || comment.user_id !== user.id) {
    return { error: 'Vous ne pouvez modifier que vos propres commentaires.' }
  }

  const { error } = await supabase
    .from('comments')
    .update({ content: content.slice(0, 2000) })
    .eq('id', commentId)

  return { error: error?.message ?? null }
}

export async function deleteComment(
  commentId: string
): Promise<{ error: string | null }> {
  const supabase = createBrowserClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Vous devez être connecté.' }

  // Use secure RPC function that handles cascade deletion
  // This bypasses RLS to delete other users' likes on our comment
  const { error } = await supabase
    .rpc('delete_comment_with_likes', { comment_uuid: commentId })

  if (error) {
    if (error.message.includes('only delete your own')) {
      return { error: 'Vous ne pouvez supprimer que vos propres commentaires.' }
    }
    return { error: error.message }
  }

  return { error: null }
}
