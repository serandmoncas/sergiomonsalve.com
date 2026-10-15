import { describe, it, expect } from 'vitest'
import { esBot, esSergio, normalizarModelo } from '../identidades'
import { coautores, esPropio, filtrarCommits, normalizarCommit, sinTrailer, tieneIA, tipoDe } from '../commits'

const msg = 'feat(blog): nuevo post\n\nCuerpo.\n\nCo-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>'

describe('identidades', () => {
  it('reconoce a Sergio, incluido horus', () => {
    for (const a of ['Sergio Monsalve', 'Sergio', 'Sergio Monsalve at x230', 'horus', 'serandmoncas']) expect(esSergio(a)).toBe(true)
    expect(esSergio('Persona X')).toBe(false)
  })
  it('reconoce bots', () => {
    expect(esBot('Vercel')).toBe(true)
    expect(esBot('dependabot[bot]')).toBe(true)
    expect(esBot('Sergio')).toBe(false)
  })
  it('normaliza el nombre del modelo', () => {
    expect(normalizarModelo('Claude Opus 5 (1M context)')).toBe('Claude Opus 5')
    expect(normalizarModelo('Claude Haiku 4.5 (200k)')).toBe('Claude Haiku 4.5')
  })
})

describe('commits', () => {
  it('extrae coautores, tipo y mensaje sin trailer', () => {
    expect(coautores(msg)).toEqual(['Claude Opus 5 (1M context)'])
    expect(tipoDe(msg)).toBe('feat')
    expect(tipoDe('fix!: algo')).toBe('fix')
    expect(tipoDe('cambios varios')).toBe('otro')
    expect(tipoDe('miproyecto: algo')).toBe('otro')
    expect(tipoDe('cultivo: x')).toBe('cultivo')
    expect(tipoDe('capacitacion(lab): x')).toBe('capacitacion')
    expect(tipoDe('miproyecto: x')).toBe('otro')
    expect(sinTrailer(msg)).toBe('feat(blog): nuevo post\n\nCuerpo.')
  })
  it('normaliza un commit co-firmado', () => {
    const c = normalizarCommit('serandmoncas', { repo: 'HER', fecha: '2026-10-15T03:00:00Z', autor: 'Sergio Monsalve', email: 'x@y.z', msg })
    expect(c).toMatchObject({ fecha: '2026-10-14', mes: '2026-10', esSergio: true, autorClaude: false, modelos: ['Claude Opus 5'], tipo: 'feat' })
    expect(c.largoSinTrailer).toBeLessThan(c.largoMensaje)
    expect(tieneIA(c)).toBe(true)
    expect(esPropio(c)).toBe(true)
  })
  it('Claude como autor principal cuenta como IA y como propio', () => {
    const c = normalizarCommit('serandmoncas', { repo: 'New-Old-School', fecha: '2026-10-01T12:00:00Z', autor: 'Claude', email: '', msg: 'docs: x' })
    expect(c.autorClaude).toBe(true)
    expect(tieneIA(c)).toBe(true)
    expect(esPropio(c)).toBe(true)
  })
  it('excluye repos con historial ajeno en smonsalve', () => {
    const crudos = ['lacasona-errbit', 'leclub', 'lacasona'].map(repo => ({ repo, fecha: '2013-05-05T00:00:00Z', autor: 'horus', email: '', msg: 'x' }))
    expect(filtrarCommits('smonsalve', crudos).map(c => c.repo)).toEqual(['lacasona'])
  })
})
