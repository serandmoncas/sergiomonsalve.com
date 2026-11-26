import { describe, it, expect } from 'vitest'
import { leerTarball } from '../tarball'
import { MemoriaFS, guardaContenido } from '../memoria'
import { CABECERA, comoStream, tarball, texto } from './ayudantes'

describe('guardaContenido', () => {
  it('notas y Tablero sí; adjuntos no', () => {
    expect(guardaContenido('Diario/2026-11-25.md')).toBe(true)
    expect(guardaContenido('Tablero/citas.json')).toBe(true)
    expect(guardaContenido('Adjuntos/foto.png')).toBe(false)
  })
})

describe('leerTarball', () => {
  it('arma notas y deja adjuntos solo como nombre', async () => {
    const fs = await leerTarball(comoStream(await tarball([
      { nombre: 'Diario/2026-11-25.md', contenido: CABECERA + 'hola' },
      { nombre: 'img.png', contenido: 'PNG' },
    ])))
    expect((await fs.list()).sort()).toEqual(['Diario/2026-11-25.md', 'img.png'])
    expect(texto(await fs.read('Diario/2026-11-25.md'))).toBe(CABECERA + 'hola')
    await expect(fs.read('img.png')).rejects.toThrow()
  })

  it('ruta larga con pax header y tildes en NFD queda en NFC', async () => {
    const larga = 'Proyectos/' + 'Subcarpeta muy larga '.repeat(8) + 'Café con Ana Prueba.md'
    const fs = await leerTarball(comoStream(await tarball([{ nombre: larga, contenido: CABECERA }])))
    const [ruta] = await fs.list()
    expect(ruta).toBe(larga.normalize('NFC'))
    expect(ruta.length).toBeGreaterThan(100)
  })

  it('ignora ../x.md, rutas absolutas, symlinks, directorios y .obsidian', async () => {
    const fs = await leerTarball(comoStream(await tarball([
      { nombre: '../fuera.md', contenido: 'x' },
      { nombre: 'a/../../fuera2.md', contenido: 'x' },
      { nombre: '/abs.md', contenido: 'x' },
      { nombre: 'enlace.md', tipo: 'symlink', enlace: '/etc/passwd' },
      { nombre: 'Carpeta/', tipo: 'directory' },
      { nombre: '.obsidian/app.json', contenido: '{}' },
      { nombre: 'bien.md', contenido: CABECERA },
    ])))
    expect(await fs.list()).toEqual(['bien.md'])
  })

  it('Tablero/citas.json se guarda', async () => {
    const fs = await leerTarball(comoStream(await tarball([{ nombre: 'Tablero/citas.json', contenido: '[]' }])))
    expect(texto(await fs.read('Tablero/citas.json'))).toBe('[]')
  })

  it('tarball corrupto rechaza', async () => {
    await expect(leerTarball(comoStream(Buffer.from('esto no es gzip')))).rejects.toThrow()
  })
})

describe('MemoriaFS', () => {
  const enc = new TextEncoder()
  const base = () => new MemoriaFS(new Map([['a.md', enc.encode('A')]]), ['x.png'])

  it('write lanza "solo lectura"', async () => {
    await expect(base().write('a.md', enc.encode('B'))).rejects.toThrow('solo lectura')
  })

  it('stat da tamaño o null', async () => {
    expect(await base().stat('a.md')).toEqual({ mtimeMs: 0, size: 1 })
    expect(await base().stat('no.md')).toBeNull()
  })

  it('aplicar no muta la instancia original', async () => {
    const a = base()
    const b = a.aplicar({ quitar: ['a.md'], poner: new Map([['b.md', enc.encode('B')]]), otros: ['y.png'] })
    expect((await a.list()).sort()).toEqual(['a.md', 'x.png'])
    expect((await b.list()).sort()).toEqual(['b.md', 'x.png', 'y.png'])
    const c = b.aplicar({ quitar: ['x.png'], poner: new Map(), otros: [] })
    expect((await c.list()).sort()).toEqual(['b.md', 'y.png'])
  })
})
