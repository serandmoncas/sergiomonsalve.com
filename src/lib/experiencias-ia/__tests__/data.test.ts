import { describe, it, expect } from 'vitest'
import {
  SESIONES,
  TEMAS,
  PERSONAS,
  TALLER,
  esSinRegistro,
  getSesion,
  getSesionesDocumentadas,
  getBitacora,
  getAdjacentSesiones,
  getUltimasSesiones,
  getPersonasVisibles,
  getProyectosPublicados,
  getMetricas,
} from '../data'

describe('getSesion', () => {
  it('returns the session matching n', () => {
    expect(getSesion(7)?.titulo).toBe('Harness Engineering')
    expect(getSesion(17)?.titulo).toBe('Nuevo formato y caras nuevas')
  })

  it('returns undefined for a non-existent session number', () => {
    expect(getSesion(999)).toBeUndefined()
  })
})

describe('sesiones documentadas', () => {
  it('has 17 sessions numbered 1..17 with no gaps', () => {
    expect(getSesionesDocumentadas().map(s => s.n)).toEqual(Array.from({ length: 17 }, (_, i) => i + 1))
  })

  it('every session has a gancho', () => {
    for (const sesion of getSesionesDocumentadas()) {
      expect(sesion.gancho.trim()).not.toBe('')
    }
  })
})

describe('getBitacora', () => {
  it('lists every entry, most recent first', () => {
    const fechas = getBitacora().map(e => e.fecha)
    expect(fechas).toHaveLength(SESIONES.length)
    expect(fechas).toEqual([...fechas].sort().reverse())
    expect(fechas[0]).toBe('2026-10-14')
  })

  it('marks 29 jul, 12 ago and 30 sep as sin registro', () => {
    const sinRegistro = getBitacora().filter(esSinRegistro).map(e => e.fecha)
    expect(sinRegistro.sort()).toEqual(['2026-07-29', '2026-08-12', '2026-09-30'])
  })
})

describe('getAdjacentSesiones', () => {
  it('has no anterior for the first session', () => {
    const { anterior, siguiente } = getAdjacentSesiones(1)
    expect(anterior).toBeUndefined()
    expect(siguiente?.n).toBe(2)
  })

  it('has no siguiente for the last session', () => {
    const { anterior, siguiente } = getAdjacentSesiones(17)
    expect(anterior?.n).toBe(16)
    expect(siguiente).toBeUndefined()
  })
})

describe('getUltimasSesiones', () => {
  it('returns the N most recent documented sessions in descending order', () => {
    expect(getUltimasSesiones(3).map(s => s.n)).toEqual([17, 16, 15])
  })
})

describe('consentimiento', () => {
  it('never shows a person without consentimiento: true', () => {
    for (const persona of getPersonasVisibles()) {
      expect(persona.consentimiento).toBe(true)
    }
    const sinConsentimiento = PERSONAS.filter(p => !p.consentimiento).map(p => p.nombre)
    for (const nombre of sinConsentimiento) {
      expect(getPersonasVisibles().map(p => p.nombre)).not.toContain(nombre)
    }
  })

  it('never publishes a Taller project without publicar: true', () => {
    expect(getProyectosPublicados().every(p => p.publicar)).toBe(true)
    expect(getProyectosPublicados()).toHaveLength(TALLER.filter(p => p.publicar).length)
  })
})

describe('TEMAS', () => {
  it('every tema has someone who propone it', () => {
    for (const tema of TEMAS) {
      expect(tema.propone.trim()).not.toBe('')
    }
  })
})

describe('getMetricas', () => {
  it('computes metrics from the data, not hardcoded values', () => {
    expect(getMetricas()).toEqual({
      totalSesiones: getSesionesDocumentadas().length,
      totalIntegrantes: PERSONAS.length,
      temasPropuestos: TEMAS.length,
    })
  })
})
