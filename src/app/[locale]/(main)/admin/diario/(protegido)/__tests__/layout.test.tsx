import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NextResponse } from 'next/server'

const { requireAdminAal2, notFound } = vi.hoisted(() => ({
  requireAdminAal2: vi.fn(),
  notFound: vi.fn(() => { throw new Error('NEXT_NOT_FOUND') }),
}))
vi.mock('@/lib/auth/admin', () => ({ requireAdminAal2 }))
vi.mock('next/navigation', () => ({ notFound }))

import ProtegidoLayout from '../layout'

describe('layout protegido del diario', () => {
  beforeEach(() => vi.clearAllMocks())

  it('sin aal2 llama a notFound y no muestra la página hija', async () => {
    requireAdminAal2.mockResolvedValue(new NextResponse(null, { status: 404 }))
    await expect(ProtegidoLayout({ children: <p>secreto</p> })).rejects.toThrow('NEXT_NOT_FOUND')
  })

  it('con aal2 muestra la página hija', async () => {
    requireAdminAal2.mockResolvedValue({ user: { email: 'sergio@example.com' } })
    render(await ProtegidoLayout({ children: <p>contenido</p> }))
    expect(screen.getByText('contenido')).toBeInTheDocument()
  })
})
