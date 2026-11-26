import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextResponse } from 'next/server'

const { requireAdminAal2, notFound, obtenerBoveda } = vi.hoisted(() => ({
  requireAdminAal2: vi.fn(),
  notFound: vi.fn(() => { throw new Error('NEXT_NOT_FOUND') }),
  obtenerBoveda: vi.fn(),
}))
vi.mock('server-only', () => ({}))
vi.mock('@/lib/auth/admin', () => ({ requireAdminAal2 }))
vi.mock('next/navigation', () => ({ notFound }))
vi.mock('../boveda', () => ({ obtenerBoveda }))

import { leerDiario } from '../acceso'

describe('leerDiario', () => {
  beforeEach(() => vi.clearAllMocks())

  it('sin aal2 llama a notFound y nunca pide la bóveda', async () => {
    requireAdminAal2.mockResolvedValue(new NextResponse(null, { status: 404 }))
    await expect(leerDiario()).rejects.toThrow('NEXT_NOT_FOUND')
    expect(obtenerBoveda).not.toHaveBeenCalled()
  })

  it('con aal2 devuelve lo que da obtenerBoveda', async () => {
    requireAdminAal2.mockResolvedValue({ user: { email: 'sergio@example.com' } })
    obtenerBoveda.mockResolvedValue({ ok: false, motivo: 'sin-token' })
    expect(await leerDiario()).toEqual({ ok: false, motivo: 'sin-token' })
  })
})
