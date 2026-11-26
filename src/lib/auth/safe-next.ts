/**
 * Acepta solo rutas internas ("/algo"). Rechaza "//host", "/\host", esquemas
 * y cualquier carácter de control; en esos casos devuelve el fallback.
 */
export function safeNext(next: string | null, fallback: string): string {
  if (!next) return fallback
  if (!next.startsWith('/')) return fallback
  if (next.startsWith('//') || next.startsWith('/\\')) return fallback
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\u007f\\]/.test(next)) return fallback
  return next
}
