import { wikiTarget } from './parse'
import type { Recorrido, Resolver } from './types'

const H2_PASOS = 'Notas, en orden'

/** Lee un archivo de `recorridos/`: título, cabecera y pasos `N. [[destino]]`. */
export function parseRecorrido(slug: string, raw: string): Recorrido {
  const lineas = raw.split(/\r?\n/)
  let nombre = ''
  let paraQuien: string | undefined
  let resultado: string | undefined
  const pasos: string[] = []
  let enPasos = false
  // Campo de cabecera abierto: sus líneas siguientes se unen hasta una línea vacía o un `**Otro:**`.
  let abierto: 'paraQuien' | 'resultado' | null = null

  for (const linea of lineas) {
    const h1 = /^#\s+(.+?)\s*$/.exec(linea)
    if (h1 && !nombre) {
      nombre = h1[1].replace(/^Recorrido\s*[—–-]\s*/i, '').trim()
      continue
    }
    const h2 = /^##\s+(.+?)\s*$/.exec(linea)
    if (h2) {
      enPasos = h2[1].trim() === H2_PASOS
      abierto = null
      continue
    }
    if (enPasos) {
      const m = /^\s*\d+\.\s*\[\[([^\]]+)\]\]/.exec(linea)
      if (m) {
        const destino = wikiTarget(m[1])
        if (destino) pasos.push(destino)
      }
      continue
    }
    const campo = /^\*\*(Para quién|Resultado):\*\*\s*(.*)$/.exec(linea)
    if (campo) {
      abierto = campo[1] === 'Resultado' ? 'resultado' : 'paraQuien'
      if (abierto === 'resultado') resultado = campo[2].trim()
      else paraQuien = campo[2].trim()
      continue
    }
    if (/^\*\*[^*]+:\*\*/.test(linea) || !linea.trim()) {
      abierto = null
      continue
    }
    if (abierto === 'resultado') resultado = `${resultado ?? ''} ${linea.trim()}`.trim()
    else if (abierto === 'paraQuien') paraQuien = `${paraQuien ?? ''} ${linea.trim()}`.trim()
  }

  const rec: Recorrido = { slug, nombre: nombre || slug, pasos }
  if (paraQuien) rec.paraQuien = paraQuien
  if (resultado) rec.resultado = resultado
  return rec
}

/**
 * Posición de `slug` en el recorrido y sus vecinos. Los pasos sin nota
 * (no resueltos o que apuntan a otro recorrido) se saltan al buscar vecinos.
 * `indice` y `total` cuentan todos los pasos. Devuelve null si la nota no está.
 */
export function pasoVecinos(
  rec: Recorrido,
  slug: string,
  resolve: Resolver,
): { indice: number; total: number; anterior?: string; siguiente?: string } | null {
  const slugs = rec.pasos.map((p) => {
    const r = resolve(p)
    return r?.tipo === 'nota' ? r.slug : null
  })
  const indice = slugs.indexOf(slug)
  if (indice === -1) return null
  const anterior = slugs.slice(0, indice).reverse().find((s): s is string => s !== null)
  const siguiente = slugs.slice(indice + 1).find((s): s is string => s !== null)
  return { indice, total: rec.pasos.length, anterior, siguiente }
}
