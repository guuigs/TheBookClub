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

export interface UpdateProfileData {
  display_name?: string
  username?: string
  bio?: string
  avatar_url?: string
}

export async function updateProfile(
  data: UpdateProfileData
): Promise<{ error: string | null }> {
  const supabase = createBrowserClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Non connecte' }
  }

  const { error } = await supabase
    .from('profiles')
    .update(data)
    .eq('id', user.id)

  if (error) {
    if (error.code === '23505') {
      return { error: 'Ce nom d\'utilisateur est deja pris' }
    }
    return { error: 'Erreur lors de la mise a jour du profil' }
  }

  return { error: null }
}

export async function uploadAvatar(
  file: File
): Promise<{ url: string | null; error: string | null }> {
  const supabase = createBrowserClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { url: null, error: 'Non connecte' }
  }

  // Validate file
  if (!file.type.startsWith('image/')) {
    return { url: null, error: 'Le fichier doit etre une image' }
  }
  if (file.size > 2 * 1024 * 1024) {
    return { url: null, error: 'Le fichier ne doit pas depasser 2MB' }
  }

  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}-${Date.now()}.${fileExt}`
  const filePath = `avatars/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true })

  if (uploadError) {
    return { url: null, error: 'Erreur lors de l\'upload' }
  }

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath)

  // Update profile with new avatar URL
  await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', user.id)

  return { url: publicUrl, error: null }
}
