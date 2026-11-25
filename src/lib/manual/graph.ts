import { normKey } from './parse'
import type { Grafo, Nota, Recorrido, Resolver } from './types'

/** Resuelve un destino crudo: nota por slug → nota por título → recorrido por slug → recorrido por nombre. */
export function makeResolver(notas: Nota[], recorridos: Recorrido[]): Resolver {
  const notaSlug = new Map<string, string>()
  const notaTitulo = new Map<string, string>()
  for (const n of notas) {
    notaSlug.set(normKey(n.slug), n.slug)
    const k = normKey(n.titulo)
    if (!notaTitulo.has(k)) notaTitulo.set(k, n.slug)
  }
  const recSlug = new Map<string, string>()
  const recNombre = new Map<string, string>()
  for (const r of recorridos) {
    recSlug.set(normKey(r.slug), r.slug)
    const k = normKey(r.nombre)
    if (!recNombre.has(k)) recNombre.set(k, r.slug)
  }
  return (raw) => {
    const k = normKey(raw)
    const n = notaSlug.get(k) ?? notaTitulo.get(k)
    if (n) return { tipo: 'nota', slug: n }
    const r = recSlug.get(k) ?? recNombre.get(k)
    if (r) return { tipo: 'recorrido', slug: r }
    return null
  }
}

/**
 * Grafo de notas. Los destinos sin resolver son nodos apagados (`x:<clave>`);
 * los enlaces a recorridos no cuentan. Huérfana = sin aristas hacia ni desde otras notas.
 */
export function buildGrafo(
  notas: Nota[],
  resolve: Resolver,
): { grafo: Grafo; backlinks: Record<string, string[]>; huerfanas: string[] } {
  const nodes: Grafo['nodes'] = notas.map((n) => ({ id: n.slug, titulo: n.titulo, existe: true }))
  const fantasmas = new Map<string, string>() // id → título crudo
  const links: Grafo['links'] = []
  const vistos = new Set<string>()
  const backlinks: Record<string, string[]> = {}
  const conectadas = new Set<string>()

  for (const n of notas) {
    for (const raw of n.enlacesRaw) {
      const r = resolve(raw)
      if (r?.tipo === 'recorrido') continue
      const target = r ? r.slug : 'x:' + normKey(raw)
      if (target === n.slug) continue
      const clave = `${n.slug}\0${target}`
      if (vistos.has(clave)) continue
      vistos.add(clave)
      links.push({ source: n.slug, target })
      if (r) {
        ;(backlinks[target] ??= []).push(n.slug)
        conectadas.add(n.slug)
        conectadas.add(target)
      } else if (!fantasmas.has(target)) {
        fantasmas.set(target, raw)
      }
    }
  }
  for (const [id, titulo] of fantasmas) nodes.push({ id, titulo, existe: false })

  const huerfanas = notas.filter((n) => !conectadas.has(n.slug)).map((n) => n.slug)
  return { grafo: { nodes, links }, backlinks, huerfanas }
}
