import {
  crearHistorial,
  crearIndice,
  crearResolutor,
  decodificar,
  rutasDiarias,
  type Diarias,
  type Historial,
  type Indice,
  type NotaDiaria,
  type Resolutor,
} from '@/lib/diaria'
import * as github from './github'
import { MemoriaFS, guardaContenido, type Cambios } from './memoria'
import { leerTarball } from './tarball'

export type Boveda = {
  sha: string
  fs: MemoriaFS
  indice: Indice
  resolutor: Resolutor
  diarias: Diarias
  historial: Historial
  rutinas: string | null
}
export type ResultadoBoveda = { ok: true; boveda: Boveda } | { ok: false; motivo: string }

const MIRAR_SHA_MS = 10_000
const MIRAR_PRIVADO_MS = 10 * 60_000
const MAX_COMPARE = 300

let actual: Boveda | null = null
let ultimoSha = 0
let ultimoPrivado = 0
let enCurso: Promise<ResultadoBoveda> | null = null

/** Solo para pruebas. */
export function reiniciarBoveda() {
  actual = null
  ultimoSha = 0
  ultimoPrivado = 0
  enCurso = null
}

const leerTexto = (fs: MemoriaFS, ruta: string) => {
  const datos = fs.leer(ruta)
  if (!datos) return null
  try {
    return decodificar(datos)
  } catch {
    return null
  }
}

/** Índice, diarias, historial y rutinas sobre una bóveda en memoria. */
export async function armarBoveda(fs: MemoriaFS, sha: string): Promise<Boveda> {
  const indice = await crearIndice(fs)
  const diarias = new Map<string, NotaDiaria>()
  for (const [dia, ruta] of rutasDiarias(indice.notas)) {
    const texto = leerTexto(fs, ruta)
    if (texto !== null) diarias.set(dia, { ruta, texto })
  }
  return {
    sha,
    fs,
    indice,
    resolutor: crearResolutor(indice),
    diarias,
    historial: crearHistorial(diarias),
    rutinas: leerTexto(fs, 'Tablero/Rutinas.md'),
  }
}

async function cambiosDesde(base: string, head: string): Promise<Cambios | null> {
  const { files } = await github.comparar(base, head)
  if (!files || files.length >= MAX_COMPARE) return null
  const cambios: Cambios = { quitar: [], poner: new Map(), otros: [] }
  for (const f of files) {
    if (f.status === 'removed') {
      cambios.quitar.push(f.filename)
      continue
    }
    if (f.status === 'renamed' && f.previous_filename) cambios.quitar.push(f.previous_filename)
    if (guardaContenido(f.filename)) cambios.poner.set(f.filename, await github.blob(f.sha))
    else cambios.otros.push(f.filename)
  }
  return cambios
}

async function actualizar(): Promise<ResultadoBoveda> {
  const ahora = Date.now()
  if (!actual || ahora - ultimoPrivado >= MIRAR_PRIVADO_MS) {
    if (!(await github.esPrivado())) {
      actual = null
      return { ok: false, motivo: 'publico' }
    }
    ultimoPrivado = ahora
  }
  const sha = await github.shaActual()
  if (actual?.sha !== sha) {
    const cambios = actual ? await cambiosDesde(actual.sha, sha) : null
    let fs: MemoriaFS
    if (actual && cambios) fs = actual.fs.aplicar(cambios)
    else {
      try {
        fs = await leerTarball(await github.tarball(sha))
      } catch (e) {
        throw e instanceof github.ErrorGithub ? e : new github.ErrorGithub('tarball')
      }
    }
    actual = await armarBoveda(fs, sha)
  }
  ultimoSha = ahora
  return { ok: true, boveda: actual }
}

/**
 * La bóveda al día (DI-084). Mira el sha como mucho cada 10 s y la privacidad
 * del repo cada 10 min; los pedidos simultáneos comparten una sola
 * actualización. Cualquier fallo da "no disponible" con un motivo corto.
 */
export async function obtenerBoveda(): Promise<ResultadoBoveda> {
  if (!github.hayToken()) return { ok: false, motivo: 'sin-token' }
  if (actual && Date.now() - ultimoSha < MIRAR_SHA_MS) return { ok: true, boveda: actual }
  if (!enCurso) {
    enCurso = actualizar()
      .catch((e: unknown): ResultadoBoveda => {
        const motivo = e instanceof github.ErrorGithub ? e.codigo : 'error'
        console.error('[diario]', motivo)
        return { ok: false, motivo }
      })
      .finally(() => {
        enCurso = null
      })
  }
  return enCurso
}
