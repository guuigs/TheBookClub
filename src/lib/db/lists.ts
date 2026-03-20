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

  // Handle Supabase aggregate format: [{count: N}] or direct number
  const booksCount = Array.isArray(row.books_count)
    ? Number(row.books_count?.[0]?.count ?? 0)
    : Number(row.books_count ?? books.length)
  const likesCount = Array.isArray(row.likes_count)
    ? Number(row.likes_count?.[0]?.count ?? 0)
    : Number(row.likes_count ?? 0)

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
    booksCount,
    likesCount,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at ?? row.created_at),
    isPrivate: row.is_private ?? false,
    isPinned: row.is_pinned ?? false,
  }
}

// Use explicit FK names to avoid "multiple relationships" error
const LIST_SELECT = `
  id, title, description, author_id, created_at, updated_at, is_private, is_pinned,
  author:profiles!book_lists_author_id_fkey(id, username, display_name, avatar_url, badge),
  items:book_list_items(book:books(id, title, cover_url, author_id)),
  likes_count:list_likes(count),
  books_count:book_list_items(count)
`

export async function getLists(client?: SupabaseClient): Promise<BookList[]> {
  const supabase = client ?? createBrowserClient()
  const { data } = await supabase
    .from('book_lists')
    .select(LIST_SELECT)
    .eq('is_private', false)
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

  // Prevent deleting the private "À lire" list
  const { data: list } = await supabase
    .from('book_lists')
    .select('is_pinned')
    .eq('id', listId)
    .single()
  if (list?.is_pinned) {
    return { error: 'La liste "À lire" ne peut pas être supprimée.' }
  }

  // Use secure RPC function that handles cascade deletion
  // This bypasses RLS to delete items and other users' likes
  const { error } = await supabase
    .rpc('delete_list_with_cascade', { list_uuid: listId })

  if (error) {
    if (error.message.includes('only delete your own')) {
      return { error: 'Vous ne pouvez supprimer que vos propres listes.' }
    }
    return { error: error.message }
  }

  return { error: null }
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

/**
 * Get user's lists with a simple format (id, title, and whether it contains a specific book)
 */
export async function getUserListsWithBookStatus(
  bookId: string
): Promise<{ lists: { id: string; title: string; hasBook: boolean; isPinned: boolean }[]; error: string | null }> {
  const supabase = createBrowserClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { lists: [], error: 'Non connecté.' }

  // Get user's lists
  const { data: listsData, error } = await supabase
    .from('book_lists')
    .select('id, title, is_pinned')
    .eq('author_id', user.id)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) return { lists: [], error: error.message }

  // Get which lists contain this book
  const { data: itemsData } = await supabase
    .from('book_list_items')
    .select('list_id')
    .eq('book_id', bookId)
    .in('list_id', listsData?.map(l => l.id) ?? [])

  const listIdsWithBook = new Set(itemsData?.map(i => i.list_id) ?? [])

  const lists = (listsData ?? []).map(l => ({
    id: l.id,
    title: l.title,
    hasBook: listIdsWithBook.has(l.id),
    isPinned: l.is_pinned ?? false,
  }))

  return { lists, error: null }
}

/**
 * Add a book to a list
 */
export async function addBookToList(
  listId: string,
  bookId: string
): Promise<{ error: string | null }> {
  const supabase = createBrowserClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté.' }

  // Verify ownership
  const { data: list } = await supabase
    .from('book_lists')
    .select('author_id')
    .eq('id', listId)
    .single()

  if (!list || list.author_id !== user.id) {
    return { error: 'Vous ne pouvez modifier que vos propres listes.' }
  }

  // Check if already in list
  const { data: existing } = await supabase
    .from('book_list_items')
    .select('list_id')
    .eq('list_id', listId)
    .eq('book_id', bookId)
    .single()

  if (existing) return { error: null } // Already in list, no error

  const { error } = await supabase
    .from('book_list_items')
    .insert({ list_id: listId, book_id: bookId })

  // Update list timestamp
  await supabase
    .from('book_lists')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', listId)

  return { error: error?.message ?? null }
}

/**
 * Remove a book from a list
 */
export async function removeBookFromList(
  listId: string,
  bookId: string
): Promise<{ error: string | null }> {
  const supabase = createBrowserClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté.' }

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
    .from('book_list_items')
    .delete()
    .eq('list_id', listId)
    .eq('book_id', bookId)

  // Update list timestamp
  await supabase
    .from('book_lists')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', listId)

  return { error: error?.message ?? null }
}

/**
 * Ensure user has a default "À lire" list (create if not exists)
 */
export async function ensureDefaultReadingList(): Promise<{ listId: string | null; error: string | null }> {
  const supabase = createBrowserClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { listId: null, error: 'Non connecté.' }

  // Check if user already has a pinned "À lire" list
  const { data: existingList } = await supabase
    .from('book_lists')
    .select('id')
    .eq('author_id', user.id)
    .eq('is_pinned', true)
    .single()

  if (existingList) return { listId: existingList.id, error: null }

  // Create the default list
  const { data, error } = await supabase
    .from('book_lists')
    .insert({
      title: 'À lire',
      description: 'Ma liste de lecture privée',
      author_id: user.id,
      is_private: true,
      is_pinned: true,
    })
    .select('id')
    .single()

  return { listId: data?.id ?? null, error: error?.message ?? null }
}
