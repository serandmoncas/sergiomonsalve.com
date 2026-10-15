import { describe, it, expect } from 'vitest'
import { crearEscena, render, cajaEtiqueta, chocan, CANAL, FUENTE, LECTURA } from '../caminoEscena'
import type { Camino, NodoCamino } from '../tipos'
import { DATOS } from '../datos'

const camino: Camino = {
  nodos: [
    { id: 'logica', etiqueta: 'L', etiquetaEn: 'L', rama: 'fundamentos', evidencia: 'inferido' },
    { id: 'ruby', etiqueta: 'R', etiquetaEn: 'R', rama: 'backend', evidencia: 'github', primeraEvidencia: '2013-01' },
    { id: 'python', etiqueta: 'P', etiquetaEn: 'P', rama: 'backend', evidencia: 'github', primeraEvidencia: '2014-10' },
    { id: 'fastapi', etiqueta: 'F', etiquetaEn: 'F', rama: 'backend', evidencia: 'github', primeraEvidencia: '2025-11', hoy: true },
    { id: 'mapa', etiqueta: 'M', etiquetaEn: 'M', rama: 'educacion', evidencia: 'declarado', hoy: true },
  ],
  aristas: [{ de: 'logica', a: 'ruby' }, { de: 'ruby', a: 'python' }, { de: 'python', a: 'fastapi' }],
}
const escena = crearEscena(camino, 50)
const fase = (tipo: string) => escena.fases.find(f => f.tipo === tipo)!

describe('crearEscena', () => {
  it('fases contiguas que cubren toda la duración', () => {
    expect(escena.fases.map(f => f.tipo)).toEqual(['presente', 'rebobinar', 'raices', 'avanzar'])
    expect(escena.fases[0].inicio).toBe(0)
    expect(escena.fases.at(-1)!.fin).toBe(50)
    for (let i = 1; i < escena.fases.length; i++) expect(escena.fases[i].inicio).toBe(escena.fases[i - 1].fin)
  })
  it('años: inferidos sin año; nodo de hoy sin fecha toma el año máximo', () => {
    const porId = Object.fromEntries(escena.nodos.map(n => [n.id, n]))
    expect(porId.logica.anio).toBeNull()
    expect(porId.mapa.anio).toBe(2025)
    expect(escena.anioMin).toBe(2013)
  })
  it('layout determinista y dentro de [0,1]', () => {
    expect(crearEscena(camino, 50)).toEqual(escena)
    for (const n of escena.nodos) {
      expect(n.x).toBeGreaterThanOrEqual(0); expect(n.x).toBeLessThanOrEqual(1)
      expect(n.y).toBeGreaterThanOrEqual(0); expect(n.y).toBeLessThanOrEqual(1)
    }
  })
})

describe('render', () => {
  it('es pura', () => {
    expect(render(escena, 17.3)).toEqual(render(escena, 17.3))
  })
  it('presente: solo los nodos de hoy', () => {
    expect(render(escena, 3).visibles.sort()).toEqual(['fastapi', 'mapa'])
  })
  it('rebobinar: el conjunto visible solo crece', () => {
    const { inicio, fin } = fase('rebobinar')
    let anterior = new Set<string>()
    for (let t = inicio; t < fin; t += 0.5) {
      const visibles = new Set(render(escena, t).visibles)
      for (const id of anterior) expect(visibles.has(id)).toBe(true)
      anterior = visibles
    }
    expect(anterior.has('ruby')).toBe(true)
    expect(anterior.has('logica')).toBe(false)
  })
  it('raíces: aparecen los inferidos', () => {
    expect(render(escena, fase('raices').fin - 0.01).visibles).toContain('logica')
  })
  it('avanzar: se resaltan en orden cronológico y al final todo está a opacidad 1', () => {
    const { inicio } = fase('avanzar')
    const temprano = render(escena, inicio + 1)
    expect(temprano.opacidad.ruby).toBe(1)
    expect(temprano.opacidad.fastapi).toBeLessThan(1)
    const final = render(escena, 50)
    for (const n of escena.nodos) expect(final.opacidad[n.id]).toBe(1)
  })
  it('presente: el año mostrado es el máximo', () => {
    expect(render(escena, 0).anio).toBe(escena.anioMax)
  })
  it('rebobinar: la visibilidad coincide con el año mostrado', () => {
    const { inicio, fin } = fase('rebobinar')
    for (let t = inicio; t < fin; t += 0.37) {
      const c = render(escena, t)
      for (const n of escena.nodos) {
        if (n.hoy || n.anio === null) continue
        expect(c.opacidad[n.id] === 1).toBe(n.anio >= c.anio!)
      }
    }
  })
  it('t fuera de rango se acota', () => {
    expect(render(escena, -5)).toEqual(render(escena, 0))
    expect(render(escena, 999)).toEqual(render(escena, 50))
  })
})

