import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NextResponse } from 'next/server'

const { requireAdmin, notFound } = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  notFound: vi.fn(() => { throw new Error('NEXT_NOT_FOUND') }),
}))
vi.mock('@/lib/auth/admin', () => ({ requireAdmin }))
vi.mock('next/navigation', () => ({ notFound }))
vi.mock('@/components/admin/diario/SegundoFactor', () => ({
  default: ({ modo, destino }: { modo: string; destino: string }) => <p>sf {modo} {destino}</p>,
}))

import SegundoFactorPage from '../page'

const props = (next?: string) => ({
  params: Promise.resolve({ locale: 'es' }),
  searchParams: Promise.resolve(next ? { next } : {}),
})

describe('página segundo-factor', () => {
  beforeEach(() => vi.clearAllMocks())

  it('sin sesión de admin llama a notFound', async () => {
    requireAdmin.mockResolvedValue(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
    await expect(SegundoFactorPage(props())).rejects.toThrow('NEXT_NOT_FOUND')
  })

  it('con sesión de admin muestra el formulario con el destino limpio', async () => {
    requireAdmin.mockResolvedValue({ user: { email: 'sergio@example.com' } })
    render(await SegundoFactorPage(props('/es/admin/diario/x')))
    expect(screen.getByText('sf entrar /es/admin/diario/x')).toBeInTheDocument()
  })
})
