import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isStudyGuide } from '@/lib/study-guide'

const ADMIN_EMAIL = 'guilhemtr@proton.me'
const BATCH_SIZE = 50

function extractVolumeId(coverUrl: string): string | null {
  const match = coverUrl.match(/[?&]id=([^&]+)/)
  return match ? match[1] : null
}

async function fetchVolumeInfo(volumeId: string) {
  try {
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes/${volumeId}`)
    if (!res.ok) return null
    const data = await res.json()
    return data.volumeInfo ?? null
  } catch {
    return null
  }
}

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user || user.email !== ADMIN_EMAIL) return null
  return user
}

/**
 * GET — Analyse les livres et covers non conformes (aperçu sans modifications).
 * Vérifie:
 *   1. Les livres de la DB dont le titre indique un guide d'étude / commentaire
 *   2. Les covers existantes qui proviennent d'un volume guide d'étude (50 par batch)
 */
export async function GET(request: Request) {
  try {
    const user = await verifyAdmin()
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const adminClient = createAdminClient()

    const { data: allBooks, error } = await adminClient
      .from('books')
      .select('id, title, cover_url, authors(name)')

    if (error || !allBooks) {
      return NextResponse.json({ error: 'Impossible de récupérer les livres' }, { status: 500 })
    }

    // 1. Books in DB whose own title is a study guide
    const studyGuideBooks: { id: string; title: string; authorName: string | null; reason: string }[] = []
    for (const book of allBooks) {
      const check = isStudyGuide({ title: book.title })
      if (check.result) {
        const authorData = book.authors as unknown as { name: string } | null
        studyGuideBooks.push({
          id: book.id,
          title: book.title,
          authorName: authorData?.name ?? null,
          reason: check.reason
        })
      }
    }

    // 2. Covers pointing to a study guide volume on Google Books (batched)
    const url = new URL(request.url)
    const offset = parseInt(url.searchParams.get('offset') ?? '0', 10)
    const booksWithCovers = allBooks.filter(b => b.cover_url)
    const toCheck = booksWithCovers.slice(offset, offset + BATCH_SIZE)
    const invalidCovers: { id: string; title: string; volumeTitle: string; reason: string }[] = []

    for (const book of toCheck) {
      const volumeId = extractVolumeId(book.cover_url!)
      if (!volumeId) continue

      const volumeInfo = await fetchVolumeInfo(volumeId)
      if (!volumeInfo) continue

      const check = isStudyGuide(volumeInfo)
      if (check.result) {
        invalidCovers.push({
          id: book.id,
          title: book.title,
          volumeTitle: volumeInfo.title ?? 'Inconnu',
          reason: check.reason
        })
      }

      await new Promise(r => setTimeout(r, 100))
    }

    return NextResponse.json({
      totalBooks: allBooks.length,
      studyGuideBooks,
      invalidCovers,
      checkedCovers: toCheck.length,
      offset,
      nextOffset: offset + toCheck.length,
      remainingCovers: Math.max(0, booksWithCovers.length - (offset + toCheck.length))
    })
  } catch (err) {
    return NextResponse.json({
      error: 'Erreur serveur',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * POST?action=books  — Supprime les livres guides d'étude de la DB
 * POST?action=covers — Remet à null les covers qui proviennent de volumes guides d'étude (batch 50)
 */
export async function POST(request: Request) {
  try {
    const user = await verifyAdmin()
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const url = new URL(request.url)
    const action = url.searchParams.get('action')
    const adminClient = createAdminClient()

    if (action === 'books') {
      const { data: allBooks, error } = await adminClient.from('books').select('id, title')
      if (error || !allBooks) {
        return NextResponse.json({ error: 'Impossible de récupérer les livres' }, { status: 500 })
      }

      const toDelete = allBooks
        .filter(b => isStudyGuide({ title: b.title }).result)
        .map(b => b.id)

      if (toDelete.length === 0) {
        return NextResponse.json({ deleted: 0 })
      }

      const { error: deleteError } = await adminClient
        .from('books')
        .delete()
        .in('id', toDelete)

      if (deleteError) {
        return NextResponse.json({ error: deleteError.message }, { status: 500 })
      }

      return NextResponse.json({ deleted: toDelete.length })
    }

    if (action === 'covers') {
      const { data: books, error } = await adminClient
        .from('books')
        .select('id, title, cover_url')
        .not('cover_url', 'is', null)

      if (error || !books) {
        return NextResponse.json({ error: 'Impossible de récupérer les livres' }, { status: 500 })
      }

      const toProcess = books.slice(0, BATCH_SIZE)
      let fixed = 0
      let failed = 0

      for (const book of toProcess) {
        const volumeId = extractVolumeId(book.cover_url!)
        if (!volumeId) continue

        const volumeInfo = await fetchVolumeInfo(volumeId)
        if (!volumeInfo) continue

        if (isStudyGuide(volumeInfo).result) {
          const { error: updateError } = await adminClient
            .from('books')
            .update({ cover_url: null })
            .eq('id', book.id)

          if (updateError) failed++
          else fixed++
        }

        await new Promise(r => setTimeout(r, 100))
      }

      return NextResponse.json({
        fixed,
        failed,
        checked: toProcess.length,
        remaining: Math.max(0, books.length - BATCH_SIZE)
      })
    }

    return NextResponse.json(
      { error: 'Action invalide. Utiliser ?action=books ou ?action=covers' },
      { status: 400 }
    )
  } catch (err) {
    return NextResponse.json({
      error: 'Erreur serveur',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 })
  }
}
