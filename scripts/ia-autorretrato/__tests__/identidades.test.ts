import { afterEach, describe, expect, it } from 'vitest'
import { coincideAutor, configurarIdentidades, esSergio, IDENTIDADES_POR_DEFECTO, parsearIdentidades } from '../identidades'

afterEach(() => configurarIdentidades(IDENTIDADES_POR_DEFECTO))

describe('identidades configurables', () => {
  it('coincideAutor: prefijo con * y exacto sin *', () => {
    expect(coincideAutor('Ana Pérez', ['Ana*'])).toBe(true)
    expect(coincideAutor('Mariana', ['Ana*'])).toBe(false)
    expect(coincideAutor('ana', ['ana'])).toBe(true)
    expect(coincideAutor('ana2', ['ana'])).toBe(false)
  })
  it('parsearIdentidades completa con los valores por defecto lo que falte', () => {
    expect(parsearIdentidades({ autores: ['Ana*'] })).toEqual({ autores: ['Ana*'], cuentas: IDENTIDADES_POR_DEFECTO.cuentas })
    expect(parsearIdentidades({ cuentas: ['ana-gh'] }).cuentas).toEqual(['ana-gh'])
  })
  it('parsearIdentidades rechaza formas inválidas', () => {
    expect(() => parsearIdentidades(null)).toThrow()
    expect(() => parsearIdentidades({ autores: [] })).toThrow(/autores/)
    expect(() => parsearIdentidades({ cuentas: [1] })).toThrow(/cuentas/)
  })
  it('esSergio usa la configuración activa', () => {
    expect(esSergio('Sergio Monsalve')).toBe(true)
    configurarIdentidades(parsearIdentidades({ autores: ['Ana*', 'ana-bot'] }))
    expect(esSergio('Ana Pérez')).toBe(true)
    expect(esSergio('ana-bot')).toBe(true)
    expect(esSergio('Sergio Monsalve')).toBe(false)
  })
})
