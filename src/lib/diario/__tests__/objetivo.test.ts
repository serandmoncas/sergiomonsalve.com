import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createHash } from 'node:crypto'
import { CABECERA, bovedaDePrueba } from './ayudantes'

vi.mock('server-only', () => ({}))

// Un GitHub falso en memoria: cada commit guarda todos los archivos.
type Commit = { sha: string; padre: string | null; mensaje: string; autor: string; archivos: Map<string, string> }
const gh = vi.hoisted(() => ({ commits: [] as unknown[], guardados: 0, fallar: null as string | null }))
const blobSha = (t: string) => createHash('sha1').update(t).digest('hex').slice(0, 8)
const commits = () => gh.commits as Commit[]
const ultimo = () => commits().at(-1)!

function commitear(mensaje: string, autor: string, cambios: Record<string, string>) {
  const archivos = new Map(ultimo()?.archivos ?? [])
  for (const [r, t] of Object.entries(cambios)) archivos.set(r, t)
  const c = { sha: `c${commits().length}`, padre: ultimo()?.sha ?? null, mensaje, autor, archivos }
  commits().push(c)
  return c
}

vi.mock('../github', async importOriginal => {
  const real = await importOriginal<typeof import('../github')>()
  return {
    ...real,
    leerArchivo: vi.fn(async (ruta: string, ref = 'main') => {
      await Promise.resolve()
      const c = ref === 'main' ? ultimo() : commits().find(x => x.sha === ref)
      const texto = c?.archivos.get(ruta)
      if (texto === undefined) throw new real.ErrorGithub('github-404')
      return { texto, sha: blobSha(texto) }
    }),
    guardarArchivo: vi.fn(async (ruta: string, texto: string, sha: string, mensaje: string) => {
      await Promise.resolve()
      if (gh.fallar) throw new real.ErrorGithub(gh.fallar)
      const actual = ultimo().archivos.get(ruta)
      if (actual === undefined || blobSha(actual) !== sha) throw new real.ErrorGithub('github-409')
      gh.guardados++
      const c = commitear(mensaje, 'DiarIA web', { [ruta]: texto })
      return { commit: c.sha, padre: c.padre!, bytes: new TextEncoder().encode(texto) }
    }),
    ultimoCommit: vi.fn(async (ruta: string) => {
      for (let i = commits().length - 1; i >= 0; i--) {
        const c = commits()[i]
        const antes = i > 0 ? commits()[i - 1].archivos.get(ruta) : undefined
        if (c.archivos.get(ruta) !== antes) return { sha: c.sha, padre: c.padre, mensaje: c.mensaje, autor: c.autor }
      }
      return null
    }),
  }
})

const estado = vi.hoisted(() => ({ boveda: null as unknown }))
vi.mock('../boveda', async importOriginal => {
  const real = await importOriginal<typeof import('../boveda')>()
  return {
    ...real,
    obtenerBoveda: vi.fn(async () => ({ ok: true, boveda: estado.boveda })),
    anotarEscritura: vi.fn(async () => {}),
  }
})

import { ejecutarAccion, objetivosActivos } from '../objetivo'
import { anotarEscritura } from '../boveda'

const HOY = '2026-12-03'
const NOTA = (estadoObj: string) =>
  `${CABECERA}---\nestado: ${estadoObj}\ninicio: 2026-12-01\nmeta_diaria: 1\n---\n# Plantar árboles\n`
const CONTACTOS = `${CABECERA}---\nkanban-plugin: basic\n---\n\n## Por contactar\n\n- [ ] Vivero Inventado\n\n## Contactado\n\n## Respondió\n`
const RUTA = 'Tablero/Objetivos/Plantar árboles - contactos.md'
const MARCA = 'DiarIA-accion: objetivo'

