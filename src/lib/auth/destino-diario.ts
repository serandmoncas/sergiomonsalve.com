import { safeNext } from './safe-next'

/**
 * A dónde ir después del segundo factor (DI-083): solo a una página del
 * diario del mismo idioma, nunca a la propia página del código (bucle) ni
 * fuera del sitio. Cualquier otra cosa cae en la portada del diario.
 */
export function destinoDiario(next: string | null, locale: string): string {
  const idioma = locale === 'en' ? 'en' : 'es'
  const portada = `/${idioma}/admin/diario`
  const destino = safeNext(next, portada)
  const enElDiario = new RegExp(`^/${idioma}/admin/diario(/|\\?|$)`)
  const esElCodigo = new RegExp(`^/${idioma}/admin/diario/segundo-factor(/|\\?|$)`)
  if (!enElDiario.test(destino) || esElCodigo.test(destino)) return portada
  return destino
}
