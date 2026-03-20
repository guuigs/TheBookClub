/**
 * Script de nettoyage des livres existants
 *
 * Applique les règles suivantes :
 * 1. Supprime les livres sans couverture
 * 2. Supprime les livres avec synopsis < 100 caractères
 * 3. Supprime les livres avec synopsis contenant "4ème de couverture"
 * 4. Nettoie les balises HTML des synopsis
 * 5. Fusionne les auteurs similaires (80%)
 * 6. Supprime les liens Google Play
 *
 * Usage: npx tsx scripts/cleanup-books.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

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

// Pattern to detect "4ème de couverture" and variants
const quatriemeCouverturePattern = /4[eè]?me?\s*(?:de\s+)?couverture|quatri[eè]me\s+(?:de\s+)?couverture/i

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

interface Book {
  id: string
  title: string
  cover_url: string | null
  description: string | null
  free_read_link: string | null
  author_id: string | null
}

interface Author {
  id: string
  name: string
}

async function main() {
  console.log('=== Nettoyage des livres existants ===\n')

  // Fetch all books
  const { data: books, error: booksError } = await supabase
    .from('books')
    .select('id, title, cover_url, description, free_read_link, author_id')

  if (booksError) {
    console.error('Error fetching books:', booksError)
    process.exit(1)
  }

  console.log(`Total de livres: ${books?.length ?? 0}\n`)

  const booksToDelete: string[] = []
  const booksToUpdate: { id: string; description?: string; free_read_link?: string | null }[] = []

  // Analyze each book
  for (const book of books ?? []) {
    let shouldDelete = false
    let reason = ''

    // Rule 1: No cover
    if (!book.cover_url) {
      shouldDelete = true
      reason = 'Pas de couverture'
    }

    // Rule 2: Synopsis < 100 characters
    if (!shouldDelete && (!book.description || book.description.length < 100)) {
      shouldDelete = true
      reason = `Synopsis trop court (${book.description?.length ?? 0} caractères)`
    }

    // Rule 3: Synopsis contains "4ème de couverture"
    if (!shouldDelete && book.description && quatriemeCouverturePattern.test(book.description)) {
      shouldDelete = true
      reason = 'Synopsis contient "4ème de couverture"'
    }

    if (shouldDelete) {
      booksToDelete.push(book.id)
      console.log(`[SUPPRIMER] "${book.title}" - ${reason}`)
      continue
    }

    // Check if book needs updates
    const updates: { id: string; description?: string; free_read_link?: string | null } = { id: book.id }
    let needsUpdate = false

    // Rule 4: Clean HTML tags from synopsis
    if (book.description) {
      const cleanedDescription = stripHtmlTags(book.description)
      if (cleanedDescription !== book.description) {
        updates.description = cleanedDescription
        needsUpdate = true
        console.log(`[NETTOYER HTML] "${book.title}"`)
      }
    }

    // Rule 6: Remove Google Play links
    if (book.free_read_link && book.free_read_link.includes('play.google.com')) {
      updates.free_read_link = null
      needsUpdate = true
      console.log(`[SUPPRIMER LIEN GOOGLE PLAY] "${book.title}"`)
    }

    if (needsUpdate) {
      booksToUpdate.push(updates)
    }
  }

  console.log(`\n--- Résumé ---`)
  console.log(`Livres à supprimer: ${booksToDelete.length}`)
  console.log(`Livres à mettre à jour: ${booksToUpdate.length}`)

  // Delete books
  if (booksToDelete.length > 0) {
    console.log(`\nSuppression de ${booksToDelete.length} livres...`)

    // First delete related records
    for (const bookId of booksToDelete) {
      // Delete ratings
      await supabase.from('ratings').delete().eq('book_id', bookId)
      // Delete comments
      await supabase.from('comments').delete().eq('book_id', bookId)
      // Delete from user_books
      await supabase.from('user_books').delete().eq('book_id', bookId)
      // Delete from book_list_items
      await supabase.from('book_list_items').delete().eq('book_id', bookId)
      // Delete from user_favorites
      await supabase.from('user_favorites').delete().eq('book_id', bookId)
    }

    // Then delete books
    const { error: deleteError } = await supabase
      .from('books')
      .delete()
      .in('id', booksToDelete)

    if (deleteError) {
      console.error('Error deleting books:', deleteError)
    } else {
      console.log(`✓ ${booksToDelete.length} livres supprimés`)
    }
  }

  // Update books
  if (booksToUpdate.length > 0) {
    console.log(`\nMise à jour de ${booksToUpdate.length} livres...`)

    for (const update of booksToUpdate) {
      const { id, ...data } = update
      const { error: updateError } = await supabase
        .from('books')
        .update(data)
        .eq('id', id)

      if (updateError) {
        console.error(`Error updating book ${id}:`, updateError)
      }
    }
    console.log(`✓ ${booksToUpdate.length} livres mis à jour`)
  }

  // Rule 5: Merge similar authors
  console.log('\n=== Fusion des auteurs similaires (80%) ===\n')

  const { data: authors, error: authorsError } = await supabase
    .from('authors')
    .select('id, name')
    .order('name')

  if (authorsError) {
    console.error('Error fetching authors:', authorsError)
    process.exit(1)
  }

  console.log(`Total d'auteurs: ${authors?.length ?? 0}\n`)

  // Find similar authors
  const authorMerges: { keepId: string; keepName: string; mergeId: string; mergeName: string; similarity: number }[] = []
  const processedIds = new Set<string>()

  for (let i = 0; i < (authors?.length ?? 0); i++) {
    const author1 = authors![i]
    if (processedIds.has(author1.id)) continue

    for (let j = i + 1; j < (authors?.length ?? 0); j++) {
      const author2 = authors![j]
      if (processedIds.has(author2.id)) continue

      const similarity = nameSimilarity(author1.name, author2.name)
      if (similarity >= 0.8) {
        // Keep the one with the shorter name (usually cleaner) or first one alphabetically
        const keep = author1.name.length <= author2.name.length ? author1 : author2
        const merge = author1.name.length <= author2.name.length ? author2 : author1

        authorMerges.push({
          keepId: keep.id,
          keepName: keep.name,
          mergeId: merge.id,
          mergeName: merge.name,
          similarity: Math.round(similarity * 100)
        })
        processedIds.add(merge.id)
        console.log(`[FUSIONNER] "${merge.name}" → "${keep.name}" (${Math.round(similarity * 100)}%)`)
      }
    }
  }

  console.log(`\nAuteurs à fusionner: ${authorMerges.length}`)

  // Perform author merges
  for (const merge of authorMerges) {
    // Update books to point to the kept author
    const { error: updateBooksError } = await supabase
      .from('books')
      .update({ author_id: merge.keepId })
      .eq('author_id', merge.mergeId)

    if (updateBooksError) {
      console.error(`Error updating books for author ${merge.mergeId}:`, updateBooksError)
      continue
    }

    // Delete the merged author
    const { error: deleteAuthorError } = await supabase
      .from('authors')
      .delete()
      .eq('id', merge.mergeId)

    if (deleteAuthorError) {
      console.error(`Error deleting author ${merge.mergeId}:`, deleteAuthorError)
    }
  }

  if (authorMerges.length > 0) {
    console.log(`✓ ${authorMerges.length} auteurs fusionnés`)
  }

  console.log('\n=== Nettoyage terminé ===')
}

main().catch(console.error)
