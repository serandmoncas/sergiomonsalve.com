import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { CABECERA, tarball, type Entrada } from './ayudantes'

vi.mock('server-only', () => ({}))

import { obtenerBoveda, reiniciarBoveda } from '../boveda'

const TOKEN = 'ghp_TOKEN_DE_PRUEBA_123'
const API = 'https://api.github.com/repos/serandmoncas/diaria-notas'

type Archivo = { filename: string; status: string; sha: string; previous_filename?: string }
const gh = {
  privado: true,
  sha: 'a1',
  arboles: {} as Record<string, Entrada[]>,
  compare: {} as Record<string, { files?: Archivo[] }>,
  blobs: {} as Record<string, string>,
  fallar: 0,
  llamadas: [] as { url: string; method: string; auth: string | null }[],
}

function responder(url: string): Response {
  if (gh.fallar) return new Response('x', { status: gh.fallar })
  if (url === `${API}/commits/main`) return new Response(gh.sha)
  if (url === API) return Response.json({ private: gh.privado })
  const t = url.match(/\/tarball\/(\w+)$/)
  if (t) return new Response(null, { status: 599, statusText: `tarball:${t[1]}` })
  const c = url.match(/\/compare\/(\w+)\.\.\.(\w+)$/)
  if (c) {
    const cmp = gh.compare[`${c[1]}...${c[2]}`]
    if (cmp === undefined) return new Response('no', { status: 404 })
    return Response.json({ status: 'ahead', ...cmp })
  }
  const b = url.match(/\/git\/blobs\/(\w+)$/)
  if (b) return new Response(gh.blobs[b[1]])
  return new Response('?', { status: 404 })
}

beforeEach(() => {
  process.env.DIARIA_GITHUB_TOKEN = TOKEN
  Object.assign(gh, { privado: true, sha: 'a1', arboles: {}, compare: {}, blobs: {}, fallar: 0, llamadas: [] })
  gh.arboles.a1 = [
    { nombre: 'Diario/2026-11-24.md', contenido: CABECERA + '- [ ] Regar el jardín\n' },
    { nombre: 'Diario/2026-11-25.md', contenido: CABECERA + '- [ ] Regar el jardín\n- [ ] Llamar a [[Ana Prueba]]\n' },
    { nombre: 'Personas/Ana Prueba.md', contenido: CABECERA },
    { nombre: 'Tablero/Rutinas.md', contenido: CABECERA + '- [ ] Regar el jardín 🔁 every day\n' },
    { nombre: 'Adjuntos/foto.png', contenido: 'PNG' },
  ]
  vi.stubGlobal('fetch', vi.fn(async (entrada: string, init?: RequestInit) => {
    const url = String(entrada)
    const h = new Headers(init?.headers)
    gh.llamadas.push({ url, method: init?.method ?? 'GET', auth: h.get('authorization') })
    const r = responder(url)
    if (r.status === 599) {
      const sha = r.statusText.split(':')[1]
      return new Response(new Uint8Array(await tarball(gh.arboles[sha] ?? [])))
    }
    return r
  }))
  reiniciarBoveda()
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-11-26T12:00:00Z'))
})
afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

const tarballs = () => gh.llamadas.filter(l => l.url.includes('/tarball/')).length
const ok = async () => {
  const r = await obtenerBoveda()
  if (!r.ok) throw new Error(`no disponible: ${r.motivo}`)
  return r.boveda
}

