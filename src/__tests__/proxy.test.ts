import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const { getUser, getAal, cookiesDeSupabase } = vi.hoisted(() => ({
  getUser: vi.fn(),
  getAal: vi.fn(),
  cookiesDeSupabase: {} as { setAll?: (c: unknown[]) => void },
}))

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn((_u: string, _k: string, opts: { cookies: { setAll: (c: unknown[]) => void } }) => {
    cookiesDeSupabase.setAll = opts.cookies.setAll
    return { auth: { getUser, mfa: { getAuthenticatorAssuranceLevel: getAal } } }
  }),
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
    getAal.mockReset()
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

  describe('/admin/diario pide segundo factor (DI-083)', () => {
    const admin = { data: { user: { email: 'sergio@example.com' } } }
    const nivel = (currentLevel: 'aal1' | 'aal2') => ({
      data: { currentLevel, nextLevel: 'aal2', currentAuthenticationMethods: [] },
      error: null,
    })
    const destino = (res: Response) => new URL(res.headers.get('location')!)

    it('admin en aal1 en /es/admin/diario va a segundo-factor con next', async () => {
      getUser.mockResolvedValue(admin)
      getAal.mockResolvedValue(nivel('aal1'))
      const loc = destino(await proxy(req('/es/admin/diario')))
      expect(loc.pathname).toBe('/es/admin/diario/segundo-factor')
      expect(loc.searchParams.get('next')).toBe('/es/admin/diario')
    })

    it('conserva subruta, query y locale', async () => {
      getUser.mockResolvedValue(admin)
      getAal.mockResolvedValue(nivel('aal1'))
      const loc = destino(await proxy(req('/en/admin/diario/x?y=1')))
      expect(loc.pathname).toBe('/en/admin/diario/segundo-factor')
      expect(loc.searchParams.get('next')).toBe('/en/admin/diario/x?y=1')
    })

    it('segundo-factor no pide aal2 (sin bucle) pero lleva cabeceras', async () => {
      getUser.mockResolvedValue(admin)
      const res = await proxy(req('/es/admin/diario/segundo-factor?next=/es/admin/diario'))
      expect(res.headers.get('location')).toBeNull()
      expect(getAal).not.toHaveBeenCalled()
      expect(res.headers.get('cache-control')).toBe('private, no-store')
    })

    it('admin en aal2 pasa y lleva las cabeceras del diario', async () => {
      getUser.mockResolvedValue(admin)
      getAal.mockResolvedValue(nivel('aal2'))
      const res = await proxy(req('/es/admin/diario'))
      expect(res.headers.get('location')).toBeNull()
      expect(res.headers.get('cache-control')).toBe('private, no-store')
      expect(res.headers.get('x-robots-tag')).toBe('noindex, nofollow')
    })

    it('si aal falla o devuelve error, redirige a segundo-factor', async () => {
      getUser.mockResolvedValue(admin)
      getAal.mockRejectedValue(new Error('caído'))
      expect(destino(await proxy(req('/es/admin/diario'))).pathname).toBe('/es/admin/diario/segundo-factor')
      getAal.mockReset().mockResolvedValue({ data: null, error: new Error('x') })
      expect(destino(await proxy(req('/es/admin/diario'))).pathname).toBe('/es/admin/diario/segundo-factor')
    })

    it('la redirección conserva las cookies que Supabase renovó', async () => {
      getUser.mockImplementation(async () => {
        cookiesDeSupabase.setAll!([{ name: 'sb-token', value: 'nuevo', options: {} }])
        return admin
      })
      getAal.mockResolvedValue(nivel('aal1'))
      const res = await proxy(req('/es/admin/diario'))
      expect(res.headers.get('location')).not.toBeNull()
      expect(res.cookies.get('sb-token')?.value).toBe('nuevo')
    })

    it('/es/admin/diariox no es el diario', async () => {
      getUser.mockResolvedValue(admin)
      await proxy(req('/es/admin/diariox'))
      expect(getAal).not.toHaveBeenCalled()
    })

    it('/es/admin/comments en aal1 pasa sin consultar aal', async () => {
      getUser.mockResolvedValue(admin)
      const res = await proxy(req('/es/admin/comments'))
      expect(res.headers.get('location')).toBeNull()
      expect(getAal).not.toHaveBeenCalled()
    })

    it('sin sesión va al login y no admin vuelve a /es', async () => {
      getUser.mockResolvedValue({ data: { user: null } })
      expect(destino(await proxy(req('/es/admin/diario'))).pathname).toBe('/es/admin/login')
      getUser.mockResolvedValue({ data: { user: { email: 'lector@example.com' } } })
      expect(destino(await proxy(req('/es/admin/diario'))).pathname).toBe('/es')
      expect(getAal).not.toHaveBeenCalled()
    })
  })
})
