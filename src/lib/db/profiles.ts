import { createClient as createBrowserClient } from '@/lib/supabase/browser'
import type { User } from '@/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapProfileRow(row: any): User {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    avatarUrl: row.avatar_url ?? undefined,
    badge: row.badge ?? 'member',
    booksRead: Number(row.books_rated ?? 0),
    listsCount: Number(row.lists_count ?? 0),
    followersCount: Number(row.followers_count ?? 0),
    followingCount: Number(row.following_count ?? 0),
    joinDate: row.created_at
      ? new Date(row.created_at).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : undefined,
  }
}

export async function getProfiles(): Promise<User[]> {
  const supabase = createBrowserClient()
  const { data } = await supabase.from('profiles_with_stats').select('*')
  return (data ?? []).map(mapProfileRow)
}

export async function getProfileById(id: string): Promise<User | null> {
  const supabase = createBrowserClient()
  const { data } = await supabase
    .from('profiles_with_stats')
    .select('*')
    .eq('id', id)
    .single()
  return data ? mapProfileRow(data) : null
}
