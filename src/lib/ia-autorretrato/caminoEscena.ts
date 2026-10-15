import { RAMAS, type AristaCamino, type Camino, type NodoCamino } from './tipos'

/**
 * Mecanismo de Claude Motion: la animación es una función pura del tiempo.
 * `crearEscena` describe la escena una vez; `render(escena, t)` dice qué se ve en el instante t.
 */
export type TipoFase = 'presente' | 'rebobinar' | 'raices' | 'avanzar'
export type Fase = { tipo: TipoFase; inicio: number; fin: number }
export type NodoEscena = NodoCamino & { x: number; y: number; anio: number | null }
export type Escena = { duracion: number; fases: Fase[]; nodos: NodoEscena[]; aristas: AristaCamino[]; anioMin: number; anioMax: number }
export type Cuadro = { fase: TipoFase; anio: number | null; opacidad: Record<string, number>; visibles: string[] }

const PROPORCIONES: [TipoFase, number][] = [['presente', 0.12], ['rebobinar', 0.48], ['raices', 0.12], ['avanzar', 0.28]]
const r3 = (n: number) => Math.round(n * 1000) / 1000
export const W = 960
export const H = 540
export const FUENTE = 18 // con minWidth 600 del SVG: 18 × 600/960 = 11.25 px
/** Ancho (unidades del SVG) reservado a la izquierda para las etiquetas de rama; ningún nodo entra. */
export const CANAL = 130
const ANCHO_CAR = 0.6 * FUENTE
const MARGEN_ETIQUETA = 11
const ALTO_ETIQUETA = 1.35 * FUENTE // alto real de línea (bbox ≈ 1.15 × fuente) más holgura
const acotar = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

export function crearEscena(camino: Camino, duracion = 50): Escena {
  const anios = camino.nodos.map(n => (n.primeraEvidencia ? Number(n.primeraEvidencia.slice(0, 4)) : null)).filter((a): a is number => a !== null)
  const anioMin = anios.length ? Math.min(...anios) : 2013
  const anioMax = anios.length ? Math.max(...anios) : 2026

  let inicio = 0
  const fases = PROPORCIONES.map(([tipo, p], i) => {
    const fin = i === PROPORCIONES.length - 1 ? duracion : r3(inicio + p * duracion)
    const fase = { tipo, inicio, fin }
    inicio = fin
    return fase
  })

  // Paso 1: año y celda (rama, año) de cada nodo.
  const base = [...camino.nodos]
    .sort((x, y) => x.id.localeCompare(y.id))
    .map(n => {
      const anio = n.evidencia === 'inferido' ? null : n.primeraEvidencia ? Number(n.primeraEvidencia.slice(0, 4)) : n.hoy ? anioMax : null
      return { n, anio, celda: `${n.rama}|${anio}` }
    })
  const total = new Map<string, number>()
  for (const b of base) total.set(b.celda, (total.get(b.celda) ?? 0) + 1)

  // Paso 2: apilar los nodos de una celda en columnas de hasta 3, centradas verticalmente en la fila.
  const POR_COLUMNA = 3
  const PASO_Y = 0.04 // ≥ 21 unidades en 540 (con margen por el redondeo)
  const PASO_X = 0.065 // ≥ 60 unidades en 960
  const visto = new Map<string, number>()
  const nodos = base.map(({ n, anio, celda }) => {
    const k = visto.get(celda) ?? 0
    visto.set(celda, k + 1)
    const col = Math.floor(k / POR_COLUMNA)
    const enColumna = Math.min(POR_COLUMNA, (total.get(celda) ?? 1) - col * POR_COLUMNA)
    const fila = RAMAS.indexOf(n.rama)
    const xBase = anio === null ? 0.15 : 0.21 + (0.75 * (anio - anioMin)) / Math.max(anioMax - anioMin, 1)
    const y = (fila + 0.5) / RAMAS.length + ((k % POR_COLUMNA) - (enColumna - 1) / 2) * PASO_Y
    return { ...n, anio, x: r3(acotar(xBase + (xBase > 0.75 ? -PASO_X : PASO_X) * col, 0, 1)), y: r3(acotar(y, 0, 1)) }
  })
  separarEtiquetas(nodos, anioMax)
  return { duracion, fases, nodos, aristas: camino.aristas, anioMin, anioMax }
}

