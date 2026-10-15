const MAX_LENGTH = 60

// Limpia el nombre de empresa que llega por ?empresa= para mostrarlo en la propuesta.
// Deja letras, números, espacios y la puntuación típica de razones sociales (S.A.S., & Cía, /).
export function cleanCompany(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const cleaned = raw
    .replace(/[^\p{L}\p{N}\s.,&'()/-]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_LENGTH)
    .trim()
  return cleaned || null
}
