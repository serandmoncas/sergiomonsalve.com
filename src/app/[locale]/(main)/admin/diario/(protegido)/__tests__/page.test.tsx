import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { NextResponse } from 'next/server'

const { requireAdminAal2, notFound } = vi.hoisted(() => ({
  requireAdminAal2: vi.fn(),
  notFound: vi.fn(() => { throw new Error('NEXT_NOT_FOUND') }),
}))
vi.mock('@/lib/auth/admin', () => ({ requireAdminAal2 }))
vi.mock('next/navigation', () => ({ notFound }))
vi.mock('@/components/admin/diario/SegundoFactor', () => ({
  default: ({ modo, destino }: { modo: string; destino: string }) => <p>segundo-factor {modo} {destino}</p>,
}))

import DiarioPage from '../page'

const params = (locale = 'es') => ({ params: Promise.resolve({ locale }) })

describe('admin/diario page', () => {
  beforeEach(() => vi.clearAllMocks())

  it('sin aal2 llama a notFound', async () => {
    requireAdminAal2.mockResolvedValue(new NextResponse(null, { status: 404 }))
    await expect(DiarioPage(params())).rejects.toThrow('NEXT_NOT_FOUND')
  })

  it('con aal2 muestra "Diario" y deja registrar otro autenticador', async () => {
    requireAdminAal2.mockResolvedValue({ user: { email: 'sergio@example.com' } })
    render(await DiarioPage(params('en')))
    expect(screen.getByRole('heading', { name: 'Diario' })).toBeInTheDocument()
    expect(screen.queryByText(/segundo-factor/)).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Registrar otro autenticador' }))
    expect(screen.getByText('segundo-factor agregar /en/admin/diario')).toBeInTheDocument()
  })
})
