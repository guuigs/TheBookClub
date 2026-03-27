import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isStudyGuide } from '@/lib/study-guide'

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
 * Returns null if only thumbnails exist (we prefer our generated covers over low-quality images).
 */
function getBestCover(imageLinks: Record<string, string> | undefined): string | null {
  if (!imageLinks) return null

  // Only accept high quality covers - NO thumbnails
  // If only thumbnail/smallThumbnail exist, return null to use our generated cover
  const qualityKeys = ['extraLarge', 'large', 'medium', 'small'] as const

  for (const key of qualityKeys) {
    if (imageLinks[key]) {
      return imageLinks[key]
        .replace(/^http:\/\//, 'https://')
        .replace(/&edge=curl/, '')
    }
  }

  return null
}

interface SearchResult {
  coverUrl: string | null
  debugInfo: SearchDebugInfo[]
}

/**
 * Fetch the full volume data by ID and return the best cover.
 * Search results only return thumbnail/smallThumbnail — the full volume
 * endpoint returns large/medium/extraLarge quality keys.
 * Returns null if the volume is a study guide, commentary, or school textbook.
 */
async function fetchVolumeCover(volumeId: string): Promise<string | null> {
  try {
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes/${volumeId}`)
    if (!res.ok) return null
    const data = await res.json()
    const volumeInfo = data.volumeInfo ?? {}

    // Reject study guides, commentaries, school textbooks
    if (isStudyGuide(volumeInfo).result) return null

    return getBestCover(volumeInfo.imageLinks)
  } catch {
    return null
  }
}

/**
 * Search Google Books for a book by title and author.
 * For each candidate found in search results, fetches the full volume by ID
 * to access high-quality image keys (large/medium/extraLarge).
 * Prefers French editions; falls back to all languages.
 */
async function searchGoogleBooks(title: string, authorName: string | null): Promise<SearchResult> {
  const debugInfo: SearchDebugInfo[] = []

  const cleanTitle = title
    .replace(/\([^)]*\)/g, '')
    .replace(/\[[^\]]*\]/g, '')
    .replace(/[,:;!?]/g, '')
    .trim()

  const queries: { name: string; query: string; langRestrict: boolean }[] = []

  if (authorName) {
    queries.push({ name: `title+author FR`, query: `${cleanTitle} ${authorName}`, langRestrict: true })
    queries.push({ name: `title+author ALL`, query: `${cleanTitle} ${authorName}`, langRestrict: false })
  }
  queries.push({ name: `title FR`, query: cleanTitle, langRestrict: true })
  queries.push({ name: `title ALL`, query: cleanTitle, langRestrict: false })

  for (const { name, query, langRestrict } of queries) {
    const encoded = encodeURIComponent(query)
    const url = langRestrict
      ? `https://www.googleapis.com/books/v1/volumes?q=${encoded}&langRestrict=fr&maxResults=5`
      : `https://www.googleapis.com/books/v1/volumes?q=${encoded}&maxResults=5`

    try {
      const res = await fetch(url)
      const debugEntry: SearchDebugInfo = {
        strategy: name,
        url,
        httpStatus: res.status,
        itemsWithCovers: 0
      }

      if (res.ok) {
        const data: GoogleBooksResponse = await res.json()
        debugEntry.totalItems = data.totalItems ?? 0

        if (data.items && data.items.length > 0) {
          for (const item of data.items) {
            // Search results only have thumbnail — fetch full volume for quality cover
            const coverUrl = await fetchVolumeCover(item.id)
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
        strategy: name,
        url,
        itemsWithCovers: 0,
        error: err instanceof Error ? err.message : 'Unknown error'
      })
    }
  }

  return { coverUrl: null, debugInfo }
}

const ADMIN_EMAIL = 'guilhemtr@proton.me'

export async function POST() {
  try {
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

    // Use admin client for operations
    const adminClient = createAdminClient()

  // Get all books without covers, with author info
  const { data: books, error } = await adminClient
    .from('books')
    .select('id, title, author_id, authors(name)')
    .is('cover_url', null)

  if (error || !books) {
    return NextResponse.json({
      error: 'Failed to fetch books',
      details: error?.message
    }, { status: 500 })
  }

  const DEBUG_MODE = false
  const BATCH_SIZE = 50
  const booksToProcess = books.slice(0, BATCH_SIZE)

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
        const { error: updateError } = await adminClient
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

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  return NextResponse.json(results)
  } catch (err) {
    console.error('find-covers error:', err)
    return NextResponse.json({
      error: 'Erreur serveur',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 })
  }
}
