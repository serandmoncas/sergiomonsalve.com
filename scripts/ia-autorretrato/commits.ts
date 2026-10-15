import type { Cuenta } from '@/lib/ia-autorretrato/tipos'
import { esBot, esSergio, normalizarModelo, REPOS_EXCLUIDOS } from './identidades'
import { diaBogota } from './util'

export type CommitCrudo = { repo: string; fecha: string; autor: string; email: string; msg: string }

export type CommitNormalizado = {
  cuenta: Cuenta
  repo: string
  fecha: string // YYYY-MM-DD, Bogotá
  mes: string   // YYYY-MM
  autor: string // solo en memoria: nunca se publica
  esSergio: boolean
  autorClaude: boolean
  esBot: boolean
  modelos: string[]
  tipo: string
  largoMensaje: number
  largoSinTrailer: number
}

const TRAILER = /^Co-Authored-By:\s*(.+?)\s*<[^>]*>\s*$/gim

export function coautores(msg: string): string[] {
  return [...msg.matchAll(TRAILER)].map(m => m[1].trim())
}

/** Solo tipos de Conventional Commits: un prefijo libre ("proyecto: …") podría ser el nombre de un proyecto. */
const TIPOS = new Set(['feat', 'fix', 'docs', 'chore', 'test', 'refactor', 'style', 'perf', 'ci', 'build', 'revert', 'merge'])

/**
 * Tipos de dominio (no repos) que sí se publican en porTipo. Es una lista explícita para que
 * un nombre de repo privado usado como prefijo ("proyecto: …") nunca se publique.
 */
export const TIPOS_DOMINIO = ['contenido', 'capacitacion', 'cultivo', 'firmware']
const PERMITIDOS_TIPO = new Set([...TIPOS, ...TIPOS_DOMINIO])

export function tipoDe(msg: string): string {
  const m = msg.match(/^([a-z]+)(\([^)]*\))?!?:/i)
  const t = m ? m[1].toLowerCase() : ''
  return PERMITIDOS_TIPO.has(t) ? t : 'otro'
}

export function sinTrailer(msg: string): string {
  return msg.split(/\n\s*Co-Authored-By:/i)[0].trim()
}

export function normalizarCommit(cuenta: Cuenta, c: CommitCrudo): CommitNormalizado {
  const fecha = diaBogota(Date.parse(c.fecha))
  const modelos = [...new Set(coautores(c.msg).filter(n => /claude/i.test(n)).map(normalizarModelo))]
  return {
    cuenta,
    repo: c.repo,
    fecha,
    mes: fecha.slice(0, 7),
    autor: c.autor,
    esSergio: esSergio(c.autor),
    autorClaude: c.autor.trim() === 'Claude',
    esBot: esBot(c.autor),
    modelos,
    tipo: tipoDe(c.msg),
    largoMensaje: c.msg.trim().length,
    largoSinTrailer: sinTrailer(c.msg).length,
  }
}

export function filtrarCommits(cuenta: Cuenta, commits: CommitCrudo[]): CommitNormalizado[] {
  const excluidos = new Set(REPOS_EXCLUIDOS[cuenta] ?? [])
  return commits.filter(c => !excluidos.has(c.repo)).map(c => normalizarCommit(cuenta, c))
}

export const tieneIA = (c: CommitNormalizado) => c.autorClaude || c.modelos.length > 0
export const esPropio = (c: CommitNormalizado) => !c.esBot && (c.esSergio || c.autorClaude)
