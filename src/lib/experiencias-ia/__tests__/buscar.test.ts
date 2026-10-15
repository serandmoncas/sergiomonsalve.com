import { describe, it, expect } from 'vitest'
import { coincide, normalizar } from '../buscar'
import { GLOSARIO, getTermino } from '../glosario'

const atencion = getTermino('mecanismo-de-atencion')!
const inyeccion = getTermino('inyeccion-de-prompts')!

describe('normalizar', () => {
  it('quita tildes y pasa a minúsculas', () => {
    expect(normalizar('Atención ÉTICA')).toBe('atencion etica')
  })
})

describe('coincide', () => {
  it('sin tildes encuentra términos con tildes', () => {
    expect(coincide(atencion, 'atencion')).toBe(true)
    expect(coincide(atencion, 'ATENCIÓN')).toBe(true)
  })

  it('busca también en la definición', () => {
    // "transformer" no está en el nombre, sí en la definición
    expect(atencion.termino.toLowerCase()).not.toContain('transformer')
    expect(coincide(atencion, 'transformer')).toBe(true)
  })

  it("modo 'y' exige todas las palabras", () => {
    expect(coincide(inyeccion, 'inyeccion prompts', 'y')).toBe(true)
    expect(coincide(inyeccion, 'inyeccion cohetes', 'y')).toBe(false)
  })

  it("modo 'o' acepta cualquiera de las palabras", () => {
    expect(coincide(inyeccion, 'inyeccion cohetes', 'o')).toBe(true)
    expect(coincide(inyeccion, 'cohetes guitarra', 'o')).toBe(false)
  })

  it('una consulta vacía o de solo espacios no filtra nada', () => {
    expect(GLOSARIO.every(t => coincide(t, '   '))).toBe(true)
  })
})
