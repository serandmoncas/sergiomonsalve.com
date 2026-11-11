import { describe, it, expect } from 'vitest'
import { validarAtributos } from '../atributos'

const valido = {
  tamanoCm: 21,
  claseTamano: 'mirla',
  colores: ['amarillo', 'gris'],
  habitats: ['ciudad', 'campo'],
  altitudM: [0, 2600],
  residencia: 'residente',
  endemica: false,
}

describe('validarAtributos', () => {
  it('acepta atributos válidos', () => {
    expect(validarAtributos(valido)).toEqual([])
  })

  it('rechaza colores vacíos', () => {
    expect(validarAtributos({ ...valido, colores: [] }).join(' ')).toContain('colores')
  })

  it('rechaza más de 3 colores', () => {
    expect(validarAtributos({ ...valido, colores: ['azul', 'rojo', 'negro', 'gris'] })).not.toEqual([])
  })

  it('rechaza una altitud mínima mayor que la máxima', () => {
    expect(validarAtributos({ ...valido, altitudM: [2000, 100] })).not.toEqual([])
  })

  it('rechaza una clase de tamaño desconocida', () => {
    expect(validarAtributos({ ...valido, claseTamano: 'aguila' })).not.toEqual([])
  })

  it('rechaza un tamaño de 0 cm', () => {
    expect(validarAtributos({ ...valido, tamanoCm: 0 })).not.toEqual([])
  })

  it('rechaza una clase de tamaño que no corresponde a los cm', () => {
    expect(validarAtributos({ ...valido, tamanoCm: 45 })).not.toEqual([])
  })
})
