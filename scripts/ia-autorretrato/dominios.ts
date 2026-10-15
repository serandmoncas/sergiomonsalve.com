import { existsSync, readFileSync } from 'node:fs'
import type { AutorretratoIA, Dominio } from '@/lib/ia-autorretrato/tipos'
import { DOMINIOS } from '@/lib/ia-autorretrato/tipos'
import type { Prompt } from './claudeCode'

/**
 * Proyecto local o repo → dominio. Claves en minúsculas. Editable por Sergio.
 * Solo contiene repos públicos: el repo es público, así que los proyectos privados
 * no se nombran aquí. Los privados se cargan en runtime desde
 * `.ia-autorretrato/dominios-privados.json` (carpeta git-ignored) con cargarDominiosPrivados.
 */
export const DOMINIO_POR_PROYECTO: Record<string, Dominio> = {
  'sergiomonsalve.com': 'producto-web', 'intefin': 'producto-web', 'slogs': 'producto-web',
  'sama-mobile': 'producto-web', 'dharmastudio.art': 'producto-web', 'personalpage': 'producto-web',
  'pp_nextjs': 'producto-web', 'personal_page': 'producto-web', 'bichongos.store': 'producto-web',
  'bichongos': 'hongos-iot', 'mobile-esp32': 'hongos-iot', 'curso-cultivo-de-orellanas-': 'hongos-iot',
  'expia': 'educacion', 'especializacion-ia': 'educacion', 'medmap': 'educacion',
  'tesismaestria': 'educacion', 'stemedu': 'educacion', 'new-old-school': 'educacion',
  'her': 'agentes', 'brayan': 'agentes',
}

/** Dominios registrados en runtime (privados); se consultan antes que el mapa público. */
let registrados: Record<string, Dominio> = {}

/** Añade o sobrescribe dominios en runtime. Las claves se normalizan a minúsculas. */
export function registrarDominios(mapa: Record<string, Dominio>): void {
  for (const [clave, dominio] of Object.entries(mapa)) {
    registrados[clave.toLowerCase()] = dominio
  }
}

/** Solo para tests: vacía los dominios registrados en runtime. */
export function limpiarDominiosRegistrados(): void {
  registrados = {}
}

/**
 * Carga dominios privados desde un JSON `Record<string, Dominio>` (p. ej.
 * `.ia-autorretrato/dominios-privados.json`, git-ignored). Devuelve cuántos se registraron;
 * 0 si el archivo no existe. Lanza si algún valor no es un Dominio válido.
 */
export function cargarDominiosPrivados(ruta: string): number {
  if (!existsSync(ruta)) return 0
  const datos = JSON.parse(readFileSync(ruta, 'utf8')) as Record<string, unknown>
  for (const [clave, valor] of Object.entries(datos)) {
    if (!DOMINIOS.includes(valor as Dominio)) {
      throw new Error(`Dominio inválido para "${clave}": ${String(valor)}`)
    }
  }
  registrarDominios(datos as Record<string, Dominio>)
  return Object.keys(datos).length
}

/** Nombres (claves) del archivo de dominios privados; [] si no existe. Sirven para la lista negra de privacidad. */
export function clavesDominiosPrivados(ruta: string): string[] {
  if (!existsSync(ruta)) return []
  return Object.keys(JSON.parse(readFileSync(ruta, 'utf8')) as Record<string, unknown>)
}

export function dominioDe(proyectoORepo: string): Dominio {
  const clave = proyectoORepo.toLowerCase()
  return registrados[clave] ?? DOMINIO_POR_PROYECTO[clave] ?? 'experimentos'
}

export function promptsPorDominio(prompts: Prompt[], reposPublicos: string[]): AutorretratoIA['promptsPorDominio'] {
  const publicos = new Map(reposPublicos.map(r => [r.toLowerCase(), r]))
  const porDominio = new Map<Dominio, { prompts: number; repos: Set<string> }>()
  for (const p of prompts) {
    const dominio = dominioDe(p.proyecto)
    const d = porDominio.get(dominio) ?? { prompts: 0, repos: new Set<string>() }
    d.prompts++
    const publico = publicos.get(p.proyecto.toLowerCase())
    if (publico) d.repos.add(publico)
    porDominio.set(dominio, d)
  }
  return [...porDominio.entries()]
    .map(([dominio, d]) => ({ dominio, prompts: d.prompts, reposPublicos: [...d.repos].sort((a, b) => a.localeCompare(b)) }))
    .sort((a, b) => b.prompts - a.prompts)
}
