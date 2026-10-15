import { describe, it, expect } from 'vitest'
import { nombresPrivados, verificarPrivacidad } from '../privacidad'

const prompt = 'arma un análisis de mis commits del proyecto con el cliente y compáralo con la propuesta privada'
const lista = { prompts: [prompt, 'corto'], reposPrivados: ['repo-secreto', 'PROY-X'], personas: ['Persona Real', 'estudiante'], permitidos: ['estudiante'] }

describe('privacidad', () => {
  it('JSON limpio pasa', () => {
    expect(verificarPrivacidad(JSON.stringify({ dominio: 'hongos-iot', repos: ['repo-secreto-backend-publico'] }), { ...lista, reposPrivados: ['PROY-X'] })).toEqual([])
  })
  it('rechaza un prompt literal', () => {
    expect(verificarPrivacidad(JSON.stringify({ x: prompt }), lista)).toEqual([expect.stringMatching(/prompt literal/)])
  })
  it('rechaza un repo privado como palabra completa, sin importar mayúsculas', () => {
    expect(verificarPrivacidad('{"repo":"Repo-Secreto"}', lista)).toEqual(['nombre privado: repo-secreto'])
    expect(verificarPrivacidad('{"repo":"repo-secreto-mobile"}', lista)).toEqual([])
  })
  it('un guion ANTES del nombre no lo oculta, pero un sufijo -mobile sí es otro nombre', () => {
    expect(verificarPrivacidad('{"repo":"x-proy-x"}', lista)).toEqual(['nombre privado: PROY-X'])
    expect(verificarPrivacidad('{"repo":"proy-x-mobile"}', lista)).toEqual([])
  })
  it('rechaza personas reales, salvo palabras permitidas', () => {
    expect(verificarPrivacidad('{"n":"Persona Real"}', lista)).toEqual(['nombre privado: Persona Real'])
    expect(verificarPrivacidad('{"n":"estudiante"}', lista)).toEqual([])
  })
  it('rechaza correos y rutas absolutas', () => {
    expect(verificarPrivacidad('{"a":"x@y.co","b":"/Users/sergio/x"}', lista)).toEqual(['correo electrónico', 'ruta absoluta /Users/'])
  })
  it('sirve para un MDX: un repo privado pegado en una cita se detecta', () => {
    expect(verificarPrivacidad('> "revisa PROY-X antes del viernes"', { ...lista, prompts: [] })).toEqual(['nombre privado: PROY-X'])
  })
})

const base = 'alfa bravo charlie delta echo foxtrot golf hotel india juliet kilo lima mike november oscar papa quebec romeo sierra tango uniform victor whisky xray yankee zulu'
const prompt100 = base.slice(0, 100)
const listaLimpia = { prompts: [] as string[], reposPrivados: ['repo-secreto', 'PROY-X'], personas: ['Persona Real'], permitidos: [] as string[] }

describe('privacidad: fallos corregidos', () => {
  it('1. detecta nombres seguidos de puntuación o sufijos de ruta', () => {
    expect(verificarPrivacidad('en repo-secreto. revisar', listaLimpia)).toEqual(['nombre privado: repo-secreto'])
    expect(verificarPrivacidad('(PROY-X)', listaLimpia)).toEqual(['nombre privado: PROY-X'])
    expect(verificarPrivacidad('repo-secreto.git', listaLimpia)).toEqual(['nombre privado: repo-secreto'])
    expect(verificarPrivacidad('serandmoncas/repo-secreto.git', listaLimpia)).toEqual(['nombre privado: repo-secreto'])
    expect(verificarPrivacidad('repo-secreto_v2', listaLimpia)).toEqual(['nombre privado: repo-secreto'])
  })
  it('1. no detecta continuaciones con guion', () => {
    expect(verificarPrivacidad('repo-secreto-mobile', listaLimpia)).toEqual([])
    expect(verificarPrivacidad('repo-secreto-backend-publico', listaLimpia)).toEqual([])
  })

  it('2. detecta un prompt cuya ventana central aparece en el texto', () => {
    const texto = `{"x":"${prompt100.slice(50, 96)}"}`
    expect(verificarPrivacidad(texto, { ...listaLimpia, prompts: [prompt100] })).toEqual(['prompt literal (#0)'])
  })
  it('2. una superposición de 39 caracteres no se detecta', () => {
    const texto = `{"x":"${prompt100.slice(20, 59)}"}`
    expect(verificarPrivacidad(texto, { ...listaLimpia, prompts: [prompt100] })).toEqual([])
  })

  it('3. nombres partidos por salto de línea o doble espacio se detectan', () => {
    expect(verificarPrivacidad('Persona\nReal', listaLimpia)).toEqual(['nombre privado: Persona Real'])
    expect(verificarPrivacidad('Persona  Real', listaLimpia)).toEqual(['nombre privado: Persona Real'])
  })
  it('3. un prompt con salto de línea aparece en el texto con espacio', () => {
    const conSalto = prompt100.slice(0, 50) + '\n' + prompt100.slice(50)
    const texto = prompt100.slice(0, 50) + ' ' + prompt100.slice(50)
    expect(verificarPrivacidad(texto, { ...listaLimpia, prompts: [conSalto] })).toEqual(['prompt literal (#0)'])
  })

  it('4. el mensaje indica el índice del prompt y no repite su texto', () => {
    const problemas = verificarPrivacidad(JSON.stringify({ x: prompt100 }), { ...listaLimpia, prompts: ['corto', prompt100] })
    expect(problemas).toEqual(['prompt literal (#1)'])
    expect(problemas[0]).not.toContain('alfa')
  })

  it('5. nombres con tildes coinciden sin tildes y al revés', () => {
    expect(verificarPrivacidad('{"n":"Jose Perez"}', { ...listaLimpia, personas: ['José Pérez'] })).toEqual(['nombre privado: José Pérez'])
    expect(verificarPrivacidad('{"n":"José Pérez"}', { ...listaLimpia, personas: ['Jose Perez'] })).toEqual(['nombre privado: Jose Perez'])
  })
})

describe('nombresPrivados', () => {
  it('une repos privados, claves de dominios y proyectos locales; excluye públicos y permitidos', () => {
    const r = nombresPrivados({
      reposPrivados: ['Secreto'],
      dominiosPrivados: ['otro-privado', 'cerebro'],
      proyectos: ['sitio-publico', 'SECRETO', 'solo-local', ''],
      reposPublicos: ['Sitio-Publico'],
      permitidos: ['cerebro'],
    })
    expect(r).toEqual(['Secreto', 'otro-privado', 'solo-local'])
  })
})
