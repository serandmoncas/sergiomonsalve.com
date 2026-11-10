import path from 'path'
import { describe, it, expect } from 'vitest'
import { getEspecies, getEspecie, getSlugs, getFechaConsulta } from '../catalogo'

const raiz = path.join(__dirname, 'fixtures')

describe('catálogo de aves', () => {
  it('devuelve las especies ordenadas por puesto en Colombia', () => {
    expect(getEspecies(raiz).map(e => e.puestoColombia)).toEqual([1, 2, 3])
  })

  it('une los atributos de la familia por speciesKey', () => {
    expect(getEspecie('tirano-tropical', raiz)?.atributos?.tamanoCm).toBe(21)
  })

  it('deja atributos en null cuando la especie no los tiene', () => {
    expect(getEspecie('gallinazo-negro', raiz)?.atributos).toBeNull()
  })

  it('devuelve null para un slug inexistente', () => {
    expect(getEspecie('no-existe', raiz)).toBeNull()
  })

  it('lista todos los slugs', () => {
    expect(getSlugs(raiz)).toHaveLength(3)
  })

  it('une solo las ilustraciones aprobadas', () => {
    const ilustraciones = getEspecie('tirano-tropical', raiz)?.ilustraciones
    expect(ilustraciones?.map(i => i.variante)).toEqual(['adulto'])
  })

  it('una especie sin ilustraciones tiene lista vacía', () => {
    expect(getEspecie('gallinazo-negro', raiz)?.ilustraciones).toEqual([])
  })

  it('expone la fecha de consulta de los datos', () => {
    expect(getFechaConsulta(raiz)).toBe('2026-10-29')
  })
})
