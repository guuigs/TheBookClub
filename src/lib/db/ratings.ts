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

export async function getRatingDistribution(
  bookId: string
): Promise<number[]> {
  const supabase = createBrowserClient()

  // Use secure RPC function that bypasses RLS for aggregation
  const { data } = await supabase
    .rpc('get_book_rating_distribution', { book_uuid: bookId })

  // Initialize array with 10 zeros (index 0 = score 1, index 9 = score 10)
  const distribution = Array(10).fill(0)

  if (data) {
    data.forEach((row: { score: number; vote_count: number }) => {
      const index = row.score - 1 // score 1 goes to index 0, etc.
      if (index >= 0 && index < 10) {
        distribution[index] = Number(row.vote_count)
      }
    })
  }

  return distribution
}