export function render(escena: Escena, tCrudo: number): Cuadro {
  const t = acotar(tCrudo, 0, escena.duracion)
  const fase = escena.fases.find(f => t < f.fin) ?? escena.fases.at(-1)!
  const progreso = fase.fin > fase.inicio ? acotar((t - fase.inicio) / (fase.fin - fase.inicio), 0, 1) : 1
  const { anioMin, anioMax } = escena
  const opacidad: Record<string, number> = {}
  let anio: number | null = null

  for (const n of escena.nodos) {
    let o = 0
    if (fase.tipo === 'presente') {
      anio = anioMax
      o = n.hoy ? progreso : 0
    } else if (fase.tipo === 'rebobinar') {
      anio = anioMax - progreso * (anioMax - anioMin)
      anio = Math.round(anio)
      o = n.hoy || (n.anio !== null && n.anio >= anio) ? 1 : 0
    } else if (fase.tipo === 'raices') {
      anio = anioMin
      o = n.anio === null && !n.hoy ? progreso : 1
    } else {
      anio = Math.round(anioMin + progreso * (anioMax - anioMin))
      const yaPaso = n.anio === null || n.anio <= anio
      o = progreso >= 1 || yaPaso ? 1 : 0.3
    }
    opacidad[n.id] = r3(o)
  }

  return {
    fase: fase.tipo,
    anio,
    opacidad,
    visibles: escena.nodos.filter(n => opacidad[n.id] > 0).map(n => n.id),
  }
}

type Caja = { x0: number; x1: number; y0: number; y1: number }

/** Caja de la etiqueta de un nodo (unidades del SVG), igual que la dibuja CaminoMotion. */
export function cajaEtiqueta(n: { x: number; y: number; etiqueta: string; etiquetaEn: string }): Caja {
  const ancho = ANCHO_CAR * Math.max(n.etiqueta.length, n.etiquetaEn.length)
  const x = n.x * W
  const cy = n.y * H
  return n.x > 0.75
    ? { x0: x - MARGEN_ETIQUETA - ancho, x1: x - MARGEN_ETIQUETA, y0: cy - ALTO_ETIQUETA / 2, y1: cy + ALTO_ETIQUETA / 2 }
    : { x0: x + MARGEN_ETIQUETA, x1: x + MARGEN_ETIQUETA + ancho, y0: cy - ALTO_ETIQUETA / 2, y1: cy + ALTO_ETIQUETA / 2 }
}
/** Zona del indicador de año y fase (arriba a la derecha): ninguna etiqueta puede entrar. */
export const LECTURA: Caja = { x0: 600, x1: W, y0: 0, y1: 64 }
const EPS = 1e-6 // tolera el redondeo de r3: cajas que solo se tocan no chocan
export const chocan = (a: Caja, b: Caja) => a.x0 < b.x1 - EPS && b.x0 < a.x1 - EPS && a.y0 < b.y1 - EPS && b.y0 < a.y1 - EPS

/**
 * Etiquetas visibles en el cuadro final (nodos de hoy o del último año): ajusta `y` para que sus cajas no se crucen.
 * Pasada hacia abajo (cada etiqueta baja hasta librar las anteriores y la zona del indicador); si la última
 * se sale del marco, pasada hacia arriba desde el borde inferior.
 */
function separarEtiquetas(nodos: NodoEscena[], anioMax: number) {
  const idx = nodos.map((_, i) => i).filter(i => nodos[i].hoy || nodos[i].anio === anioMax).sort((a, b) => nodos[a].y - nodos[b].y)
  const medio = ALTO_ETIQUETA / 2
  const maxY = (H - medio - 2) / H
  const y = new Map(idx.map(i => [i, nodos[i].y]))
  const caja = (i: number) => cajaEtiqueta({ ...nodos[i], y: y.get(i)! })
  const resolver = (orden: number[], sentido: 1 | -1) => {
    const fijos: number[] = []
    for (const i of orden) {
      for (let paso = 0; paso < 200; paso++) {
        const c = caja(i)
        const estorba = [...(sentido === 1 ? [LECTURA] : []), ...fijos.map(caja)].filter(o => chocan(c, o))
        if (!estorba.length) break
        const salto = sentido === 1 ? Math.max(...estorba.map(o => o.y1)) + medio : Math.min(...estorba.map(o => o.y0)) - medio
        y.set(i, (salto + sentido * 2 * EPS) / H)
      }
      fijos.push(i)
    }
  }
  resolver(idx, 1)
  if (idx.some(i => y.get(i)! > maxY)) {
    for (const i of idx) y.set(i, Math.min(y.get(i)!, maxY))
    resolver([...idx].reverse(), -1)
  }
  for (const i of idx) nodos[i].y = r3(acotar(y.get(i)!, 0, 1))
}
