import { createClient as createBrowserClient } from '@/lib/supabase/browser'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { BookList } from '@/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapListRow(row: any): BookList {
  const author = row.author ?? {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const books = (row.items ?? []).map((item: any) => ({
    id: item.book?.id ?? item.book_id ?? '',
    title: item.book?.title ?? '',
    author: {
      id: item.book?.author_id ?? '',
      name: '',
      booksCount: 0,
    },
    coverUrl: item.book?.cover_url ?? '',
    description: '',
    publishedYear: 0,
    genre: '',
    averageRating: 0,
    totalVotes: 0,
    ratingDistribution: [],
  }))

  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    author: {
      id: author.id ?? '',
      username: author.username ?? '',
      displayName: author.display_name ?? 'Inconnu',
      avatarUrl: author.avatar_url ?? undefined,
      badge: author.badge ?? 'member',
      booksRead: 0,
      listsCount: 0,
      followersCount: 0,
      followingCount: 0,
    },
    books,
    booksCount: Number(row.books_count ?? books.length),
    likesCount: Number(row.likes_count ?? 0),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at ?? row.created_at),
  }
}

const LIST_SELECT = `
  id, title, description, author_id, created_at, updated_at,
  author:profiles(id, username, display_name, avatar_url, badge),
  items:book_list_items(book:books(id, title, cover_url, author_id)),
  likes_count:list_likes(count),
  books_count:book_list_items(count)
`

export async function getLists(client?: SupabaseClient): Promise<BookList[]> {
  const supabase = client ?? createBrowserClient()
  const { data } = await supabase
    .from('book_lists')
    .select(LIST_SELECT)
    .order('created_at', { ascending: false })
  return (data ?? []).map(mapListRow)
}

export async function getListById(id: string, client?: SupabaseClient): Promise<BookList | null> {
  const supabase = client ?? createBrowserClient()
  const { data, error } = await supabase
    .from('book_lists')
    .select(LIST_SELECT)
    .eq('id', id)
    .single()

  if (error) {
    console.error('[getListById] Error fetching list:', error.message, 'id:', id)
    return null
  }
  return data ? mapListRow(data) : null
}

export async function getListsByUserId(userId: string, client?: SupabaseClient): Promise<BookList[]> {
  const supabase = client ?? createBrowserClient()
  const { data } = await supabase
    .from('book_lists')
    .select(LIST_SELECT)
    .eq('author_id', userId)
    .order('created_at', { ascending: false })
  return (data ?? []).map(mapListRow)
}

export async function createList(
  title: string,
  description?: string
): Promise<{ id: string | null; error: string | null }> {
  const supabase = createBrowserClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { id: null, error: 'Vous devez être connecté.' }

  const { data, error } = await supabase
    .from('book_lists')
    .insert({ title, description, author_id: user.id })
    .select('id')
    .single()
  return { id: data?.id ?? null, error: error?.message ?? null }
}

export async function updateList(
  listId: string,
  title: string,
  description?: string
): Promise<{ error: string | null }> {
  const supabase = createBrowserClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Vous devez être connecté.' }

  // Verify ownership
  const { data: list } = await supabase
    .from('book_lists')
    .select('author_id')
    .eq('id', listId)
    .single()

  if (!list || list.author_id !== user.id) {
    return { error: 'Vous ne pouvez modifier que vos propres listes.' }
  }

  const { error } = await supabase
    .from('book_lists')
    .update({ title, description, updated_at: new Date().toISOString() })
    .eq('id', listId)

  return { error: error?.message ?? null }
}

export async function updateListBooks(
  listId: string,
  bookIds: string[]
): Promise<{ error: string | null }> {
  const supabase = createBrowserClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Vous devez être connecté.' }

  // Verify ownership
  const { data: list } = await supabase
    .from('book_lists')
    .select('author_id')
    .eq('id', listId)
    .single()

  if (!list || list.author_id !== user.id) {
    return { error: 'Vous ne pouvez modifier que vos propres listes.' }
  }

  // Delete existing items
  await supabase
    .from('book_list_items')
    .delete()
    .eq('list_id', listId)

  // Insert new items
  if (bookIds.length > 0) {
    const { error } = await supabase
      .from('book_list_items')
      .insert(bookIds.map((book_id) => ({ list_id: listId, book_id })))
    if (error) return { error: error.message }
  }

  // Update list timestamp
  await supabase
    .from('book_lists')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', listId)

  return { error: null }
}

export async function deleteList(
  listId: string
): Promise<{ error: string | null }> {
  const supabase = createBrowserClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Vous devez être connecté.' }

  // Verify ownership
  const { data: list } = await supabase
    .from('book_lists')
    .select('author_id')
    .eq('id', listId)
    .single()

  if (!list || list.author_id !== user.id) {
    return { error: 'Vous ne pouvez supprimer que vos propres listes.' }
  }

  // Delete items first (foreign key)
  await supabase
    .from('book_list_items')
    .delete()
    .eq('list_id', listId)

  // Delete likes
  await supabase
    .from('list_likes')
    .delete()
    .eq('list_id', listId)

  // Delete list
  const { error } = await supabase
    .from('book_lists')
    .delete()
    .eq('id', listId)

  return { error: error?.message ?? null }
}

export async function isListLikedByUser(listId: string): Promise<boolean> {
  const supabase = createBrowserClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase
    .from('list_likes')
    .select('list_id')
    .eq('user_id', user.id)
    .eq('list_id', listId)
    .single()

  return !!data
}

export async function toggleListLike(
  listId: string
): Promise<{ liked: boolean; error: string | null }> {
  const supabase = createBrowserClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { liked: false, error: 'Non connecté.' }

  const { data: existing } = await supabase
    .from('list_likes')
    .select('list_id')
    .eq('user_id', user.id)
    .eq('list_id', listId)
    .single()

  if (existing) {
    const { error } = await supabase
      .from('list_likes')
      .delete()
      .eq('user_id', user.id)
      .eq('list_id', listId)
    return { liked: false, error: error?.message ?? null }
  } else {
    const { error } = await supabase
      .from('list_likes')
      .insert({ user_id: user.id, list_id: listId })
    return { liked: true, error: error?.message ?? null }
  }
}
