import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import ManualAdmin from '../admin/ManualAdmin'

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}))

const reader = { email: 'ana@mail.com', name: 'Ana', note: null, invited_at: '2026-11-01T00:00:00Z' }
const comment = { id: 'c1', note_slug: 'nota-de-prueba', author_name: 'Ana', author_email: 'ana@mail.com', body: 'Lorem', created_at: '2026-11-02T00:00:00Z' }
const ok = (body: unknown) => ({ ok: true, status: 200, json: async () => body })
const fail = (status = 500) => ({ ok: false, status, json: async () => ({}) })
const contenido = { ok: true as const, rotas: [], huerfanas: [] }

function listas() {
  return (url: string, init?: RequestInit) => {
    if (init?.method) return Promise.resolve(ok({}))
    return Promise.resolve(url.includes('readers') ? ok({ readers: [reader] }) : ok({ comments: [comment] }))
  }
}

describe('ManualAdmin', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
  })

  it('si DELETE de lector falla, la fila queda y se avisa', async () => {
    vi.stubGlobal('fetch', vi.fn((url: string, init?: RequestInit) =>
      init?.method === 'DELETE' ? Promise.resolve(fail()) : listas()(url, init)))
    render(<ManualAdmin contenido={contenido} />)
    fireEvent.click(await screen.findByText('Quitar'))
    expect(await screen.findByRole('status')).toHaveTextContent('No se pudo quitar')
    expect(screen.getByText('ana@mail.com')).toBeInTheDocument()
  })

  it('si DELETE de comentario falla, el comentario queda y se avisa', async () => {
    vi.stubGlobal('fetch', vi.fn((url: string, init?: RequestInit) =>
      init?.method === 'DELETE' ? Promise.resolve(fail()) : listas()(url, init)))
    render(<ManualAdmin contenido={contenido} />)
    fireEvent.click(await screen.findByText('Borrar'))
    expect(await screen.findByRole('status')).toHaveTextContent('No se pudo borrar')
    expect(screen.getByText('Lorem')).toBeInTheDocument()
  })

  it('quita la fila cuando el DELETE funciona', async () => {
    vi.stubGlobal('fetch', vi.fn(listas()))
    render(<ManualAdmin contenido={contenido} />)
    fireEvent.click(await screen.findByText('Quitar'))
    await waitFor(() => expect(screen.queryByText('ana@mail.com')).toBeNull())
  })

  it('una lista con error no-401 muestra aviso, no "sin lectores"', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(fail())))
    render(<ManualAdmin contenido={contenido} />)
    expect(await screen.findByRole('status')).toHaveTextContent('No se pudo cargar')
  })

  it('si fetch rechaza al invitar, avisa y reactiva el botón', async () => {
    vi.stubGlobal('fetch', vi.fn((url: string, init?: RequestInit) =>
      init?.method === 'POST' ? Promise.reject(new Error('red')) : listas()(url, init)))
    render(<ManualAdmin contenido={contenido} />)
    await screen.findByText('Quitar')
    fireEvent.change(screen.getByLabelText('Correo'), { target: { value: 'b@mail.com' } })
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Bea' } })
    fireEvent.click(screen.getByRole('button', { name: 'Invitar' }))
    expect(await screen.findByRole('status')).toHaveTextContent('Error de red')
    expect(screen.getByRole('button', { name: 'Invitar' })).not.toBeDisabled()
  })

  it('si fetch rechaza al refrescar, avisa', async () => {
    vi.stubGlobal('fetch', vi.fn((url: string, init?: RequestInit) =>
      init?.method === 'POST' ? Promise.reject(new Error('red')) : listas()(url, init)))
    render(<ManualAdmin contenido={contenido} />)
    fireEvent.click(await screen.findByText('Refrescar contenido'))
    expect(await screen.findByRole('status')).toHaveTextContent('Error de red')
  })

  it('muestra "no disponible" si el contenido no cargó', async () => {
    vi.stubGlobal('fetch', vi.fn(listas()))
    render(<ManualAdmin contenido={{ ok: false }} />)
    expect(await screen.findByText(/no disponible/)).toBeInTheDocument()
  })
})
