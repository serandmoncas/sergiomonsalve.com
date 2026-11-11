/**
 * Valida content/aves/atributos/*.json y content/aves/nombres-colombia.json contra el catálogo.
 *
 * Usage:
 *   npx tsx scripts/aves/validar-atributos.ts
 *
 * Sale con código 1 si hay errores (atributos inválidos o especies que no están en el catálogo).
 * Las especies que aún no tienen atributos o nombre se reportan, pero no son error.
 */

import fs from 'fs'
import path from 'path'
import { validarAtributos } from '../../src/lib/aves/atributos'
import type { Catalogo } from '../../src/lib/aves/tipos'

const RAIZ = path.join(process.cwd(), 'content/aves')
const catalogo: Catalogo = JSON.parse(fs.readFileSync(path.join(RAIZ, 'catalogo.json'), 'utf-8'))
const enCatalogo = new Set(catalogo.especies.map(e => String(e.speciesKey)))

const errores: string[] = []
const conAtributos = new Set<string>()

const dir = path.join(RAIZ, 'atributos')
for (const archivo of fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith('.json')) : []) {
  const porEspecie: Record<string, unknown> = JSON.parse(fs.readFileSync(path.join(dir, archivo), 'utf-8'))
  for (const [key, atributos] of Object.entries(porEspecie)) {
    if (!enCatalogo.has(key)) errores.push(`${archivo} ${key}: no está en el catálogo`)
    for (const e of validarAtributos(atributos)) errores.push(`${archivo} ${key}: ${e}`)
    conAtributos.add(key)
  }
}

const archivoNombres = path.join(RAIZ, 'nombres-colombia.json')
const nombres: Record<string, string> = fs.existsSync(archivoNombres)
  ? JSON.parse(fs.readFileSync(archivoNombres, 'utf-8'))
  : {}
for (const [key, nombre] of Object.entries(nombres)) {
  if (!enCatalogo.has(key)) errores.push(`nombres-colombia.json ${key}: no está en el catálogo`)
  if (!nombre.trim()) errores.push(`nombres-colombia.json ${key}: nombre vacío`)
}

const sinAtributos = catalogo.especies.filter(e => !conAtributos.has(String(e.speciesKey)))
for (const e of sinAtributos.slice(0, 20)) console.log(`sin atributos: ${e.speciesKey} ${e.cientifico} (${e.familia})`)
for (const e of errores) console.error(e)

const total = catalogo.especies.length
console.log(`${conAtributos.size}/${total} con atributos, ${Object.keys(nombres).length}/${total} con nombre colombiano, ${errores.length} errores`)
process.exit(errores.length > 0 ? 1 : 0)
