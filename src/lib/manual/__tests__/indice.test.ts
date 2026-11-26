import { describe, expect, it } from 'vitest'
import { parseIndice } from '../indice'

const YAML = `
secciones:
  - id: uno
    titulo: Sección uno
    entradas:
      - n: 0
        titulo: Entrada cero
        confianza: alta
        recorrido: recorrido-de-prueba
      - n: 1
        titulo: Entrada uno
        puerta: una puerta
        confianza: media
        nota: nota-de-prueba
  - id: dos
    titulo: Sección dos
    entradas:
      - n: 2
        titulo: Entrada dos
        confianza: baja
`

describe('parseIndice', () => {
  it('lee secciones y entradas', () => {
    const idx = parseIndice(YAML)
    expect(idx.secciones.map((s) => s.id)).toEqual(['uno', 'dos'])
    expect(idx.secciones[0].entradas[0]).toMatchObject({ n: 0, recorrido: 'recorrido-de-prueba' })
    expect(idx.secciones[0].entradas[1]).toMatchObject({ nota: 'nota-de-prueba', puerta: 'una puerta' })
    expect(idx.secciones[1].entradas[0].nota).toBeUndefined()
  })

  it('lanza error si falta `secciones`', () => {
    expect(() => parseIndice('otra: cosa')).toThrow()
  })

  it('lanza error si una entrada no tiene título o n', () => {
    expect(() => parseIndice('secciones:\n  - id: a\n    titulo: A\n    entradas:\n      - n: 1')).toThrow()
  })

  it('lanza error con YAML roto', () => {
    expect(() => parseIndice('secciones: [')).toThrow()
  })
})
