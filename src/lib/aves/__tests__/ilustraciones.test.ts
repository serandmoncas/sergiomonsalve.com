import { describe, it, expect } from 'vitest'
import { cambiarEstado, registrarGenerada, aprobadas } from '../ilustraciones'
import type { Ilustracion } from '../tipos'

const base: Ilustracion = {
  variante: 'macho', estado: 'generada', archivo: 'x--macho', referencias: [], nota: '', actualizado: '2026-10-01',
}

describe('cambiarEstado', () => {
  it('cambia estado, nota y fecha', () => {
    const r = cambiarEstado(base, 'marcada', 'pico muy corto', '2026-10-30')
    expect(r).toMatchObject({ estado: 'marcada', nota: 'pico muy corto', actualizado: '2026-10-30' })
  })

  it('no permite aprobar una ilustración rechazada', () => {
    const rechazada = { ...base, estado: 'rechazada' as const }
    expect(() => cambiarEstado(rechazada, 'aprobada', '', '2026-10-30')).toThrow()
  })
})

describe('registrarGenerada', () => {
  const hoy = '2026-10-30'

  it('reemplaza una variante aprobada y la deja en generada', () => {
    const registro = { '1': [{ ...base, estado: 'aprobada' as const }] }
    const r = registrarGenerada(registro, 1, { variante: 'macho', archivo: 'x--macho', referencias: [] }, hoy)
    expect(r['1']).toHaveLength(1)
    expect(r['1'][0].estado).toBe('generada')
  })

  it('conserva las otras variantes de la especie', () => {
    const registro = { '1': [{ ...base, variante: 'hembra' as const, archivo: 'x--hembra' }] }
    const r = registrarGenerada(registro, 1, { variante: 'macho', archivo: 'x--macho', referencias: [] }, hoy)
    expect(r['1'].map(i => i.variante).sort()).toEqual(['hembra', 'macho'])
  })
})

describe('aprobadas', () => {
  it('filtra las aprobadas y las ordena macho, hembra, adulto, juvenil', () => {
    const lista: Ilustracion[] = [
      { ...base, variante: 'hembra', estado: 'aprobada' },
      { ...base, variante: 'juvenil', estado: 'generada' },
      { ...base, variante: 'macho', estado: 'aprobada' },
    ]
    expect(aprobadas(lista).map(i => i.variante)).toEqual(['macho', 'hembra'])
  })
})
