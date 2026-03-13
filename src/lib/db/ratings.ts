import { createClient as createBrowserClient } from '@/lib/supabase/browser'

export async function getUserRating(
  bookId: string
): Promise<number | null> {
  const supabase = createBrowserClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('ratings')
    .select('score')
    .eq('user_id', user.id)
    .eq('book_id', bookId)
    .single()

  return data?.score ?? null
}

export async function upsertRating(
  bookId: string,
  score: number
): Promise<{ error: string | null }> {
  const supabase = createBrowserClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Vous devez être connecté pour noter.' }

  const { error } = await supabase.from('ratings').upsert(
    { user_id: user.id, book_id: bookId, score },
    { onConflict: 'user_id,book_id' }
  )
  return { error: error?.message ?? null }
}

export async function deleteRating(
  bookId: string
): Promise<{ error: string | null }> {
  const supabase = createBrowserClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté.' }

  const { error } = await supabase
    .from('ratings')
    .delete()
    .eq('user_id', user.id)
    .eq('book_id', bookId)
  return { error: error?.message ?? null }
}
