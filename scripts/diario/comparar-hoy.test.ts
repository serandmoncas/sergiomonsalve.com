// @vitest-environment node
// Comparación de CA-1 (DI-084): la web (tarball → bóveda en memoria) contra el
// tablero de prueba (núcleo de DiarIA sobre los archivos del clon), en las
// últimas 30 fechas con nota. Solo imprime conteos. Uso:
//   COMPARAR_CLON=~/Documents/diaria-notas COMPARAR_DIARIA=~/Code/DiarIA \
//     npx vitest run scripts/diario/comparar-hoy.test.ts
import { describe, it, expect, vi } from 'vitest'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { Readable } from 'node:stream'
import { join } from 'node:path'

vi.mock('server-only', () => ({}))

const CLON = process.env.COMPARAR_CLON
const DIARIA = process.env.COMPARAR_DIARIA

/** JSON con claves ordenadas: el mismo dato da el mismo hash. */
function canonico(x: unknown): string {
  return JSON.stringify(x, (_k, v) =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b)))
      : v,
  )
}
const huella = (x: unknown) => createHash('sha256').update(canonico(x)).digest('hex')

describe.runIf(CLON && DIARIA)('CA-1: la web muestra lo mismo que el tablero de prueba', () => {
  it('vistaHoy y mes iguales en 30 fechas', { timeout: 300_000 }, async () => {
    const { leerTarball } = await import('@/lib/diario/tarball')
    const { armarBoveda } = await import('@/lib/diario/boveda')
    const web = await import('@/lib/diaria')
    const nucleo = await import(join(DIARIA!, 'packages/core/src/index.ts'))
    const { crearVaultFSNode } = await import(join(DIARIA!, 'packages/fs-node/src/index.ts'))

    // La web: el tarball del commit actual, como lo da GitHub.
    const sha = execFileSync('git', ['-C', CLON!, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
    const gz = execFileSync('git', ['-C', CLON!, 'archive', '--format=tar.gz', `--prefix=repo-${sha.slice(0, 7)}/`, sha], {
      maxBuffer: 512 << 20,
    })
    const b = await armarBoveda(await leerTarball(Readable.from([gz])), sha)

    // El tablero de prueba: el núcleo de DiarIA sobre los archivos del clon.
    const fs = crearVaultFSNode(CLON!)
    const indice = await nucleo.crearIndice(fs)
    const diarias = new Map()
    for (const [dia, ruta] of nucleo.rutasDiarias(indice.notas)) {
      try {
        diarias.set(dia, { ruta, texto: nucleo.decodificar(await fs.read(ruta)) })
      } catch { /* ilegible */ }
    }
    const historial = nucleo.crearHistorial(diarias)
    let rutinas: string | null = null
    try { rutinas = nucleo.decodificar(await fs.read('Tablero/Rutinas.md')) } catch { /* sin rutinas */ }

    const fechas = [...diarias.keys()].sort().slice(-30)
    let iguales = 0
    let total = 0
    for (const dia of fechas) {
      total += 2
      if (huella(web.vistaHoy(b.diarias, b.historial, b.rutinas, dia)) === huella(nucleo.vistaHoy(diarias, historial, rutinas, dia))) iguales++
      if (huella(web.mes(b.diarias, dia.slice(0, 7))) === huella(nucleo.mes(diarias, dia.slice(0, 7)))) iguales++
    }
    const notasIguales = b.indice.notas.length === indice.notas.length
    process.stderr.write(`CA-1: ${iguales}/${total} iguales en ${fechas.length} fechas; notas web ${b.indice.notas.length}, clon ${indice.notas.length}; diarias web ${b.diarias.size}, clon ${diarias.size}\n`)
    expect(notasIguales).toBe(true)
    expect(iguales).toBe(total)
  })
})
