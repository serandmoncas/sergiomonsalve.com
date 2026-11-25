import { describe, it, expect, vi, beforeEach } from 'vitest'

const { exchange } = vi.hoisted(() => ({ exchange: vi.fn() }))
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({ auth: { exchangeCodeForSession: exchange } })),
}))

import { GET } from '../route'

const call = (qs: string) => GET(new Request(`https://sergiomonsalve.com/auth/callback?${qs}`))

describe('callback de auth', () => {
  beforeEach(() => exchange.mockReset().mockResolvedValue({ error: null }))
  it('next externo cae al fallback', async () => {
    const res = await call('code=x&next=' + encodeURIComponent('//evil.com'))
    expect(res.headers.get('location')).toBe('https://sergiomonsalve.com/es/admin/comments')
  })
  it('next interno se respeta', async () => {
    const res = await call('code=x&next=' + encodeURIComponent('/es/manual-de-usuario/mapa'))
    expect(res.headers.get('location')).toBe('https://sergiomonsalve.com/es/manual-de-usuario/mapa')
  })
  it('sin code va al login', async () => {
    const res = await call('next=/es/x')
    expect(res.headers.get('location')).toBe('https://sergiomonsalve.com/es/admin/login?error=auth')
  })
  it('sin code y next del manual va a /entrar?error=enlace', async () => {
    const res = await call('next=' + encodeURIComponent('/es/manual-de-usuario/mapa'))
    expect(res.headers.get('location')).toBe('https://sergiomonsalve.com/es/manual-de-usuario/entrar?error=enlace')
  })
  it('intercambio fallido y next del manual va a /entrar?error=enlace', async () => {
    exchange.mockResolvedValue({ error: { message: 'x' } })
    const res = await call('code=x&next=' + encodeURIComponent('/es/manual-de-usuario/n/a'))
    expect(res.headers.get('location')).toBe('https://sergiomonsalve.com/es/manual-de-usuario/entrar?error=enlace')
  })
  it('intercambio fallido con next de admin sigue yendo al login', async () => {
    exchange.mockResolvedValue({ error: { message: 'x' } })
    const res = await call('code=x&next=/es/admin/comments')
    expect(res.headers.get('location')).toBe('https://sergiomonsalve.com/es/admin/login?error=auth')
  })
})
