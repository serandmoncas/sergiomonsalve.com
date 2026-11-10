/**
 * Consulta y cambia el estado de las ilustraciones en content/aves/ilustraciones.json.
 *
 * Usage:
 *   npx tsx scripts/aves/estado.ts listar <estado>
 *   npx tsx scripts/aves/estado.ts poner <slug--variante> <estado> [nota]
 *
 * Estados: generada, marcada, revisada-auto, aprobada, rechazada.
 * La revisión automática solo usa "marcada" y "revisada-auto"; "aprobada" la pone Sergio.
 * AVES_RAIZ cambia la carpeta de datos (para pruebas).
 */

import { cambiarEstado, guardarRegistro, leerRegistro } from '../../src/lib/aves/ilustraciones'
import type { EstadoIlustracion } from '../../src/lib/aves/tipos'

const ESTADOS: EstadoIlustracion[] = ['generada', 'marcada', 'revisada-auto', 'aprobada', 'rechazada']

function main() {
  const [comando, a, b, ...resto] = process.argv.slice(2)
  const registro = leerRegistro()

  if (comando === 'listar' && ESTADOS.includes(a as EstadoIlustracion)) {
    for (const lista of Object.values(registro)) {
      for (const i of lista.filter(i => i.estado === a)) {
        console.log(`${i.archivo}\tpublic/aves/${i.archivo}-1024.webp${i.nota ? `\t${i.nota}` : ''}`)
      }
    }
    return
  }

  if (comando === 'poner' && a && ESTADOS.includes(b as EstadoIlustracion)) {
    const hoy = new Date().toISOString().slice(0, 10)
    for (const [key, lista] of Object.entries(registro)) {
      const i = lista.findIndex(x => x.archivo === a)
      if (i === -1) continue
      lista[i] = cambiarEstado(lista[i], b as EstadoIlustracion, resto.join(' '), hoy)
      registro[key] = lista
      guardarRegistro(registro)
      console.log(`${a}: ${b}`)
      return
    }
    throw new Error(`${a}: no está en el registro`)
  }

  throw new Error('Uso: estado.ts listar <estado> | estado.ts poner <slug--variante> <estado> [nota]')
}

try {
  main()
} catch (err) {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
}
