import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface GoogleBooksVolume {
  id: string
  volumeInfo?: {
    title?: string
    authors?: string[]
    language?: string
    imageLinks?: Record<string, string>
  }
}

interface GoogleBooksResponse {
  totalItems?: number
  items?: GoogleBooksVolume[]
}

/**
 * Get the best available cover URL from Google Books imageLinks.
 * Returns null if no real cover exists.
 */
function getBestCover(imageLinks: Record<string, string> | undefined): string | null {
  if (!imageLinks) return null

  // Priority order: highest quality first
  // These keys only exist when a real cover is available
  const qualityKeys = ['extraLarge', 'large', 'medium', 'small'] as const

  for (const key of qualityKeys) {
    if (imageLinks[key]) {
      return imageLinks[key]
        .replace(/^http:\/\//, 'https://')
        .replace(/&edge=curl/, '')
    }
  }

  // If only thumbnail/smallThumbnail exist, this is a placeholder
  return null
}

/**
 * Search Google Books for a book by title and author.
 * Prioritizes French language results.
 */
async function searchGoogleBooks(title: string, authorName: string | null): Promise<string | null> {
  try {
    // Build search query
    let query = `intitle:${encodeURIComponent(title)}`
    if (authorName) {
      query += `+inauthor:${encodeURIComponent(authorName)}`
    }

    // Search with French language filter first
    const urlFr = `https://www.googleapis.com/books/v1/volumes?q=${query}&langRestrict=fr&maxResults=5`
    const resFr = await fetch(urlFr)

    if (resFr.ok) {
      const dataFr: GoogleBooksResponse = await resFr.json()
      if (dataFr.items && dataFr.items.length > 0) {
        // Try to find a book with a real cover
        for (const item of dataFr.items) {
          const coverUrl = getBestCover(item.volumeInfo?.imageLinks)
          if (coverUrl) {
            return coverUrl
          }
        }
      }
    }

    // If no French result with cover, try without language restriction
    const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=5`
    const res = await fetch(url)

    if (res.ok) {
      const data: GoogleBooksResponse = await res.json()
      if (data.items && data.items.length > 0) {
        for (const item of data.items) {
          const coverUrl = getBestCover(item.volumeInfo?.imageLinks)
          if (coverUrl) {
            return coverUrl
          }
        }
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

  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  // Strict admin check: only specific email allowed
  if (user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Accès admin requis' }, { status: 403 })
  }

  // Get all books without covers, with author info
  const { data: books, error } = await supabase
    .from('books')
    .select('id, title, author_id, authors(name)')
    .is('cover_url', null)

  if (error || !books) {
    return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 })
  }

  const results = {
    total: books.length,
    found: 0,
    notFound: 0,
    details: [] as { id: string; title: string; status: string; coverUrl?: string }[]
  }

  for (const book of books) {
    // Get author name from the joined authors table
    // Supabase returns single relation as object, but TypeScript sees it as array
    const authorData = book.authors as unknown as { name: string } | null
    const authorName = authorData?.name ?? null

    // Search for cover on Google Books
    const coverUrl = await searchGoogleBooks(book.title, authorName)

    if (coverUrl) {
      // Update the book with the found cover
      const { error: updateError } = await supabase
        .from('books')
        .update({ cover_url: coverUrl })
        .eq('id', book.id)

      if (updateError) {
        results.details.push({
          id: book.id,
          title: book.title,
          status: 'update_failed'
        })
      } else {
        results.found++
        results.details.push({
          id: book.id,
          title: book.title,
          status: 'cover_found',
          coverUrl
        })
      }
    } else {
      results.notFound++
      results.details.push({
        id: book.id,
        title: book.title,
        status: 'no_cover_found'
      })
    }

    // Add small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200))
  }

  return NextResponse.json(results)
}
