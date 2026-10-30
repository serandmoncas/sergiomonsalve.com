/**
 * Construye content/aves/catalogo.json con las 500 aves más comunes de Colombia.
 *
 * Usage:
 *   npx tsx scripts/aves/construir-catalogo.ts
 *
 * Fuente: API pública de GBIF (https://api.gbif.org/v1), solo registros con licencia
 * CC BY 4.0 y CC0 (uso comercial permitido con atribución). Incluye el eBird
 * Observation Dataset, publicado en GBIF bajo CC BY 4.0.
 */

import fs from 'fs'
import path from 'path'
import {
  PAISES_LATAM,
  asignarSlugs,
  elegirNombre,
  mesesDesdeFacetas,
  rankingDesdeFacetas,
  regionesDesdeDepartamentos,
} from '../../src/lib/aves/gbif'
import type { Catalogo, EspecieBase } from '../../src/lib/aves/tipos'

const API = 'https://api.gbif.org/v1'
const AVES = 'taxonKey=212'
const LICENCIAS = 'license=CC_BY_4_0&license=CC0_1_0'
const TOTAL = 500
const PARALELO = 5
const RAIZ = path.join(process.cwd(), 'content/aves')

type Faceta = { name: string; count: number }

async function getJson<T>(url: string, intento = 1): Promise<T> {
  const res = await fetch(url)
  if (res.status === 429 && intento <= 5) {
    await new Promise(r => setTimeout(r, 2000 * intento))
    return getJson(url, intento + 1)
  }
  if (!res.ok) throw new Error(`GBIF ${res.status}: ${url}`)
  return res.json() as Promise<T>
}

async function facetas(consulta: string, campo: string, limite: number): Promise<Faceta[]> {
  const url = `${API}/occurrence/search?${consulta}&${AVES}&${LICENCIAS}&limit=0&facet=${campo}&${campo}.facetLimit=${limite}`
  const data = await getJson<{ facets: { field: string; counts: Faceta[] }[] }>(url)
  return data.facets[0]?.counts ?? []
}

async function enLotes<T, R>(items: T[], fn: (item: T) => Promise<R>): Promise<R[]> {
  const resultados: R[] = []
  for (let i = 0; i < items.length; i += PARALELO) {
    resultados.push(...(await Promise.all(items.slice(i, i + PARALELO).map(fn))))
    process.stdout.write(`\r${Math.min(i + PARALELO, items.length)}/${items.length} especies`)
  }
  process.stdout.write('\n')
  return resultados
}

// Nombres comunes usados en Colombia (speciesKey → nombre), asignados por familia.
// GBIF no trae una lista colombiana: sus nombres en español mezclan países ("Zopilote común").
function leerNombresColombia(): Record<string, string> {
  const archivo = path.join(RAIZ, 'nombres-colombia.json')
  return fs.existsSync(archivo) ? JSON.parse(fs.readFileSync(archivo, 'utf-8')) : {}
}

async function main() {
  const nombresColombia = leerNombresColombia()
  const topColombia = await facetas('country=CO', 'speciesKey', TOTAL)
  const rankingColombia = rankingDesdeFacetas(topColombia)
  const paises = PAISES_LATAM.map(c => `country=${c}`).join('&')
  const rankingLatam = rankingDesdeFacetas(await facetas(paises, 'speciesKey', 4000))

  const detalles = await enLotes(topColombia, async ({ name, count }) => {
    const key = Number(name)
    const [especie, vernaculos, departamentos, meses] = await Promise.all([
      getJson<{ canonicalName: string; family: string; order: string }>(`${API}/species/${key}`),
      getJson<{ results: { language: string; vernacularName: string; source?: string }[] }>(
        `${API}/species/${key}/vernacularNames?limit=300`
      ),
      facetas(`country=CO&speciesKey=${key}`, 'stateProvince', 100),
      facetas(`country=CO&speciesKey=${key}`, 'month', 12),
    ])
    const nombreEn = elegirNombre(vernaculos.results, 'eng') ?? especie.canonicalName
    const nombreEs = nombresColombia[key] ?? elegirNombre(vernaculos.results, 'spa') ?? nombreEn
    return { key, count, especie, nombreEs, nombreEn, departamentos, meses }
  })

  const slugs = asignarSlugs(detalles.map(d => ({ speciesKey: d.key, base: d.nombreEs })))
  const especies: EspecieBase[] = detalles.map(d => ({
    speciesKey: d.key,
    slug: slugs.get(d.key)!,
    cientifico: d.especie.canonicalName,
    nombreEs: d.nombreEs,
    nombreEn: d.nombreEn,
    familia: d.especie.family,
    orden: d.especie.order,
    puestoColombia: rankingColombia.get(d.key)!,
    registrosColombia: d.count,
    puestoLatam: rankingLatam.get(d.key) ?? null,
    regiones: regionesDesdeDepartamentos(d.departamentos),
    meses: mesesDesdeFacetas(d.meses),
    amenaza: null,
  }))

  const catalogo: Catalogo = { consultado: new Date().toISOString().slice(0, 10), especies }
  fs.mkdirSync(RAIZ, { recursive: true })
  fs.writeFileSync(path.join(RAIZ, 'catalogo.json'), JSON.stringify(catalogo, null, 2) + '\n')
  console.log(`${especies.length} especies escritas en content/aves/catalogo.json`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
