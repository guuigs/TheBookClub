import { createClient as createBrowserClient } from '@/lib/supabase/browser'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Book } from '@/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapBookRow(row: any): Book {
  return {
    id: row.id,
    title: row.title,
    author: {
      id: row.author_id ?? '',
      name: row.author_name ?? 'Auteur inconnu',
      bio: row.author_bio ?? undefined,
      photoUrl: row.author_photo_url ?? undefined,
      booksCount: 0,
    },
    coverUrl: row.cover_url ?? '',
    description: row.description ?? '',
    genre: row.genre ?? '',
    averageRating: Number(row.average_rating ?? 0),
    totalVotes: Number(row.total_votes ?? 0),
    ratingDistribution: [],
    freeReadLink: row.free_read_link ?? undefined,
    buyLink: row.buy_link ?? undefined,
  }
}

export async function getBooks(client?: SupabaseClient): Promise<Book[]> {
  const supabase = client ?? createBrowserClient()
  const { data } = await supabase
    .from('books_with_stats')
    .select('*')
    .order('total_votes', { ascending: false })
  return (data ?? []).map(mapBookRow)
}

export async function getBookById(id: string, client?: SupabaseClient): Promise<Book | null> {
  const supabase = client ?? createBrowserClient()
  const { data } = await supabase
    .from('books_with_stats')
    .select('*')
    .eq('id', id)
    .single()
  return data ? mapBookRow(data) : null
}

export async function getBooksByAuthorId(authorId: string): Promise<Book[]> {
  const supabase = createBrowserClient()
  const { data } = await supabase
    .from('books_with_stats')
    .select('*')
    .eq('author_id', authorId)
  return (data ?? []).map(mapBookRow)
}

export async function searchBooks(query: string): Promise<Book[]> {
  if (!query.trim()) return []
  const supabase = createBrowserClient()
  const { data } = await supabase
    .from('books_with_stats')
    .select('*')
    .or(
      `title.ilike.%${query}%,author_name.ilike.%${query}%,genre.ilike.%${query}%`
    )
  return (data ?? []).map(mapBookRow)
}

export async function getListsContainingBook(bookId: string) {
  const supabase = createBrowserClient()
  const { data } = await supabase
    .from('book_list_items')
    .select(
      `list_id, book_lists(id, title, description, author_id, created_at, updated_at,
        author:profiles!book_lists_author_id_fkey(id, username, display_name, avatar_url, badge),
        items:book_list_items(book_id)
      )`
    )
    .eq('book_id', bookId)
    .limit(5)
  return data ?? []
}

// Book status management (to_read / read)
export type BookStatus = 'to_read' | 'read' | null

export async function getBookStatus(bookId: string): Promise<BookStatus> {
  const supabase = createBrowserClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('user_books')
    .select('status')
    .eq('user_id', user.id)
    .eq('book_id', bookId)
    .single()

  return (data?.status as BookStatus) ?? null
}

export async function setBookStatus(
  bookId: string,
  status: 'to_read' | 'read'
): Promise<{ error: string | null }> {
  const supabase = createBrowserClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Vous devez être connecté.' }

  const { error } = await supabase
    .from('user_books')
    .upsert(
      {
        user_id: user.id,
        book_id: bookId,
        status,
        read_date: status === 'read' ? new Date().toISOString().split('T')[0] : null,
        added_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,book_id' }
    )

  return { error: error?.message ?? null }
}

export async function removeBookStatus(
  bookId: string
): Promise<{ error: string | null }> {
  const supabase = createBrowserClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Vous devez être connecté.' }

  const { error } = await supabase
    .from('user_books')
    .delete()
    .eq('user_id', user.id)
    .eq('book_id', bookId)

  return { error: error?.message ?? null }
}
