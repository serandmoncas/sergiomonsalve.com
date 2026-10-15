import { describe, it, expect } from 'vitest'
import es from '@/messages/es.json'
import en from '@/messages/en.json'
import { buildPlan, buildMapPrompt, buildTutorPrompt, fill, type MapaData, type PlanCopy } from '../plan'

const esCopy = es.mapa.plan as PlanCopy
const enCopy = en.mapa.plan as PlanCopy
const example = es.mapa.example as MapaData

const empty: MapaData = {
  skill: '', outcome: '', why: '', hours: '3', project: '', firstStep: '', weak: '',
  drill: '', recall: '', feedback: '', reviewDay: 'Viernes', pieces: [{ text: '', key: false }]
}

describe('fill', () => {
  it('replaces every placeholder and leaves unknown ones', () => {
    expect(fill('{a} y {a} con {b} {c}', { a: 'x', b: 'y' })).toBe('x y x con y {c}')
  })
})

describe('buildPlan', () => {
  it('builds the full plan from the example', () => {
    const plan = buildPlan(example, esCopy)
    expect(plan).toContain('PLAN MAPA · 30 DÍAS')
    expect(plan).toContain('Habilidad: SQL para analizar ventas')
    expect(plan).toContain('Tiempo: 3 h/semana · revisión cada viernes')
    expect(plan).toContain('  ★ JOIN entre tablas')
    expect(plan).toContain('  Después: Subconsultas, Funciones de fecha, Índices y rendimiento')
    expect(plan).toContain('    · ¿Qué hace GROUP BY con los NULL?')
    expect(plan).toContain('  1 · SELECT, WHERE y ORDER BY + primera versión del proyecto')
    expect(plan).toContain('  3 · GROUP BY y agregaciones + integrar todo en el proyecto')
  })

  it('uses placeholders when fields are empty', () => {
    const plan = buildPlan(empty, esCopy)
    expect(plan).toContain('Habilidad: [tu habilidad]')
    expect(plan).toContain('  ★ [marca tus 3 piezas clave]')
    expect(plan).toContain('  1 · pieza clave 1 + primera versión del proyecto')
    expect(plan).not.toContain('Por qué ahora')
    expect(plan).not.toContain('Después:')
  })

  it('reuses the last key piece when fewer than three are starred', () => {
    const plan = buildPlan({ ...empty, pieces: [{ text: 'JOIN', key: true }] }, esCopy)
    expect(plan).toContain('  2 · JOIN + práctica del punto débil')
    expect(plan).toContain('  3 · JOIN + integrar todo en el proyecto')
  })

  it('ignores starred pieces with empty text', () => {
    const plan = buildPlan({ ...empty, pieces: [{ text: '  ', key: true }] }, esCopy)
    expect(plan).toContain('[marca tus 3 piezas clave]')
  })

  it('works in English', () => {
    const plan = buildPlan({ ...(en.mapa.example as MapaData) }, enCopy)
    expect(plan).toContain('MAPA PLAN · 30 DAYS')
    expect(plan).toContain('review every friday')
  })
})

describe('prompts', () => {
  it('fills the map prompt with skill, outcome and hours', () => {
    const prompt = buildMapPrompt(example, esCopy)
    expect(prompt).toContain('experto en SQL para analizar ventas')
    expect(prompt).toContain('Tengo 3 horas por semana')
  })

  it('lists key pieces as tutor topics, or a fallback', () => {
    expect(buildTutorPrompt(example, esCopy)).toContain('sobre SELECT, WHERE y ORDER BY, JOIN entre tablas, GROUP BY y agregaciones,')
    expect(buildTutorPrompt(empty, esCopy)).toContain('sobre lo que estoy aprendiendo,')
  })
})
