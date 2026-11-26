import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { bovedaDePrueba, NOTAS_DE_PRUEBA } from '@/lib/diario/__tests__/ayudantes'

const { leerDiario } = vi.hoisted(() => ({ leerDiario: vi.fn() }))
vi.mock('@/lib/diario/acceso', () => ({ leerDiario }))
vi.mock('server-only', () => ({}))

import NotaPage from '../page'

const props = (ruta?: string | string[]) => ({
  params: Promise.resolve({ locale: 'es' }),
  searchParams: Promise.resolve(ruta === undefined ? {} : { ruta }),
})

describe('Nota', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    leerDiario.mockResolvedValue({ ok: true, boveda: await bovedaDePrueba(NOTAS_DE_PRUEBA, ['Adjuntos/foto.png']) })
  })

  it('muestra el título y el texto de la nota', async () => {
    render(await NotaPage(props('Personas/Ana Prueba.md')))
    // El título de la página es el nombre del archivo; el "# Ana Prueba" de la nota se pinta aparte.
    const titulos = screen.getAllByRole('heading', { level: 1, name: 'Ana Prueba' })
    expect(titulos).toHaveLength(2)
    expect(titulos[0].className).toContain('text-2xl')
  })

  it('los [[enlaces]] van a su nota y los rotos se marcan', async () => {
    const { container } = render(await NotaPage(props('Diario/2026-11-25.md')))
    expect(screen.getByRole('link', { name: 'Ana Prueba' }).getAttribute('href'))
      .toBe('/es/admin/diario/nota?ruta=' + encodeURIComponent('Personas/Ana Prueba.md'))
    expect(container.querySelector('input[type=checkbox]:checked')).not.toBeNull()
  })

  it.each([undefined, '../x.md', '/Personas/Ana Prueba.md', 'inexistente.md', 'Adjuntos/foto.png', ['a', 'b']])(
    '%s → "Nota no encontrada."',
    async (ruta) => {
      render(await NotaPage(props(ruta as string | string[] | undefined)))
      expect(screen.getByText('Nota no encontrada.')).toBeInTheDocument()
    },
  )

  it('sin bóveda dice "Diario no disponible."', async () => {
    leerDiario.mockResolvedValue({ ok: false, motivo: 'red' })
    render(await NotaPage(props('Personas/Ana Prueba.md')))
    expect(screen.getByText('Diario no disponible.')).toBeInTheDocument()
  })
})
