import type { AutorretratoIA, Cuenta, Era } from '@/lib/ia-autorretrato/tipos'
import { esPropio, tieneIA, type CommitNormalizado } from './commits'
import { mediana } from './util'

export function calcularEra(cuenta: Cuenta, commits: CommitNormalizado[]): Era {
  const propios = commits.filter(esPropio)
  const fechas = propios.map(c => c.fecha).sort()
  const personas = new Set(commits.filter(c => !c.esBot && !c.esSergio && !c.autorClaude).map(c => c.autor))
  const modelos = new Set(commits.flatMap(c => c.modelos))
  return {
    cuenta,
    desde: fechas[0] ?? '',
    hasta: fechas.at(-1) ?? '',
    commitsPropios: propios.length,
    reposActivos: new Set(propios.map(c => c.repo)).size,
    medianaMensaje: mediana(propios.map(c => c.largoMensaje)),
    medianaMensajeSinTrailer: mediana(propios.map(c => c.largoSinTrailer)),
    coautores: [{ tipo: 'persona', n: personas.size }, { tipo: 'modelo', n: modelos.size }],
  }
}

export function commitsPorMes(commits: CommitNormalizado[]): AutorretratoIA['commitsPorMes'] {
  const meses = new Map<string, AutorretratoIA['commitsPorMes'][number]>()
  for (const c of commits.filter(esPropio)) {
    const m = meses.get(c.mes) ?? { mes: c.mes, total: 0, coautoriaClaude: 0, porTipo: {} }
    m.total++
    if (tieneIA(c)) m.coautoriaClaude++
    m.porTipo[c.tipo] = (m.porTipo[c.tipo] ?? 0) + 1
    meses.set(c.mes, m)
  }
  return [...meses.values()].sort((a, b) => a.mes.localeCompare(b.mes))
}

export function modelosPorMes(commits: CommitNormalizado[]): AutorretratoIA['modelosPorMes'] {
  const cuenta = new Map<string, number>()
  for (const c of commits.filter(esPropio)) {
    const modelos = c.modelos.length ? c.modelos : c.autorClaude ? ['Claude (autor)'] : []
    for (const m of modelos) cuenta.set(`${c.mes}|${m}`, (cuenta.get(`${c.mes}|${m}`) ?? 0) + 1)
  }
  return [...cuenta.entries()]
    .map(([k, commits]) => { const [mes, modelo] = k.split('|'); return { mes, modelo, commits } })
    .sort((a, b) => a.mes.localeCompare(b.mes) || a.modelo.localeCompare(b.modelo))
}

export function primeraFechaPorRepo(commits: CommitNormalizado[]): Map<string, string> {
  const primera = new Map<string, string>()
  for (const c of commits.filter(esPropio)) {
    const clave = c.repo.toLowerCase()
    const actual = primera.get(clave)
    if (!actual || c.mes < actual) primera.set(clave, c.mes)
  }
  return primera
}
