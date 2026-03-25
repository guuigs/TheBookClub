import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Extract volume ID from a Google Books cover URL
 * Example: https://books.google.com/books/content?id=XXX&printsec=frontcover...
 */
function extractVolumeId(coverUrl: string): string | null {
  const match = coverUrl.match(/[?&]id=([^&]+)/)
  return match ? match[1] : null
}

/**
 * Get the best available cover URL from Google Books API.
 * Returns null if no real cover exists (only placeholder available).
 */
async function getBestCoverFromApi(volumeId: string): Promise<string | null> {
  try {
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes/${volumeId}`)
    if (!res.ok) return null

    const data = await res.json()
    const imageLinks = data.volumeInfo?.imageLinks

    if (!imageLinks) return null

    // Only high quality - NO thumbnails (prefer generated covers over low-quality)
    const qualityKeys = ['extraLarge', 'large', 'medium', 'small'] as const

    for (const key of qualityKeys) {
      if (imageLinks[key]) {
        return imageLinks[key]
          .replace(/^http:\/\//, 'https://')
          .replace(/&edge=curl/, '')
      }
    }

    return null
  } catch {
    return null
  }
}

const ADMIN_EMAIL = 'guilhemtr@proton.me'

export async function POST() {
  const supabase = await createClient()

  // Vérifier l'authentification
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  // Strict admin check: only specific email allowed
  if (user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Accès admin requis' }, { status: 403 })
  }

  // Use admin client for operations
  const adminClient = createAdminClient()

  // Get all books with their cover URLs
  const { data: books, error } = await adminClient
    .from('books')
    .select('id, title, cover_url')

  if (error || !books) {
    return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 })
  }

  const results = {
    total: books.length,
    updated: 0,
    failed: 0,
    skipped: 0,
    details: [] as { id: string; title: string; status: string }[]
  }

  for (const book of books) {
    if (!book.cover_url) {
      results.skipped++
      results.details.push({ id: book.id, title: book.title, status: 'no_cover' })
      continue
    }

    // Extract volume ID from current cover URL
    const volumeId = extractVolumeId(book.cover_url)
    if (!volumeId) {
      results.skipped++
      results.details.push({ id: book.id, title: book.title, status: 'invalid_url' })
      continue
    }

    // Get the best cover from Google Books API
    const bestUrl = await getBestCoverFromApi(volumeId)

    if (!bestUrl) {
      // No real cover available - set to null so generated cover is used
      const { error: nullError } = await adminClient
        .from('books')
        .update({ cover_url: null })
        .eq('id', book.id)

      if (nullError) {
        results.failed++
        results.details.push({ id: book.id, title: book.title, status: 'null_update_failed' })
      } else {
        results.updated++
        results.details.push({ id: book.id, title: book.title, status: 'set_to_generated' })
      }
      continue
    }

    // Update if different
    if (bestUrl !== book.cover_url) {
      const { error: updateError } = await adminClient
        .from('books')
        .update({ cover_url: bestUrl })
        .eq('id', book.id)

      if (updateError) {
        results.failed++
        results.details.push({ id: book.id, title: book.title, status: 'update_failed' })
      } else {
        results.updated++
        results.details.push({ id: book.id, title: book.title, status: 'upgraded' })
      }
    } else {
      results.skipped++
      results.details.push({ id: book.id, title: book.title, status: 'already_best' })
    }
  }

  return NextResponse.json(results)
}
