import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { clavesDominiosPrivados } from '../../../../scripts/ia-autorretrato/dominios'
import { PERMITIDOS } from '../../../../scripts/ia-autorretrato/identidades'
import { verificarPrivacidad } from '../../../../scripts/ia-autorretrato/privacidad'
import { DATOS } from '../datos'

const texto = JSON.stringify(DATOS)
// Los nombres privados no se escriben en el repo: salen del archivo local (git-ignored), si existe.
const RUTA_PRIVADOS = path.join(process.cwd(), '.ia-autorretrato/dominios-privados.json')
const privados = clavesDominiosPrivados(RUTA_PRIVADOS)

describe('datos publicados (data/ia-autorretrato.json)', () => {
  it('no contiene correos ni rutas locales', () => {
    expect(texto).not.toMatch(/[\w.+-]+@[\w-]+\.[a-z]{2,}/i)
    expect(texto).not.toContain('/Users/')
  })
  it('las personas están anonimizadas como "Persona N"', () => {
    const personas = DATOS.grafoCoautoria.flatMap(g => g.nodos).filter(n => n.tipo === 'persona')
    for (const n of personas) expect(n.etiqueta).toMatch(/^Persona \d+$/)
  })
  it('los nodos de modelo son "Claude …"', () => {
    const modelos = DATOS.grafoCoautoria.flatMap(g => g.nodos).filter(n => n.tipo === 'modelo')
    for (const n of modelos) expect(n.etiqueta).toMatch(/^Claude /)
  })
  it('las URLs del contexto son https', () => {
    const urls = JSON.stringify(DATOS.contexto).match(/https?:\/\/[^"\s]+/g) ?? []
    for (const u of urls) expect(u.startsWith('https://')).toBe(true)
  })
  it.skipIf(!fs.existsSync(RUTA_PRIVADOS))('no aparece ningún nombre de proyecto privado (lista local)', () => {
    expect(verificarPrivacidad(texto, { prompts: [], reposPrivados: privados, personas: [], permitidos: PERMITIDOS })).toEqual([])
  })
})
