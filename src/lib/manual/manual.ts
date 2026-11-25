import { cache } from 'react'
import matter from 'gray-matter'
import { fetchRepoFiles, ManualSourceError, type RepoFiles } from './source'
import { parseNota } from './parse'
import { parseIndice } from './indice'
import { parseRecorrido } from './recorridos'
import { makeResolver, buildGrafo } from './graph'
import type { Indice, Manual, ManualError, Nota, Recorrido } from './types'

const msg = (e: unknown) => (e instanceof Error ? e.message : String(e))

function ensamblar(files: RepoFiles): Manual {
  const rotas: Manual['rotas'] = []

  const notas = new Map<string, Nota>()
  for (const [slug, raw] of Object.entries(files.notas)) {
    const r = parseNota(slug, raw)
    if (r.ok) notas.set(slug, r.nota)
    else rotas.push({ slug, error: r.error })
  }

  // Un recorrido roto se omite y se registra; no tumba el manual.
  const recorridos = new Map<string, Recorrido>()
  for (const [slug, raw] of Object.entries(files.recorridos)) {
    try {
      recorridos.set(slug, parseRecorrido(slug, raw))
    } catch (e) {
      console.error(`[manual] recorrido ${slug} no parsea: ${msg(e)}`)
      rotas.push({ slug: `recorridos/${slug}`, error: msg(e) })
    }
  }

  let indice: Indice | null = null
  if (files.indice !== null) {
    try {
      indice = parseIndice(files.indice)
    } catch (e) {
      console.error(`[manual] indice.yml no parsea: ${msg(e)}`)
      rotas.push({ slug: 'indice.yml', error: msg(e) })
    }
  }

  const sobre = files.sobre === null ? null : matter(files.sobre).content

  const resolve = makeResolver([...notas.values()], [...recorridos.values()])
  const { grafo, backlinks, huerfanas } = buildGrafo([...notas.values()], resolve)
  return { notas, rotas, indice, recorridos, resolve, grafo, backlinks, huerfanas, sobre }
}

async function cargar(): Promise<{ ok: true; manual: Manual } | { ok: false; error: ManualError }> {
  try {
    return { ok: true, manual: ensamblar(await fetchRepoFiles()) }
  } catch (e) {
    if (e instanceof ManualSourceError && e.tipo === 'no-configurado') {
      return { ok: false, error: { tipo: 'no-configurado' } }
    }
    console.error(`[manual] fallo al cargar: ${msg(e)}`)
    return { ok: false, error: { tipo: 'fallo', detalle: msg(e) } }
  }
}

// cache() evita repetir el trabajo dentro de un mismo render.
export const getManual = cache(cargar)
