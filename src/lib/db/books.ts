import { createClient as createBrowserClient } from '@/lib/supabase/browser'
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
    publishedYear: row.published_year ?? 0,
    genre: row.genre ?? '',
    averageRating: Number(row.average_rating ?? 0),
    totalVotes: Number(row.total_votes ?? 0),
    ratingDistribution: [],
  }
}

export async function getBooks(): Promise<Book[]> {
  const supabase = createBrowserClient()
  const { data } = await supabase
    .from('books_with_stats')
    .select('*')
    .order('total_votes', { ascending: false })
  return (data ?? []).map(mapBookRow)
}

export async function getBookById(id: string): Promise<Book | null> {
  const supabase = createBrowserClient()
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
        author:profiles(id, username, display_name, avatar_url, badge),
        items:book_list_items(book_id)
      )`
    )
    .eq('book_id', bookId)
    .limit(5)
  return data ?? []
}
