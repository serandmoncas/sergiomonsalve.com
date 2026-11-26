import 'server-only'

// Lectura del repo privado de notas (DI-084). Solo GET; el token vive solo
// aquí, en el servidor, y nunca aparece en errores ni logs.
const REPO = 'https://api.github.com/repos/serandmoncas/diaria-notas'
const RAMA = 'main'

export class ErrorGithub extends Error {
  constructor(public codigo: string) {
    super(codigo)
    this.name = 'ErrorGithub'
  }
}

export const hayToken = () => Boolean(process.env.DIARIA_GITHUB_TOKEN)

async function pedir(ruta: string, accept = 'application/vnd.github+json'): Promise<Response> {
  const token = process.env.DIARIA_GITHUB_TOKEN
  if (!token) throw new ErrorGithub('sin-token')
  let res: Response
  try {
    res = await fetch(`${REPO}${ruta}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: accept,
        'X-GitHub-Api-Version': '2022-11-28',
      },
      cache: 'no-store',
    })
  } catch {
    throw new ErrorGithub('red')
  }
  if (!res.ok) throw new ErrorGithub(`github-${res.status}`)
  return res
}

export async function shaActual(): Promise<string> {
  return (await (await pedir(`/commits/${RAMA}`, 'application/vnd.github.sha')).text()).trim()
}

export async function esPrivado(): Promise<boolean> {
  const repo = (await (await pedir('')).json()) as { private?: unknown }
  return repo.private === true
}

export async function tarball(sha: string): Promise<ReadableStream<Uint8Array>> {
  const res = await pedir(`/tarball/${sha}`)
  if (!res.body) throw new ErrorGithub('tarball')
  return res.body
}

export type ArchivoCambiado = { filename: string; status: string; sha: string; previous_filename?: string }

export async function comparar(base: string, head: string): Promise<{ files?: ArchivoCambiado[] }> {
  return (await pedir(`/compare/${base}...${head}`)).json()
}

export async function blob(sha: string): Promise<Uint8Array> {
  return new Uint8Array(await (await pedir(`/git/blobs/${sha}`, 'application/vnd.github.raw')).arrayBuffer())
}
