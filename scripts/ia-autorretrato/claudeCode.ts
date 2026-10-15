import path from 'node:path'
import type { AutorretratoIA, GrupoHerramienta } from '@/lib/ia-autorretrato/tipos'
import { diaBogota, mediana } from './util'

export type Prompt = { texto: string; proyecto: string; fecha: string; sesion: string }

function* lineasJson(texto: string): Generator<Record<string, unknown>> {
  for (const linea of texto.split('\n')) {
    if (!linea.trim()) continue
    let valor: unknown
    try {
      valor = JSON.parse(linea)
    } catch {
      continue // línea cortada o corrupta: se ignora
    }
    // solo objetos: null, números, textos y arreglos no son registros
    if (typeof valor === 'object' && valor !== null && !Array.isArray(valor)) {
      yield valor as Record<string, unknown>
    }
  }
}

export function leerHistorial(texto: string): Prompt[] {
  const prompts: Prompt[] = []
  for (const r of lineasJson(texto)) {
    const display = typeof r.display === 'string' ? r.display.trim() : ''
    const ts = r.timestamp
    if (!display || typeof ts !== 'number' || !Number.isFinite(ts)) continue
    prompts.push({
      texto: display,
      proyecto: path.basename(String(r.project ?? '')),
      fecha: diaBogota(ts),
      sesion: String(r.sessionId ?? ''),
    })
  }
  return prompts
}

export function actividadDiaria(prompts: Prompt[]): AutorretratoIA['actividadDiaria'] {
  const dias = new Map<string, { prompts: number; sesiones: Set<string> }>()
  for (const p of prompts) {
    const d = dias.get(p.fecha) ?? { prompts: 0, sesiones: new Set<string>() }
    d.prompts++
    d.sesiones.add(p.sesion)
    dias.set(p.fecha, d)
  }
  return [...dias.entries()]
    .map(([fecha, d]) => ({ fecha, prompts: d.prompts, sesiones: d.sesiones.size }))
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
}

export function nombreHerramienta(n: string): string {
  return n.startsWith('mcp__') ? `mcp:${n.split('__')[1]}` : n
}

export function grupoDe(nombre: string): GrupoHerramienta {
  if (nombre === 'Bash') return 'ejecucion'
  if (nombre === 'WebSearch' || nombre === 'WebFetch') return 'investigacion'
  if (/chrome|playwright|browser/i.test(nombre)) return 'navegador'
  if (nombre.startsWith('mcp:')) return 'mcp'
  if (['Read', 'Write', 'Edit', 'NotebookEdit'].includes(nombre)) return 'edicion'
  return 'orquestacion'
}

const ordenarConteo = <T extends string>(m: Map<T, number>) =>
  [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))

export function leerSesiones(textos: string[]): Pick<AutorretratoIA, 'herramientas' | 'modelos'> {
  const herramientas = new Map<string, number>()
  const modelos = new Map<string, number>()
  for (const texto of textos) {
    for (const r of lineasJson(texto)) {
      if (r.type !== 'assistant') continue
      const msg = r.message as { model?: string; content?: unknown } | undefined
      if (!msg?.model || msg.model === '<synthetic>') continue
      modelos.set(msg.model, (modelos.get(msg.model) ?? 0) + 1)
      for (const c of Array.isArray(msg.content) ? msg.content : []) {
        if (c?.type === 'tool_use' && typeof c.name === 'string') {
          const n = nombreHerramienta(c.name)
          herramientas.set(n, (herramientas.get(n) ?? 0) + 1)
        }
      }
    }
  }
  return {
    herramientas: ordenarConteo(herramientas).slice(0, 15).map(([nombre, usos]) => ({ nombre, usos, grupo: grupoDe(nombre) })),
    modelos: ordenarConteo(modelos).map(([modelo, respuestas]) => ({ modelo, respuestas })),
  }
}

const PALABRAS_ES = new Set(['el', 'la', 'de', 'que', 'y', 'en', 'los', 'las', 'por', 'para', 'con', 'una', 'un', 'es', 'como', 'mi', 'del'])
const PALABRAS_EN = new Set(['the', 'and', 'of', 'to', 'is', 'in', 'for', 'with', 'that', 'this', 'it', 'on', 'please'])
const INICIO_PREGUNTA = /^[¿]?(que|qué|como|cómo|por que|por qué|cual|cuál|cuales|what|how|why|can|could|is|are|do|does)(?![\p{L}\p{N}])/iu

function idioma(texto: string): 'es' | 'en' | null {
  const palabras = texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').split(/[^a-z]+/)
  const es = palabras.filter(p => PALABRAS_ES.has(p)).length
  const en = palabras.filter(p => PALABRAS_EN.has(p)).length
  if (es === 0 && en === 0) return null
  return es >= en ? 'es' : 'en'
}

const esComando = (p: Prompt) => p.texto.startsWith('/')

export function perfilPrompts(prompts: Prompt[]): AutorretratoIA['perfilPrompts'] {
  const utiles = prompts.filter(p => !esComando(p))
  const preguntas = utiles.filter(p => /\?\s*$/.test(p.texto) || INICIO_PREGUNTA.test(p.texto)).length
  const idiomas = utiles.map(p => idioma(p.texto)).filter(Boolean)
  const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 0)
  return {
    total: utiles.length,
    medianaCaracteres: mediana(utiles.map(p => p.texto.length)),
    pctPreguntas: pct(preguntas, utiles.length),
    pctEspanol: pct(idiomas.filter(i => i === 'es').length, idiomas.length),
  }
}

/** Candidatas para que Sergio elija citas. Se escriben solo en .ia-autorretrato/ (privado). */
export function seleccionarCitas(prompts: Prompt[], max = 30): Prompt[] {
  const aptas = prompts.filter(p =>
    !esComando(p) && p.texto.length >= 60 && p.texto.length <= 280 &&
    !/https?:\/\/|@|\/Users\//.test(p.texto) && idioma(p.texto) === 'es')
  const porMes = new Map<string, Prompt>()
  for (const p of aptas) {
    const clave = `${p.fecha.slice(0, 7)}|${p.proyecto}`
    const actual = porMes.get(clave)
    if (!actual || p.texto.length > actual.texto.length) porMes.set(clave, p)
  }
  return [...porMes.values()].sort((a, b) => a.fecha.localeCompare(b.fecha)).slice(0, max)
}
