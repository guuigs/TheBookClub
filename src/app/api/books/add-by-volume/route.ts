import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function toHdCover(url: string | null): string | null {
  if (!url) return null
  return url
    .replace(/^http:\/\//, 'https://')
    .replace(/&edge=curl/, '')
    .replace(/zoom=\d/, 'zoom=0')
    .concat('&fife=w600')
}

export async function POST(request: NextRequest) {
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
  const description: string | null = volumeInfo.description ?? null
  const rawCoverUrl: string | null =
    volumeInfo.imageLinks?.thumbnail ?? volumeInfo.imageLinks?.smallThumbnail ?? null
  const coverUrl = toHdCover(rawCoverUrl)

  const accessInfo = item.accessInfo ?? {}
  const saleInfo = item.saleInfo ?? {}
  const freeReadLink: string | null = accessInfo.webReaderLink ?? null
  const buyLink: string | null =
    saleInfo.saleability === 'FOR_SALE' ? (saleInfo.buyLink ?? null) : null

  const supabase = await createClient()

  // Helper: upsert a single author by name, return their id
  async function upsertAuthor(name: string): Promise<string | null> {
    const { data: existing } = await supabase
      .from('authors')
      .select('id')
      .ilike('name', name)
      .maybeSingle()
    if (existing) return existing.id

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
