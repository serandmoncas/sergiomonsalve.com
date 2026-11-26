import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { bovedaDePrueba, NOTAS_DE_PRUEBA } from '@/lib/diario/__tests__/ayudantes'

const { leerDiario } = vi.hoisted(() => ({ leerDiario: vi.fn() }))
vi.mock('@/lib/diario/acceso', () => ({ leerDiario }))
vi.mock('server-only', () => ({}))
vi.mock('@/lib/diario/fecha', async (orig) => ({
  ...(await orig<typeof import('@/lib/diario/fecha')>()),
  fechaBogota: () => '2026-11-26',
}))

import CalendarioPage from '../page'

const props = (mes?: string) => ({
  params: Promise.resolve({ locale: 'es' }),
  searchParams: Promise.resolve(mes ? { mes } : {}),
})

describe('Calendario', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    leerDiario.mockResolvedValue({ ok: true, boveda: await bovedaDePrueba(NOTAS_DE_PRUEBA) })
  })

  it('los días con nota enlazan a su nota; los demás no', async () => {
    render(await CalendarioPage(props()))
    expect(screen.getByRole('link', { name: /^25/ }).getAttribute('href'))
      .toBe('/es/admin/diario/nota?ruta=' + encodeURIComponent('Diario/2026-11-25.md'))
    expect(screen.queryByRole('link', { name: /^23/ })).toBeNull()
    expect(screen.getByText('23')).toBeInTheDocument()
  })

  it('un mes inválido cae en el de hoy', async () => {
    render(await CalendarioPage(props('2026-13')))
    expect(screen.getByRole('heading', { name: 'noviembre de 2026' })).toBeInTheDocument()
  })

  it('anterior y siguiente cruzan el año', async () => {
    render(await CalendarioPage(props('2026-12')))
    expect(screen.getByRole('link', { name: 'mes siguiente ›' }).getAttribute('href')).toBe('/es/admin/diario/calendario?mes=2027-01')
    expect(screen.getByRole('link', { name: '‹ mes anterior' }).getAttribute('href')).toBe('/es/admin/diario/calendario?mes=2026-11')
  })

  it('sin bóveda dice "Diario no disponible."', async () => {
    leerDiario.mockResolvedValue({ ok: false, motivo: 'red' })
    render(await CalendarioPage(props()))
    expect(screen.getByText('Diario no disponible.')).toBeInTheDocument()
  })
})
