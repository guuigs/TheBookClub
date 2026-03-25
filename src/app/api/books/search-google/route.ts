import { NextRequest, NextResponse } from 'next/server'

function toHdCover(url: string | null): string | null {
  if (!url) return null
  // Only do safe transformations - don't change zoom level as it might not exist
  return url
    .replace(/^http:\/\//, 'https://')
    .replace(/&edge=curl/, '')
}

export async function GET(request: NextRequest) {
  const title = request.nextUrl.searchParams.get('title')?.trim() || ''
  const author = request.nextUrl.searchParams.get('author')?.trim() || ''
  const isbn = request.nextUrl.searchParams.get('isbn')?.trim() || ''

  // Build query with Google Books operators
  const queryParts: string[] = []

  if (title) {
    queryParts.push(`intitle:${title}`)
  }
  if (author) {
    queryParts.push(`inauthor:${author}`)
  }
  if (isbn) {
    queryParts.push(`isbn:${isbn}`)
  }

  // Need at least one search term with minimum 2 characters
  const hasValidSearch = title.length >= 2 || author.length >= 2 || isbn.length >= 2

  if (queryParts.length === 0 || !hasValidSearch) {
    return NextResponse.json({ results: [] })
  }

  const query = queryParts.join('+')
  const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&langRestrict=fr&maxResults=12`

  console.log('[search-google] Fetching:', apiUrl)

  let res: Response
  try {
    res = await fetch(apiUrl)
  } catch (err) {
    console.error('[search-google] Fetch failed:', err)
    return NextResponse.json({ results: [], error: 'Network error' })
  }

  if (!res.ok) {
    console.error('[search-google] Google Books API error:', res.status, res.statusText)
    return NextResponse.json({ results: [], error: `API error: ${res.status}` })
  }

  let data: { items?: unknown[] }
  try {
    data = await res.json()
  } catch (err) {
    console.error('[search-google] JSON parse failed:', err)
    return NextResponse.json({ results: [], error: 'Invalid response' })
  }

  console.log('[search-google] Got', data.items?.length ?? 0, 'items')

  if (!data.items?.length) {
    return NextResponse.json({ results: [] })
  }

  // langRestrict=fr already filters by language at API level
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const results = data.items.map((item: any) => {
    const v = item.volumeInfo ?? {}
    const rawCover =
      v.imageLinks?.thumbnail ?? v.imageLinks?.smallThumbnail ?? null
    return {
      volumeId: item.id,
      title: v.title ?? 'Titre inconnu',
      author: (v.authors ?? []).join(', ') || 'Auteur inconnu',
      coverUrl: toHdCover(rawCover),
      description: v.description ?? '',
      genre: v.categories?.join(', ') ?? '',
    }
  })

  return NextResponse.json({ results })
}
