/**
 * Verifica que el MDX del post no filtre repos privados, personas, correos ni rutas.
 * Uso: npx tsx scripts/ia-autorretrato/verificar-mdx.ts content/blog/es/<archivo>.mdx [content/blog/en/<archivo>.mdx]
 */
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { leerHistorial } from './claudeCode'
import { clavesDominiosPrivados } from './dominios'
import type { DescargaCuenta } from './github'
import { cargarIdentidades, esBot, esSergio, PERMITIDOS } from './identidades'
import { nombresPrivados, verificarPrivacidad } from './privacidad'

const privado = path.join(process.cwd(), '.ia-autorretrato')
const cache = path.join(privado, 'cache')
const { cuentas } = cargarIdentidades(path.join(privado, 'identidades.json'))
const descargas: DescargaCuenta[] = cuentas.map(c => JSON.parse(fs.readFileSync(path.join(cache, `github-${c}.json`), 'utf8')))
const historial = path.join(os.homedir(), '.claude/history.jsonl')
const reposPrivados = nombresPrivados({
  reposPrivados: descargas.flatMap(d => d.repos.filter(r => r.privado).map(r => r.nombre)),
  dominiosPrivados: clavesDominiosPrivados(path.join(privado, 'dominios-privados.json')),
  proyectos: fs.existsSync(historial) ? leerHistorial(fs.readFileSync(historial, 'utf8')).map(p => p.proyecto) : [],
  reposPublicos: descargas.flatMap(d => d.repos.filter(r => !r.privado).map(r => r.nombre)),
  permitidos: PERMITIDOS,
})
const personas = [...new Set(descargas.flatMap(d => d.commits.map(c => c.autor)).filter(a => !esSergio(a) && !esBot(a) && a.trim() !== 'Claude'))]

let fallo = false
for (const archivo of process.argv.slice(2)) {
  const problemas = verificarPrivacidad(fs.readFileSync(archivo, 'utf8'), { prompts: [], reposPrivados, personas, permitidos: PERMITIDOS })
  if (problemas.length) { fallo = true; console.error(`✗ ${archivo}\n${problemas.map(p => `  - ${p}`).join('\n')}`) }
  else console.log(`✓ ${archivo}`)
}
process.exit(fallo ? 1 : 0)
