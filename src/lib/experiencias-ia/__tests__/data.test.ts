import { describe, it, expect } from 'vitest'
import {
  SESIONES,
  CRONOGRAMA,
  BACKLOG,
  PARTICIPANTES,
  getSesion,
  getAdjacentSesiones,
  getUltimasSesiones,
  getPendientesAbiertos,
  getMetricas,
} from '../data'

describe('getSesion', () => {
  it('returns the session matching n', () => {
    const sesion = getSesion(7)
    expect(sesion?.titulo).toBe('Harness Engineering')
  })

  it('returns undefined for a non-existent session number', () => {
    expect(getSesion(999)).toBeUndefined()
  })
})

describe('getAdjacentSesiones', () => {
  it('has no anterior for the first session', () => {
    const { anterior, siguiente } = getAdjacentSesiones(1)
    expect(anterior).toBeUndefined()
    expect(siguiente?.n).toBe(2)
  })

  it('has no siguiente for the last session', () => {
    const { anterior, siguiente } = getAdjacentSesiones(8)
    expect(anterior?.n).toBe(7)
    expect(siguiente).toBeUndefined()
  })

  it('returns both neighbors for a middle session', () => {
    const { anterior, siguiente } = getAdjacentSesiones(4)
    expect(anterior?.n).toBe(3)
    expect(siguiente?.n).toBe(5)
  })
})

describe('getUltimasSesiones', () => {
  it('returns the N most recent sessions in descending order', () => {
    const ultimas = getUltimasSesiones(3)
    expect(ultimas.map(s => s.n)).toEqual([8, 7, 6])
  })
})

describe('getPendientesAbiertos', () => {
  it('returns exactly the 19 open pendientes across all sessions', () => {
    expect(getPendientesAbiertos()).toHaveLength(19)
  })

  it('each entry carries its originating session number and title', () => {
    const deLaSesion7 = getPendientesAbiertos().filter(p => p.sesionN === 7)
    expect(deLaSesion7).toHaveLength(4)
    expect(deLaSesion7[0].sesionTitulo).toBe('Harness Engineering')
  })

  it('excludes closed pendientes', () => {
    const cerrados = getPendientesAbiertos().filter(p => p.estado === 'cerrado')
    expect(cerrados).toHaveLength(0)
  })
})

describe('getMetricas', () => {
  it('computes all four metrics from the data, not hardcoded values', () => {
    expect(getMetricas()).toEqual({
      totalSesiones: SESIONES.length,
      totalIntegrantes: PARTICIPANTES.length,
      pendientesAbiertos: getPendientesAbiertos().length,
      temasBacklog: BACKLOG.length,
    })
    expect(getMetricas().totalSesiones).toBe(8)
    expect(getMetricas().totalIntegrantes).toBe(18)
    expect(getMetricas().temasBacklog).toBe(12)
  })
})

describe('CRONOGRAMA', () => {
  it('has the 4 upcoming sessions (9-12)', () => {
    expect(CRONOGRAMA.map(s => s.n)).toEqual([9, 10, 11, 12])
  })
})
