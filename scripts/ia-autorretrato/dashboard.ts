/**
 * Datasets del Claude Dashboard del camino. Solo salen del JSON ya publicado.
 * Uso: npx tsx scripts/ia-autorretrato/dashboard.ts
 */
import fs from 'node:fs'
import path from 'node:path'
import { DATOS } from '@/lib/ia-autorretrato/datos'

const dir = path.join(process.cwd(), '.ia-autorretrato/dashboard')
fs.mkdirSync(dir, { recursive: true })
const nodos = DATOS.camino.nodos.map(n => ({
  id: n.id,
  etiqueta: n.etiqueta,
  rama: n.rama,
  evidencia: n.evidencia,
  primeraEvidencia: n.primeraEvidencia ?? '',
  hoy: Boolean(n.hoy),
  fuente: n.repos?.length ? `GitHub: ${n.repos.join(', ')}` : n.declaradoEn ?? 'inferido',
}))
fs.writeFileSync(path.join(dir, 'camino-nodos.json'), JSON.stringify(nodos, null, 2))
fs.writeFileSync(path.join(dir, 'camino-aristas.json'), JSON.stringify(DATOS.camino.aristas, null, 2))
console.log(`✓ ${nodos.length} nodos, ${DATOS.camino.aristas.length} aristas en .ia-autorretrato/dashboard/`)
