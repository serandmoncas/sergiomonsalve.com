import { normalizar } from '@/lib/experiencias-ia/buscar'
import type { ConceptoClasificado, Cuadrante } from '@/lib/ia-autorretrato/tipos'
import { aCsv, deCsv } from './csv'
import { escaparRegex } from './util'

type EntradaGlosario = { slug: string; termino: string; categoria: string }

/** Clave: variante normalizada del término. Editable. */
export const SINONIMOS: Record<string, string[]> = {
  llm: ['llms', 'modelo de lenguaje', 'modelos de lenguaje'],
  mcp: ['model context protocol'],
  rag: ['retrieval augmented generation', 'retrieval-augmented generation'],
  agente: ['agentes'],
  embeddings: ['embedding'],
}

/** Señales en manifiestos y lenguajes que indican que el concepto está construido. */
export const SENALES_CODIGO: Record<string, RegExp> = {
  rag: /pgvector|chromadb|faiss|pinecone|embedding/,
  embeddings: /embedding|sentence-transformers|pgvector/,
  agente: /anthropic|openai|langchain|crewai|ollama/,
  mcp: /modelcontextprotocol/,
}

export function variantes(termino: string): string[] {
  const base = normalizar(termino).trim()
  const sinParentesis = base.replace(/\s*\([^)]*\)\s*/g, ' ').trim()
  const dentro = [...base.matchAll(/\(([^)]+)\)/g)].map(m => m[1].trim())
  const todas = new Set([base, sinParentesis, ...dentro].filter(v => v.length >= 2))
  for (const v of [...todas]) for (const s of SINONIMOS[v] ?? []) todas.add(s)
  return [...todas]
}

export function contiene(textoNormalizado: string, variante: string): boolean {
  return new RegExp(`(^|[^a-z0-9])${escaparRegex(variante)}([^a-z0-9]|$)`).test(textoNormalizado)
}

const INTERROGATIVOS = /(^|[^a-z])(que es|que son|que significa|explicame|como funciona|what is|what are|what does)([^a-z]|$)/

export function esOracionPregunta(oracion: string): boolean {
  const o = oracion.trim()
  return o.endsWith('?') || INTERROGATIVOS.test(o)
}

const oraciones = (texto: string) => normalizar(texto).split(/(?<=[.!?\n])\s+/).filter(Boolean)

export function clasificarConceptos(
  glosario: EntradaGlosario[],
  prompts: string[],
  senalesCodigo: string,
  correcciones: Map<string, Cuadrante> = new Map(),
): ConceptoClasificado[] {
  const porPrompt = prompts.map(oraciones)
  return glosario.map(g => {
    const vars = variantes(g.termino)
    let hablado = 0
    let preguntado = 0
    for (const os of porPrompt) {
      const conTermino = os.filter(o => vars.some(v => contiene(o, v)))
      if (conTermino.length === 0) continue
      if (conTermino.every(esOracionPregunta)) preguntado++
      else hablado++
    }
    const construido = vars.some(v => contiene(senalesCodigo, v) || (SENALES_CODIGO[v]?.test(senalesCodigo) ?? false))
    const calculado: Cuadrante = hablado > 0
      ? (construido ? 'ambos' : 'solo-hablado')
      : (construido ? 'solo-construido' : 'ninguno')
    return {
      slug: g.slug, termino: g.termino, categoria: g.categoria,
      hablado, preguntado, construido,
      cuadrante: correcciones.get(g.slug) ?? calculado,
      corregido: correcciones.has(g.slug),
    }
  })
}

const CABECERA = ['slug', 'termino', 'categoria', 'hablado', 'preguntado', 'construido', 'cuadrante', 'correccion']
const CUADRANTES: Cuadrante[] = ['ambos', 'solo-hablado', 'solo-construido', 'ninguno']

/** CSV para que Sergio revise. La columna `correccion` vacía = de acuerdo. */
export function revisionConceptos(cs: ConceptoClasificado[]): string {
  return aCsv([CABECERA, ...cs.map(c => [c.slug, c.termino, c.categoria, c.hablado, c.preguntado, c.construido, c.cuadrante, ''])])
}

/**
 * Lee las correcciones que Sergio dejó en el CSV de revisión (puede venir de una hoja de cálculo:
 * BOM UTF-8 y separador ';'). Sin efectos: solo parsea y valida.
 */
export function leerCorrecciones(csv: string, slugsValidos?: Set<string>): Map<string, Cuadrante> {
  const texto = csv.replace(/^\uFEFF/, '')
  const primeraLinea = texto.split(/\r?\n/)[0] ?? ''
  const separador = primeraLinea.includes(';') && !primeraLinea.includes(',') ? ';' : ','
  const [cabecera, ...filas] = deCsv(texto, separador)
  const iSlug = cabecera?.indexOf('slug') ?? -1
  const iCorr = cabecera?.indexOf('correccion') ?? -1
  if (iSlug < 0 || iCorr < 0) throw new Error('CSV de revisión sin columna "slug"/"correccion"')
  const correcciones = new Map<string, Cuadrante>()
  for (const f of filas) {
    const slug = f[iSlug]
    const valor = (f[iCorr] ?? '').trim()
    if (!valor) continue
    if (slugsValidos && !slugsValidos.has(slug)) throw new Error(`Corrección para un slug que no está en el glosario: "${slug}"`)
    if (!CUADRANTES.includes(valor as Cuadrante)) throw new Error(`Corrección inválida para "${slug}": ${valor}`)
    correcciones.set(slug, valor as Cuadrante)
  }
  return correcciones
}
