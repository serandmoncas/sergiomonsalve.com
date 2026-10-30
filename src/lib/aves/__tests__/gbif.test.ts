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
  mesesRelativos,
  fusionarSinonimos,
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

  it('descarta regiones con menos del 5 % de los registros', () => {
    const regiones = regionesDesdeDepartamentos([
      { name: 'Antioquia', count: 960 },
      { name: 'Meta', count: 30 },
      { name: 'Chocó', count: 10 },
    ])
    expect(regiones).toEqual(['andina'])
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

describe('mesesRelativos', () => {
  it('divide por el esfuerzo de cada mes para que un Big Day no cree un pico falso', () => {
    const especie = [10, 10, 10, 10, 50, 10, 10, 10, 10, 10, 10, 10]
    const totales = [100, 100, 100, 100, 500, 100, 100, 100, 100, 100, 100, 100]
    expect(new Set(mesesRelativos(especie, totales)).size).toBe(1)
  })

  it('escala a 0–100 con el mes más alto en 100', () => {
    const r = mesesRelativos([0, 5, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0], new Array(12).fill(100))
    expect(r[2]).toBe(100)
    expect(r[1]).toBe(50)
    expect(r[0]).toBe(0)
  })

  it('un mes sin registros totales vale 0', () => {
    expect(mesesRelativos(new Array(12).fill(1), [0, ...new Array(11).fill(10)])[0]).toBe(0)
  })
})

describe('fusionarSinonimos', () => {
  it('suma los registros del sinónimo a la especie aceptada y lo quita', () => {
    const r = fusionarSinonimos(
      [{ name: '1', count: 100 }, { name: '2', count: 50 }, { name: '3', count: 30 }],
      { 3: 2 },
    )
    expect(r).toEqual([{ name: '1', count: 100 }, { name: '2', count: 80 }])
  })

  it('reordena si la suma cambia el puesto', () => {
    const r = fusionarSinonimos(
      [{ name: '1', count: 100 }, { name: '2', count: 50 }, { name: '3', count: 60 }],
      { 3: 2 },
    )
    expect(r.map(c => c.name)).toEqual(['2', '1'])
  })
})
