import fs from 'fs'
import path from 'path'
import type { Atributos, Catalogo, Especie } from './tipos'

const raizPorDefecto = path.join(process.cwd(), 'content/aves')

function leerCatalogo(raiz: string): Catalogo {
  return JSON.parse(fs.readFileSync(path.join(raiz, 'catalogo.json'), 'utf-8'))
}

function leerAtributos(raiz: string): Map<number, Atributos> {
  const dir = path.join(raiz, 'atributos')
  const atributos = new Map<number, Atributos>()
  if (!fs.existsSync(dir)) return atributos
  for (const archivo of fs.readdirSync(dir).filter(f => f.endsWith('.json'))) {
    const porEspecie: Record<string, Atributos> = JSON.parse(fs.readFileSync(path.join(dir, archivo), 'utf-8'))
    for (const [key, valor] of Object.entries(porEspecie)) atributos.set(Number(key), valor)
  }
  return atributos
}

export function getEspecies(raiz = raizPorDefecto): Especie[] {
  const atributos = leerAtributos(raiz)
  return leerCatalogo(raiz)
    .especies.map(e => ({ ...e, atributos: atributos.get(e.speciesKey) ?? null }))
    .sort((a, b) => a.puestoColombia - b.puestoColombia)
}

export function getEspecie(slug: string, raiz = raizPorDefecto): Especie | null {
  return getEspecies(raiz).find(e => e.slug === slug) ?? null
}

export function getSlugs(raiz = raizPorDefecto): string[] {
  return leerCatalogo(raiz).especies.map(e => e.slug)
}

export function getFechaConsulta(raiz = raizPorDefecto): string {
  return leerCatalogo(raiz).consultado
}
