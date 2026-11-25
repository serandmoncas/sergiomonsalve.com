import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { exchangeCodeForSession: vi.fn(async () => ({ error: null })) },
  })),
}))

import { GET } from '../route'

const call = (qs: string) => GET(new Request(`https://sergiomonsalve.com/auth/callback?${qs}`))

describe('callback de auth', () => {
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
})
