'use server'

import { revalidatePath } from 'next/cache'
import { cambiarEstado, guardarRegistro, leerRegistro } from '@/lib/aves/ilustraciones'
import type { EstadoIlustracion } from '@/lib/aves/tipos'

// Solo en desarrollo: en producción el registro vive en el repo y no se puede escribir
function exigirDesarrollo() {
  if (process.env.NODE_ENV !== 'development') throw new Error('La revisión de ilustraciones solo funciona en desarrollo')
}

function poner(clave: string, estado: EstadoIlustracion, nota: string) {
  exigirDesarrollo()
  const registro = leerRegistro()
  const hoy = new Date().toISOString().slice(0, 10)
  for (const [key, lista] of Object.entries(registro)) {
    const i = lista.findIndex(x => x.archivo === clave)
    if (i === -1) continue
    lista[i] = cambiarEstado(lista[i], estado, nota, hoy)
    registro[key] = lista
    guardarRegistro(registro)
    revalidatePath('/[locale]/admin/aves', 'page')
    return
  }
  throw new Error(`${clave}: no está en el registro`)
}

export async function aprobar(clave: string): Promise<void> {
  poner(clave, 'aprobada', '')
}

export async function rechazar(clave: string, nota: string): Promise<void> {
  poner(clave, 'rechazada', nota)
}

export async function rechazarConFormulario(clave: string, datos: FormData): Promise<void> {
  poner(clave, 'rechazada', String(datos.get('nota') ?? '').trim())
}
