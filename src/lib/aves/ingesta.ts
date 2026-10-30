import type { Variante } from './tipos'

const VARIANTES: Variante[] = ['adulto', 'macho', 'hembra', 'juvenil']
const EXTENSIONES = ['png', 'jpg', 'jpeg', 'webp']
// La web necesita 1024 px; imprimir necesita 2048 (las de menos se amplían antes de imprimir).
// El modelo gratuito de AI Studio entrega 1200×896.
export const LADO_MINIMO_WEB = 1024
export const LADO_MINIMO_IMPRESION = 2048

// "<slug>--<variante>.<ext>", p. ej. "azulejo-comun--adulto.png"
export function parsearNombreArchivo(
  nombre: string,
  slugs: Set<string>
): { slug: string; variante: Variante } | { error: string } {
  const punto = nombre.lastIndexOf('.')
  const ext = punto > 0 ? nombre.slice(punto + 1).toLowerCase() : ''
  if (!EXTENSIONES.includes(ext)) return { error: `${nombre}: extensión no válida (usa ${EXTENSIONES.join(', ')})` }

  const base = nombre.slice(0, punto)
  const separador = base.lastIndexOf('--')
  if (separador <= 0) return { error: `${nombre}: el nombre debe ser <slug>--<variante>` }

  const slug = base.slice(0, separador)
  const variante = base.slice(separador + 2) as Variante
  if (!slugs.has(slug)) return { error: `${nombre}: el slug "${slug}" no está en el catálogo` }
  if (!VARIANTES.includes(variante)) return { error: `${nombre}: variante "${variante}" no válida (${VARIANTES.join(', ')})` }
  return { slug, variante }
}

export function validarDimensiones(ancho: number, alto: number): string | null {
  return Math.max(ancho, alto) >= LADO_MINIMO_WEB
    ? null
    : `la imagen mide ${ancho}×${alto} px; el lado largo debe tener al menos ${LADO_MINIMO_WEB} px`
}

export function aptaParaImpresion(ancho: number, alto: number): boolean {
  return Math.max(ancho, alto) >= LADO_MINIMO_IMPRESION
}
