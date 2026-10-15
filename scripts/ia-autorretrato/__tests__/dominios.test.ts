import { describe, it, expect, beforeEach } from 'vitest'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  dominioDe, promptsPorDominio, registrarDominios, cargarDominiosPrivados, limpiarDominiosRegistrados,
} from '../dominios'
import type { Prompt } from '../claudeCode'

const p = (proyecto: string): Prompt => ({ texto: 'x', proyecto, fecha: '2026-10-15', sesion: 's' })

beforeEach(() => limpiarDominiosRegistrados())

describe('dominios', () => {
  it('mapea sin importar mayúsculas y usa experimentos por defecto', () => {
    expect(dominioDe('Bichongos')).toBe('hongos-iot')
    expect(dominioDe('bichongos')).toBe('hongos-iot')
    expect(dominioDe('HER')).toBe('agentes')
    expect(dominioDe('Code')).toBe('experimentos')
    expect(dominioDe('desconocido')).toBe('experimentos')
  })
  it('agrupa prompts y solo lista repos públicos con la grafía de GitHub', () => {
    registrarDominios({ proyectoprivado: 'hongos-iot' })
    const r = promptsPorDominio([p('sergiomonsalve.com'), p('sergiomonsalve.com'), p('proyectoPrivado'), p('InteFin')], ['sergiomonsalve.com', 'InteFin'])
    expect(r).toEqual([
      { dominio: 'producto-web', prompts: 3, reposPublicos: ['InteFin', 'sergiomonsalve.com'] },
      { dominio: 'hongos-iot', prompts: 1, reposPublicos: [] },
    ])
  })
  it('cargarDominiosPrivados registra dominios desde un archivo', () => {
    const dir = mkdtempSync(join(tmpdir(), 'dominios-'))
    const ruta = join(dir, 'dominios-privados.json')
    writeFileSync(ruta, JSON.stringify({ ProyectoPrivado: 'hongos-iot' }))
    expect(cargarDominiosPrivados(ruta)).toBe(1)
    expect(dominioDe('proyectoprivado')).toBe('hongos-iot')
  })
  it('cargarDominiosPrivados devuelve 0 si el archivo no existe', () => {
    const dir = mkdtempSync(join(tmpdir(), 'dominios-'))
    expect(cargarDominiosPrivados(join(dir, 'no-existe.json'))).toBe(0)
  })
  it('cargarDominiosPrivados lanza con la clave si el dominio es inválido', () => {
    const dir = mkdtempSync(join(tmpdir(), 'dominios-'))
    const ruta = join(dir, 'dominios-privados.json')
    writeFileSync(ruta, JSON.stringify({ proyectoMalo: 'no-es-un-dominio' }))
    expect(() => cargarDominiosPrivados(ruta)).toThrow(/proyectoMalo/)
  })
})
