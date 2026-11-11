/**
 * Arma el kit de generación de ilustraciones de una familia: prompts y fotos de referencia.
 *
 * Usage:
 *   npx tsx scripts/aves/kit-familia.ts Thraupidae [máximo de especies]
 *
 * Lee los rasgos de content/aves/prompts/<familia>.json y escribe en content/aves/kits/<familia>/
 * (ignorado por git) un kit.md para generar en Google AI Studio y un referencias.json que usa la
 * ingesta. Las fotos de referencia vienen de GBIF con cualquier licencia: solo son referencia y
 * quedan registradas por trazabilidad.
 */

import fs from 'fs'
import path from 'path'
import { getEspecies } from '../../src/lib/aves/catalogo'
import { construirPrompt, referenciasDesdeGbif, validarRasgos, type RasgosEspecie } from '../../src/lib/aves/prompts'
import { ORDEN_VARIANTES } from '../../src/lib/aves/ilustraciones'
import type { Referencia, Variante } from '../../src/lib/aves/tipos'

const API = 'https://api.gbif.org/v1'
const RAIZ = path.join(process.cwd(), 'content/aves')
const FOTOS = 5

async function fotos(speciesKey: number): Promise<Referencia[]> {
  for (const pais of ['&country=CO', '']) {
    const res = await fetch(`${API}/occurrence/search?speciesKey=${speciesKey}${pais}&mediaType=StillImage&limit=20`)
    if (!res.ok) throw new Error(`GBIF ${res.status} para ${speciesKey}`)
    const refs = referenciasDesdeGbif((await res.json()).results, FOTOS)
    if (refs.length > 0) return refs
  }
  return []
}

async function main() {
  const [familia, maximo] = process.argv.slice(2)
  if (!familia) throw new Error('Uso: npx tsx scripts/aves/kit-familia.ts <Familia> [máximo]')

  const archivoRasgos = path.join(RAIZ, 'prompts', `${familia.toLowerCase()}.json`)
  if (!fs.existsSync(archivoRasgos)) throw new Error(`No existe ${archivoRasgos}`)
  const rasgos: Record<string, RasgosEspecie> = JSON.parse(fs.readFileSync(archivoRasgos, 'utf-8'))

  const especies = getEspecies()
    .filter(e => e.familia === familia)
    .slice(0, maximo ? Number(maximo) : undefined)
  if (especies.length === 0) throw new Error(`No hay especies de la familia ${familia}`)

  const kit: string[] = [`# Kit de ilustraciones: ${familia}`, '', 'En Google AI Studio, con el modelo de imagen de Gemini (Nano Banana): pega el prompt, adjunta 2 o 3 fotos de referencia y guarda la imagen con el nombre de archivo indicado en ~/Downloads/aves-lote/.', '']
  const referencias: Record<string, Referencia[]> = {}
  let prompts = 0

  for (const e of especies) {
    const r = rasgos[e.speciesKey]
    const errores = r ? validarRasgos(r) : ['faltan los rasgos']
    if (errores.length > 0) throw new Error(`${e.cientifico} (${e.speciesKey}): ${errores.join('; ')}`)
    const refs = await fotos(e.speciesKey)

    kit.push(`## #${e.puestoColombia} ${e.nombreEs} — *${e.cientifico}*`, '')
    for (const variante of ORDEN_VARIANTES.filter(v => r[v]) as Variante[]) {
      const clave = `${e.slug}--${variante}`
      referencias[clave] = refs
      kit.push(`### ${variante}: \`${clave}.png\``, '', '```', construirPrompt(e, variante, r[variante]!), '```', '')
      prompts++
    }
    kit.push('Fotos de referencia:', ...refs.map((f, i) => `${i + 1}. ${f.url} (${f.licencia || 'sin licencia indicada'})`), '')
  }

  const destino = path.join(RAIZ, 'kits', familia.toLowerCase())
  fs.mkdirSync(destino, { recursive: true })
  fs.writeFileSync(path.join(destino, 'kit.md'), kit.join('\n'))
  fs.writeFileSync(path.join(destino, 'referencias.json'), JSON.stringify(referencias, null, 2) + '\n')
  console.log(`${prompts} prompts de ${especies.length} especies en ${path.relative(process.cwd(), destino)}/kit.md`)
}

main().catch(err => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
