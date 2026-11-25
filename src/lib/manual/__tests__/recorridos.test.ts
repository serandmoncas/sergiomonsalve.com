import { describe, expect, it } from 'vitest'
import { parseRecorrido, pasoVecinos } from '../recorridos'
import { makeResolver } from '../graph'
import type { Nota } from '../types'

const RAW = `# Recorrido — Recorrido de prueba

**Para quién:** Lorem ipsum dolor.
**Resultado:** Sit amet consectetur
que sigue en otra línea.
**Estado:** borrador

## Notas, en orden

1. [[a]]
2. [[falta]]
3. [[Nota con Título|alias]]

## Otra sección

4. [[no-cuenta]]
`

const nota = (slug: string, titulo: string): Nota => ({
  slug, titulo, estado: 'semilla', confianza: '', iaCapas: {}, voces: [], fuentes: [],
  verificado: null, terminos: [], entrada: '', capas: {}, enlacesRaw: [],
})

describe('parseRecorrido', () => {
  it('extrae nombre, para quién, resultado y pasos', () => {
    const r = parseRecorrido('rec-prueba', RAW)
    expect(r.slug).toBe('rec-prueba')
    expect(r.nombre).toBe('Recorrido de prueba')
    expect(r.paraQuien).toBe('Lorem ipsum dolor.')
    expect(r.resultado).toBe('Sit amet consectetur que sigue en otra línea.')
    expect(r.pasos).toEqual(['a', 'falta', 'Nota con Título'])
  })

  it('usa el slug como nombre si no hay título', () => {
    expect(parseRecorrido('x', '').nombre).toBe('x')
  })
})

describe('pasoVecinos', () => {
  const notas = [nota('a', 'A'), nota('b', 'B')]
  const rec = { slug: 'r', nombre: 'R', pasos: ['a', 'falta', 'b'] }
  const resolve = makeResolver(notas, [rec])

  it('salta los pasos sin nota', () => {
    expect(pasoVecinos(rec, 'a', resolve)).toEqual({ indice: 0, total: 3, anterior: undefined, siguiente: 'b' })
    expect(pasoVecinos(rec, 'b', resolve)).toEqual({ indice: 2, total: 3, anterior: 'a', siguiente: undefined })
  })

  it('devuelve null si la nota no está en el recorrido', () => {
    expect(pasoVecinos(rec, 'zzz', resolve)).toBeNull()
  })
})
