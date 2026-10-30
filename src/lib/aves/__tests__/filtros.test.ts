import { describe, it, expect } from 'vitest'
import { buscar, filtrarEspecies, agruparPorFamilia, FILTROS_VACIOS } from '../filtros'
import { especie } from './especie-de-prueba'

const azulejo = especie('azulejo', { nombreEs: 'Tángara azuleja', puestoColombia: 2 }, { colores: ['azul', 'gris'], habitats: ['ciudad'] })
const barranquero = especie('barranquero', { nombreEs: 'Barranquero', cientifico: 'Momotus momota', familia: 'Momotidae', puestoColombia: 30 }, { tamanoCm: 42, claseTamano: 'gallinazo', colores: ['verde', 'azul'] })
const sirir = especie('sirir', { nombreEs: 'Sirirí común', nombreEn: 'Tropical Kingbird', familia: 'Tyrannidae', puestoColombia: 1 }, { colores: ['amarillo', 'gris'], habitats: ['ciudad', 'campo'] })
const sinDatos = especie('sin-datos', { nombreEs: 'Tangara sin datos', puestoColombia: 3 }, null)
const todas = [azulejo, barranquero, sirir, sinDatos]

describe('buscar', () => {
  it('ignora tildes y mayúsculas', () => {
    expect(buscar(todas, 'TANGARA AZULEJA')).toEqual([azulejo])
  })

  it('busca por nombre científico', () => {
    expect(buscar(todas, 'momotus')).toEqual([barranquero])
  })

  it('busca por nombre en inglés', () => {
    expect(buscar(todas, 'kingbird')).toEqual([sirir])
  })

  it('con texto vacío devuelve todas', () => {
    expect(buscar(todas, '  ')).toHaveLength(4)
  })
})

describe('filtrarEspecies', () => {
  it('con varios colores devuelve las que tienen alguno', () => {
    const r = filtrarEspecies(todas, { ...FILTROS_VACIOS, colores: ['azul', 'amarillo'] })
    expect(r.map(e => e.slug).sort()).toEqual(['azulejo', 'barranquero', 'sirir'])
  })

  it('tamaño y hábitat se combinan como intersección', () => {
    const r = filtrarEspecies(todas, { ...FILTROS_VACIOS, tamano: 'mirla', habitat: 'ciudad' })
    expect(r.map(e => e.slug).sort()).toEqual(['azulejo', 'sirir'])
  })

  it('una especie sin atributos queda fuera si hay filtros de atributos', () => {
    expect(filtrarEspecies(todas, { ...FILTROS_VACIOS, tamano: 'mirla' })).not.toContain(sinDatos)
  })

  it('una especie sin atributos queda dentro si solo hay texto', () => {
    expect(filtrarEspecies(todas, { ...FILTROS_VACIOS, texto: 'tangara' })).toContain(sinDatos)
  })
})

describe('agruparPorFamilia', () => {
  it('ordena las familias por su especie mejor ubicada y las especies por puesto', () => {
    const grupos = agruparPorFamilia(todas)
    expect(grupos.map(g => g.familia)).toEqual(['Tyrannidae', 'Thraupidae', 'Momotidae'])
    expect(grupos[1].especies.map(e => e.slug)).toEqual(['azulejo', 'sin-datos'])
  })
})
