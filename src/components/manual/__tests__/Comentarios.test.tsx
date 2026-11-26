import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

vi.mock('next-intl', () => ({ useTranslations: () => (k: string) => k }))

import { Comentarios } from '../Comentarios'

const existente = { id: 'c1', author_name: 'Ben', body: 'Lorem ipsum', created_at: '2026-11-25T10:00:00Z', mine: false }
const nuevo = { id: 'c2', author_name: 'Lia', body: 'Dolor sit amet', created_at: '2026-11-25T11:00:00Z', mine: true }

describe('Comentarios', () => {
  const fetchMock = vi.fn()
  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  it('carga, envía, limpia el campo y muestra el nuevo comentario', async () => {
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => ({ comments: [existente] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ comment: nuevo }) })
    render(<Comentarios slug="nota-de-prueba" />)
    expect(await screen.findByText('Lorem ipsum')).toBeTruthy()

    const campo = screen.getByRole('textbox') as HTMLTextAreaElement
    expect(campo.maxLength).toBe(4000)
    fireEvent.change(campo, { target: { value: 'Dolor sit amet' } })
    fireEvent.click(screen.getByRole('button'))

    expect(await screen.findByText('Dolor sit amet')).toBeTruthy()
    expect(campo.value).toBe('')
    const [url, init] = fetchMock.mock.calls[1]
    expect(url).toBe('/api/manual/comments')
    expect(JSON.parse(init.body)).toEqual({ note_slug: 'nota-de-prueba', body: 'Dolor sit amet' })
  })

  it('muestra un error genérico si falla el envío y conserva el texto', async () => {
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => ({ comments: [] }) })
      .mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'x' }) })
    render(<Comentarios slug="nota-de-prueba" />)
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    const campo = screen.getByRole('textbox') as HTMLTextAreaElement
    fireEvent.change(campo, { target: { value: 'hola' } })
    fireEvent.click(screen.getByRole('button'))
    expect(await screen.findByRole('alert')).toBeTruthy()
    expect(campo.value).toBe('hola')
  })
})