describe('layout de celdas', () => {
  const separados = (nodos: { x: number; y: number }[]) => {
    for (let i = 0; i < nodos.length; i++) for (let j = i + 1; j < nodos.length; j++) {
      const a = nodos[i], b = nodos[j]
      expect(Math.abs(a.y - b.y) * 540 >= 21 - 1e-6 || Math.abs(a.x - b.x) * 960 >= 60 - 1e-6).toBe(true)
    }
  }
  const porCelda = (e: typeof escena) => {
    const m = new Map<string, typeof e.nodos>()
    for (const n of e.nodos) m.set(`${n.rama}|${n.anio}`, [...(m.get(`${n.rama}|${n.anio}`) ?? []), n])
    return [...m.values()]
  }
  it('nodos de una misma celda no se solapan (celda sintética de 8)', () => {
    const nodos: NodoCamino[] = Array.from({ length: 8 }, (_, i) => ({
      id: `n${i}`, etiqueta: 'N', etiquetaEn: 'N', rama: 'web', evidencia: 'github', primeraEvidencia: '2020-01',
    }))
    const e = crearEscena({ nodos: [...nodos, { ...nodos[0], id: 'z', primeraEvidencia: '2013-01' }], aristas: [] })
    for (const c of porCelda(e)) separados(c)
    for (const n of e.nodos) { expect(n.y).toBeGreaterThanOrEqual(0); expect(n.y).toBeLessThanOrEqual(1) }
  })
  it('datos reales: sin solapes dentro de cada celda', () => {
    for (const c of porCelda(crearEscena(DATOS.camino))) separados(c)
  })
})

describe('etiquetas del cuadro final', () => {
  const etiquetados = (e: typeof escena) => e.nodos.filter(n => n.hoy || n.anio === e.anioMax)
  const sinChoques = (e: typeof escena) => {
    const ns = etiquetados(e)
    for (let i = 0; i < ns.length; i++) for (let j = i + 1; j < ns.length; j++)
      expect(chocan(cajaEtiqueta(ns[i]), cajaEtiqueta(ns[j])), `${ns[i].id} / ${ns[j].id}`).toBe(false)
  }
  it('datos reales: ninguna caja de etiqueta se cruza con otra', () => {
    sinChoques(crearEscena(DATOS.camino))
  })
  it('celda sintética saturada de nodos de hoy en el borde derecho', () => {
    const nodos: NodoCamino[] = Array.from({ length: 7 }, (_, i) => ({
      id: `h${i}`, etiqueta: 'Etiqueta larga ' + i, etiquetaEn: 'Long label ' + i, rama: i % 2 ? 'infra' : 'backend', evidencia: 'github', primeraEvidencia: '2026-01', hoy: true,
    }))
    const e = crearEscena({ nodos: [...nodos, { ...nodos[0], id: 'viejo', hoy: false, primeraEvidencia: '2013-01' }], aristas: [] })
    sinChoques(e)
    for (const n of e.nodos) { expect(n.y).toBeGreaterThanOrEqual(0); expect(n.y).toBeLessThanOrEqual(1) }
  })
  it('ninguna etiqueta final entra en la zona del indicador de año', () => {
    for (const n of etiquetados(crearEscena(DATOS.camino))) expect(chocan(cajaEtiqueta(n), LECTURA)).toBe(false)
  })
  it('ningún nodo ocupa el canal de las etiquetas de rama', () => {
    for (const n of crearEscena(DATOS.camino).nodos) expect(n.x * 960).toBeGreaterThanOrEqual(CANAL)
    for (const n of escena.nodos) expect(n.x * 960).toBeGreaterThanOrEqual(CANAL)
  })
  it('el canal cabe la rama más larga (0.6 × FUENTE × 11 caracteres)', () => {
    expect(CANAL).toBeGreaterThanOrEqual(4 + 0.6 * FUENTE * 11)
  })
})
