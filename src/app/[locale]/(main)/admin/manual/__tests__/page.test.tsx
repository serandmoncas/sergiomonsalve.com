import { describe, it, expect, vi, beforeEach } from 'vitest'

const { getReader, getManual, notFound } = vi.hoisted(() => ({
  getReader: vi.fn(),
  getManual: vi.fn(),
  notFound: vi.fn(() => { throw new Error('NEXT_NOT_FOUND') }),
}))
vi.mock('@/lib/manual/access', () => ({ getReader }))
vi.mock('@/lib/manual/manual', () => ({ getManual }))
vi.mock('next/navigation', () => ({ notFound }))
vi.mock('@/components/admin/ManualAdmin', () => ({ default: () => null }))

import AdminManualPage from '../page'

describe('admin/manual page', () => {
  beforeEach(() => vi.clearAllMocks())

  it('lector no admin → notFound y no carga el manual', async () => {
    getReader.mockResolvedValue({ isAdmin: false })
    await expect(AdminManualPage()).rejects.toThrow('NEXT_NOT_FOUND')
    expect(notFound).toHaveBeenCalled()
    expect(getManual).not.toHaveBeenCalled()
  })

  it('sin sesión → notFound', async () => {
    getReader.mockResolvedValue(null)
    await expect(AdminManualPage()).rejects.toThrow('NEXT_NOT_FOUND')
  })

  it('getManual no ok → pasa contenido {ok:false}', async () => {
    getReader.mockResolvedValue({ isAdmin: true })
    getManual.mockResolvedValue({ ok: false, error: { tipo: 'fallo' } })
    const el = await AdminManualPage()
    expect(el.props.contenido).toEqual({ ok: false })
  })

  it('getManual ok → pasa rotas y huérfanas', async () => {
    getReader.mockResolvedValue({ isAdmin: true })
    getManual.mockResolvedValue({ ok: true, manual: { rotas: [{ slug: 'x', error: 'e' }], huerfanas: ['h'] } })
    const el = await AdminManualPage()
    expect(el.props.contenido).toEqual({ ok: true, rotas: [{ slug: 'x', error: 'e' }], huerfanas: ['h'] })
  })
})
