import { describe, it, expect } from 'vitest'
import {
  PAISES_LATAM,
  REGION_POR_DEPARTAMENTO,
  rankingDesdeFacetas,
  elegirNombre,
  slugify,
  asignarSlugs,
  regionesDesdeDepartamentos,
  mesesDesdeFacetas,
} from '../gbif'

describe('constantes', () => {
  it('incluye los 20 países de Latinoamérica', () => {
    expect(PAISES_LATAM).toHaveLength(20)
    expect(PAISES_LATAM).toContain('CO')
  })

  it('asigna región a los 32 departamentos y Bogotá', () => {
    expect(Object.keys(REGION_POR_DEPARTAMENTO)).toHaveLength(33)
    expect(REGION_POR_DEPARTAMENTO['Antioquia']).toBe('andina')
  })
})

describe('rankingDesdeFacetas', () => {
  it('asigna puestos desde 1 en el orden de la faceta', () => {
    const ranking = rankingDesdeFacetas([{ name: '5', count: 9 }, { name: '7', count: 3 }])
    expect(ranking.get(5)).toBe(1)
    expect(ranking.get(7)).toBe(2)
  })
})

describe('elegirNombre', () => {
  const CAS = 'Colaboraciones Americanas Sobre Aves'

  it('prefiere la fuente Colaboraciones Americanas Sobre Aves', () => {
    const nombres = [
      { language: 'spa', vernacularName: 'Sirirí común', source: 'Catalogue of Life' },
      { language: 'spa', vernacularName: 'Sirirí común', source: 'Otra' },
      { language: 'spa', vernacularName: 'Tirano tropical', source: CAS },
    ]
    expect(elegirNombre(nombres, 'spa')).toBe('Tirano tropical')
  })

  it('sin esa fuente, elige el nombre más repetido sin importar mayúsculas', () => {
    const nombres = [
      { language: 'spa', vernacularName: 'Pepite' },
      { language: 'spa', vernacularName: 'Tirano tropical' },
      { language: 'spa', vernacularName: 'Tirano Tropical' },
    ]
    expect(elegirNombre(nombres, 'spa')?.toLowerCase()).toBe('tirano tropical')
  })

  it('devuelve null si no hay nombres en ese idioma', () => {
    expect(elegirNombre([{ language: 'eng', vernacularName: 'Tropical Kingbird' }], 'spa')).toBeNull()
  })
})

describe('slugify', () => {
  it('quita tildes, mayúsculas y espacios', () => {
    expect(slugify('Tángara Azuleja')).toBe('tangara-azuleja')
  })

  it('quita apóstrofos y signos', () => {
    expect(slugify("Carpintero de Lewis's")).toBe('carpintero-de-lewiss')
  })
})

describe('asignarSlugs', () => {
  it('nunca repite un slug', () => {
    const slugs = asignarSlugs([
      { speciesKey: 1, base: 'tirano tropical' },
      { speciesKey: 2, base: 'Tirano Tropical' },
    ])
    expect(slugs.get(1)).toBe('tirano-tropical')
    expect(slugs.get(2)).toBe('tirano-tropical-2')
  })
})

describe('regionesDesdeDepartamentos', () => {
  it('ordena por registros, ignora nombres desconocidos y no repite', () => {
    const regiones = regionesDesdeDepartamentos([
      { name: 'Antioquia', count: 50 },
      { name: 'Meta', count: 20 },
      { name: 'Caldas', count: 10 },
      { name: 'Narnia', count: 5 },
    ])
    expect(regiones).toEqual(['andina', 'orinoquia'])
  })

  it('reconoce las variantes de nombre que trae GBIF', () => {
    const regiones = regionesDesdeDepartamentos([
      { name: 'Choco', count: 9 },
      { name: 'Bogotá, D.C.', count: 8 },
      { name: 'Atlantico', count: 7 },
      { name: 'Narino Department', count: 6 },
      { name: 'San Andrés y Providencia', count: 5 },
    ])
    expect(regiones).toEqual(['andina', 'pacifica', 'caribe', 'insular'])
  })
})

describe('mesesDesdeFacetas', () => {
  it('devuelve 12 conteos con enero en el índice 0', () => {
    const meses = mesesDesdeFacetas([{ name: '5', count: 3 }])
    expect(meses).toHaveLength(12)
    expect(meses[4]).toBe(3)
    expect(meses.filter(m => m === 0)).toHaveLength(11)
  })
})
