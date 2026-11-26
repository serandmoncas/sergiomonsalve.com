import 'server-only'
import { createHash } from 'node:crypto'
import type { MemoriaFS } from './memoria'
import { leerTarball } from './tarball'

// Acceso al repo privado de notas (DI-084, DI-087). Lee con GET y solo escribe
// con guardarArchivo; el token vive solo aquí, en el servidor, y nunca aparece
// en errores ni logs.
const REPO = 'https://api.github.com/repos/serandmoncas/diaria-notas'
const RAMA = 'main'

export class ErrorGithub extends Error {
  constructor(public codigo: string) {
    super(codigo)
    this.name = 'ErrorGithub'
  }
}

export const hayToken = () => Boolean(process.env.DIARIA_GITHUB_TOKEN)

/**
 * Clave para los identificadores opacos de las URLs de notas. Se deriva del
 * token con un hash de un solo sentido: no lo revela y no se puede adivinar
 * desde fuera. Si el token cambia, las URLs viejas dejan de servir.
 */
export function claveUrls(): Buffer {
  return createHash('sha256').update(`diaria-url\0${process.env.DIARIA_GITHUB_TOKEN ?? 'sin-token'}`).digest()
}

const TIEMPO_API_MS = 10_000
const TIEMPO_TARBALL_MS = 60_000

/**
 * Un pedido con límite de tiempo que cubre también la lectura del cuerpo: si
 * GitHub se cuelga, el pedido falla con "tiempo" en vez de colgar a todos.
 */
async function pedir<T>(
  ruta: string,
  leer: (res: Response) => Promise<T>,
  {
    accept = 'application/vnd.github+json',
    ms = TIEMPO_API_MS,
    method = 'GET',
    body,
  }: { accept?: string; ms?: number; method?: 'GET' | 'PUT'; body?: string } = {},
): Promise<T> {
  const token = process.env.DIARIA_GITHUB_TOKEN
  if (!token) throw new ErrorGithub('sin-token')
  const control = new AbortController()
  const reloj = setTimeout(() => control.abort(), ms)
  try {
    let res: Response
    try {
      res = await fetch(`${REPO}${ruta}`, {
        method,
        body,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: accept,
          'X-GitHub-Api-Version': '2022-11-28',
        },
        cache: 'no-store',
        signal: control.signal,
      })
    } catch {
      throw new ErrorGithub(control.signal.aborted ? 'tiempo' : 'red')
    }
    if (!res.ok) throw new ErrorGithub(`github-${res.status}`)
    try {
      return await leer(res)
    } catch (e) {
      if (control.signal.aborted) throw new ErrorGithub('tiempo')
      throw e
    }
  } finally {
    clearTimeout(reloj)
  }
}

export async function shaActual(): Promise<string> {
  return pedir(`/commits/${RAMA}`, async r => (await r.text()).trim(), { accept: 'application/vnd.github.sha' })
}

export async function esPrivado(): Promise<boolean> {
  return pedir('', async r => ((await r.json()) as { private?: unknown }).private === true)
}

/** El commit entero como bóveda en memoria (el tarball se lee en streaming). */
export async function tarball(sha: string): Promise<MemoriaFS> {
  return pedir(
    `/tarball/${sha}`,
    async r => {
      if (!r.body) throw new ErrorGithub('tarball')
      try {
        return await leerTarball(r.body)
      } catch (e) {
        throw e instanceof ErrorGithub ? e : new ErrorGithub('tarball')
      }
    },
    { ms: TIEMPO_TARBALL_MS },
  )
}

export type ArchivoCambiado = { filename: string; status: string; sha: string; previous_filename?: string }

export async function comparar(base: string, head: string): Promise<{ status?: string; files?: ArchivoCambiado[] }> {
  return pedir(`/compare/${base}...${head}`, r => r.json())
}

export async function blob(sha: string): Promise<Uint8Array> {
  return pedir(`/git/blobs/${sha}`, async r => new Uint8Array(await r.arrayBuffer()), {
    accept: 'application/vnd.github.raw',
  })
}

// --- Escritura (DI-087) ---

const AUTOR = { name: 'DiarIA web', email: 'diaria-web@sergiomonsalve.com' }

/** Cada segmento de la ruta codificado: espacios, tildes y `#` no rompen la URL. */
const contenidos = (ruta: string) => `/contents/${ruta.split('/').map(encodeURIComponent).join('/')}`

/** El texto de un archivo y el sha de su blob, en `main` o en `ref`. */
export async function leerArchivo(ruta: string, ref: string = RAMA): Promise<{ texto: string; sha: string }> {
  return pedir(`${contenidos(ruta)}?ref=${encodeURIComponent(ref)}`, async r => {
    const j = (await r.json()) as { sha?: string; content?: string; encoding?: string }
    if (typeof j.sha !== 'string' || typeof j.content !== 'string' || j.encoding !== 'base64') {
      throw new ErrorGithub('contenido')
    }
    return { texto: Buffer.from(j.content, 'base64').toString('utf8'), sha: j.sha }
  })
}

/**
 * Guarda `texto` en `ruta` con un commit en `main`. GitHub rechaza (409/422)
 * si `shaArchivo` ya no es el actual: así nunca se pisa un cambio ajeno.
 */
export async function guardarArchivo(
  ruta: string,
  texto: string,
  shaArchivo: string,
  mensaje: string,
): Promise<{ commit: string; padre: string; bytes: Uint8Array }> {
  const bytes = new TextEncoder().encode(texto)
  return pedir(
    contenidos(ruta),
    async r => {
      // GitHub ya respondió 2xx: el commit existe aunque la respuesta no se entienda.
      const j = (await r.json().catch(() => ({}))) as { commit?: { sha?: string; parents?: { sha?: string }[] } }
      const commit = j.commit?.sha
      const padre = j.commit?.parents?.[0]?.sha
      if (!commit || !padre) throw new ErrorGithub('guardado-incierto')
      return { commit, padre, bytes }
    },
    {
      method: 'PUT',
      body: JSON.stringify({
        message: mensaje,
        content: Buffer.from(bytes).toString('base64'),
        sha: shaArchivo,
        branch: RAMA,
        author: AUTOR,
        committer: AUTOR,
      }),
    },
  )
}

/** El último commit de `main` que tocó `ruta`, o null si no hay. */
export async function ultimoCommit(
  ruta: string,
): Promise<{ sha: string; padre: string | null; mensaje: string; autor: string } | null> {
  return pedir(`/commits?path=${encodeURIComponent(ruta)}&sha=${RAMA}&per_page=1`, async r => {
    const lista = (await r.json()) as {
      sha: string
      parents?: { sha: string }[]
      commit: { message: string; author?: { name?: string } }
    }[]
    const c = lista[0]
    if (!c) return null
    return { sha: c.sha, padre: c.parents?.[0]?.sha ?? null, mensaje: c.commit.message, autor: c.commit.author?.name ?? '' }
  })
}
