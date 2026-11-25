import matter from 'gray-matter'
import type { DesdeAqui, Nota, ParseResult } from './types'

const WIKILINK = /\[\[([^\]]+)\]\]/g
const CALLOUT = /^>\s*\[!desde-aqui\][-+]?\s*(.*)$/i

const H2_TODOS = 'Lo que nos pasa a todos'
const H2_OTROS = ['Cómo lo han vivido y pensado otros', 'Cómo lo han vivido otros']
const H2_LLEVAR = 'Para llevarte'
const H2_RELACIONADO = 'Relacionado'

type Seccion = 'entrada' | 'todos' | 'otros' | 'llevar' | 'relacionado' | 'otra'

/** Quita `|alias` y `#ancla` de un wikilink y recorta. */
export function wikiTarget(raw: string): string {
  return raw.split('|')[0].split('#')[0].trim()
}

/** Clave comparable: minúsculas, sin tildes, espacios/guiones colapsados a `-`. */
export function normKey(s: string): string {
  return s
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/[\s-]+/g, '-')
}

function seccionDe(h2: string): Seccion {
  const t = h2.trim()
  if (t === H2_TODOS) return 'todos'
  if (H2_OTROS.includes(t)) return 'otros'
  if (t === H2_LLEVAR) return 'llevar'
  if (t === H2_RELACIONADO) return 'relacionado'
  return 'otra'
}

function strList(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []
}

// Wikilinks en un texto, ya reducidos a su destino.
function wikilinks(texto: string): string[] {
  return [...texto.matchAll(WIKILINK)].map((m) => wikiTarget(m[1])).filter(Boolean)
}

function fechaIso(v: unknown): string | null {
  if (v instanceof Date && !isNaN(v.getTime())) return v.toISOString().slice(0, 10)
  return typeof v === 'string' && v.trim() ? v.trim() : null
}

export function parseNota(slug: string, raw: string): ParseResult {
  let data: Record<string, unknown>
  let body: string
  try {
    // Se pasa un objeto de opciones para esquivar la caché de gray-matter.
    const fm = matter(raw, {})
    data = fm.data
    body = fm.content
  } catch (e) {
    return { ok: false, slug, error: `Frontmatter inválido: ${e instanceof Error ? e.message : String(e)}` }
  }

  const secciones: Record<Seccion, string[]> = {
    entrada: [], todos: [], otros: [], llevar: [], relacionado: [], otra: [],
  }
  const desdeAqui: DesdeAqui[] = []
  let h1: string | null = null
  let actual: Seccion = 'entrada'
  let fence = false
  let callout: { voz: string; lineas: string[] } | null = null
  const cerrarCallout = () => {
    if (callout) {
      desdeAqui.push({ voz: callout.voz, md: callout.lineas.join('\n').trim() })
      callout = null
    }
  }

  for (const linea of body.split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(linea)) fence = !fence
    // Continuación de un callout: líneas que empiezan con ">".
    if (callout && !fence && linea.startsWith('>')) {
      callout.lineas.push(linea.replace(/^>\s?/, ''))
      continue
    }
    cerrarCallout()
    if (!fence) {
      const c = CALLOUT.exec(linea)
      if (c) {
        callout = { voz: c[1].trim(), lineas: [] }
        continue
      }
      const h = /^(#{1,2})\s+(.+?)\s*#*\s*$/.exec(linea)
      if (h) {
        if (h[1] === '#') {
          if (h1 === null) { h1 = h[2].trim(); continue }
        } else {
          const s = seccionDe(h[2])
          // H2 desconocido: se conserva con su contenido en la sección vigente.
          if (s !== 'otra') { actual = s; continue }
        }
      }
    }
    secciones[actual].push(linea)
  }
  cerrarCallout()

  const md = (s: Seccion) => secciones[s].join('\n').trim()

  const fmTitulo = typeof data.titulo === 'string' ? data.titulo.trim() : ''
  const titulo = fmTitulo || h1 || ''
  if (!titulo) return { ok: false, slug, error: 'Falta el título (frontmatter ni H1)' }

  const estadoRaw = data.estado
  const estado: Nota['estado'] =
    estadoRaw === 'brote' || estadoRaw === 'perenne' ? estadoRaw : 'semilla'

  const iaCapas: Nota['iaCapas'] = {}
  if (data.ia_capas && typeof data.ia_capas === 'object') {
    const ic = data.ia_capas as Record<string, unknown>
    for (const k of ['todos', 'otros', 'desde_aqui'] as const) {
      if (typeof ic[k] === 'string') iaCapas[k] = ic[k] as string
    }
  }

  // Enlaces: cuerpo completo (incluida "Relacionado" y callouts) + frontmatter.
  const enlaces = [
    ...wikilinks(body),
    ...strList(data.relacionados).flatMap((r) => {
      const l = wikilinks(r)
      return l.length ? l : [wikiTarget(r)].filter(Boolean)
    }),
  ]

  const capas: Nota['capas'] = {}
  if (md('todos')) capas.todos = md('todos')
  if (md('otros')) capas.otros = md('otros')
  if (desdeAqui.length) capas.desdeAqui = desdeAqui

  const nota: Nota = {
    slug,
    titulo,
    estado,
    confianza: typeof data.confianza === 'string' ? data.confianza : '',
    iaCapas,
    voces: strList(data.voces),
    fuentes: strList(data.fuentes),
    verificado: fechaIso(data.verificado),
    terminos: strList(data.terminos).map((t) => wikilinks(t)[0] ?? t.trim()),
    entrada: md('entrada'),
    capas,
    enlacesRaw: [...new Set(enlaces)],
  }
  if (md('llevar')) nota.llevar = md('llevar')
  return { ok: true, nota }
}
