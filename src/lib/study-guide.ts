/**
 * Utility to detect study guides, commentaries, and school textbooks
 * in Google Books volume data.
 *
 * These should never be used as covers for actual books in the library.
 */

const TITLE_KEYWORDS = [
  'commentaire',
  'analyse de',
  'fiche de lecture',
  'résumé de',
  'étude de',
  'cahier de',
  'guide de lecture',
  'lecture analytique',
  'étude critique',
  'profil - ',
  'lire en classe',
  'questions sur',
  'explication de texte',
  'dissertation sur',
  'livre du professeur',
  'parcours de lecture',
  'note de lecture',
  'etude de l',
  'étude de l',
]

const PUBLISHER_KEYWORDS = [
  'le petit littéraire',
  'lepetitlittéraire',
  'hatier',
  "profil d'une oeuvre",
  'gradesaver',
  'bookrags',
  'cliffsnotes',
  'sparknotes',
  'lulu.com',
]

interface VolumeInfo {
  title?: string
  subtitle?: string
  publisher?: string
}

export function isStudyGuide(volumeInfo: VolumeInfo): { result: boolean; reason: string } {
  const title = (volumeInfo.title ?? '').toLowerCase()
  const subtitle = (volumeInfo.subtitle ?? '').toLowerCase()
  const publisher = (volumeInfo.publisher ?? '').toLowerCase()
  const combined = `${title} ${subtitle}`

  for (const kw of TITLE_KEYWORDS) {
    if (combined.includes(kw)) {
      return { result: true, reason: `titre contient "${kw}"` }
    }
  }

  for (const pub of PUBLISHER_KEYWORDS) {
    if (publisher.includes(pub)) {
      return { result: true, reason: `éditeur "${publisher}"` }
    }
  }

  return { result: false, reason: '' }
}
