import { describe, expect, it } from 'vitest'
import { buildGrafo, makeResolver } from '../graph'
import type { Nota, Recorrido } from '../types'

const nota = (slug: string, titulo: string, enlacesRaw: string[] = []): Nota => ({
  slug, titulo, estado: 'semilla', confianza: '', iaCapas: {}, voces: [], fuentes: [],
  verificado: null, terminos: [], entrada: '', capas: {}, enlacesRaw,
})

const rec: Recorrido = { slug: 'rec-de-prueba', nombre: 'Un Recorrído', pasos: [] }

describe('makeResolver', () => {
  const notas = [nota('a', 'Título Ñandú')]
  const resolve = makeResolver(notas, [rec])

  it('resuelve por slug', () => expect(resolve('a')).toEqual({ tipo: 'nota', slug: 'a' }))
  it('resuelve por título con tildes distintas', () => {
    expect(resolve('titulo nandu')).toEqual({ tipo: 'nota', slug: 'a' })
    expect(resolve('Título   Ñandú')).toEqual({ tipo: 'nota', slug: 'a' })
  })
  it('resuelve recorridos por slug y por nombre', () => {
    expect(resolve('rec-de-prueba')).toEqual({ tipo: 'recorrido', slug: 'rec-de-prueba' })
    expect(resolve('un recorrido')).toEqual({ tipo: 'recorrido', slug: 'rec-de-prueba' })
  })
  it('devuelve null si no existe', () => expect(resolve('nada')).toBeNull())
})

describe('buildGrafo', () => {
  const notas = [
    nota('a', 'A', ['b', 'Inexistente']),
    nota('b', 'B'),
    nota('c', 'C'),
  ]
  const resolve = makeResolver(notas, [])

  it('arma nodos, enlaces, backlinks y huérfanas', () => {
    const { grafo, backlinks, huerfanas } = buildGrafo(notas, resolve)
    expect(grafo.nodes).toHaveLength(4)
    expect(grafo.nodes.filter((n) => n.existe)).toHaveLength(3)
    expect(grafo.nodes.find((n) => !n.existe)).toMatchObject({ id: 'x:inexistente', existe: false })
    expect(grafo.links).toContainEqual({ source: 'a', target: 'b' })
    expect(grafo.links).toContainEqual({ source: 'a', target: 'x:inexistente' })
    expect(backlinks.b).toEqual(['a'])
    expect(huerfanas).toEqual(['c'])
  })

  it('los enlaces a recorridos no son aristas ni backlinks', () => {
    const ns = [nota('a', 'A', ['rec-de-prueba'])]
    const { grafo, backlinks, huerfanas } = buildGrafo(ns, makeResolver(ns, [rec]))
    expect(grafo.links).toEqual([])
    expect(grafo.nodes).toHaveLength(1)
    expect(backlinks).toEqual({})
    expect(huerfanas).toEqual(['a'])
  })

  it('ignora autoenlaces y duplicados', () => {
    const ns = [nota('a', 'A', ['a', 'b', 'B']), nota('b', 'B')]
    const { grafo } = buildGrafo(ns, makeResolver(ns, []))
    expect(grafo.links).toEqual([{ source: 'a', target: 'b' }])
  })
})
