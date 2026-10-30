/**
 * Ingiere las ilustraciones generadas en Google AI Studio.
 *
 * Usage:
 *   npx tsx scripts/aves/ingerir.ts ~/Downloads/aves-lote [--sin-copia]
 *
 * Cada archivo debe llamarse <slug>--<variante>.png (o .jpg/.webp) y medir al menos 2048 px de lado
 * largo. Por cada uno: recorta el blanco sobrante, escribe public/aves/<archivo>-1024.webp y -512.webp,
 * copia el original a "lajobiteka:Guia de aves/originales/" con rclone (los originales no van al
 * repo) y lo registra como "generada" en content/aves/ilustraciones.json.
 * --sin-copia omite rclone (solo para pruebas locales).
 */

import fs from 'fs'
import path from 'path'
import { execFileSync } from 'child_process'
import sharp from 'sharp'
import { getEspecies } from '../../src/lib/aves/catalogo'
import { guardarRegistro, leerRegistro, registrarGenerada } from '../../src/lib/aves/ilustraciones'
import { parsearNombreArchivo, validarDimensiones } from '../../src/lib/aves/ingesta'
import type { Referencia } from '../../src/lib/aves/tipos'

const RAIZ = path.join(process.cwd(), 'content/aves')
const PUBLICO = path.join(process.cwd(), 'public/aves')
const DRIVE = 'lajobiteka:Guia de aves/originales'

function leerReferencias(familia: string): Record<string, Referencia[]> {
  const archivo = path.join(RAIZ, 'kits', familia.toLowerCase(), 'referencias.json')
  return fs.existsSync(archivo) ? JSON.parse(fs.readFileSync(archivo, 'utf-8')) : {}
}

async function main() {
  const args = process.argv.slice(2)
  const carpeta = args.find(a => !a.startsWith('--'))
  const sinCopia = args.includes('--sin-copia')
  if (!carpeta) throw new Error('Uso: npx tsx scripts/aves/ingerir.ts <carpeta> [--sin-copia]')

  const especies = getEspecies()
  const porSlug = new Map(especies.map(e => [e.slug, e]))
  const slugs = new Set(porSlug.keys())
  const hoy = new Date().toISOString().slice(0, 10)
  let registro = leerRegistro()
  const rechazos: string[] = []
  let ingeridas = 0

  fs.mkdirSync(PUBLICO, { recursive: true })
  for (const nombre of fs.readdirSync(carpeta).filter(f => !f.startsWith('.')).sort()) {
    const origen = path.join(carpeta, nombre)
    const parseado = parsearNombreArchivo(nombre, slugs)
    if ('error' in parseado) {
      rechazos.push(parseado.error)
      continue
    }
    const { slug, variante } = parseado
    const archivo = `${slug}--${variante}`

    try {
      const { width = 0, height = 0 } = await sharp(origen).metadata()
      const problema = validarDimensiones(width, height)
      if (problema) {
        rechazos.push(`${nombre}: ${problema}`)
        continue
      }

      const recortada = await sharp(origen).trim({ threshold: 12 }).toBuffer()
      for (const ancho of [1024, 512]) {
        await sharp(recortada).resize({ width: ancho }).webp({ quality: 82 }).toFile(path.join(PUBLICO, `${archivo}-${ancho}.webp`))
      }

      if (sinCopia) {
        console.warn(`${nombre}: --sin-copia, el original no se copió al Drive`)
      } else {
        execFileSync('rclone', ['copyto', origen, `${DRIVE}/${archivo}${path.extname(nombre).toLowerCase()}`], { stdio: 'pipe' })
      }

      const especie = porSlug.get(slug)!
      const referencias = leerReferencias(especie.familia)[archivo] ?? []
      registro = registrarGenerada(registro, especie.speciesKey, { variante, archivo, referencias }, hoy)
      ingeridas++
    } catch (err) {
      rechazos.push(`${nombre}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  guardarRegistro(registro)
  console.log(`${ingeridas} ingeridas, ${rechazos.length} rechazadas`)
  for (const r of rechazos) console.log(`  rechazada: ${r}`)
}

main().catch(err => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
