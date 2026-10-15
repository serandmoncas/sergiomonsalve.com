import { describe, it, expect } from 'vitest'
import { normalizarCommit } from '../commits'
import { calcularEra, commitsPorMes, modelosPorMes, primeraFechaPorRepo } from '../agregadosGithub'

const T = 'Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>'
const c = (repo: string, fecha: string, autor: string, msg: string) =>
  normalizarCommit('serandmoncas', { repo, fecha: `${fecha}T12:00:00Z`, autor, email: '', msg })

const commits = [
  c('HER', '2026-07-01', 'Sergio Monsalve', `feat: a\n\n${T}`),
  c('HER', '2026-07-02', 'Sergio Monsalve', 'fix: b'),
  c('Bichongos', '2026-08-01', 'Sergio', `docs: c\n\n${T}`),
  c('New-Old-School', '2026-10-01', 'Claude', 'docs: d'),
  c('x', '2026-10-02', 'Vercel', 'chore: bot'),
  c('lacasona', '2026-10-03', 'Persona X', 'cambio'),
]

describe('agregados de GitHub', () => {
  it('era: propios excluye bots y personas; cuenta modelos y personas', () => {
    const e = calcularEra('serandmoncas', commits)
    expect(e.commitsPropios).toBe(4)
    expect(e.reposActivos).toBe(3)
    expect(e.desde).toBe('2026-07-01')
    expect(e.hasta).toBe('2026-10-01')
    expect(e.coautores).toEqual([{ tipo: 'persona', n: 1 }, { tipo: 'modelo', n: 1 }])
    expect(e.medianaMensajeSinTrailer).toBeLessThanOrEqual(e.medianaMensaje)
  })
  it('commits por mes con coautoría y tipo', () => {
    expect(commitsPorMes(commits)).toEqual([
      { mes: '2026-07', total: 2, coautoriaClaude: 1, porTipo: { feat: 1, fix: 1 } },
      { mes: '2026-08', total: 1, coautoriaClaude: 1, porTipo: { docs: 1 } },
      { mes: '2026-10', total: 1, coautoriaClaude: 1, porTipo: { docs: 1 } },
    ])
  })
  it('modelos por mes incluye a Claude como autor', () => {
    expect(modelosPorMes(commits)).toEqual([
      { mes: '2026-07', modelo: 'Claude Sonnet 5', commits: 1 },
      { mes: '2026-08', modelo: 'Claude Sonnet 5', commits: 1 },
      { mes: '2026-10', modelo: 'Claude (autor)', commits: 1 },
    ])
  })
  it('primera fecha por repo en minúsculas', () => {
    const m = primeraFechaPorRepo(commits)
    expect(m.get('her')).toBe('2026-07')
    expect(m.has('x')).toBe(false) // solo propios
  })
})
