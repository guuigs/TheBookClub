import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * API Admin pour nettoyer les livres sans vraie couverture
 *
 * GET  - Analyse et liste les livres problématiques
 * POST - Supprime les livres sans vraie couverture (avec ?action=delete)
 *      - Met à jour vers la meilleure qualité (avec ?action=update)
 */

// Extraire l'ID du volume depuis une URL de couverture Google Books
function extractVolumeId(coverUrl: string): string | null {
  const match = coverUrl.match(/[?&]id=([^&]+)/)
  return match ? match[1] : null
}

// Vérifier si un livre a une vraie couverture via l'API Google Books
async function checkCover(volumeId: string): Promise<{ hasReal: boolean; bestUrl: string | null }> {
  try {
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes/${volumeId}`)
    if (!res.ok) return { hasReal: false, bestUrl: null }

    const data = await res.json()
    const imageLinks = data.volumeInfo?.imageLinks

    if (!imageLinks) return { hasReal: false, bestUrl: null }

    const qualityKeys = ['extraLarge', 'large', 'medium', 'small'] as const

    for (const key of qualityKeys) {
      if (imageLinks[key]) {
        const bestUrl = imageLinks[key]
          .replace(/^http:\/\//, 'https://')
          .replace(/&edge=curl/, '')
        return { hasReal: true, bestUrl }
      }
    }

    return { hasReal: false, bestUrl: null }
  } catch {
    return { hasReal: false, bestUrl: null }
  }
}

// Vérification admin
async function verifyAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { authorized: false, error: 'Non autorisé' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('badge')
    .eq('id', user.id)
    .single()

  if (profile?.badge !== 'honor') {
    return { authorized: false, error: 'Accès admin requis' }
  }

  return { authorized: true, error: null }
}

// GET: Analyse des couvertures
export async function GET() {
  const supabase = await createClient()

  const { authorized, error } = await verifyAdmin(supabase)
  if (!authorized) {
    return NextResponse.json({ error }, { status: 401 })
  }

  const { data: books, error: fetchError } = await supabase
    .from('books')
    .select('id, title, cover_url')
    .order('title')

  if (fetchError || !books) {
    return NextResponse.json({ error: 'Erreur récupération livres' }, { status: 500 })
  }

  const results = {
    total: books.length,
    valid: [] as { id: string; title: string; canUpgrade: boolean }[],
    invalid: [] as { id: string; title: string }[],
    noUrl: [] as { id: string; title: string }[]
  }

  for (const book of books) {
    if (!book.cover_url) {
      results.noUrl.push({ id: book.id, title: book.title })
      continue
    }

    const volumeId = extractVolumeId(book.cover_url)
    if (!volumeId) {
      results.invalid.push({ id: book.id, title: book.title })
      continue
    }

    const { hasReal, bestUrl } = await checkCover(volumeId)

    if (hasReal && bestUrl) {
      const canUpgrade = bestUrl !== book.cover_url
      results.valid.push({ id: book.id, title: book.title, canUpgrade })
    } else {
      results.invalid.push({ id: book.id, title: book.title })
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  return NextResponse.json({
    summary: {
      total: results.total,
      valid: results.valid.length,
      canUpgrade: results.valid.filter(b => b.canUpgrade).length,
      invalid: results.invalid.length,
      noUrl: results.noUrl.length
    },
    invalid: results.invalid,
    noUrl: results.noUrl,
    canUpgrade: results.valid.filter(b => b.canUpgrade)
  })
}

// POST: Actions sur les couvertures
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { authorized, error } = await verifyAdmin(supabase)
  if (!authorized) {
    return NextResponse.json({ error }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  if (action !== 'delete' && action !== 'update') {
    return NextResponse.json(
      { error: 'Action invalide. Utilisez ?action=delete ou ?action=update' },
      { status: 400 }
    )
  }

  const { data: books, error: fetchError } = await supabase
    .from('books')
    .select('id, title, cover_url')

  if (fetchError || !books) {
    return NextResponse.json({ error: 'Erreur récupération livres' }, { status: 500 })
  }

  const results = {
    processed: 0,
    deleted: [] as string[],
    updated: [] as string[],
    errors: [] as { title: string; error: string }[]
  }

  for (const book of books) {
    if (!book.cover_url) continue

    const volumeId = extractVolumeId(book.cover_url)
    if (!volumeId) continue

    const { hasReal, bestUrl } = await checkCover(volumeId)
    results.processed++

    if (action === 'delete' && !hasReal) {
      // Supprimer les livres sans vraie couverture
      const { error: deleteError } = await supabase
        .from('books')
        .delete()
        .eq('id', book.id)

      if (deleteError) {
        results.errors.push({ title: book.title, error: deleteError.message })
      } else {
        results.deleted.push(book.title)
      }
    } else if (action === 'update' && hasReal && bestUrl && bestUrl !== book.cover_url) {
      // Mettre à jour vers la meilleure qualité
      const { error: updateError } = await supabase
        .from('books')
        .update({ cover_url: bestUrl })
        .eq('id', book.id)

      if (updateError) {
        results.errors.push({ title: book.title, error: updateError.message })
      } else {
        results.updated.push(book.title)
      }
    }

    await new Promise(resolve => setTimeout(resolve, 100))
  }

  return NextResponse.json({
    action,
    processed: results.processed,
    deleted: results.deleted.length,
    updated: results.updated.length,
    errors: results.errors.length,
    details: {
      deleted: results.deleted,
      updated: results.updated,
      errors: results.errors
    }
  })
}
