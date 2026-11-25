import 'server-only'

// Fuente del manual: repo privado de GitHub leído con la API REST.
const REPO = 'https://api.github.com/repos/serandmoncas/manual-de-usuario'

export class ManualSourceError extends Error {
  constructor(
    public tipo: 'no-configurado' | 'fallo',
    public detalle: string = tipo,
  ) {
    super(detalle)
    this.name = 'ManualSourceError'
  }
}

export type RepoFiles = {
  notas: Record<string, string>
  recorridos: Record<string, string>
  indice: string | null
  sobre: string | null
}

// Devuelve los archivos relevantes del árbol: [ruta, ...].
function relevantes(tree: { path: string; type: string }[]) {
  const soloNombre = (p: string, dir: string) => {
    const resto = p.slice(dir.length)
    return p.startsWith(dir) && !resto.includes('/') && resto.endsWith('.md') ? resto.slice(0, -3) : null
  }
  const notas: { slug: string; path: string }[] = []
  const recorridos: { slug: string; path: string }[] = []
  let indice = false
  let sobre = false
  for (const e of tree) {
    if (e.type !== 'blob') continue
    const n = soloNombre(e.path, 'notas/')
    if (n && !n.startsWith('_')) notas.push({ slug: n, path: e.path })
    const r = soloNombre(e.path, 'recorridos/')
    if (r && r !== 'TEMPLATE') recorridos.push({ slug: r, path: e.path })
    if (e.path === 'indice.yml') indice = true
    if (e.path === 'sobre.md') sobre = true
  }
  return { notas, recorridos, indice, sobre }
}

export async function fetchRepoFiles(): Promise<RepoFiles> {
  const token = process.env.MANUAL_GITHUB_TOKEN
  if (!token) throw new ManualSourceError('no-configurado')

  const init = (accept: string): RequestInit & { next: { revalidate: number; tags: string[] } } => ({
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: accept,
      'X-GitHub-Api-Version': '2022-11-28',
    },
    next: { revalidate: 300, tags: ['manual'] },
  })
  const get = async (path: string) => {
    const url = `${REPO}/contents/${path.split('/').map(encodeURIComponent).join('/')}?ref=main`
    const res = await fetch(url, init('application/vnd.github.raw+json'))
    if (!res.ok) throw new ManualSourceError('fallo', `${path}: HTTP ${res.status}`)
    return res.text()
  }

  const resArbol = await fetch(`${REPO}/git/trees/main?recursive=1`, init('application/vnd.github+json'))
  if (!resArbol.ok) throw new ManualSourceError('fallo', `árbol: HTTP ${resArbol.status}`)
  const { tree } = (await resArbol.json()) as { tree: { path: string; type: string }[] }
  const rel = relevantes(tree ?? [])

  const [notas, recorridos, indice, sobre] = await Promise.all([
    Promise.all(rel.notas.map(async (n) => [n.slug, await get(n.path)] as const)),
    Promise.all(rel.recorridos.map(async (n) => [n.slug, await get(n.path)] as const)),
    rel.indice ? get('indice.yml') : null,
    rel.sobre ? get('sobre.md') : null,
  ])
  return { notas: Object.fromEntries(notas), recorridos: Object.fromEntries(recorridos), indice, sobre }
}
