import { NextRequest, NextResponse } from 'next/server'

function toHdCover(url: string | null): string | null {
  if (!url) return null
  return url
    .replace(/^http:\/\//, 'https://')
    .replace(/&edge=curl/, '')
    .replace(/zoom=\d/, 'zoom=0')
    .concat('&fife=w600')
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim()

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] })
  }

  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=8`
  )

  if (!res.ok) {
    return NextResponse.json({ results: [] })
  }

  const data = await res.json()

  if (!data.items?.length) {
    return NextResponse.json({ results: [] })
  }

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
