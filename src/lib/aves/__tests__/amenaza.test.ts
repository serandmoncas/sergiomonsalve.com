import { describe, it, expect } from 'vitest'
import { parsearAmenazas } from '../amenaza'

describe('parsearAmenazas', () => {
  it('lee la categoría por nombre científico en minúsculas', () => {
    const amenazas = parsearAmenazas('# fuente\ncientifico,categoria\nAra militaris,VU\n')
    expect(amenazas.get('ara militaris')).toBe('VU')
  })

  it('ignora categorías distintas de CR, EN y VU', () => {
    const amenazas = parsearAmenazas('cientifico,categoria\nAra macao,NT\nAra ararauna,\n')
    expect(amenazas.size).toBe(0)
  })
})
