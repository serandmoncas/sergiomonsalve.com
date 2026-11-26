import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { bovedaDePrueba, NOTAS_DE_PRUEBA } from '@/lib/diario/__tests__/ayudantes'
import { idNota, urlNota } from '@/lib/diario/urls'

const { leerDiario } = vi.hoisted(() => ({ leerDiario: vi.fn() }))
vi.mock('@/lib/diario/acceso', () => ({ leerDiario }))
vi.mock('server-only', () => ({}))

import NotaPage from '../page'

const props = (n?: string | string[]) => ({
  params: Promise.resolve({ locale: 'es' }),
  searchParams: Promise.resolve(n === undefined ? {} : { n }),
})
const de = (ruta: string) => idNota(ruta)

describe('Nota', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    leerDiario.mockResolvedValue({ ok: true, boveda: await bovedaDePrueba(NOTAS_DE_PRUEBA, ['Adjuntos/foto.png']) })
  })

  it('muestra el título y el texto de la nota', async () => {
    render(await NotaPage(props(de('Personas/Ana Prueba.md'))))
    // El título de la página es el nombre del archivo; el "# Ana Prueba" de la nota se pinta aparte.
    const titulos = screen.getAllByRole('heading', { level: 1, name: 'Ana Prueba' })
    expect(titulos).toHaveLength(2)
    expect(titulos[0].className).toContain('text-2xl')
  })

  it('los [[enlaces]] van a su nota y los rotos se marcan', async () => {
    const { container } = render(await NotaPage(props(de('Diario/2026-11-25.md'))))
    expect(screen.getByRole('link', { name: 'Ana Prueba' }).getAttribute('href'))
      .toBe(urlNota('es', 'Personas/Ana Prueba.md'))
    expect(container.querySelector('input[type=checkbox]:checked')).not.toBeNull()
  })

  it.each([undefined, 'Personas/Ana Prueba.md', 'x', de('../x.md'), de('inexistente.md'), de('Adjuntos/foto.png'), ['a', 'b']])(
    '%s → "Nota no encontrada."',
    async (n) => {
      render(await NotaPage(props(n as string | string[] | undefined)))
      expect(screen.getByText('Nota no encontrada.')).toBeInTheDocument()
    },
  )

  it('sin bóveda dice "Diario no disponible."', async () => {
    leerDiario.mockResolvedValue({ ok: false, motivo: 'red' })
    render(await NotaPage(props(de('Personas/Ana Prueba.md'))))
    expect(screen.getByText('Diario no disponible.')).toBeInTheDocument()
  })
})
