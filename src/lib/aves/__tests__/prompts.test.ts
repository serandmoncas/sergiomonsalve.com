import { describe, it, expect } from 'vitest'
import { ESTILO, construirPrompt, validarRasgos, referenciasDesdeGbif } from '../prompts'
import { especie } from './especie-de-prueba'

const sirir = especie('siriri-comun', { cientifico: 'Tyrannus melancholicus' }, { tamanoCm: 21 })

describe('construirPrompt', () => {
  it('incluye estilo, especie, tamaño, variante y rasgos', () => {
    const p = construirPrompt(sirir, 'macho', 'gray head, olive back, bright yellow belly')
    expect(p).toContain(ESTILO)
    expect(p).toContain('Tyrannus melancholicus')
    expect(p).toContain('about 21 cm')
    expect(p).toContain('adult male')
    expect(p).toContain('bright yellow belly')
  })

  it('nombra cada variante en inglés', () => {
    expect(construirPrompt(sirir, 'hembra', 'x')).toContain('adult female')
    expect(construirPrompt(sirir, 'juvenil', 'x')).toContain('juvenile')
    expect(construirPrompt(sirir, 'adulto', 'x')).toMatch(/\badult\b/)
  })
})

describe('validarRasgos', () => {
  it('acepta solo adulto', () => {
    expect(validarRasgos({ adulto: 'x' })).toEqual([])
  })

  it('macho exige hembra', () => {
    expect(validarRasgos({ macho: 'x' })).not.toEqual([])
  })

  it('adulto excluye macho y hembra', () => {
    expect(validarRasgos({ adulto: 'x', macho: 'y' })).not.toEqual([])
  })

  it('rechaza un objeto vacío', () => {
    expect(validarRasgos({})).not.toEqual([])
  })
})

describe('referenciasDesdeGbif', () => {
  const r = (url?: string) => ({ media: url ? [{ identifier: url, license: 'CC BY-NC' }] : [], datasetName: 'iNaturalist' })

  it('toma como máximo n, omite las que no tienen URL y no repite', () => {
    const refs = referenciasDesdeGbif([r('a'), r(), r('a'), r('b'), r('c')], 2)
    expect(refs.map(x => x.url)).toEqual(['a', 'b'])
    expect(refs[0]).toEqual({ url: 'a', licencia: 'CC BY-NC', fuente: 'iNaturalist' })
  })
})
