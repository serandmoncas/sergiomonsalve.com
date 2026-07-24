import { describe, it, expect } from 'vitest'
import { SESIONES } from '../data'
import {
  GLOSARIO,
  CATEGORIAS,
  ORDEN_CATEGORIAS,
  getTerminosPorCategoria,
  getTermino,
} from '../glosario'

describe('GLOSARIO', () => {
  it('has exactly 40 entries', () => {
    expect(GLOSARIO).toHaveLength(40)
  })

  it('has all unique slugs', () => {
    const slugs = GLOSARIO.map(t => t.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('every sesionOrigen present corresponds to a real session in SESIONES', () => {
    const sesionNumeros = new Set(SESIONES.map(s => s.n))
    const conOrigen = GLOSARIO.filter(t => t.sesionOrigen !== undefined)
    expect(conOrigen.length).toBeGreaterThan(0)
    for (const termino of conOrigen) {
      expect(sesionNumeros.has(termino.sesionOrigen!)).toBe(true)
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
  it('returns exactly 10 terms for each of the 4 categories', () => {
    for (const categoria of ORDEN_CATEGORIAS) {
      expect(getTerminosPorCategoria(categoria)).toHaveLength(10)
    }
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
