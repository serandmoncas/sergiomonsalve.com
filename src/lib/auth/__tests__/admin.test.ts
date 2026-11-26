import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextResponse } from 'next/server'

const { getUser } = vi.hoisted(() => ({ getUser: vi.fn() }))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({ auth: { getUser } })),
}))

import { isAdminEmail, requireAdmin } from '../admin'

describe('isAdminEmail', () => {
  beforeEach(() => { process.env.ADMIN_EMAILS = 'Sergio@Example.com, otro@x.co' })

  it('acepta sin importar mayúsculas ni espacios', () => {
    expect(isAdminEmail(' sergio@example.com ')).toBe(true)
    expect(isAdminEmail('otro@x.co')).toBe(true)
  })

  it('rechaza otros, vacíos y cuando falta la variable', () => {
    expect(isAdminEmail('lector@x.co')).toBe(false)
    expect(isAdminEmail(null)).toBe(false)
    expect(isAdminEmail(undefined)).toBe(false)
    expect(isAdminEmail('')).toBe(false)
    delete process.env.ADMIN_EMAILS
    expect(isAdminEmail('sergio@example.com')).toBe(false)
  })
})

describe('requireAdmin', () => {
  beforeEach(() => {
    process.env.ADMIN_EMAILS = 'sergio@example.com'
    getUser.mockReset()
  })

  it('401 sin sesión', async () => {
    getUser.mockResolvedValue({ data: { user: null } })
    const res = await requireAdmin()
    expect(res).toBeInstanceOf(NextResponse)
    expect((res as NextResponse).status).toBe(401)
  })

  it('403 con sesión no admin', async () => {
    getUser.mockResolvedValue({ data: { user: { email: 'lector@x.co' } } })
    const res = await requireAdmin()
    expect(res).toBeInstanceOf(NextResponse)
    expect((res as NextResponse).status).toBe(403)
  })

  it('devuelve el usuario si es admin', async () => {
    const user = { email: 'Sergio@example.com' }
    getUser.mockResolvedValue({ data: { user } })
    expect(await requireAdmin()).toEqual({ user })
  })
})
