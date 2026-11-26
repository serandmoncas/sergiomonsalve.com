import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('server-only', () => ({}))

import { ErrorGithub, guardarArchivo, leerArchivo, ultimoCommit } from '../github'

const TOKEN = 'ghp_TOKEN_DE_PRUEBA_123'
const API = 'https://api.github.com/repos/serandmoncas/diaria-notas'
const RUTA = 'Tablero/Objetivos/Plantar árboles - contactos.md'
const RUTA_URL = 'Tablero/Objetivos/Plantar%20%C3%A1rboles%20-%20contactos.md'
const MENSAJE = 'objetivo: contacto agregado\n\nDiarIA-accion: objetivo'

type Llamada = { url: string; method: string; auth: string | null; cuerpo: string | null }
let llamadas: Llamada[] = []
let respuesta: () => Response

beforeEach(() => {
  process.env.DIARIA_GITHUB_TOKEN = TOKEN
  llamadas = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (entrada: string, init?: RequestInit) => {
      const h = new Headers(init?.headers)
      llamadas.push({
        url: String(entrada),
        method: init?.method ?? 'GET',
        auth: h.get('authorization'),
        cuerpo: typeof init?.body === 'string' ? init.body : null,
      })
      return respuesta()
    }),
  )
})
afterEach(() => vi.unstubAllGlobals())

const base64 = (t: string) => Buffer.from(t, 'utf8').toString('base64')

describe('escritura en GitHub (DI-087)', () => {
  it('leerArchivo decodifica base64 y devuelve el sha del blob', async () => {
    respuesta = () => Response.json({ sha: 'b1', encoding: 'base64', content: base64('## Por contactar\n- [ ] Ñandú\n') })
    const r = await leerArchivo(RUTA)
    expect(r).toEqual({ texto: '## Por contactar\n- [ ] Ñandú\n', sha: 'b1' })
    expect(llamadas[0].url).toBe(`${API}/contents/${RUTA_URL}?ref=main`)
  })

  it('leerArchivo con ref pide esa versión', async () => {
    respuesta = () => Response.json({ sha: 'b0', encoding: 'base64', content: base64('x') })
    await leerArchivo(RUTA, 'c0')
    expect(llamadas[0].url).toBe(`${API}/contents/${RUTA_URL}?ref=c0`)
  })

  it('guardarArchivo manda PUT con sha, rama, autor DiarIA web y el mensaje con la marca', async () => {
    respuesta = () =>
      Response.json({ content: { sha: 'b2' }, commit: { sha: 'c2', parents: [{ sha: 'c1' }] } })
    const r = await guardarArchivo(RUTA, 'nuevo\n', 'b1', MENSAJE)
    expect(r.commit).toBe('c2')
    expect(r.padre).toBe('c1')
    expect(new TextDecoder().decode(r.bytes)).toBe('nuevo\n')
    const l = llamadas[0]
    expect(l.method).toBe('PUT')
    expect(l.url).toBe(`${API}/contents/${RUTA_URL}`)
    const cuerpo = JSON.parse(l.cuerpo!)
    expect(cuerpo).toMatchObject({
      message: MENSAJE,
      sha: 'b1',
      branch: 'main',
      content: base64('nuevo\n'),
      author: { name: 'DiarIA web', email: 'diaria-web@sergiomonsalve.com' },
      committer: { name: 'DiarIA web', email: 'diaria-web@sergiomonsalve.com' },
    })
  })

  it.each([409, 422, 403, 404])('guardarArchivo con HTTP %i lanza el error github-<status>', async status => {
    respuesta = () => new Response('no', { status })
    await expect(guardarArchivo(RUTA, 'x', 'b1', MENSAJE)).rejects.toEqual(new ErrorGithub(`github-${status}`))
  })

  it('un 2xx sin commit en la respuesta lanza guardado-incierto', async () => {
    respuesta = () => Response.json({})
    await expect(guardarArchivo(RUTA, 'x', 'b1', MENSAJE)).rejects.toEqual(new ErrorGithub('guardado-incierto'))
  })

  it('el cuerpo del PUT no lleva el token', async () => {
    respuesta = () => Response.json({ content: { sha: 'b2' }, commit: { sha: 'c2', parents: [{ sha: 'c1' }] } })
    await guardarArchivo(RUTA, 'x', 'b1', MENSAJE)
    expect(llamadas[0].cuerpo).not.toContain(TOKEN)
    expect(llamadas[0].auth).toBe(`Bearer ${TOKEN}`)
  })

  it('ultimoCommit devuelve el último commit del archivo', async () => {
    respuesta = () =>
      Response.json([
        { sha: 'c2', parents: [{ sha: 'c1' }], commit: { message: MENSAJE, author: { name: 'DiarIA web' } } },
      ])
    expect(await ultimoCommit(RUTA)).toEqual({ sha: 'c2', padre: 'c1', mensaje: MENSAJE, autor: 'DiarIA web' })
    expect(llamadas[0].url).toBe(`${API}/commits?path=${encodeURIComponent(RUTA)}&sha=main&per_page=1`)
  })

  it('ultimoCommit devuelve null si el archivo no tiene commits', async () => {
    respuesta = () => Response.json([])
    expect(await ultimoCommit(RUTA)).toBeNull()
  })
})
