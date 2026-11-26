import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('server-only', () => ({}))
// cache() de React no aplica fuera de un render: identidad.
vi.mock('react', async (orig) => ({ ...(await orig<typeof import('react')>()), cache: <T,>(f: T) => f }))

// parseRecorrido es tolerante; se fuerza un fallo con un marcador.
vi.mock('../recorridos', async (orig) => {
  const m = await orig<typeof import('../recorridos')>()
  return {
    ...m,
    parseRecorrido: (slug: string, raw: string) => {
      if (raw.includes('BOOM')) throw new Error('recorrido roto')
      return m.parseRecorrido(slug, raw)
    },
  }
})

import { getManual } from '../manual'
import { fetchRepoFiles, ManualSourceError } from '../source'

const BASE = 'https://api.github.com/repos/serandmoncas/manual-de-usuario'
const nota = (titulo: string) =>
  `---\ntitulo: ${titulo}\nestado: semilla\nconfianza: media\n---\n\n# ${titulo}\n\nLorem ipsum.\n`

function montar(tree: string[], contenidos: Record<string, string>, opts: { arbol?: number; indice?: number } = {}) {
  return vi.fn(async (url: string) => {
    if (url.includes('/git/trees/main')) {
      if (opts.arbol) return new Response('x', { status: opts.arbol })
      return Response.json({ tree: tree.map((path) => ({ path, type: 'blob' })).concat([{ path: 'notas/sub', type: 'tree' }]) })
    }
    const path = decodeURIComponent(url.split('/contents/')[1].split('?')[0])
    if (path === 'indice.yml' && opts.indice) return new Response('x', { status: opts.indice })
    const c = contenidos[path]
    return c === undefined ? new Response('no', { status: 404 }) : new Response(c)
  })
}

describe('manual', () => {
  beforeEach(() => {
    vi.stubEnv('MANUAL_GITHUB_TOKEN', 'tok-secreto')
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('sin token: no-configurado y sin fetch', async () => {
    vi.stubEnv('MANUAL_GITHUB_TOKEN', '')
    const f = vi.fn()
    vi.stubGlobal('fetch', f)
    expect(await getManual()).toEqual({ ok: false, error: { tipo: 'no-configurado' } })
    await expect(fetchRepoFiles()).rejects.toBeInstanceOf(ManualSourceError)
    expect(f).not.toHaveBeenCalled()
  })

  it('árbol 401: fallo', async () => {
    vi.stubGlobal('fetch', montar([], {}, { arbol: 401 }))
    const r = await getManual()
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.tipo).toBe('fallo')
  })

  it('ignora _plantilla, TEMPLATE y subdirectorios; header en cada llamada', async () => {
    const f = montar(
      ['notas/_plantilla.md', 'notas/a.md', 'recorridos/TEMPLATE.md', 'notas/sub/b.md', 'notas/c.txt'],
      { 'notas/a.md': nota('A') },
    )
    vi.stubGlobal('fetch', f)
    const files = await fetchRepoFiles()
    expect(Object.keys(files.notas)).toEqual(['a'])
    expect(files.recorridos).toEqual({})
    expect(files.indice).toBeNull()
    expect(files.sobre).toBeNull()
    expect(f).toHaveBeenCalledTimes(2)
    for (const [url, init] of f.mock.calls as unknown as [string, RequestInit][]) {
      const h = init.headers as Record<string, string>
      expect(h.Authorization).toBe('Bearer tok-secreto')
      expect(h['X-GitHub-Api-Version']).toBe('2022-11-28')
      expect(init).toMatchObject({ next: { revalidate: 300, tags: ['manual'] } })
      if (url.includes('/contents/')) expect(h.Accept).toBe('application/vnd.github.raw+json')
    }
    expect(f.mock.calls[0][0]).toBe(`${BASE}/git/trees/main?recursive=1`)
    expect(f.mock.calls[1][0]).toBe(`${BASE}/contents/notas/a.md?ref=main`)
  })

  it('nota rota va a rotas y el resto se ensambla; sobre sin frontmatter', async () => {
    vi.stubGlobal(
      'fetch',
      montar(['notas/a.md', 'notas/mala.md', 'sobre.md'], {
        'notas/a.md': nota('A'),
        'notas/mala.md': '---\n: [roto\n---\ncuerpo',
        'sobre.md': '---\nx: 1\n---\nLorem sobre.\n',
      }),
    )
    const r = await getManual()
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect([...r.manual.notas.keys()]).toEqual(['a'])
    expect(r.manual.rotas.map((x) => x.slug)).toEqual(['mala'])
    expect(r.manual.sobre?.trim()).toBe('Lorem sobre.')
    expect(r.manual.indice).toBeNull()
  })

  it('sobre.md con frontmatter roto no tumba el manual', async () => {
    vi.stubGlobal(
      'fetch',
      montar(['notas/a.md', 'sobre.md'], {
        'notas/a.md': nota('A'),
        'sobre.md': '---\n: [roto\n---\ncuerpo',
      }),
    )
    const r = await getManual()
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.manual.sobre).toBeNull()
    expect([...r.manual.notas.keys()]).toEqual(['a'])
    expect(r.manual.rotas.map((x) => x.slug)).toEqual(['sobre.md'])
    expect(console.error).toHaveBeenCalled()
  })

  it('indice.yml presente con fetch 500: fallo', async () => {
    vi.stubGlobal('fetch', montar(['indice.yml'], {}, { indice: 500 }))
    const r = await getManual()
    expect(r.ok).toBe(false)
  })

  it('indice.yml mal formado y recorrido roto: tolerados y en rotas', async () => {
    vi.stubGlobal(
      'fetch',
      montar(['notas/a.md', 'indice.yml', 'recorridos/r.md'], {
        'notas/a.md': nota('A'),
        'indice.yml': 'secciones: 5',
        'recorridos/r.md': 'BOOM',
      }),
    )
    const r = await getManual()
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.manual.indice).toBeNull()
    expect(r.manual.rotas.map((x) => x.slug).sort()).toEqual(['indice.yml', 'recorridos/r'])
    expect(r.manual.notas.size).toBe(1)
  })

  it('no loguea el token', async () => {
    vi.stubGlobal('fetch', montar([], {}, { arbol: 401 }))
    await getManual()
    expect(JSON.stringify((console.error as ReturnType<typeof vi.fn>).mock.calls)).not.toContain('tok-secreto')
  })
})
