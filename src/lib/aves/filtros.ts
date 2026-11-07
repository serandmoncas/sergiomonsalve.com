import type { ClaseTamano, Color, Especie, Habitat } from './tipos'

export type Filtros = { texto: string; tamano: ClaseTamano | null; colores: Color[]; habitat: Habitat | null }

export const FILTROS_VACIOS: Filtros = { texto: '', tamano: null, colores: [], habitat: null }

const normalizar = (texto: string) =>
  texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()

export function buscar(especies: Especie[], texto: string): Especie[] {
  const q = normalizar(texto)
  if (!q) return especies
  return especies.filter(e => [e.nombreEs, e.nombreEn, e.cientifico].some(n => normalizar(n).includes(q)))
}

export function filtrarEspecies(especies: Especie[], f: Filtros): Especie[] {
  const hayFiltrosDeAtributos = f.tamano !== null || f.colores.length > 0 || f.habitat !== null
  return buscar(especies, f.texto).filter(e => {
    if (!hayFiltrosDeAtributos) return true
    const a = e.atributos
    if (!a) return false
    if (f.tamano && a.claseTamano !== f.tamano) return false
    if (f.colores.length > 0 && !f.colores.some(c => a.colores.includes(c))) return false
    if (f.habitat && !a.habitats.includes(f.habitat)) return false
    return true
  })
}

export function agruparPorFamilia(especies: Especie[]): { familia: string; especies: Especie[] }[] {
  const grupos = new Map<string, Especie[]>()
  for (const e of [...especies].sort((a, b) => a.puestoColombia - b.puestoColombia)) {
    grupos.set(e.familia, [...(grupos.get(e.familia) ?? []), e])
  }
  return [...grupos.entries()].map(([familia, especies]) => ({ familia, especies }))
}
