import yaml from 'js-yaml'
import type { Entrada, Indice } from './types'

const aTexto = (v: unknown): string | undefined =>
  typeof v === 'string' && v.trim() ? v.trim() : v == null ? undefined : String(v)

/** Lee `indice.yml`. Lanza Error si la forma es inválida. */
export function parseIndice(texto: string): Indice {
  const doc = yaml.load(texto) as { secciones?: unknown } | null
  if (!doc || typeof doc !== 'object' || !Array.isArray(doc.secciones)) {
    throw new Error('indice.yml: falta la lista `secciones`')
  }
  const secciones = doc.secciones.map((s, i) => {
    const sec = s as Record<string, unknown> | null
    if (!sec || typeof sec.id !== 'string' || typeof sec.titulo !== 'string' || !Array.isArray(sec.entradas)) {
      throw new Error(`indice.yml: sección ${i + 1} inválida (id, titulo y entradas)`)
    }
    const entradas = sec.entradas.map((e, j): Entrada => {
      const en = e as Record<string, unknown> | null
      if (!en || typeof en.n !== 'number' || typeof en.titulo !== 'string') {
        throw new Error(`indice.yml: entrada ${j + 1} de "${sec.id}" inválida (n y titulo)`)
      }
      const entrada: Entrada = { n: en.n, titulo: en.titulo, confianza: aTexto(en.confianza) ?? '' }
      const puerta = aTexto(en.puerta)
      const nota = aTexto(en.nota)
      const recorrido = aTexto(en.recorrido)
      if (puerta) entrada.puerta = puerta
      if (nota) entrada.nota = nota
      if (recorrido) entrada.recorrido = recorrido
      return entrada
    })
    return { id: sec.id, titulo: sec.titulo, entradas }
  })
  return { secciones }
}
