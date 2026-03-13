import { createClient as createBrowserClient } from '@/lib/supabase/browser'

export async function followUser(
  targetId: string
): Promise<{ error: string | null }> {
  const supabase = createBrowserClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Vous devez être connecté.' }
  if (user.id === targetId) return { error: 'Vous ne pouvez pas vous suivre.' }

  const { error } = await supabase
    .from('follows')
    .insert({ follower_id: user.id, following_id: targetId })
  return { error: error?.message ?? null }
}

export async function unfollowUser(
  targetId: string
): Promise<{ error: string | null }> {
  const supabase = createBrowserClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté.' }

  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', user.id)
    .eq('following_id', targetId)
  return { error: error?.message ?? null }
}

export async function isFollowing(targetId: string): Promise<boolean> {
  const supabase = createBrowserClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', user.id)
    .eq('following_id', targetId)
    .single()
  return !!data
}
