import { describe, it, expect } from 'vitest'
import { getSesionesDocumentadas } from '../data'
import {
  GLOSARIO,
  CATEGORIAS,
  ORDEN_CATEGORIAS,
  getTerminosPorCategoria,
  getTermino,
} from '../glosario'

describe('GLOSARIO', () => {
  it('has exactly 58 entries (40 originales + 18 de ago–oct)', () => {
    expect(GLOSARIO).toHaveLength(58)
  })

  it('has all unique slugs', () => {
    const slugs = GLOSARIO.map(t => t.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('every sesionOrigen present corresponds to a real session in SESIONES', () => {
    const sesionNumeros = new Set(getSesionesDocumentadas().map(s => s.n))
    const conOrigen = GLOSARIO.filter(t => t.sesionOrigen !== undefined)
    expect(conOrigen.length).toBeGreaterThan(0)
    for (const termino of conOrigen) {
      expect(sesionNumeros.has(termino.sesionOrigen!)).toBe(true)
    }
  })

  it('every referencia.url present is a real https link, never fabricated/empty', () => {
    const conReferencia = GLOSARIO.filter(t => t.referencia !== undefined)
    expect(conReferencia.length).toBeGreaterThan(0)
    for (const termino of conReferencia) {
      expect(termino.referencia!.url).toMatch(/^https:\/\//)
    }
  })
})

describe('ORDEN_CATEGORIAS', () => {
  it('has the 4 categories in the fixed order', () => {
    expect(ORDEN_CATEGORIAS).toEqual([
      'fundamentos',
      'contexto-memoria',
      'seguridad-control',
      'operacion-evaluacion',
    ])
  })

  it('CATEGORIAS has a human label for every category', () => {
    for (const categoria of ORDEN_CATEGORIAS) {
      expect(CATEGORIAS[categoria]).toBeTruthy()
    }
  })
})

describe('getTerminosPorCategoria', () => {
  it('returns the expected number of terms per category', () => {
    expect(Object.fromEntries(ORDEN_CATEGORIAS.map(c => [c, getTerminosPorCategoria(c).length]))).toEqual({
      'fundamentos': 13,
      'contexto-memoria': 13,
      'seguridad-control': 12,
      'operacion-evaluacion': 20,
    })
  })
})

describe('getTermino', () => {
  it('returns the term matching the slug', () => {
    const termino = getTermino('prompt-engineering')
    expect(termino?.termino).toBe('Prompt engineering')
  })

  it('returns undefined for a non-existent slug', () => {
    expect(getTermino('no-existe')).toBeUndefined()
  })
})
