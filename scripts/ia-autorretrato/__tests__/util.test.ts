import { describe, it, expect } from 'vitest'
import { diaBogota, escaparRegex, mediana } from '../util'
import { leerFlujoJson } from '../flujoJson'

describe('util', () => {
  it('mediana de pares, impares y vacío', () => {
    expect(mediana([3, 1, 2])).toBe(2)
    expect(mediana([1, 2, 3, 4])).toBe(3) // (2+3)/2 redondeado
    expect(mediana([])).toBe(0)
  })
  it('escapa caracteres de regex', () => {
    expect(new RegExp(escaparRegex('a.b(c)')).test('a.b(c)')).toBe(true)
    expect(new RegExp(escaparRegex('a.b')).test('axb')).toBe(false)
  })
  it('diaBogota usa la hora de Colombia, no UTC', () => {
    expect(diaBogota(Date.parse('2026-10-15T03:00:00Z'))).toBe('2026-10-14')
    expect(diaBogota(Date.parse('2026-10-15T06:00:00Z'))).toBe('2026-10-15')
  })
})

describe('leerFlujoJson', () => {
  it('separa arreglos concatenados (salida de gh --paginate)', () => {
    expect(leerFlujoJson('[1,2][3]')).toEqual([[1, 2], [3]])
  })
  it('separa objetos en la misma línea y respeta llaves dentro de strings', () => {
    expect(leerFlujoJson('{"a":"}{"}{"b":"[\\"x"}\n')).toEqual([{ a: '}{' }, { b: '["x' }])
  })
})
