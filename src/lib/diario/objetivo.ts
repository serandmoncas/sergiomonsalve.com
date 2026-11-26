import 'server-only'
import { agregarContacto, decodificar, leerObjetivo, moverTarjeta } from '@/lib/diaria'
import { anotarEscritura, obtenerBoveda, type Boveda } from './boveda'
import * as github from './github'
import { idNota } from './urls'

/**
 * Acciones del objetivo desde la web (DI-087). Solo escribe en el archivo de
 * contactos de un objetivo activo; cada acción es un commit con la marca
 * `DiarIA-accion: objetivo`, que es lo que deshacer reconoce.
 */

const CARPETA = 'Tablero/Objetivos/'
const SUFIJO = ' - contactos.md'
const MARCA = 'DiarIA-accion: objetivo'
const AUTOR_WEB = 'DiarIA web'
const INTENTOS = 3

export type ObjetivoWeb = { id: string; nombre: string; rutaNota: string; rutaContactos: string }

export type Accion =
  | { tipo: 'contacto'; nombre?: string; canal?: string; nota?: string }
  | { tipo: 'mover'; texto?: string; a?: string }
  | { tipo: 'deshacer' }

export type ResultadoAccion = { ok: true } | { ok: false; estado: 400 | 409 | 502; error: string }

const texto = (b: Boveda, ruta: string) => {
  const datos = b.fs.leer(ruta)
  if (!datos) return null
  try {
    return decodificar(datos)
  } catch {
    return null
  }
}

/** Objetivos con `estado: activo` y su tablero de contactos, en orden alfabético. */
export function objetivosActivos(b: Boveda): ObjetivoWeb[] {
  const notas = new Set(b.indice.notas)
  const lista: ObjetivoWeb[] = []
  for (const rutaNota of b.indice.notas) {
    if (!rutaNota.startsWith(CARPETA) || rutaNota.endsWith(SUFIJO) || rutaNota.includes('(conflicto ')) continue
    const resto = rutaNota.slice(CARPETA.length)
    if (resto.includes('/') || !resto.endsWith('.md')) continue
    const nombre = resto.slice(0, -'.md'.length)
    const rutaContactos = `${CARPETA}${nombre}${SUFIJO}`
    if (!notas.has(rutaContactos)) continue
    const t = texto(b, rutaNota)
    if (t === null || leerObjetivo(nombre, t).estado !== 'activo') continue
    lista.push({ id: idNota(rutaContactos), nombre, rutaNota, rutaContactos })
  }
  return lista.sort((x, y) => x.nombre.localeCompare(y.nombre, 'es'))
}

const conMarca = (titulo: string) => `${titulo}\n\n${MARCA}`
const falla = (estado: 400 | 409 | 502, error: string): ResultadoAccion => ({ ok: false, estado, error })
const esShaViejo = (e: unknown) =>
  e instanceof github.ErrorGithub && (e.codigo === 'github-409' || e.codigo === 'github-422')

function registrar(e: unknown) {
  console.error('[diario]', e instanceof github.ErrorGithub ? e.codigo : 'error')
}

/** Errores del guardado tras los que no se sabe si GitHub hizo el commit. */
const INCIERTOS = new Set(['tiempo', 'red', 'guardado-incierto'])

class GuardadoIncierto extends Error {}

/**
 * Guarda y pone al día la memoria. Si el PUT pudo haber llegado (sin
 * respuesta o con una que no se entiende), no se reintenta: repetir podría
 * duplicar la tarjeta. Una falla de la memoria no deshace lo guardado.
 */
async function guardar(ruta: string, nuevo: string, sha: string, titulo: string) {
  let r: Awaited<ReturnType<typeof github.guardarArchivo>>
  try {
    r = await github.guardarArchivo(ruta, nuevo, sha, conMarca(titulo))
  } catch (e) {
    if (e instanceof github.ErrorGithub && INCIERTOS.has(e.codigo)) {
      registrar(e)
      throw new GuardadoIncierto()
    }
    throw e
  }
  await anotarEscritura(ruta, r.bytes, r.commit, r.padre).catch(() => registrar(new github.ErrorGithub('memoria')))
}

const INCIERTO = 'no se sabe si se guardó; recarga antes de repetir'


/** Lee, aplica y guarda; si el archivo cambió entretanto, relee y repite. */
async function aplicar(
  ruta: string,
  cambiar: (t: string) => { texto: string } | { error: string },
  titulo: string,
): Promise<ResultadoAccion> {
  for (let i = 0; i < INTENTOS; i++) {
    try {
      const actual = await github.leerArchivo(ruta)
      const cambio = cambiar(actual.texto)
      if ('error' in cambio) return falla(409, cambio.error)
      await guardar(ruta, cambio.texto, actual.sha, titulo)
      return { ok: true }
    } catch (e) {
      if (esShaViejo(e)) continue
      if (e instanceof GuardadoIncierto) return falla(502, INCIERTO)
      registrar(e)
      return falla(502, 'no se guardó')
    }
  }
  return falla(409, 'no se pudo guardar; intenta otra vez')
}

/** Vuelve a la versión anterior si el último commit del archivo es una acción de la web. */
async function deshacer(ruta: string): Promise<ResultadoAccion> {
  const no = falla(409, 'ya no se puede deshacer')
  try {
    const c = await github.ultimoCommit(ruta)
    if (!c?.padre || c.autor !== AUTOR_WEB || !c.mensaje.trimEnd().endsWith(MARCA)) return no
    if (c.mensaje.startsWith('objetivo: deshacer')) return no
    const actual = await github.leerArchivo(ruta)
    const dejado = await github.leerArchivo(ruta, c.sha)
    if (actual.sha !== dejado.sha) return no
    const previo = await github.leerArchivo(ruta, c.padre)
    await guardar(ruta, previo.texto, actual.sha, 'objetivo: deshacer')
    return { ok: true }
  } catch (e) {
    if (esShaViejo(e)) return no
    if (e instanceof GuardadoIncierto) return falla(502, INCIERTO)
    registrar(e)
    return falla(502, 'no se guardó')
  }
}

export async function ejecutarAccion(objetivoId: string, accion: Accion, hoy: string): Promise<ResultadoAccion> {
  const res = await obtenerBoveda()
  if (!res.ok) return falla(502, 'Diario no disponible')
  const objetivo = objetivosActivos(res.boveda).find(o => o.id === objetivoId)
  if (!objetivo) return falla(400, 'objetivo desconocido')
  const ruta = objetivo.rutaContactos
  switch (accion.tipo) {
    case 'contacto':
      return aplicar(ruta, t => agregarContacto(t, accion, hoy), 'objetivo: contacto agregado')
    case 'mover':
      return aplicar(ruta, t => moverTarjeta(t, accion, hoy), `objetivo: tarjeta movida a ${accion.a}`)
    case 'deshacer':
      return deshacer(ruta)
  }
}
