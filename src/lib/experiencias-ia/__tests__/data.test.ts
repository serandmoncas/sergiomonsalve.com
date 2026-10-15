import { describe, it, expect } from 'vitest'
import {
  SESIONES,
  TEMAS,
  PERSONAS,
  TALLER,
  MIERCOLES_SIN_SESION,
  esSinRegistro,
  getSesion,
  getSesionesDocumentadas,
  getBitacora,
  getAdjacentSesiones,
  getUltimasSesiones,
  getPersonasVisibles,
  getProyectosPublicados,
  getMetricas,
  getProximaSesion,
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
  // Sin cantidades fijas: agregar una sesión no debe obligar a tocar los tests.
  it('are numbered 1..N with no gaps or repeats', () => {
    const numeros = getSesionesDocumentadas().map(s => s.n)
    expect(numeros).toEqual(Array.from({ length: numeros.length }, (_, i) => i + 1))
  })

  it('every hallazgos list has at most 6 items (recaps cortos)', () => {
    for (const sesion of getSesionesDocumentadas()) {
      expect(sesion.hallazgos?.length ?? 0).toBeLessThanOrEqual(6)
    }
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
    expect(fechas[0]).toBe([...SESIONES].map(e => e.fecha).sort().at(-1))
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
    const ultima = getSesionesDocumentadas().length
    const { anterior, siguiente } = getAdjacentSesiones(ultima)
    expect(anterior?.n).toBe(ultima - 1)
    expect(siguiente).toBeUndefined()
  })
})

describe('getUltimasSesiones', () => {
  it('returns the N most recent documented sessions in descending order', () => {
    const ultima = getSesionesDocumentadas().length
    expect(getUltimasSesiones(3).map(s => s.n)).toEqual([ultima, ultima - 1, ultima - 2])
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

describe('getProximaSesion', () => {
  // Las horas van en UTC; Bogotá es UTC-5.
  it('un jueves devuelve el miércoles siguiente', () => {
    expect(getProximaSesion(new Date('2026-10-15T15:00:00Z'))).toEqual({
      fecha: '2026-10-21',
      texto: 'Miércoles 21 de octubre de 2026',
    })
  })

  it('el miércoles antes de terminar la sesión devuelve ese mismo día, aunque en UTC ya sea jueves', () => {
    // 7:30 p.m. en Bogotá = 00:30 UTC del jueves
    expect(getProximaSesion(new Date('2026-10-22T00:30:00Z')).fecha).toBe('2026-10-21')
  })

  it('el miércoles después de las 8:30 p.m. pasa a la semana siguiente', () => {
    // 8:45 p.m. en Bogotá
    expect(getProximaSesion(new Date('2026-10-22T01:45:00Z')).fecha).toBe('2026-10-28')
  })

  it('cambia bien de mes y de año', () => {
    expect(getProximaSesion(new Date('2026-12-31T15:00:00Z')).texto).toBe('Miércoles 6 de enero de 2027')
  })

  it('se salta los miércoles sin sesión', () => {
    MIERCOLES_SIN_SESION.push({ fecha: '2026-10-21', nota: 'Prueba' })
    try {
      expect(getProximaSesion(new Date('2026-10-15T15:00:00Z')).fecha).toBe('2026-10-28')
    } finally {
      MIERCOLES_SIN_SESION.pop()
    }
  })
})
