import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ADMIN_EMAIL = 'guilhemtr@proton.me'

interface DuplicateGroup {
  title: string
  author_id: string | null
  ids: string[]
}

export async function POST() {
  const supabase = await createClient()

  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  // Strict admin check
  if (user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Accès admin requis' }, { status: 403 })
  }

  // Find duplicate books (same title + author_id)
  const { data: books, error: fetchError } = await supabase
    .from('books')
    .select('id, title, author_id, created_at')
    .order('created_at', { ascending: true })

  if (fetchError || !books) {
    return NextResponse.json({ error: 'Erreur lors de la récupération des livres' }, { status: 500 })
  }

  // Group by title + author_id (case insensitive)
  const groups = new Map<string, typeof books>()

  for (const book of books) {
    const key = `${book.title.toLowerCase().trim()}|${book.author_id || 'null'}`
    const existing = groups.get(key) || []
    existing.push(book)
    groups.set(key, existing)
  }

  // Find groups with duplicates
  const duplicateGroups: DuplicateGroup[] = []
  for (const [, group] of groups) {
    if (group.length > 1) {
      duplicateGroups.push({
        title: group[0].title,
        author_id: group[0].author_id,
        ids: group.map(b => b.id)
      })
    }
  }

  const results = {
    duplicateGroupsFound: duplicateGroups.length,
    totalDuplicates: duplicateGroups.reduce((sum, g) => sum + g.ids.length - 1, 0),
    deleted: 0,
    errors: [] as string[],
    details: [] as { title: string; kept: string; deleted: string[] }[]
  }

  // For each duplicate group, keep the first (oldest) and delete the rest
  for (const group of duplicateGroups) {
    const [keepId, ...deleteIds] = group.ids

    for (const deleteId of deleteIds) {
      try {
        // First, update any references to point to the kept book
        // Update ratings
        await supabase
          .from('ratings')
          .update({ book_id: keepId })
          .eq('book_id', deleteId)

        // Update comments
        await supabase
          .from('comments')
          .update({ book_id: keepId })
          .eq('book_id', deleteId)

        // Update book_list_items (might have duplicates, so delete instead)
        await supabase
          .from('book_list_items')
          .delete()
          .eq('book_id', deleteId)

        // Now delete the duplicate book
        const { error: deleteError } = await supabase
          .from('books')
          .delete()
          .eq('id', deleteId)

        if (deleteError) {
          results.errors.push(`Erreur suppression ${group.title}: ${deleteError.message}`)
        } else {
          results.deleted++
        }
      } catch (err) {
        results.errors.push(`Erreur ${group.title}: ${err instanceof Error ? err.message : 'Unknown'}`)
      }
    }

    results.details.push({
      title: group.title,
      kept: keepId,
      deleted: deleteIds
    })
  }

  return NextResponse.json(results)
}

// GET method to preview duplicates without deleting
export async function GET() {
  const supabase = await createClient()

  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  // Strict admin check
  if (user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Accès admin requis' }, { status: 403 })
  }

  // Find duplicate books
  const { data: books, error: fetchError } = await supabase
    .from('books')
    .select('id, title, author_id, authors(name), created_at')
    .order('created_at', { ascending: true })

  if (fetchError || !books) {
    return NextResponse.json({ error: 'Erreur lors de la récupération des livres' }, { status: 500 })
  }

  // Group by title + author_id
  const groups = new Map<string, typeof books>()

  for (const book of books) {
    const key = `${book.title.toLowerCase().trim()}|${book.author_id || 'null'}`
    const existing = groups.get(key) || []
    existing.push(book)
    groups.set(key, existing)
  }

  // Find groups with duplicates
  const duplicates = []
  for (const [, group] of groups) {
    if (group.length > 1) {
      const authorData = group[0].authors as unknown as { name: string } | null
      duplicates.push({
        title: group[0].title,
        author: authorData?.name ?? 'Inconnu',
        count: group.length,
        ids: group.map(b => b.id)
      })
    }
  }

  return NextResponse.json({
    totalDuplicateGroups: duplicates.length,
    totalDuplicateBooks: duplicates.reduce((sum, d) => sum + d.count - 1, 0),
    duplicates
  })
}
