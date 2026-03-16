import { createClient as createBrowserClient } from '@/lib/supabase/browser'

const MAX_FAVORITES = 4

export async function getUserFavorites(userId: string): Promise<string[]> {
  const supabase = createBrowserClient()
  const { data } = await supabase
    .from('user_favorites')
    .select('book_id')
    .eq('user_id', userId)
    .order('position', { ascending: true })
    .limit(MAX_FAVORITES)

  return (data ?? []).map(d => d.book_id)
}

export async function isBookFavorite(bookId: string): Promise<boolean> {
  const supabase = createBrowserClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase
    .from('user_favorites')
    .select('book_id')
    .eq('user_id', user.id)
    .eq('book_id', bookId)
    .single()

  return !!data
}

export async function addFavorite(
  bookId: string
): Promise<{ error: string | null }> {
  const supabase = createBrowserClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Vous devez etre connecte.' }

  // Check current count
  const { data: existing } = await supabase
    .from('user_favorites')
    .select('book_id')
    .eq('user_id', user.id)

  if ((existing?.length ?? 0) >= MAX_FAVORITES) {
    return { error: `Vous ne pouvez avoir que ${MAX_FAVORITES} coups de coeur.` }
  }

  // Get next position
  const position = (existing?.length ?? 0) + 1

  const { error } = await supabase
    .from('user_favorites')
    .insert({ user_id: user.id, book_id: bookId, position })

  return { error: error?.message ?? null }
}

export async function removeFavorite(
  bookId: string
): Promise<{ error: string | null }> {
  const supabase = createBrowserClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Vous devez etre connecte.' }

  const { error } = await supabase
    .from('user_favorites')
    .delete()
    .eq('user_id', user.id)
    .eq('book_id', bookId)

  return { error: error?.message ?? null }
}

export async function toggleFavorite(
  bookId: string
): Promise<{ isFavorite: boolean; error: string | null }> {
  const isFav = await isBookFavorite(bookId)

  if (isFav) {
    const result = await removeFavorite(bookId)
    return { isFavorite: false, error: result.error }
  } else {
    const result = await addFavorite(bookId)
    if (result.error) {
      return { isFavorite: false, error: result.error }
    }
    return { isFavorite: true, error: null }
  }
}
