import type { Variante } from './tipos'

const VARIANTES: Variante[] = ['adulto', 'macho', 'hembra', 'juvenil']
const EXTENSIONES = ['png', 'jpg', 'jpeg', 'webp']
export const LADO_MINIMO = 2048

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
  return Math.max(ancho, alto) >= LADO_MINIMO
    ? null
    : `la imagen mide ${ancho}×${alto} px; el lado largo debe tener al menos ${LADO_MINIMO} px`
}
