/**
 * Escribe datos de ejemplo en data/ia-autorretrato.json para que el sitio compile
 * antes de la primera corrida real del pipeline.
 *
 * Uso: npx tsx scripts/ia-autorretrato/escribir-ejemplo.ts [--forzar]
 * No sobrescribe un data/ia-autorretrato.json existente sin --forzar.
 */
import fs from 'node:fs'
import path from 'node:path'
import { EJEMPLO } from '@/lib/ia-autorretrato/ejemplo'

const destino = path.join(process.cwd(), 'data/ia-autorretrato.json')
if (fs.existsSync(destino) && !process.argv.includes('--forzar')) {
  console.error(`${path.relative(process.cwd(), destino)} ya existe: no se sobrescribe. Usa --forzar para reemplazarlo con el ejemplo.`)
  process.exit(1)
}
fs.writeFileSync(destino, JSON.stringify(EJEMPLO, null, 2) + '\n')
console.log(`Ejemplo escrito en ${path.relative(process.cwd(), destino)}`)
