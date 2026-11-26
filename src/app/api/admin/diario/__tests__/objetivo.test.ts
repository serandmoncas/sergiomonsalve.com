import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextResponse } from 'next/server'

vi.mock('server-only', () => ({}))

const { acceso, ejecutar } = vi.hoisted(() => ({ acceso: vi.fn(), ejecutar: vi.fn() }))

vi.mock('@/lib/auth/admin', () => ({ requireAdminAal2: acceso }))
vi.mock('@/lib/diario/objetivo', () => ({ ejecutarAccion: ejecutar }))

import { POST } from '../objetivo/route'

const ORIGEN = 'https://www.sergiomonsalve.com'
const URL_RUTA = `${ORIGEN}/api/admin/diario/objetivo`

function pedido(cuerpo: unknown, origin: string | null = ORIGEN) {
  const headers: Record<string, string> = { 'content-type': 'application/json' }
  if (origin) headers.origin = origin
  return new Request(URL_RUTA, {
    method: 'POST',
    headers,
    body: typeof cuerpo === 'string' ? cuerpo : JSON.stringify(cuerpo),
  })
}

beforeEach(() => {
  acceso.mockReset().mockResolvedValue({ user: { email: 'admin@example.com' } })
  ejecutar.mockReset().mockResolvedValue({ ok: true })
})
afterEach(() => vi.useRealTimers())

describe('POST /api/admin/diario/objetivo (DI-087)', () => {
  it('404 sin aal2 y no llama a ejecutarAccion', async () => {
    acceso.mockResolvedValue(new NextResponse(null, { status: 404 }))
    const r = await POST(pedido({ objetivo: 'x', tipo: 'deshacer' }))
    expect(r.status).toBe(404)
    expect(ejecutar).not.toHaveBeenCalled()
  })

  it.each([null, 'https://otro.example'])('403 si Origin es %s', async origin => {
    const r = await POST(pedido({ objetivo: 'x', tipo: 'deshacer' }, origin))
    expect(r.status).toBe(403)
    expect(ejecutar).not.toHaveBeenCalled()
  })

  it.each(['no es json', { objetivo: 'x', tipo: 'borrar' }, { tipo: 'deshacer' }, [1]])(
    '400 con cuerpo inválido (%j)',
    async cuerpo => {
      const r = await POST(pedido(cuerpo))
      expect(r.status).toBe(400)
      expect(ejecutar).not.toHaveBeenCalled()
    },
  )

  it('pasa la fecha de Bogotá: a las 20:00 del 3 dic en Colombia es 2026-12-03', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-12-04T01:00:00Z'))
    await POST(pedido({ objetivo: 'abc', tipo: 'contacto', nombre: 'A' }))
    expect(ejecutar).toHaveBeenCalledWith('abc', { tipo: 'contacto', nombre: 'A' }, '2026-12-03')
  })

  it('solo pasa los campos de cada tipo, como texto', async () => {
    await POST(pedido({ objetivo: 'abc', tipo: 'mover', texto: 'T', a: 'Respondió', extra: 'x', nombre: 9 }))
    expect(ejecutar.mock.calls[0][1]).toEqual({ tipo: 'mover', texto: 'T', a: 'Respondió' })
  })

  it('responde con el estado de la acción y las cabeceras del diario', async () => {
    ejecutar.mockResolvedValue({ ok: false, estado: 409, error: 'el tablero cambió; recarga' })
    const r = await POST(pedido({ objetivo: 'abc', tipo: 'deshacer' }))
    expect(r.status).toBe(409)
    expect(await r.json()).toEqual({ ok: false, error: 'el tablero cambió; recarga' })
    expect(r.headers.get('cache-control')).toBe('private, no-store')
    expect(r.headers.get('x-robots-tag')).toBe('noindex, nofollow')
  })

  it('200 con { ok: true }', async () => {
    const r = await POST(pedido({ objetivo: 'abc', tipo: 'deshacer' }))
    expect(r.status).toBe(200)
    expect(await r.json()).toEqual({ ok: true })
  })
})
