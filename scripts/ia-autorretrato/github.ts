import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import type { Cuenta } from '@/lib/ia-autorretrato/tipos'
import type { CommitCrudo } from './commits'
import { leerFlujoJson } from './flujoJson'

export type Ejecutor = (args: string[]) => string
export type RepoInfo = { nombre: string; privado: boolean; lenguaje: string | null }
export type DescargaCuenta = { cuenta: Cuenta; repos: RepoInfo[]; commits: CommitCrudo[]; manifiestos: Record<string, string[]> }

export const gh: Ejecutor = args =>
  execFileSync('gh', args, { encoding: 'utf8', maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'pipe'] })

const MANIFIESTOS = ['package.json', 'requirements.txt', 'pyproject.toml', 'platformio.ini', 'Gemfile', 'go.mod']

type CommitApi = { commit: { author: { date: string; name: string; email: string }; message: string } }
const esCommitApi = (x: unknown): x is CommitApi =>
  typeof x === 'object' && x !== null && 'commit' in x

/** Repos propios (sin forks) de la cuenta. */
export function listarRepos(cuenta: Cuenta, run: Ejecutor = gh): RepoInfo[] {
  const salida = run(['repo', 'list', cuenta, '--limit', '300', '--source', '--json', 'name,isPrivate,primaryLanguage'])
  const repos = JSON.parse(salida) as { name: string; isPrivate: boolean; primaryLanguage: { name: string } | null }[]
  return repos.map(r => ({ nombre: r.name, privado: r.isPrivate, lenguaje: r.primaryLanguage?.name ?? null }))
}

/** Texto del error de gh: mensaje más stderr (execFileSync lo incluye en ambos). */
function textoError(e: unknown): string {
  if (!(e instanceof Error)) return String(e)
  const stderr = (e as Error & { stderr?: unknown }).stderr
  return `${e.message} ${stderr ? String(stderr) : ''}`
}

const ERROR_REPO_VACIO = /\b409\b|Git Repository is empty/
const ERROR_NO_ENCONTRADO = /\b404\b|Not Found/

export function descargarCommits(cuenta: Cuenta, repo: string, run: Ejecutor = gh): CommitCrudo[] {
  let salida: string
  try {
    salida = run(['api', `repos/${cuenta}/${repo}/commits?per_page=100`, '--paginate'])
  } catch (e) {
    if (ERROR_REPO_VACIO.test(textoError(e))) return [] // repo vacío: no hay commits
    throw e // auth, rate limit, red: no se debe confundir con un repo vacío
  }
  return leerFlujoJson(salida)
    .flatMap(v => (Array.isArray(v) ? v : [v]))
    .filter(esCommitApi)
    .map(c => ({ repo, fecha: c.commit.author.date, autor: c.commit.author.name, email: c.commit.author.email, msg: c.commit.message }))
}

export function descargarManifiestos(cuenta: Cuenta, repo: string, run: Ejecutor = gh): string[] {
  return MANIFIESTOS.flatMap(ruta => {
    try {
      const b64 = run(['api', `repos/${cuenta}/${repo}/contents/${ruta}`, '--jq', '.content'])
      return [Buffer.from(b64.replace(/\s/g, ''), 'base64').toString('utf8')]
    } catch (e) {
      if (ERROR_NO_ENCONTRADO.test(textoError(e))) return [] // el manifiesto no existe en este repo
      throw e
    }
  })
}

/** Descarga (o lee de caché) todo lo de una cuenta. La caché vive en .ia-autorretrato/ (ignorado). */
export function descargarCuenta(cuenta: Cuenta, dirCache: string, refrescar = false, run: Ejecutor = gh): DescargaCuenta {
  const archivo = path.join(dirCache, `github-${cuenta}.json`)
  if (!refrescar && fs.existsSync(archivo)) return JSON.parse(fs.readFileSync(archivo, 'utf8'))
  const repos = listarRepos(cuenta, run)
  const commits: CommitCrudo[] = []
  const manifiestos: Record<string, string[]> = {}
  for (const r of repos) {
    console.log(`  ${cuenta}/${r.nombre}`)
    commits.push(...descargarCommits(cuenta, r.nombre, run))
    manifiestos[r.nombre] = descargarManifiestos(cuenta, r.nombre, run)
  }
  const descarga = { cuenta, repos, commits, manifiestos }
  // Escritura atómica: un corte a mitad no deja una caché parcial que luego se lea como válida.
  fs.mkdirSync(dirCache, { recursive: true })
  const tmp = `${archivo}.tmp`
  fs.writeFileSync(tmp, JSON.stringify(descarga))
  fs.renameSync(tmp, archivo)
  return descarga
}
