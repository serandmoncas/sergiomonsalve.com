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
    expect(screen.getByRole('heading', { level: 1, name: 'Ana Prueba' })).toBeInTheDocument()
    expect(document.body.textContent).toContain('Ana Prueba')
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
