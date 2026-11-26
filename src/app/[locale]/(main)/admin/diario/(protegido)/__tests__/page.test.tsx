import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { bovedaDePrueba, NOTAS_DE_PRUEBA } from '@/lib/diario/__tests__/ayudantes'
import { vistaHoy } from '@/lib/diaria'

const { leerDiario } = vi.hoisted(() => ({ leerDiario: vi.fn() }))
vi.mock('@/lib/diario/acceso', () => ({ leerDiario }))
vi.mock('server-only', () => ({}))
vi.mock('@/components/admin/diario/SegundoFactor', () => ({
  default: ({ modo, destino }: { modo: string; destino: string }) => <p>segundo-factor {modo} {destino}</p>,
}))
vi.mock('@/lib/diario/fecha', async (orig) => ({
  ...(await orig<typeof import('@/lib/diario/fecha')>()),
  fechaBogota: () => '2026-11-25',
}))

import DiarioPage from '../page'

const params = (locale = 'es') => ({ params: Promise.resolve({ locale }) })

describe('Hoy (admin/diario)', () => {
  beforeEach(() => vi.clearAllMocks())

  it('pinta las cinco secciones con los elementos que da el núcleo', async () => {
    const b = await bovedaDePrueba(NOTAS_DE_PRUEBA)
    leerDiario.mockResolvedValue({ ok: true, boveda: b })
    render(await DiarioPage(params()))
    const v = vistaHoy(b.diarias, b.historial, b.rutinas, '2026-11-25')
    for (const [titulo, items] of [
      ['Para hoy', v.hoy], ['Arrastrados', v.arrastrados], ['Quedaron atrás', v.atras],
      ['Rutinas', v.rutinas], ['Luego', v.rutinasLuego],
    ] as const) {
      const seccion = screen.getByRole('region', { name: titulo })
      if (items.length === 0) expect(within(seccion).getByText('Nada.')).toBeInTheDocument()
      else for (const i of items) expect(within(seccion).getByText(i.texto)).toBeInTheDocument()
    }
    expect(v.arrastrados.map(i => i.texto)).toEqual(['Revisar [[Proyecto Faro]]'])
  })

  it('cada elemento enlaza a la nota de su última aparición', async () => {
    leerDiario.mockResolvedValue({ ok: true, boveda: await bovedaDePrueba(NOTAS_DE_PRUEBA) })
    render(await DiarioPage(params()))
    const enlace = screen.getByText('Llamar a [[Ana Prueba]]').closest('a')!
    expect(enlace.getAttribute('href')).toBe('/es/admin/diario/nota?ruta=' + encodeURIComponent('Diario/2026-11-25.md'))
  })

  it('sin bóveda dice "Diario no disponible." sin el motivo', async () => {
    leerDiario.mockResolvedValue({ ok: false, motivo: 'github-401' })
    render(await DiarioPage(params()))
    expect(screen.getByText('Diario no disponible.')).toBeInTheDocument()
    expect(screen.queryByText(/github-401/)).not.toBeInTheDocument()
  })

  it('deja registrar otro autenticador', async () => {
    leerDiario.mockResolvedValue({ ok: true, boveda: await bovedaDePrueba(NOTAS_DE_PRUEBA) })
    render(await DiarioPage(params('en')))
    fireEvent.click(screen.getByRole('button', { name: 'Registrar otro autenticador' }))
    expect(screen.getByText('segundo-factor agregar /en/admin/diario')).toBeInTheDocument()
  })
})
