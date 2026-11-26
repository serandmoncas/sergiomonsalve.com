import { describe, it, expect } from 'vitest'
import { fechaBogota, mesDe, mesVecino } from '../fecha'

describe('fechas del diario', () => {
  it('hoy es la fecha de Bogotá, no la de UTC', () => {
    expect(fechaBogota(new Date('2026-11-27T03:00:00Z'))).toBe('2026-11-26')
    expect(fechaBogota(new Date('2026-11-27T05:00:00Z'))).toBe('2026-11-27')
  })

  it('mesDe acepta YYYY-MM válido y si no usa el de hoy', () => {
    expect(mesDe('2026-02', '2026-11-26')).toBe('2026-02')
    for (const malo of ['2026-13', '2026-00', 'x', '', undefined, ['2026-01'], '2026-1', '0999-01'])
      expect(mesDe(malo as string | string[] | undefined, '2026-11-26')).toBe('2026-11')
  })

  it('mesVecino cruza el año', () => {
    expect(mesVecino('2026-12', 1)).toBe('2027-01')
    expect(mesVecino('2026-01', -1)).toBe('2025-12')
  })
})
