import { describe, it, expect } from 'vitest'
import { EJEMPLO } from '../ejemplo'
import { DATOS } from '../datos'
import { RAMAS } from '../tipos'

describe('datos del autorretrato', () => {
  it('el JSON publicado tiene todas las claves del tipo', () => {
    expect(Object.keys(DATOS).sort()).toEqual(Object.keys(EJEMPLO).sort())
  })
  it('cada nodo del camino usa una rama conocida', () => {
    for (const n of DATOS.camino.nodos) expect(RAMAS).toContain(n.rama)
  })
})
