import { describe, it, expect } from 'vitest'
import CONTEXTO from '../contexto.json'
import DECLARADO from '../declarado.json'

describe('contexto.json', () => {
  it('cada dato tiene url https, fecha y fuente', () => {
    for (const d of CONTEXTO.datos) {
      expect(d.url).toMatch(/^https:\/\//)
      expect(d.fecha).not.toBe('')
      expect(d.fuente).not.toBe('')
    }
  })
  it('las relaciones apuntan a conceptos existentes', () => {
    const ids = new Set(CONTEXTO.conceptos.map(c => c.id))
    for (const r of CONTEXTO.relaciones) {
      expect(ids.has(r.de)).toBe(true)
      expect(ids.has(r.a)).toBe(true)
    }
  })
})

describe('declarado.json', () => {
  it('solo Claude Code es medido; intensidad 1–3', () => {
    expect(DECLARADO.filter(d => d.fuente === 'medido').map(d => d.herramienta)).toEqual(['Claude Code'])
    for (const d of DECLARADO) expect([1, 2, 3]).toContain(d.intensidad)
  })
})
