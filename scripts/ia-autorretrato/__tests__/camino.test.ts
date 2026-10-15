import { describe, it, expect } from 'vitest'
import type { Camino } from '@/lib/ia-autorretrato/tipos'
import CAMINO from '../camino.json'
import { ancestros, aplicarRevision, revisionRespondida, enriquecerCamino, reposNoPublicos, revisionCamino, validarCamino } from '../camino'
import { deCsv, aCsv } from '../csv'

const camino = CAMINO as unknown as Camino

describe('camino.json', () => {
  it('es válido: ids únicos, aristas conocidas, acíclico, cada nodo de hoy llega a un fundamento', () => {
    expect(validarCamino(camino.nodos, camino.aristas)).toEqual([])
  })
  it('tiene entre 50 y 70 nodos', () => {
    expect(camino.nodos.length).toBeGreaterThanOrEqual(50)
    expect(camino.nodos.length).toBeLessThanOrEqual(70)
  })
})

describe('validarCamino', () => {
  const n = (id: string, rama: 'fundamentos' | 'backend' = 'backend', hoy = false) =>
    ({ id, etiqueta: id, etiquetaEn: id, rama, evidencia: 'github' as const, hoy })
  it('detecta ciclos', () => {
    expect(validarCamino([n('a'), n('b')], [{ de: 'a', a: 'b' }, { de: 'b', a: 'a' }])).toContain('ciclo en el camino')
  })
  it('detecta un nodo de hoy sin fundamento', () => {
    expect(validarCamino([n('x', 'backend', true)], [])).toContain('"x" (hoy) no llega a ningún fundamento')
  })
  it('detecta aristas a nodos inexistentes', () => {
    expect(validarCamino([n('a')], [{ de: 'a', a: 'z' }])).toContain('arista a nodo desconocido: a→z')
  })
})

describe('enriquecer, revisión', () => {
  it('ancestros son transitivos', () => {
    expect([...ancestros('fastapi', camino.aristas)]).toEqual(expect.arrayContaining(['flask', 'python', 'programacion', 'logica']))
  })
  it('primera evidencia = mínimo entre repos y fecha declarada; inferidos sin fecha', () => {
    const r = enriquecerCamino(camino.nodos, new Map([['flask_heroku', '2020-10'], ['flask_template', '2022-08'], ['bichongos', '2026-06']]))
    const porId = Object.fromEntries(r.map(x => [x.id, x]))
    expect(porId.flask.primeraEvidencia).toBe('2020-10')
    expect(porId.esp32.primeraEvidencia).toBe('2026-02') // la declarada es anterior
    expect(porId.logica.primeraEvidencia).toBeUndefined()
  })
  it('reposNoPublicos lista repos del camino que no están en la lista pública', () => {
    expect(reposNoPublicos(camino.nodos, ['HER'])).toContain('brayan')
  })
  it('aplicar revisión: los inferidos marcados "no" salen con sus aristas', () => {
    const filas = deCsv(revisionCamino(camino.nodos))
    expect(filas[0]).toEqual(['id', 'etiqueta', 'rama', 'aprobado'])
    for (const f of filas.slice(1)) f[3] = f[0] === 'react' ? 'no' : 'si'
    const r = aplicarRevision(camino, aCsv(filas))
    expect(r.nodos.some(x => x.id === 'react')).toBe(false)
    expect(r.aristas.some(a => a.de === 'react' || a.a === 'react')).toBe(false)
  })
  it('aplicar revisión: un inferido sin respuesta también sale', () => {
    const filas = deCsv(revisionCamino(camino.nodos)).map((f, i) => (i === 0 ? f : [...f.slice(0, 3), f[0] === 'logica' ? '' : 'si']))
    expect(aplicarRevision(camino, aCsv(filas)).nodos.some(x => x.id === 'logica')).toBe(false)
  })
  it('aplicar revisión: tolera BOM y separador ";"', () => {
    const base = deCsv(revisionCamino(camino.nodos)).map((f, i) => (i === 0 ? f : [...f.slice(0, 3), f[0] === 'react' ? 'no' : 'si']))
    const csv = '\uFEFF' + base.map(f => f.map(c => c.replace(/[;,]/g, ' ')).join(';')).join('\n')
    const r = aplicarRevision(camino, csv)
    expect(r.nodos.some(x => x.id === 'react')).toBe(false)
    expect(r.nodos.some(x => x.id === 'logica')).toBe(true)
  })
  it('aplicar revisión: falla claro si falta la columna id o aprobado', () => {
    expect(() => aplicarRevision(camino, 'id,etiqueta\nreact,React')).toThrow(/aprobado/)
    expect(() => aplicarRevision(camino, 'x,aprobado\nreact,si')).toThrow(/id/)
  })
  it('revisionRespondida: en blanco es false; "si" o "no" es true', () => {
    const blanco = revisionCamino(camino.nodos)
    expect(revisionRespondida(blanco)).toBe(false)
    const conValor = (v: string) => aCsv(deCsv(blanco).map((f, i) => (i === 1 ? [...f.slice(0, 3), v] : f)))
    expect(revisionRespondida(conValor('si'))).toBe(true)
    expect(revisionRespondida(conValor('no'))).toBe(true)
  })
})
