import { describe, it, expect } from 'vitest'
import { aCsv, deCsv } from '../csv'
import { clasificarConceptos, contiene, leerCorrecciones, revisionConceptos, variantes } from '../conceptos'

const glosario = [
  { slug: 'rag', termino: 'Retrieval-Augmented Generation (RAG)', categoria: 'contexto-memoria' },
  { slug: 'contexto', termino: 'Contexto', categoria: 'contexto-memoria' },
  { slug: 'mcp', termino: 'MCP', categoria: 'operacion-evaluacion' },
  { slug: 'fine-tuning', termino: 'Fine-tuning', categoria: 'fundamentos' },
]

describe('csv', () => {
  it('ida y vuelta con comas y comillas', () => {
    const filas = [['a', 'b,c', 'd "e"'], ['1', '2', '3']]
    expect(deCsv(aCsv(filas))).toEqual(filas)
  })
})

describe('conceptos', () => {
  it('variantes incluyen la sigla entre paréntesis y sinónimos', () => {
    expect(variantes('Retrieval-Augmented Generation (RAG)')).toEqual(expect.arrayContaining(['retrieval-augmented generation', 'rag']))
    expect(variantes('MCP')).toContain('model context protocol')
  })
  it('coincidencia por palabra completa: contexto no está en contextos', () => {
    expect(contiene('usa el contexto', 'contexto')).toBe(true)
    expect(contiene('los contextos largos', 'contexto')).toBe(false)
    expect(contiene('el rag-pipeline', 'rag')).toBe(true)
  })
  it('clasifica: hablado, preguntado, construido y cuadrante', () => {
    const prompts = ['¿Qué es MCP?', 'Agrega RAG al buscador. Usa el contexto del glosario.', 'explícame qué es fine-tuning']
    const r = Object.fromEntries(clasificarConceptos(glosario, prompts, 'next pgvector supabase').map(c => [c.slug, c]))
    expect(r.rag).toMatchObject({ hablado: 1, preguntado: 0, construido: true, cuadrante: 'ambos' })
    expect(r.contexto).toMatchObject({ hablado: 1, construido: false, cuadrante: 'solo-hablado' })
    expect(r.mcp).toMatchObject({ hablado: 0, preguntado: 1, cuadrante: 'ninguno' })
    expect(r['fine-tuning']).toMatchObject({ hablado: 0, preguntado: 1 })
  })
  it('las correcciones de Sergio mandan y quedan marcadas', () => {
    const csv = revisionConceptos(clasificarConceptos(glosario, [], ''))
    const filas = deCsv(csv)
    expect(filas[0]).toEqual(['slug', 'termino', 'categoria', 'hablado', 'preguntado', 'construido', 'cuadrante', 'correccion'])
    filas[3][7] = 'ambos' // mcp
    const correcciones = leerCorrecciones(aCsv(filas))
    expect(correcciones.get('mcp')).toBe('ambos')
    const mcp = clasificarConceptos(glosario, [], '', correcciones).find(c => c.slug === 'mcp')!
    expect(mcp).toMatchObject({ cuadrante: 'ambos', corregido: true })
  })
  it('una corrección inválida falla con el slug', () => {
    expect(() => leerCorrecciones('slug,termino,categoria,hablado,preguntado,construido,cuadrante,correccion\nmcp,MCP,x,0,0,false,ninguno,quizas\n')).toThrow(/mcp/)
  })
})

const CABECERA_CSV = 'slug,termino,categoria,hablado,preguntado,construido,cuadrante,correccion'

describe('lectura de revisión editada en hoja de cálculo', () => {
  it('lee un CSV con BOM UTF-8 al inicio', () => {
    const csv = `﻿${CABECERA_CSV}\nmcp,MCP,x,0,0,false,ninguno,ambos\n`
    expect(leerCorrecciones(csv).get('mcp')).toBe('ambos')
  })
  it('lee un CSV con punto y coma como separador', () => {
    const csv = 'slug;termino;categoria;hablado;preguntado;construido;cuadrante;correccion\nmcp;MCP;x;0;0;false;ninguno;ambos\n'
    expect(leerCorrecciones(csv).get('mcp')).toBe('ambos')
  })
  it('sin columna slug o correccion lanza error claro', () => {
    const msg = 'CSV de revisión sin columna "slug"/"correccion"'
    expect(() => leerCorrecciones('termino,cuadrante\nMCP,ninguno\n')).toThrow(msg)
    expect(() => leerCorrecciones('slug,termino\nmcp,MCP\n')).toThrow(msg)
    expect(() => leerCorrecciones('')).toThrow(msg)
  })
  it('slug desconocido lanza error con el slug si se pasan slugsValidos', () => {
    const csv = `${CABECERA_CSV}\nfantasma,X,x,0,0,false,ninguno,ambos\n`
    expect(() => leerCorrecciones(csv, new Set(['mcp']))).toThrow(/fantasma/)
    expect(leerCorrecciones(csv, new Set(['fantasma'])).get('fantasma')).toBe('ambos')
    expect(leerCorrecciones(csv).get('fantasma')).toBe('ambos')
  })
  it('aCsv/deCsv ida y vuelta con salto de línea dentro de una celda', () => {
    const filas = [['a', 'línea 1\nlínea 2', 'x'], ['1', '', '3']]
    expect(deCsv(aCsv(filas))).toEqual(filas)
  })
})

describe('interrogativos con límites de palabra', () => {
  it('"porque estamos" no cuenta como pregunta', () => {
    const r = Object.fromEntries(clasificarConceptos(glosario, ['Agrega RAG porque estamos migrando'], '').map(c => [c.slug, c]))
    expect(r.rag).toMatchObject({ hablado: 1, preguntado: 0 })
  })
  it('"porque sonó" no cuenta como pregunta', () => {
    const r = Object.fromEntries(clasificarConceptos(glosario, ['Agrega RAG porque sonó bien'], '').map(c => [c.slug, c]))
    expect(r.rag).toMatchObject({ hablado: 1, preguntado: 0 })
  })
  it('"qué es RAG" sigue siendo pregunta', () => {
    const r = Object.fromEntries(clasificarConceptos(glosario, ['qué es RAG'], '').map(c => [c.slug, c]))
    expect(r.rag).toMatchObject({ hablado: 0, preguntado: 1 })
  })
})
