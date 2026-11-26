import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const { getUser } = vi.hoisted(() => ({ getUser: vi.fn() }))

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({ auth: { getUser } })),
}))
vi.mock('next-intl/middleware', () => ({
  default: () => () => new Response(null, { headers: { 'x-i18n': '1' } }),
}))

import { proxy } from '../proxy'

const req = (path: string) => new NextRequest(`https://sergiomonsalve.com${path}`)

describe('proxy', () => {
  beforeEach(() => {
    process.env.ADMIN_EMAILS = 'sergio@example.com'
    getUser.mockReset()
  })

  it('/en/manual-de-usuario/n/x redirige 307 a /es conservando ruta y query', async () => {
    const res = await proxy(req('/en/manual-de-usuario/n/x?r=y'))
    expect(res.status).toBe(307)
    expect(new URL(res.headers.get('location')!).pathname + new URL(res.headers.get('location')!).search)
      .toBe('/es/manual-de-usuario/n/x?r=y')
  })

  it.each(['mapa', 'r/rec', 'n/x', 'grafo'])('/es/manual-de-usuario/%s sin sesión va a entrar con next', async (p) => {
    getUser.mockResolvedValue({ data: { user: null } })
    const res = await proxy(req(`/es/manual-de-usuario/${p}`))
    const loc = new URL(res.headers.get('location')!)
    expect(loc.pathname).toBe('/es/manual-de-usuario/entrar')
    expect(loc.searchParams.get('next')).toBe(`/es/manual-de-usuario/${p}`)
  })

  it('con sesión deja pasar las rutas protegidas del manual', async () => {
    getUser.mockResolvedValue({ data: { user: { email: 'a@b.com' } } })
    const res = await proxy(req('/es/manual-de-usuario/mapa'))
    expect(res.headers.get('location')).toBeNull()
  })

  it('portada y entrar son libres (sin consultar sesión)', async () => {
    for (const p of ['/es/manual-de-usuario', '/es/manual-de-usuario/entrar']) {
      const res = await proxy(req(p))
      expect(res.headers.get('x-i18n')).toBe('1')
    }
    expect(getUser).not.toHaveBeenCalled()
  })

  it('no admin con sesión en /admin/* vuelve a /{locale}', async () => {
    getUser.mockResolvedValue({ data: { user: { email: 'lector@example.com' } } })
    const res = await proxy(req('/es/admin/comments'))
    expect(res.status).toBe(307)
    expect(new URL(res.headers.get('location')!).pathname).toBe('/es')
  })

  it('admin con sesión pasa; sin sesión va al login', async () => {
    getUser.mockResolvedValue({ data: { user: { email: 'Sergio@example.com' } } })
    expect((await proxy(req('/es/admin/comments'))).headers.get('location')).toBeNull()
    getUser.mockResolvedValue({ data: { user: null } })
    const res = await proxy(req('/es/admin/comments'))
    expect(new URL(res.headers.get('location')!).pathname).toBe('/es/admin/login')
  })
})
