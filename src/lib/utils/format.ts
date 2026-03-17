/**
 * Centralized formatting utilities
 */

/**
 * Format a date in French locale
 * @example formatDate(new Date()) // "17 mars 2026"
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/**
 * Format a date as relative time
 * @example formatRelativeDate(new Date()) // "aujourd'hui"
 */
export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "aujourd'hui";
  if (diffDays === 1) return "hier";
  if (diffDays < 7) return `il y a ${diffDays} jours`;
  if (diffDays < 30) return `il y a ${Math.floor(diffDays / 7)} semaines`;

  return formatDate(date);
}

/**
 * Truncate text with ellipsis
 * @example truncateText("Hello world", 5) // "Hello..."
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

/**
 * Format a count with plural suffix
 * @example formatCount(5, "livre") // "5 livres"
 * @example formatCount(1, "commentaire") // "1 commentaire"
 */
export function formatCount(count: number, singular: string, plural?: string): string {
  const pluralForm = plural ?? singular + "s";
  return `${count} ${count <= 1 ? singular : pluralForm}`;
}