describe('obtenerBoveda', () => {
  it('sin token → no disponible sin-token, sin llamar a fetch', async () => {
    delete process.env.DIARIA_GITHUB_TOKEN
    expect(await obtenerBoveda()).toEqual({ ok: false, motivo: 'sin-token' })
    expect(fetch).not.toHaveBeenCalled()
  })

  it('repo público → no disponible publico, sin bajar el tarball', async () => {
    gh.privado = false
    expect(await obtenerBoveda()).toEqual({ ok: false, motivo: 'publico' })
    expect(tarballs()).toBe(0)
  })

  it('arranque: 1 tarball y el índice tiene las notas, diarias y rutinas', async () => {
    const b = await ok()
    expect(tarballs()).toBe(1)
    expect(b.sha).toBe('a1')
    expect(b.indice.notas).toContain('Personas/Ana Prueba.md')
    expect(b.indice.adjuntos).toContain('Adjuntos/foto.png')
    expect([...b.diarias.keys()].sort()).toEqual(['2026-11-24', '2026-11-25'])
    expect(b.rutinas).toContain('every day')
    expect(gh.llamadas.every(l => l.auth === `Bearer ${TOKEN}`)).toBe(true)
  })

  it('mismo sha dentro de 10 s → no vuelve a llamar', async () => {
    await ok()
    const n = gh.llamadas.length
    vi.setSystemTime(new Date('2026-11-26T12:00:09Z'))
    await ok()
    expect(gh.llamadas.length).toBe(n)
    vi.setSystemTime(new Date('2026-11-26T12:00:11Z'))
    await ok()
    expect(gh.llamadas.length).toBe(n + 1) // solo el sha
    expect(tarballs()).toBe(1)
  })

  it('sha nuevo → compare y blobs solo de lo cambiado; borrado y renombrado aplicados', async () => {
    await ok()
    gh.sha = 'b2'
    gh.compare['a1...b2'] = {
      files: [
        { filename: 'Diario/2026-11-26.md', status: 'added', sha: 'n1' },
        { filename: 'Diario/2026-11-24.md', status: 'removed', sha: '0' },
        { filename: 'Personas/Ana P.md', previous_filename: 'Personas/Ana Prueba.md', status: 'renamed', sha: 'n2' },
        { filename: 'Adjuntos/otra.png', status: 'added', sha: 'n3' },
      ],
    }
    gh.blobs.n1 = CABECERA + '- [ ] Escribir\n'
    gh.blobs.n2 = CABECERA
    vi.setSystemTime(new Date('2026-11-26T12:00:20Z'))
    const b = await ok()
    expect(b.sha).toBe('b2')
    expect(tarballs()).toBe(1)
    expect(gh.llamadas.filter(l => l.url.includes('/git/blobs/')).map(l => l.url.split('/').pop()).sort()).toEqual(['n1', 'n2'])
    expect([...b.diarias.keys()].sort()).toEqual(['2026-11-25', '2026-11-26'])
    expect(b.indice.notas).toContain('Personas/Ana P.md')
    expect(b.indice.notas).not.toContain('Personas/Ana Prueba.md')
    expect(b.indice.adjuntos).toContain('Adjuntos/otra.png')
  })

  it.each([
    ['300 archivos', { files: Array.from({ length: 300 }, (_, i) => ({ filename: `n${i}.md`, status: 'added', sha: 'z' })) }],
    ['sin files', {}],
  ])('compare con %s → recarga el tarball', async (_n, cmp) => {
    await ok()
    gh.sha = 'b2'
    gh.arboles.b2 = gh.arboles.a1
    gh.compare['a1...b2'] = cmp
    vi.setSystemTime(new Date('2026-11-26T12:00:20Z'))
    const b = await ok()
    expect(b.sha).toBe('b2')
    expect(tarballs()).toBe(2)
    expect(gh.llamadas.some(l => l.url.includes('/git/blobs/'))).toBe(false)
  })

  it('compare que falla (historia reescrita) → recarga el tarball', async () => {
    await ok()
    gh.sha = 'b2'
    gh.arboles.b2 = gh.arboles.a1.slice(1)
    vi.setSystemTime(new Date('2026-11-26T12:00:20Z'))
    const b = await ok()
    expect(b.sha).toBe('b2')
    expect(tarballs()).toBe(2)
    expect([...b.diarias.keys()]).toEqual(['2026-11-25'])
  })

  it('compare con status diverged → recarga el tarball', async () => {
    await ok()
    gh.sha = 'b2'
    gh.arboles.b2 = gh.arboles.a1
    gh.compare['a1...b2'] = { status: 'diverged', files: [] } as never
    vi.setSystemTime(new Date('2026-11-26T12:00:20Z'))
    expect((await ok()).sha).toBe('b2')
    expect(tarballs()).toBe(2)
  })

  it('pedidos simultáneos en frío → un solo tarball', async () => {
    const [a, b] = await Promise.all([obtenerBoveda(), obtenerBoveda()])
    expect(a.ok && b.ok).toBe(true)
    expect(tarballs()).toBe(1)
  })

  it('401/5xx → no disponible, y al volver GitHub se recupera', async () => {
    const errores = vi.spyOn(console, 'error').mockImplementation(() => {})
    gh.fallar = 401
    expect(await obtenerBoveda()).toEqual({ ok: false, motivo: 'github-401' })
    gh.fallar = 503
    expect(await obtenerBoveda()).toEqual({ ok: false, motivo: 'github-503' })
    gh.fallar = 0
    expect((await obtenerBoveda()).ok).toBe(true)
    expect(errores).toHaveBeenCalledWith('[diario]', 'github-401')
  })

  it('si el repo pasa a público, deja de estar disponible en la siguiente comprobación', async () => {
    await ok()
    gh.privado = false
    vi.setSystemTime(new Date('2026-11-26T12:10:01Z'))
    expect(await obtenerBoveda()).toEqual({ ok: false, motivo: 'publico' })
  })

  it('ninguna llamada usa un método distinto de GET', async () => {
    await ok()
    gh.sha = 'b2'
    gh.compare['a1...b2'] = { files: [{ filename: 'x.md', status: 'added', sha: 'n1' }] }
    gh.blobs.n1 = CABECERA
    vi.setSystemTime(new Date('2026-11-26T12:00:20Z'))
    await ok()
    expect(gh.llamadas.length).toBeGreaterThan(3)
    expect(gh.llamadas.every(l => l.method === 'GET')).toBe(true)
  })

  it('el token no aparece en el motivo ni en console.error', async () => {
    const errores = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error(`fallo con ${TOKEN}`) }))
    const r = await obtenerBoveda()
    expect(r).toEqual({ ok: false, motivo: 'red' })
    expect(JSON.stringify(errores.mock.calls)).not.toContain(TOKEN)
  })

  it('GitHub colgado → no disponible por tiempo, y no cuelga los pedidos siguientes', async () => {
    vi.useRealTimers()
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] })
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.stubGlobal('fetch', vi.fn((_u: string, init?: RequestInit) => new Promise((_r, rechazar) => {
      init?.signal?.addEventListener('abort', () => rechazar(new DOMException('abort', 'AbortError')))
    })))
    const p = obtenerBoveda()
    await vi.advanceTimersByTimeAsync(11_000)
    expect(await p).toEqual({ ok: false, motivo: 'tiempo' })
    const q = obtenerBoveda()
    await vi.advanceTimersByTimeAsync(11_000)
    expect(await q).toEqual({ ok: false, motivo: 'tiempo' })
  })
})
