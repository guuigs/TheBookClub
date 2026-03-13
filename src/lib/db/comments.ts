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
  const { data } = await supabase
    .from('comments')
    .select(
      `*, user:profiles(id, username, display_name, avatar_url, badge),
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
): Promise<{ error: string | null }> {
  const supabase = createBrowserClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Vous devez être connecté pour commenter.' }

  const { error } = await supabase.from('comments').insert({
    book_id: bookId,
    user_id: user.id,
    content: content.slice(0, 2000),
  })
  return { error: error?.message ?? null }
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
