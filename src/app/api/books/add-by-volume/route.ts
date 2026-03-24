import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Get the best available cover URL from Google Books imageLinks.
 *
 * Detection method: Google Books API only provides 'small', 'medium', 'large', 'extraLarge'
 * keys when a real cover exists. If only 'thumbnail' and 'smallThumbnail' are present,
 * the book has no cover (those URLs return "image not available" placeholders).
 *
 * This is 100% reliable and requires no additional HTTP requests.
 */
function getBestCover(imageLinks: Record<string, string> | undefined): string | null {
  if (!imageLinks) return null

  // Priority order: highest quality first
  // These keys only exist when a real cover is available
  const qualityKeys = ['extraLarge', 'large', 'medium', 'small'] as const

  for (const key of qualityKeys) {
    if (imageLinks[key]) {
      // Clean URL: use HTTPS and remove curl effect
      return imageLinks[key]
        .replace(/^http:\/\//, 'https://')
        .replace(/&edge=curl/, '')
    }
  }

  // If only thumbnail/smallThumbnail exist, this is a placeholder - no real cover
  return null
}

// Strip HTML tags and decode common HTML entities
function stripHtmlTags(text: string): string {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

// Levenshtein distance for author name similarity
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = []
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }
  return matrix[b.length][a.length]
}

function nameSimilarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length)
  if (maxLen === 0) return 1
  return 1 - levenshteinDistance(a.toLowerCase(), b.toLowerCase()) / maxLen
}

// Pattern to detect "4ème de couverture" and variants
const quatriemeCouverturePattern = /4[eè]?me?\s*(?:de\s+)?couverture|quatri[eè]me\s+(?:de\s+)?couverture/i

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // Authentification requise pour ajouter un livre
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Connexion requise pour ajouter un livre' }, { status: 401 })
  }

  const { volumeId } = await request.json()

  if (!volumeId) {
    return NextResponse.json({ error: 'Volume ID manquant' }, { status: 400 })
  }

  // Fetch full book data from Google Books
  const res = await fetch(`https://www.googleapis.com/books/v1/volumes/${volumeId}`)
  if (!res.ok) {
    return NextResponse.json({ error: 'Livre introuvable' }, { status: 404 })
  }

  const item = await res.json()
  const volumeInfo = item.volumeInfo ?? {}

  const title: string = volumeInfo.title || 'Inconnu'
  // Google Books returns authors as an array — keep them separate
  const authorsRaw: string[] = volumeInfo.authors ?? []
  const genre: string | null = volumeInfo.categories?.join(', ') ?? null
  const rawDescription: string | null = volumeInfo.description ?? null
  const coverUrl = await getBestCover(volumeInfo.imageLinks)

  // Validation 1: Cover required
  if (!coverUrl) {
    return NextResponse.json(
      { error: "Ce livre n'a pas de couverture disponible." },
      { status: 400 }
    )
  }

  // Clean description from HTML tags
  const description = rawDescription ? stripHtmlTags(rawDescription) : null

  // Validation 2: Synopsis must be at least 100 characters
  if (!description || description.length < 100) {
    return NextResponse.json(
      { error: 'Le synopsis de ce livre est trop court ou absent (minimum 100 caractères).' },
      { status: 400 }
    )
  }

  // Validation 3: Reject if synopsis contains "4ème de couverture" variants
  if (quatriemeCouverturePattern.test(description)) {
    return NextResponse.json(
      { error: 'Le synopsis contient une mention de "4ème de couverture" et ne peut pas être ajouté.' },
      { status: 400 }
    )
  }

  const accessInfo = item.accessInfo ?? {}
  const saleInfo = item.saleInfo ?? {}
  const rawFreeReadLink: string | null = accessInfo.webReaderLink ?? null

  // Validation 7: Reject Google Play links for free reading
  const freeReadLink = rawFreeReadLink && !rawFreeReadLink.includes('play.google.com')
    ? rawFreeReadLink
    : null

  const buyLink: string | null =
    saleInfo.saleability === 'FOR_SALE' ? (saleInfo.buyLink ?? null) : null

  // Helper: upsert a single author by name with 80% similarity matching
  async function upsertAuthor(name: string): Promise<string | null> {
    // 1. First check exact match (case-insensitive)
    const { data: existing } = await supabase
      .from('authors')
      .select('id')
      .ilike('name', name)
      .maybeSingle()
    if (existing) return existing.id

    // 2. Check for similar authors (80% similarity threshold)
    const { data: allAuthors } = await supabase
      .from('authors')
      .select('id, name')

    if (allAuthors) {
      for (const author of allAuthors) {
        if (nameSimilarity(name, author.name) >= 0.8) {
          // Merge under the existing author
          return author.id
        }
      }
    }

    // 3. Create new author if no match found
    const { data: created, error } = await supabase
      .from('authors')
      .insert({ name })
      .select('id')
      .single()
    if (error) {
      console.error('[add-by-volume] author insert error:', error)
      return null
    }
    return created.id
  }

  // Deduplication: title (case-insensitive) + first author
  const firstAuthorName = authorsRaw[0] ?? null
  if (firstAuthorName) {
    const { data: existingAuthor } = await supabase
      .from('authors')
      .select('id')
      .ilike('name', firstAuthorName)
      .maybeSingle()

    if (existingAuthor) {
      const { data: existingBook } = await supabase
        .from('books')
        .select('id')
        .ilike('title', title)
        .eq('author_id', existingAuthor.id)
        .maybeSingle()

      if (existingBook) {
        return NextResponse.json({ exists: true, book_id: existingBook.id })
      }
    }
  } else {
    // No author — deduplicate by title only
    const { data: existingBook } = await supabase
      .from('books')
      .select('id')
      .ilike('title', title)
      .maybeSingle()

    if (existingBook) {
      return NextResponse.json({ exists: true, book_id: existingBook.id })
    }
  }

  // Upsert each author individually, collect their ids
  const authorIds: string[] = []
  for (const name of authorsRaw) {
    const id = await upsertAuthor(name)
    if (id) authorIds.push(id)
  }
  const authorId = authorIds[0] ?? null

  // Insert book
  const { data: newBook, error: bookError } = await supabase
    .from('books')
    .insert({
      title,
      author_id: authorId,
      cover_url: coverUrl,
      description,
      genre,
      free_read_link: freeReadLink,
      buy_link: buyLink,
    })
    .select('id')
    .single()

  if (bookError) {
    console.error('[add-by-volume] book insert error:', bookError)
    return NextResponse.json(
      { error: `Erreur livre: ${bookError.message} (code: ${bookError.code})` },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true, book_id: newBook.id })
}
