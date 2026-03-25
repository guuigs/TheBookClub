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

interface SearchDebugInfo {
  strategy: string
  url: string
  httpStatus?: number
  totalItems?: number
  itemsWithCovers: number
  error?: string
}

interface BookSearchResult {
  bookTitle: string
  authorName: string | null
  coverFound: boolean
  coverUrl?: string
  debugInfo: SearchDebugInfo[]
}

/**
 * Get the best available cover URL from Google Books imageLinks.
 * Returns null if no cover exists at all.
 */
function getBestCover(imageLinks: Record<string, string> | undefined): string | null {
  if (!imageLinks) return null

  // Priority order: highest quality first, but accept thumbnails too
  const qualityKeys = ['extraLarge', 'large', 'medium', 'small', 'thumbnail', 'smallThumbnail'] as const

  for (const key of qualityKeys) {
    if (imageLinks[key]) {
      // Clean URL and upgrade quality for thumbnails
      let url = imageLinks[key]
        .replace(/^http:\/\//, 'https://')
        .replace(/&edge=curl/, '')

      // Try to get higher resolution by modifying zoom parameter
      if (key === 'thumbnail' || key === 'smallThumbnail') {
        url = url.replace(/zoom=\d/, 'zoom=2')
      }

      return url
    }
  }

  return null
}

interface SearchResult {
  coverUrl: string | null
  debugInfo: SearchDebugInfo[]
}

/**
 * Search Google Books for a book by title and author.
 * Tries multiple search strategies to maximize cover discovery.
 * Returns debug info for troubleshooting.
 */
async function searchGoogleBooks(title: string, authorName: string | null): Promise<SearchResult> {
  const debugInfo: SearchDebugInfo[] = []

  // Clean title for better search results
  const cleanTitle = title
    .replace(/\([^)]*\)/g, '') // Remove parentheses content
    .replace(/\[[^\]]*\]/g, '') // Remove brackets content
    .replace(/[,:;!?]/g, '') // Remove punctuation
    .trim()

  const searchStrategies: { name: string; query: string }[] = []

  // Strategy 1: Simple title + author search (most flexible)
  if (authorName) {
    searchStrategies.push({
      name: `title+author: "${cleanTitle}" + "${authorName}"`,
      query: `${cleanTitle} ${authorName}`
    })
  }

  // Strategy 2: Just the title
  searchStrategies.push({
    name: `title only: "${cleanTitle}"`,
    query: cleanTitle
  })

  // Strategy 3: With intitle prefix (more precise)
  searchStrategies.push({
    name: `intitle: "${cleanTitle}"`,
    query: `intitle:${cleanTitle}`
  })

  for (const { name, query } of searchStrategies) {
    const encodedQuery = encodeURIComponent(query)

    // Try French first
    const urlFr = `https://www.googleapis.com/books/v1/volumes?q=${encodedQuery}&langRestrict=fr&maxResults=10`

    try {
      const resFr = await fetch(urlFr)
      const debugEntry: SearchDebugInfo = {
        strategy: `${name} (FR)`,
        url: urlFr,
        httpStatus: resFr.status,
        itemsWithCovers: 0
      }

      if (resFr.ok) {
        const dataFr: GoogleBooksResponse = await resFr.json()
        debugEntry.totalItems = dataFr.totalItems ?? 0

        if (dataFr.items && dataFr.items.length > 0) {
          for (const item of dataFr.items) {
            const coverUrl = getBestCover(item.volumeInfo?.imageLinks)
            if (coverUrl) {
              debugEntry.itemsWithCovers++
              debugInfo.push(debugEntry)
              return { coverUrl, debugInfo }
            }
          }
        }
      } else {
        debugEntry.error = `HTTP ${resFr.status}`
      }
      debugInfo.push(debugEntry)
    } catch (err) {
      debugInfo.push({
        strategy: `${name} (FR)`,
        url: urlFr,
        itemsWithCovers: 0,
        error: err instanceof Error ? err.message : 'Unknown error'
      })
    }

    // Try without language restriction
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodedQuery}&maxResults=10`

    try {
      const res = await fetch(url)
      const debugEntry: SearchDebugInfo = {
        strategy: `${name} (ALL)`,
        url: url,
        httpStatus: res.status,
        itemsWithCovers: 0
      }

      if (res.ok) {
        const data: GoogleBooksResponse = await res.json()
        debugEntry.totalItems = data.totalItems ?? 0

        if (data.items && data.items.length > 0) {
          for (const item of data.items) {
            const coverUrl = getBestCover(item.volumeInfo?.imageLinks)
            if (coverUrl) {
              debugEntry.itemsWithCovers++
              debugInfo.push(debugEntry)
              return { coverUrl, debugInfo }
            }
          }
        }
      } else {
        debugEntry.error = `HTTP ${res.status}`
      }
      debugInfo.push(debugEntry)
    } catch (err) {
      debugInfo.push({
        strategy: `${name} (ALL)`,
        url: url,
        itemsWithCovers: 0,
        error: err instanceof Error ? err.message : 'Unknown error'
      })
    }
  }

  return { coverUrl: null, debugInfo }
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
    return NextResponse.json({
      error: 'Failed to fetch books',
      details: error?.message
    }, { status: 500 })
  }

  // DEBUG MODE: Only process first 5 books to see what's happening
  const DEBUG_MODE = true
  const booksToProcess = DEBUG_MODE ? books.slice(0, 5) : books

  const results = {
    debugMode: DEBUG_MODE,
    totalBooksWithoutCover: books.length,
    processed: booksToProcess.length,
    found: 0,
    notFound: 0,
    details: [] as {
      id: string
      title: string
      authorName: string | null
      status: string
      coverUrl?: string
      debugInfo?: SearchDebugInfo[]
    }[]
  }

  for (const book of booksToProcess) {
    // Get author name from the joined authors table
    // Supabase returns single relation as object, but TypeScript sees it as array
    const authorData = book.authors as unknown as { name: string } | null
    const authorName = authorData?.name ?? null

    // Search for cover on Google Books
    const { coverUrl, debugInfo } = await searchGoogleBooks(book.title, authorName)

    if (coverUrl) {
      // In debug mode, don't actually update the database
      if (!DEBUG_MODE) {
        const { error: updateError } = await supabase
          .from('books')
          .update({ cover_url: coverUrl })
          .eq('id', book.id)

        if (updateError) {
          results.details.push({
            id: book.id,
            title: book.title,
            authorName,
            status: 'update_failed',
            debugInfo
          })
          continue
        }
      }

      results.found++
      results.details.push({
        id: book.id,
        title: book.title,
        authorName,
        status: 'cover_found',
        coverUrl,
        debugInfo
      })
    } else {
      results.notFound++
      results.details.push({
        id: book.id,
        title: book.title,
        authorName,
        status: 'no_cover_found',
        debugInfo
      })
    }

    // Add small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  return NextResponse.json(results)
}
