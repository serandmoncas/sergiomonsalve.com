/**
 * Pipeline del post "Autorretrato con IA".
 * Lee ~/.claude y GitHub (serandmoncas + smonsalve), clasifica, verifica privacidad
 * y escribe data/ia-autorretrato.json. Lo privado queda en .ia-autorretrato/ (ignorado).
 *
 * Uso: npx tsx scripts/ia-autorretrato/index.ts [--refrescar]
 *
 * Personalización (opcional, en .ia-autorretrato/, git-ignored):
 * - identidades.json: { "autores": ["Tu Nombre*", "otro-alias"], "cuentas": ["tu-usuario-gh"] }.
 *   Los autores que terminan en `*` coinciden por prefijo. Sin archivo se usan los de Sergio.
 * - dominios-privados.json: { "mi-repo-privado": "producto-web" }.
 *
 * Si camino.json nombra repos que no son públicos en tus cuentas, se avisa y esos nodos se
 * quedan sin fecha derivada de commits. Con AUTORRETRATO_ESTRICTO=1 (las corridas de Sergio) falla.
 */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { normalizar } from '@/lib/experiencias-ia/buscar'
import { GLOSARIO } from '@/lib/experiencias-ia/glosario'
import type { AutorretratoIA, Camino, Cuenta, ItemEcosistema } from '@/lib/ia-autorretrato/tipos'
import { calcularEra, commitsPorMes, modelosPorMes, primeraFechaPorRepo } from './agregadosGithub'
import { aplicarRevision, enriquecerCamino, reposNoPublicos, revisionCamino, revisionRespondida, validarCamino } from './camino'
import CAMINO from './camino.json'
import { actividadDiaria, leerHistorial, leerSesiones, perfilPrompts, seleccionarCitas } from './claudeCode'
import { filtrarCommits, type CommitNormalizado } from './commits'
import { clasificarConceptos, leerCorrecciones, revisionConceptos } from './conceptos'
import CONTEXTO from './contexto.json'
import DECLARADO from './declarado.json'
import { cargarDominiosPrivados, clavesDominiosPrivados, promptsPorDominio } from './dominios'
import { descargarCuenta } from './github'
import { cargarIdentidades, PERMITIDOS } from './identidades'
import { nombresPrivados, verificarPrivacidad } from './privacidad'
import { grafoCoautoria, grafoDiscurso } from './red'

const RAIZ = process.cwd()
const PRIVADO = path.join(RAIZ, '.ia-autorretrato')
const CLAUDE = path.join(os.homedir(), '.claude')

const leer = (archivo: string) => fs.readFileSync(archivo, 'utf8')
const siExiste = (archivo: string) => (fs.existsSync(archivo) ? leer(archivo) : null)

function listarJsonl(dir: string): string[] {
  return (fs.readdirSync(dir, { recursive: true }) as string[])
    .filter(f => f.endsWith('.jsonl'))
    .map(f => path.join(dir, f))
}

