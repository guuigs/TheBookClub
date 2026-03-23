import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Check if an image URL returns a valid image
async function isImageUrlValid(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    if (!response.ok) return false
    const contentType = response.headers.get('content-type')
    return contentType?.startsWith('image/') ?? false
  } catch {
    return false
  }
}

// Find the best zoom level for a cover URL
async function findBestZoom(coverUrl: string): Promise<string | null> {
  // Try zoom levels from 6 (highest) down to 0 (lowest)
  for (let zoom = 6; zoom >= 0; zoom--) {
    const testUrl = coverUrl.replace(/zoom=\d/, `zoom=${zoom}`)
    if (await isImageUrlValid(testUrl)) {
      return testUrl
    }
  }
  return null
}

export async function POST() {
  const supabase = await createClient()

  // Get all books with their cover URLs
  const { data: books, error } = await supabase
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
    details: [] as { id: string; title: string; status: string; newZoom?: number }[]
  }

  for (const book of books) {
    if (!book.cover_url) {
      results.skipped++
      results.details.push({ id: book.id, title: book.title, status: 'no_cover' })
      continue
    }

    // Find the best zoom level
    const bestUrl = await findBestZoom(book.cover_url)

    if (!bestUrl) {
      results.failed++
      results.details.push({ id: book.id, title: book.title, status: 'no_valid_zoom' })
      continue
    }

    // Extract the zoom level from the best URL
    const zoomMatch = bestUrl.match(/zoom=(\d)/)
    const newZoom = zoomMatch ? parseInt(zoomMatch[1]) : null

    // Update if different
    if (bestUrl !== book.cover_url) {
      const { error: updateError } = await supabase
        .from('books')
        .update({ cover_url: bestUrl })
        .eq('id', book.id)

      if (updateError) {
        results.failed++
        results.details.push({ id: book.id, title: book.title, status: 'update_failed' })
      } else {
        results.updated++
        results.details.push({ id: book.id, title: book.title, status: 'updated', newZoom: newZoom ?? undefined })
      }
    } else {
      results.skipped++
      results.details.push({ id: book.id, title: book.title, status: 'already_best', newZoom: newZoom ?? undefined })
    }
  }

  return NextResponse.json(results)
}