const NOTAS = {
  'Tablero/Objetivos/Plantar árboles.md': NOTA('activo'),
  [RUTA]: CONTACTOS,
  'Tablero/Objetivos/Pausado.md': NOTA('pausado'),
  'Tablero/Objetivos/Pausado - contactos.md': CONTACTOS,
  'Tablero/Objetivos/Sin tablero.md': NOTA('activo'),
  'Tablero/Objetivos/Plantar árboles (conflicto 2026-12-01 10-00).md': NOTA('activo'),
  'Tablero/Objetivos/Plantar árboles (conflicto 2026-12-01 10-00) - contactos.md': CONTACTOS,
}

let id = ''
beforeEach(async () => {
  gh.commits = []
  gh.guardados = 0
  gh.fallar = null
  commitear('espejo: inicial', 'Sergio', { [RUTA]: CONTACTOS })
  estado.boveda = await bovedaDePrueba(NOTAS)
  const lista = objetivosActivos(estado.boveda as never)
  id = lista[0].id
  vi.clearAllMocks()
})

const archivo = () => ultimo().archivos.get(RUTA)!

describe('acciones del objetivo (DI-087)', () => {
  it('objetivosActivos ignora pausados, sin contactos y copias de conflicto', () => {
    const lista = objetivosActivos(estado.boveda as never)
    expect(lista.map(o => o.nombre)).toEqual(['Plantar árboles'])
    expect(lista[0].rutaContactos).toBe(RUTA)
    expect(lista[0].id).toMatch(/^[0-9a-f]{20}$/)
  })

  it('un id que no es de un objetivo activo da error y no llama a GitHub', async () => {
    const r = await ejecutarAccion('0123456789abcdef0123', { tipo: 'contacto', nombre: 'X' }, HOY)
    expect(r).toMatchObject({ ok: false, estado: 400 })
    expect(gh.guardados).toBe(0)
  })

  it("agregar contacto guarda con el mensaje 'objetivo: contacto agregado' y la marca", async () => {
    const r = await ejecutarAccion(id, { tipo: 'contacto', nombre: 'Huerta Prueba', canal: 'correo' }, HOY)
    expect(r).toEqual({ ok: true })
    expect(archivo()).toContain('- [ ] Huerta Prueba · correo (Contactado 2026-12-03)')
    expect(ultimo().mensaje).toBe(`objetivo: contacto agregado\n\n${MARCA}`)
    expect(ultimo().mensaje).not.toContain('Huerta')
  })

  it('mover deja la tarjeta en la columna con el evento y un mensaje sin nombres', async () => {
    const r = await ejecutarAccion(id, { tipo: 'mover', texto: 'Vivero Inventado', a: 'Respondió' }, HOY)
    expect(r).toEqual({ ok: true })
    expect(archivo()).toContain('- [ ] Vivero Inventado (Respondió 2026-12-03)')
    expect(ultimo().mensaje).toBe(`objetivo: tarjeta movida a Respondió\n\n${MARCA}`)
  })

  it("con sha viejo relee y repite; a la tercera se rinde con 'no se pudo guardar; intenta otra vez'", async () => {
    gh.fallar = 'github-409'
    const r = await ejecutarAccion(id, { tipo: 'contacto', nombre: 'X' }, HOY)
    expect(r).toEqual({ ok: false, estado: 409, error: 'no se pudo guardar; intenta otra vez' })
    const { guardarArchivo } = await import('../github')
    expect(vi.mocked(guardarArchivo)).toHaveBeenCalledTimes(3)
  })

  it('si el archivo cambió en otro lado, relee y aplica encima', async () => {
    const { leerArchivo } = await import('../github')
    vi.mocked(leerArchivo).mockImplementationOnce(async () => {
      const r = { texto: CONTACTOS, sha: blobSha(CONTACTOS) }
      commitear('objetivo: contacto agregado', 'DiarIA web', { [RUTA]: CONTACTOS.replace('## Respondió', '- [ ] Otro (Contactado 2026-12-03)\n\n## Respondió') })
      return r
    })
    const r = await ejecutarAccion(id, { tipo: 'contacto', nombre: 'Nuevo' }, HOY)
    expect(r).toEqual({ ok: true })
    expect(archivo()).toContain('Otro (Contactado 2026-12-03)')
    expect(archivo()).toContain('Nuevo (Contactado 2026-12-03)')
  })

  it('doble agregado con sha viejo deja dos tarjetas, no una ni tres', async () => {
    const [a, b] = await Promise.all([
      ejecutarAccion(id, { tipo: 'contacto', nombre: 'Primero' }, HOY),
      ejecutarAccion(id, { tipo: 'contacto', nombre: 'Segundo' }, HOY),
    ])
    expect(a).toEqual({ ok: true })
    expect(b).toEqual({ ok: true })
    expect(archivo().match(/\(Contactado 2026-12-03\)/g)).toHaveLength(2)
    expect(archivo()).toContain('Primero')
    expect(archivo()).toContain('Segundo')
  })

  it("si la tarjeta ya no está, 'el tablero cambió; recarga' y no guarda", async () => {
    const r = await ejecutarAccion(id, { tipo: 'mover', texto: 'Nadie', a: 'Respondió' }, HOY)
    expect(r).toEqual({ ok: false, estado: 409, error: 'el tablero cambió; recarga' })
    expect(gh.guardados).toBe(0)
  })

  it("un error de GitHub da 'no se guardó' y no anota la escritura", async () => {
    gh.fallar = 'github-403'
    const errores = vi.spyOn(console, 'error').mockImplementation(() => {})
    const r = await ejecutarAccion(id, { tipo: 'contacto', nombre: 'Huerta Prueba' }, HOY)
    expect(r).toEqual({ ok: false, estado: 502, error: 'no se guardó' })
    expect(anotarEscritura).not.toHaveBeenCalled()
    expect(errores.mock.calls.flat().join(' ')).not.toContain('Huerta')
    expect(errores.mock.calls.flat().join(' ')).not.toContain('Plantar')
    errores.mockRestore()
  })

  it('tras guardar, anota la escritura con el archivo y el commit nuevo', async () => {
    await ejecutarAccion(id, { tipo: 'contacto', nombre: 'X' }, HOY)
    const [ruta, bytes, commit, padre] = vi.mocked(anotarEscritura).mock.calls[0]
    expect([ruta, commit, padre]).toEqual([RUTA, ultimo().sha, ultimo().padre])
    expect(new TextDecoder().decode(bytes)).toBe(archivo())
  })

  it("deshacer vuelve a la versión anterior con 'objetivo: deshacer'", async () => {
    await ejecutarAccion(id, { tipo: 'contacto', nombre: 'X' }, HOY)
    const r = await ejecutarAccion(id, { tipo: 'deshacer' }, HOY)
    expect(r).toEqual({ ok: true })
    expect(archivo()).toBe(CONTACTOS)
    expect(ultimo().mensaje).toBe(`objetivo: deshacer\n\n${MARCA}`)
  })

  it('deshacer se niega si el último commit del archivo no es de la web o ya es un deshacer', async () => {
    const no = { ok: false, estado: 409, error: 'ya no se puede deshacer' }
    expect(await ejecutarAccion(id, { tipo: 'deshacer' }, HOY)).toEqual(no)
    await ejecutarAccion(id, { tipo: 'contacto', nombre: 'X' }, HOY)
    await ejecutarAccion(id, { tipo: 'deshacer' }, HOY)
    expect(await ejecutarAccion(id, { tipo: 'deshacer' }, HOY)).toEqual(no)
    commitear(`objetivo: contacto agregado\n\n${MARCA}`, 'Alguien', { [RUTA]: CONTACTOS + '- [ ] y\n' })
    expect(await ejecutarAccion(id, { tipo: 'deshacer' }, HOY)).toEqual(no)
  })

  it('deshacer funciona aunque el último commit del repo sea del espejo en otro archivo', async () => {
    await ejecutarAccion(id, { tipo: 'contacto', nombre: 'X' }, HOY)
    commitear('espejo: 1 nuevas, 0 cambiadas, 0 borradas', 'Sergio', { 'Diario/2026-12-03.md': 'hoy\n' })
    expect(await ejecutarAccion(id, { tipo: 'deshacer' }, HOY)).toEqual({ ok: true })
    expect(archivo()).toBe(CONTACTOS)
  })
})
