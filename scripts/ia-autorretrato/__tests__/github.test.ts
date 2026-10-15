import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { descargarCommits, descargarCuenta, descargarManifiestos, listarRepos } from '../github'

const pagina = (n: number) => JSON.stringify([{ commit: { author: { date: `2026-0${n}-01T12:00:00Z`, name: 'Sergio', email: 's@x.y' }, message: `m${n}` } }])

describe('github', () => {
  it('lee páginas concatenadas de commits', () => {
    const run = () => pagina(1) + pagina(2)
    const cs = descargarCommits('serandmoncas', 'HER', run)
    expect(cs.map(c => c.msg)).toEqual(['m1', 'm2'])
    expect(cs[0]).toMatchObject({ repo: 'HER', autor: 'Sergio' })
  })
  it('un repo vacío (gh falla con 409) devuelve lista vacía', () => {
    const run = () => { throw new Error('HTTP 409: Git Repository is empty.') }
    expect(descargarCommits('smonsalve', 'vacio', run)).toEqual([])
  })
  it('un error de autenticación en commits se propaga', () => {
    const run = () => { throw new Error('HTTP 401: Bad credentials') }
    expect(() => descargarCommits('smonsalve', 'x', run)).toThrow('HTTP 401: Bad credentials')
  })
  it('ignora objetos que no son commits', () => {
    const run = () => '{"message":"Git Repository is empty."}' + pagina(3)
    expect(descargarCommits('smonsalve', 'x', run)).toHaveLength(1)
  })
  it('lista repos con privacidad y lenguaje', () => {
    const run = () => JSON.stringify([{ name: 'HER', isPrivate: false, primaryLanguage: { name: 'Python' } }, { name: 'repo-secreto', isPrivate: true, primaryLanguage: null }])
    expect(listarRepos('serandmoncas', run)).toEqual([
      { nombre: 'HER', privado: false, lenguaje: 'Python' },
      { nombre: 'repo-secreto', privado: true, lenguaje: null },
    ])
  })
  it('decodifica manifiestos en base64 y omite los que no existen', () => {
    const run = (args: string[]) => {
      if (args[1].endsWith('package.json')) return Buffer.from('{"dependencies":{"next":"16"}}').toString('base64') + '\n'
      throw new Error('404')
    }
    expect(descargarManifiestos('serandmoncas', 'x', run)).toEqual(['{"dependencies":{"next":"16"}}'])
  })
  it('un error de autenticación en manifiestos se propaga', () => {
    const run = () => { throw new Error('HTTP 403: API rate limit exceeded') }
    expect(() => descargarManifiestos('serandmoncas', 'x', run)).toThrow('HTTP 403')
  })
})

describe('descargarCuenta', () => {
  let dir: string
  let log: ReturnType<typeof vi.spyOn>

  // Fake gh: un repo con commits y package.json; el resto de manifiestos no existen.
  const fakeRun = vi.fn((args: string[]) => {
    if (args[0] === 'repo') return JSON.stringify([{ name: 'HER', isPrivate: false, primaryLanguage: { name: 'Python' } }])
    if (args[1].includes('/commits')) return pagina(1)
    if (args[1].endsWith('package.json')) return Buffer.from('{"name":"x"}').toString('base64') + '\n'
    throw new Error('HTTP 404: Not Found')
  })

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'autorretrato-'))
    log = vi.spyOn(console, 'log').mockImplementation(() => {})
    fakeRun.mockClear()
  })
  afterEach(() => {
    log.mockRestore()
    fs.rmSync(dir, { recursive: true, force: true })
  })

  it('cache miss descarga, escribe github-<cuenta>.json y devuelve todo', () => {
    const d = descargarCuenta('serandmoncas', dir, false, fakeRun)
    expect(fakeRun).toHaveBeenCalled()
    expect(d.repos).toEqual([{ nombre: 'HER', privado: false, lenguaje: 'Python' }])
    expect(d.commits.map(c => c.msg)).toEqual(['m1'])
    expect(d.manifiestos).toEqual({ HER: ['{"name":"x"}'] })
    expect(JSON.parse(fs.readFileSync(path.join(dir, 'github-serandmoncas.json'), 'utf8'))).toEqual(d)
    expect(fs.existsSync(path.join(dir, 'github-serandmoncas.json.tmp'))).toBe(false)
  })

  it('segunda llamada sin refrescar lee la caché y no invoca al ejecutor', () => {
    const primera = descargarCuenta('serandmoncas', dir, false, fakeRun)
    fakeRun.mockClear()
    const segunda = descargarCuenta('serandmoncas', dir, false, fakeRun)
    expect(fakeRun).not.toHaveBeenCalled()
    expect(segunda).toEqual(primera)
  })

  it('refrescar=true vuelve a invocar al ejecutor', () => {
    descargarCuenta('serandmoncas', dir, false, fakeRun)
    fakeRun.mockClear()
    descargarCuenta('serandmoncas', dir, true, fakeRun)
    expect(fakeRun).toHaveBeenCalled()
  })

  it('crea un dirCache anidado que no existe', () => {
    const anidado = path.join(dir, 'a', 'b', 'c')
    descargarCuenta('serandmoncas', anidado, false, fakeRun)
    expect(fs.existsSync(path.join(anidado, 'github-serandmoncas.json'))).toBe(true)
  })

  it('un error de autenticación aborta sin escribir caché', () => {
    const roto = vi.fn((args: string[]) => {
      if (args[0] === 'repo') return JSON.stringify([{ name: 'HER', isPrivate: false, primaryLanguage: null }])
      throw new Error('HTTP 401: Bad credentials')
    })
    expect(() => descargarCuenta('serandmoncas', dir, false, roto)).toThrow('HTTP 401')
    expect(fs.existsSync(path.join(dir, 'github-serandmoncas.json'))).toBe(false)
  })
})