function main() {
  const { cuentas: CUENTAS } = cargarIdentidades(path.join(PRIVADO, 'identidades.json'))
  const refrescar = process.argv.includes('--refrescar')
  fs.mkdirSync(path.join(PRIVADO, 'cache'), { recursive: true })
  const nPrivados = cargarDominiosPrivados(path.join(PRIVADO, 'dominios-privados.json'))
  console.log(`Dominios privados cargados: ${nPrivados}`)
  if (nPrivados === 0) console.warn('   ⚠ .ia-autorretrato/dominios-privados.json falta o está vacío: los proyectos privados caerán en "experimentos"')

  console.log('1/6 Claude Code…')
  const prompts = leerHistorial(leer(path.join(CLAUDE, 'history.jsonl')))
  const sesiones = leerSesiones(listarJsonl(path.join(CLAUDE, 'projects')).map(leer))

  console.log('2/6 GitHub…')
  const descargas = CUENTAS.map(c => descargarCuenta(c, path.join(PRIVADO, 'cache'), refrescar))
  const commits = Object.fromEntries(descargas.map(d => [d.cuenta, filtrarCommits(d.cuenta, d.commits)])) as Record<Cuenta, CommitNormalizado[]>
  const todos = [...commits.smonsalve, ...commits.serandmoncas]
  const repos = descargas.flatMap(d => d.repos)
  const reposPublicos = [...new Set(repos.filter(r => !r.privado).map(r => r.nombre))]
  const reposPrivados = [...new Set(repos.filter(r => r.privado).map(r => r.nombre))]

  console.log('3/6 Conceptos…')
  const senales = normalizar([
    ...descargas.flatMap(d => Object.values(d.manifiestos).flat()),
    ...repos.map(r => r.lenguaje ?? ''),
  ].join(' '))
  const csvConceptos = siExiste(path.join(PRIVADO, 'conceptos-revision.csv'))
  const correcciones = csvConceptos ? leerCorrecciones(csvConceptos, new Set(GLOSARIO.map(g => g.slug))) : new Map()
  const conceptos = clasificarConceptos(GLOSARIO, prompts.map(p => p.texto), senales, correcciones)

  console.log('4/6 Camino…')
  let camino = CAMINO as unknown as Camino
  const csvCamino = siExiste(path.join(PRIVADO, 'camino-revision.csv'))
  const revisado = csvCamino !== null && revisionRespondida(csvCamino)
  if (revisado) camino = aplicarRevision(camino, csvCamino)
  else console.warn('   ⚠ camino sin revisar: se incluyen todos los nodos inferidos (borrador)')
  const noPublicos = reposNoPublicos(camino.nodos, reposPublicos)
  if (noPublicos.length) {
    const mensaje = `camino.json nombra repos que no son públicos en tus cuentas: ${noPublicos.join(', ')}`
    if (process.env.AUTORRETRATO_ESTRICTO === '1') throw new Error(mensaje)
    console.warn(`   ⚠ ${mensaje}. Esos repos se ignoran (los nodos se quedan sin fecha de commits); edita camino.json.`)
    const fuera = new Set(noPublicos.map(r => r.toLowerCase()))
    camino = { ...camino, nodos: camino.nodos.map(n => ({ ...n, repos: (n.repos ?? []).filter(r => !fuera.has(r.toLowerCase())) })) }
  }
  const nodos = enriquecerCamino(camino.nodos, primeraFechaPorRepo(todos))
  const errores = validarCamino(nodos, camino.aristas)
  if (errores.length) throw new Error(`camino inválido:\n${errores.join('\n')}`)

  console.log('5/6 Armando el JSON…')
  const fechas = prompts.map(p => p.fecha).sort()
  const datos: AutorretratoIA = {
    generado: new Date().toISOString(),
    periodo: { desde: fechas[0] ?? '', hasta: fechas.at(-1) ?? '' },
    actividadDiaria: actividadDiaria(prompts),
    commitsPorMes: commitsPorMes(commits.serandmoncas),
    promptsPorDominio: promptsPorDominio(prompts, reposPublicos),
    herramientas: sesiones.herramientas,
    modelos: sesiones.modelos,
    ecosistema: DECLARADO as unknown as ItemEcosistema[],
    conceptos,
    perfilPrompts: perfilPrompts(prompts),
    eras: CUENTAS.map(c => calcularEra(c, commits[c])),
    modelosPorMes: modelosPorMes(commits.serandmoncas),
    grafoCoautoria: CUENTAS.map(c => grafoCoautoria(c, commits[c])),
    grafoDiscurso: grafoDiscurso(CONTEXTO.conceptos, CONTEXTO.relaciones, prompts.map(p => p.texto)),
    contexto: CONTEXTO.datos,
    camino: { nodos, aristas: camino.aristas },
  }

  console.log('6/6 Privacidad…')
  const json = JSON.stringify(datos, null, 2)
  const personas = [...new Set(todos.filter(c => !c.esBot && !c.esSergio && !c.autorClaude).map(c => c.autor))]
  const lista = nombresPrivados({
    reposPrivados,
    dominiosPrivados: clavesDominiosPrivados(path.join(PRIVADO, 'dominios-privados.json')),
    proyectos: prompts.map(p => p.proyecto),
    reposPublicos,
    permitidos: PERMITIDOS,
  })
  const problemas = verificarPrivacidad(json, { prompts: prompts.map(p => p.texto), reposPrivados: lista, personas, permitidos: PERMITIDOS })
  if (problemas.length) {
    console.error('✗ No se escribe el JSON. Problemas de privacidad:\n' + problemas.map(p => `  - ${p}`).join('\n'))
    process.exit(1)
  }
  fs.writeFileSync(path.join(RAIZ, 'data/ia-autorretrato.json'), json + '\n')

  // Archivos de revisión (privados). No se sobrescriben si Sergio ya los editó.
  const revConceptos = path.join(PRIVADO, 'conceptos-revision.csv')
  if (!fs.existsSync(revConceptos)) fs.writeFileSync(revConceptos, revisionConceptos(conceptos))
  const revCamino = path.join(PRIVADO, 'camino-revision.csv')
  // Se genera desde el camino completo, para que Sergio vea todos los inferidos.
  if (!fs.existsSync(revCamino)) fs.writeFileSync(revCamino, revisionCamino((CAMINO as unknown as Camino).nodos))
  fs.writeFileSync(path.join(PRIVADO, 'citas-candidatas.json'), JSON.stringify(seleccionarCitas(prompts), null, 2))

  const [vieja, nueva] = datos.eras
  console.log(`✓ data/ia-autorretrato.json
  prompts: ${datos.perfilPrompts.total} · días activos: ${datos.actividadDiaria.length}
  smonsalve: ${vieja.commitsPropios} commits propios (${vieja.desde} → ${vieja.hasta}), mensaje mediano ${vieja.medianaMensaje}
  serandmoncas: ${nueva.commitsPropios} commits propios, mensaje mediano ${nueva.medianaMensaje} (${nueva.medianaMensajeSinTrailer} sin trailer)
  conceptos: ${conceptos.filter(c => c.cuadrante === 'ambos').length} ambos · ${conceptos.filter(c => c.corregido).length} corregidos
  camino: ${nodos.length} nodos · revisión ${revisado ? 'aplicada' : 'pendiente'}`)
}

main()
