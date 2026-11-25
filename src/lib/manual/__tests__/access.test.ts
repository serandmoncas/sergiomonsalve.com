import { describe, it, expect, vi, beforeEach } from 'vitest'

const { getUser, maybeSingle, eq, from } = vi.hoisted(() => {
  const maybeSingle = vi.fn()
  const eq = vi.fn(() => ({ maybeSingle }))
  const select = vi.fn(() => ({ eq }))
  const from = vi.fn(() => ({ select }))
  return { getUser: vi.fn(), maybeSingle, eq, from }
})

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({ auth: { getUser } })),
  createAdminClient: vi.fn(() => ({ from })),
}))

import { normalizeEmail, getReader } from '../access'

describe('normalizeEmail', () => {
  it('recorta y pasa a minúsculas', () => {
    expect(normalizeEmail(' Ana@Mail.COM ')).toBe('ana@mail.com')
  })
})

describe('getReader', () => {
  beforeEach(() => {
    process.env.ADMIN_EMAILS = 'sergio@example.com'
    delete process.env.ADMIN_NAME
    getUser.mockReset()
    maybeSingle.mockReset()
    eq.mockClear()
    from.mockClear()
  })

  it('null sin sesión', async () => {
    getUser.mockResolvedValue({ data: { user: null } })
    expect(await getReader()).toBeNull()
  })

  it('null si el correo no está invitado', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'x@y.co' } } })
    maybeSingle.mockResolvedValue({ data: null })
    expect(await getReader()).toBeNull()
  })

  it('devuelve el lector invitado, consultando con el correo normalizado', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'u1', email: ' Ana@Mail.COM ' } } })
    maybeSingle.mockResolvedValue({ data: { name: 'Ana' } })
    const r = await getReader()
    expect(r).toMatchObject({ userId: 'u1', email: 'ana@mail.com', name: 'Ana', isAdmin: false })
    expect(from).toHaveBeenCalledWith('manual_readers')
    expect(eq).toHaveBeenCalledWith('email', 'ana@mail.com')
  })

  it('admin sin fila entra con ADMIN_NAME o Sergio', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'u2', email: 'Sergio@example.com' } } })
    expect(await getReader()).toMatchObject({ name: 'Sergio', isAdmin: true })
    expect(from).not.toHaveBeenCalled()
  })
})
