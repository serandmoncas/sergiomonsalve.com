import { describe, it, expect } from 'vitest'
import { normalizarCommit } from '../commits'
import { grafoCoautoria, grafoDiscurso } from '../red'

const c = (repo: string, fecha: string, autor: string, msg = 'x') =>
  normalizarCommit('smonsalve', { repo, fecha: `${fecha}T12:00:00Z`, autor, email: '', msg })

describe('grafo de coautoría', () => {
  const commits = [
    c('lacasona', '2013-02-19', 'Persona Real'),
    c('lacasona', '2013-02-20', 'horus'),
    c('Zpp', '2015-03-27', 'Otra Persona'),
    c('HER', '2026-07-01', 'Sergio', 'feat: a\n\nCo-Authored-By: Claude Sonnet 5 <n@a.com>'),
    c('x', '2026-07-01', 'Vercel'),
  ]
  const g = grafoCoautoria('smonsalve', commits)

  it('anonimiza personas en orden de aparición y no publica nombres', () => {
    const json = JSON.stringify(g)
    expect(json).not.toMatch(/Persona Real|Otra Persona|Vercel/)
    expect(g.nodos.filter(n => n.tipo === 'persona').map(n => n.etiqueta)).toEqual(['Persona 1', 'Persona 2'])
  })
  it('Sergio va primero y los modelos son nodos propios', () => {
    const autores = g.nodos.filter(n => n.tipo !== 'dominio')
    expect(autores[0].id).toBe('sergio')
    expect(g.nodos.some(n => n.id === 'modelo:Claude Sonnet 5')).toBe(true)
  })
  it('aristas autor→dominio con peso', () => {
    expect(g.aristas).toContainEqual({ de: 'sergio', a: 'dominio:agentes', peso: 1 })
    expect(g.aristas).toContainEqual({ de: 'persona-1', a: 'dominio:experimentos', peso: 1 })
  })
  it('layout determinista', () => {
    expect(grafoCoautoria('smonsalve', [...commits].reverse())).toEqual(g)
    for (const n of g.nodos) expect(n.x).toBe(n.tipo === 'dominio' ? 0.72 : 0.32)
  })
})

describe('grafo del discurso', () => {
  it('resalta conceptos presentes en los prompts y ubica en círculo', () => {
    const g = grafoDiscurso(
      [
        { id: 'vibe-coding', etiqueta: 'vibe coding', etiquetaEn: 'vibe coding', variantes: ['vibe coding'] },
        { id: 'deuda-tecnica', etiqueta: 'deuda técnica', etiquetaEn: 'technical debt', variantes: ['deuda tecnica'] },
      ],
      [{ de: 'vibe-coding', a: 'deuda-tecnica', motivo: 'x' }],
      ['Esto huele a Deuda Técnica'],
    )
    expect(g.nodos.map(n => n.resaltado)).toEqual([false, true])
    expect(g.nodos[0]).toMatchObject({ x: 0.5, y: 0.12 })
    expect(g.aristas).toHaveLength(1)
  })
})
