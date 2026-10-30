import fs from 'fs'
import path from 'path'
import type { EstadoIlustracion, Ilustracion, Variante } from './tipos'

export const ORDEN_VARIANTES: Variante[] = ['macho', 'hembra', 'adulto', 'juvenil']

type Registro = Record<string, Ilustracion[]>

// Ninguna ilustración se publica sin pasar por "aprobada", que solo pone Sergio.
// Una rechazada no se aprueba: se regenera y vuelve a entrar como "generada".
const TRANSICIONES: Record<EstadoIlustracion, EstadoIlustracion[]> = {
  generada: ['marcada', 'revisada-auto', 'aprobada', 'rechazada'],
  marcada: ['aprobada', 'rechazada'],
  'revisada-auto': ['aprobada', 'rechazada'],
  aprobada: ['rechazada'],
  rechazada: [],
}

export function cambiarEstado(i: Ilustracion, nuevo: EstadoIlustracion, nota: string, hoy: string): Ilustracion {
  if (!TRANSICIONES[i.estado].includes(nuevo)) {
    throw new Error(`${i.archivo}: no se puede pasar de "${i.estado}" a "${nuevo}"`)
  }
  return { ...i, estado: nuevo, nota, actualizado: hoy }
}

export function registrarGenerada(
  registro: Registro,
  speciesKey: number,
  nueva: Omit<Ilustracion, 'estado' | 'nota' | 'actualizado'>,
  hoy: string
): Registro {
  const otras = (registro[speciesKey] ?? []).filter(i => i.variante !== nueva.variante)
  return { ...registro, [speciesKey]: [...otras, { ...nueva, estado: 'generada', nota: '', actualizado: hoy }] }
}

export function aprobadas(lista: Ilustracion[]): Ilustracion[] {
  return lista
    .filter(i => i.estado === 'aprobada')
    .sort((a, b) => ORDEN_VARIANTES.indexOf(a.variante) - ORDEN_VARIANTES.indexOf(b.variante))
}

const raizPorDefecto = () => process.env.AVES_RAIZ ?? path.join(process.cwd(), 'content/aves')

export function leerRegistro(raiz = raizPorDefecto()): Registro {
  const archivo = path.join(raiz, 'ilustraciones.json')
  return fs.existsSync(archivo) ? JSON.parse(fs.readFileSync(archivo, 'utf-8')) : {}
}

export function guardarRegistro(registro: Registro, raiz = raizPorDefecto()): void {
  fs.writeFileSync(path.join(raiz, 'ilustraciones.json'), JSON.stringify(registro, null, 2) + '\n')
}
