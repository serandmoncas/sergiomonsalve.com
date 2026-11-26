// Guarda de privacidad del código del diario (DI-084). El sitio es público:
// nada del diario de Sergio (nombres de personas o lugares de la denylist de
// DiarIA) puede entrar en el código del diario. Uso: npm run guarda.
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const RUTAS_DIARIO = [
  /^src\/lib\/diaria\//,
  /^src\/lib\/diario\//,
  /^src\/components\/admin\/diario\//,
  /^src\/app\/.*\/diario\//,
  /^scripts\/diario\//,
]
const CABECERA = '<!-- fixture: sintética -->'

const normal = (t) => t.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

/** Violaciones como "ruta: término n.º i", sin repetir nunca el término. */
export function revisar(archivos, denylist) {
  const terminos = denylist.map((t) => t.trim()).filter(Boolean).map(normal)
  const violaciones = []
  for (const { ruta, contenido } of archivos) {
    if (!RUTAS_DIARIO.some((r) => r.test(ruta))) continue
    if (ruta.toLowerCase().endsWith('.md') && !contenido.startsWith(CABECERA))
      violaciones.push(`${ruta}: .md sin ${CABECERA}`)
    const texto = normal(`${ruta}\n${contenido}`)
    terminos.forEach((t, i) => {
      if (texto.includes(t)) violaciones.push(`${ruta}: término n.º ${i + 1}`)
    })
  }
  return violaciones
}

function main() {
  const git = (...a) => execFileSync('git', a, { encoding: 'utf8', maxBuffer: 64 << 20 })
  const rutas = git('ls-files', '--cached', '-z').split('\0').filter(Boolean)
  const delDiario = rutas.filter((r) => RUTAS_DIARIO.some((x) => x.test(r)))
  const archivos = delDiario.map((ruta) => ({ ruta, contenido: git('show', `:${ruta}`) }))
  const ruta = process.env.DIARIA_DENYLIST ?? join(homedir(), '.config', 'diaria', 'denylist.txt')
  let denylist = []
  if (existsSync(ruta)) denylist = readFileSync(ruta, 'utf8').split('\n')
  else console.warn('guarda del diario: no encontré la denylist; solo reviso las cabeceras de fixtures')
  const v = revisar(archivos, denylist)
  console.log(`guarda del diario: ${archivos.length} archivos, denylist con ${denylist.filter((t) => t.trim()).length} términos`)
  if (v.length) {
    for (const x of v) console.error(`✖ ${x}`)
    process.exit(1)
  }
  console.log('✔ sin violaciones')
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main()
