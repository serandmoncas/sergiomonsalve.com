import { describe, it, expect, vi, beforeEach } from 'vitest'

const { getUser, getAal } = vi.hoisted(() => ({
  getUser: vi.fn(),
  getAal: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser, mfa: { getAuthenticatorAssuranceLevel: getAal } },
  })),
}))

import { GET } from '../estado/route'

const admin = { data: { user: { email: 'sergio@example.com' } } }
const nivel = (currentLevel: 'aal1' | 'aal2') => ({
  data: { currentLevel, nextLevel: 'aal2', currentAuthenticationMethods: [] },
  error: null,
})

async function esNegado(res: Response) {
  expect(res.status).toBe(404)
  expect(await res.text()).toBe('')
  expect(res.headers.get('cache-control')).toBe('private, no-store')
}

describe('GET /api/admin/diario/estado', () => {
  beforeEach(() => {
    process.env.ADMIN_EMAILS = 'sergio@example.com'
    getUser.mockReset()
    getAal.mockReset()
  })

  it('404 sin sesión', async () => {
    getUser.mockResolvedValue({ data: { user: null } })
    await esNegado(await GET())
  })

  it('404 si no es admin, aunque esté en aal2', async () => {
    getUser.mockResolvedValue({ data: { user: { email: 'lector@example.com' } } })
    getAal.mockResolvedValue(nivel('aal2'))
    await esNegado(await GET())
  })

  it('404 en aal1', async () => {
    getUser.mockResolvedValue(admin)
    getAal.mockResolvedValue(nivel('aal1'))
    await esNegado(await GET())
  })

  it('404 si Supabase rechaza o devuelve error', async () => {
    getUser.mockResolvedValue(admin)
    getAal.mockRejectedValue(new Error('caído'))
    await esNegado(await GET())
    getAal.mockReset().mockResolvedValue({ data: null, error: new Error('x') })
    await esNegado(await GET())
  })

  it('404 si getUser lanza', async () => {
    getUser.mockRejectedValue(new Error('caído'))
    await esNegado(await GET())
  })

  it('200 en aal2 con las cabeceras del diario', async () => {
    getUser.mockResolvedValue(admin)
    getAal.mockResolvedValue(nivel('aal2'))
    const res = await GET()
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })
    expect(res.headers.get('cache-control')).toBe('private, no-store')
    expect(res.headers.get('x-robots-tag')).toBe('noindex, nofollow')
  })
})
