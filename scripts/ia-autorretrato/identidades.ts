import { existsSync, readFileSync } from 'node:fs'
import type { Cuenta } from '@/lib/ia-autorretrato/tipos'

/** Repos con historial ajeno (upstream de Errbit y Heroku) que no son trabajo de Sergio. */
export const REPOS_EXCLUIDOS: Partial<Record<Cuenta, string[]>> = {
  smonsalve: ['lacasona-errbit', 'leclub'],
  serandmoncas: [],
}

/** Palabras que coinciden con un nombre de la lista negra pero no identifican a nadie. */
export const PERMITIDOS = [
  'estudiante',
  // "cerebro": palabra común (glosario: «Segundo cerebro») y nombre de un proyecto del portafolio.
  'cerebro',
  // Sin tildes "mía" (pronombre) coincide con un nombre de proyecto de una sola sílaba.
  'mia',
  // Proyecto público del portafolio.
  'claudedataviz',
  // Carpetas genéricas desde las que se abre Claude Code (el home y la carpeta de código), no proyectos.
  'code',
  'sergiomonsalve',
]

export type Identidades = { autores: string[]; cuentas: Cuenta[] }

/** Valores por defecto: las identidades de Sergio. `horus` era Sergio (confirmado el 2026-10-15). */
export const IDENTIDADES_POR_DEFECTO: Identidades = {
  autores: ['Sergio*', 'horus', 'serandmoncas', 'smonsalve'],
  cuentas: ['smonsalve', 'serandmoncas'],
}

let identidades: Identidades = IDENTIDADES_POR_DEFECTO

/** Valida el contenido de `.ia-autorretrato/identidades.json`; lo que falte cae a los valores por defecto. */
export function parsearIdentidades(datos: unknown): Identidades {
  if (typeof datos !== 'object' || datos === null) throw new Error('identidades.json debe ser un objeto')
  const { autores, cuentas } = datos as Record<string, unknown>
  const lista = (v: unknown, campo: string): string[] | undefined => {
    if (v === undefined) return undefined
    if (!Array.isArray(v) || v.length === 0 || v.some(x => typeof x !== 'string' || !x.trim())) {
      throw new Error(`identidades.json: "${campo}" debe ser una lista no vacía de textos`)
    }
    return v.map(x => (x as string).trim())
  }
  return {
    autores: lista(autores, 'autores') ?? IDENTIDADES_POR_DEFECTO.autores,
    cuentas: (lista(cuentas, 'cuentas') as Cuenta[] | undefined) ?? IDENTIDADES_POR_DEFECTO.cuentas,
  }
}

/** Entradas que terminan en `*` coinciden por prefijo; las demás, de forma exacta. */
export function coincideAutor(autor: string, autores: string[]): boolean {
  const a = autor.trim()
  return autores.some(p => (p.endsWith('*') ? a.startsWith(p.slice(0, -1)) : a === p))
}

export function configurarIdentidades(config: Identidades): void {
  identidades = config
}

/** Lee el archivo opcional; si no existe deja los valores por defecto. */
export function cargarIdentidades(ruta: string): Identidades {
  const config = existsSync(ruta) ? parsearIdentidades(JSON.parse(readFileSync(ruta, 'utf8'))) : IDENTIDADES_POR_DEFECTO
  configurarIdentidades(config)
  return config
}

export function esSergio(autor: string): boolean {
  return coincideAutor(autor, identidades.autores)
}

export function esBot(autor: string): boolean {
  const a = autor.trim()
  return a.endsWith('[bot]') || a === 'Vercel' || a === 'GitHub'
}

/** "Claude Opus 5 (1M context)" → "Claude Opus 5" */
export function normalizarModelo(nombre: string): string {
  return nombre.replace(/\s*\([^)]*\)/g, '').replace(/\s+/g, ' ').trim()
}
