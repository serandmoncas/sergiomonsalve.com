import type { Region } from './tipos'

type Faceta = { name: string; count: number }
type NombreVernaculo = { language: string; vernacularName: string; source?: string }

export const PAISES_LATAM = [
  'AR', 'BO', 'BR', 'CL', 'CO', 'CR', 'CU', 'DO', 'EC', 'SV',
  'GT', 'HN', 'MX', 'NI', 'PA', 'PY', 'PE', 'PR', 'UY', 'VE',
]

// Región natural principal de cada departamento (una sola, para el mapa esquemático)
export const REGION_POR_DEPARTAMENTO: Record<string, Region> = {
  'Amazonas': 'amazonia',
  'Antioquia': 'andina',
  'Arauca': 'orinoquia',
  'Atlántico': 'caribe',
  'Bogotá': 'andina',
  'Bolívar': 'caribe',
  'Boyacá': 'andina',
  'Caldas': 'andina',
  'Caquetá': 'amazonia',
  'Casanare': 'orinoquia',
  'Cauca': 'andina',
  'Cesar': 'caribe',
  'Chocó': 'pacifica',
  'Córdoba': 'caribe',
  'Cundinamarca': 'andina',
  'Guainía': 'amazonia',
  'Guaviare': 'amazonia',
  'Huila': 'andina',
  'La Guajira': 'caribe',
  'Magdalena': 'caribe',
  'Meta': 'orinoquia',
  'Nariño': 'andina',
  'Norte de Santander': 'andina',
  'Putumayo': 'amazonia',
  'Quindío': 'andina',
  'Risaralda': 'andina',
  'San Andrés y Providencia': 'insular',
  'Santander': 'andina',
  'Sucre': 'caribe',
  'Tolima': 'andina',
  'Valle del Cauca': 'andina',
  'Vaupés': 'amazonia',
  'Vichada': 'orinoquia',
}

const sinTildes = (texto: string) => texto.normalize('NFD').replace(/\p{Diacritic}/gu, '')

// GBIF trae variantes: "Narino Department", "Bogotá, D.C.", "Archipiélago de San Andrés, ..."
function normalizarDepartamento(nombre: string): string {
  const n = sinTildes(nombre)
    .toLowerCase()
    .replace(/\b(department|capital district|d\.? ?c\.?|distrito capital de)\b/g, '')
    .replace(/[^a-z ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (n.includes('bogota')) return 'bogota'
  if (n.includes('san andres')) return 'san andres y providencia'
  if (n === 'guajira') return 'la guajira'
  if (n === 'valle de cauca') return 'valle del cauca'
  return n
}

const REGION_NORMALIZADA = new Map(
  Object.entries(REGION_POR_DEPARTAMENTO).map(([nombre, region]) => [normalizarDepartamento(nombre), region])
)

export function rankingDesdeFacetas(conteos: Faceta[]): Map<number, number> {
  return new Map(conteos.map((c, i) => [Number(c.name), i + 1]))
}

export function elegirNombre(nombres: NombreVernaculo[], idioma: 'spa' | 'eng'): string | null {
  const delIdioma = nombres.filter(n => n.language === idioma && n.vernacularName.trim())
  if (delIdioma.length === 0) return null
  const preferido = delIdioma.find(n => n.source === 'Colaboraciones Americanas Sobre Aves')
  if (preferido) return preferido.vernacularName.trim()

  const votos = new Map<string, { nombre: string; n: number }>()
  for (const { vernacularName } of delIdioma) {
    const clave = vernacularName.trim().toLowerCase()
    const actual = votos.get(clave)
    votos.set(clave, { nombre: actual?.nombre ?? vernacularName.trim(), n: (actual?.n ?? 0) + 1 })
  }
  return [...votos.values()].sort((a, b) => b.n - a.n)[0].nombre
}

export function slugify(texto: string): string {
  return sinTildes(texto)
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function asignarSlugs(items: { speciesKey: number; base: string }[]): Map<number, string> {
  const usados = new Set<string>()
  const slugs = new Map<number, string>()
  for (const { speciesKey, base } of items) {
    let slug = slugify(base)
    if (usados.has(slug)) slug = `${slug}-${speciesKey}`
    usados.add(slug)
    slugs.set(speciesKey, slug)
  }
  return slugs
}

// Una región cuenta si tiene al menos este porcentaje de los registros: unos pocos registros
// raros o de piedemonte no deben pintar una región donde el ave casi no está.
const UMBRAL_REGION = 0.05

export function regionesDesdeDepartamentos(conteos: Faceta[]): Region[] {
  const total = new Map<Region, number>()
  for (const { name, count } of conteos) {
    const region = REGION_NORMALIZADA.get(normalizarDepartamento(name))
    if (region) total.set(region, (total.get(region) ?? 0) + count)
  }
  const suma = [...total.values()].reduce((a, b) => a + b, 0)
  return [...total.entries()]
    .filter(([, n]) => n >= suma * UMBRAL_REGION)
    .sort((a, b) => b[1] - a[1])
    .map(([region]) => region)
}

export function mesesDesdeFacetas(conteos: Faceta[]): number[] {
  const meses = new Array(12).fill(0)
  for (const { name, count } of conteos) {
    const mes = Number(name)
    if (mes >= 1 && mes <= 12) meses[mes - 1] += count
  }
  return meses
}

// Registros de la especie divididos por el total de registros de aves de cada mes (esfuerzo de
// observación), escalados a 0–100. Sin esto, el Global Big Day de mayo sale como pico en todas.
export function mesesRelativos(especie: number[], totales: number[]): number[] {
  const tasas = especie.map((n, i) => (totales[i] > 0 ? n / totales[i] : 0))
  const maximo = Math.max(...tasas)
  return tasas.map(t => (maximo > 0 ? Math.round((t / maximo) * 100) : 0))
}

// Especies que GBIF separa pero que en Colombia son la misma ave (sinónimo → especie aceptada).
// Troglodytes aedon: registros colombianos con la taxonomía antigua de T. musculus.
export const SINONIMOS: Record<number, number> = {
  5231459: 8346347,
}

export function fusionarSinonimos(conteos: Faceta[], sinonimos: Record<number, number> = SINONIMOS): Faceta[] {
  const total = new Map<string, number>()
  for (const { name, count } of conteos) {
    const destino = String(sinonimos[Number(name)] ?? name)
    total.set(destino, (total.get(destino) ?? 0) + count)
  }
  return [...total.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)
}
