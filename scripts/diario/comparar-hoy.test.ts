// @vitest-environment node
// Comparación de CA-1 (DI-084): la web (tarball del commit → bóveda en memoria)
// contra el tablero de prueba que está corriendo (sus /api/hoy y /api/mes), en
// las últimas 30 fechas con nota. Solo imprime conteos. Uso:
//   COMPARAR_CLON=~/Documents/diaria-notas COMPARAR_SPIKE=http://127.0.0.1:4322 \
//     npx vitest run scripts/diario/comparar-hoy.test.ts
import { describe, it, expect, vi } from 'vitest'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { Readable } from 'node:stream'

vi.mock('server-only', () => ({}))

const CLON = process.env.COMPARAR_CLON
const SPIKE = process.env.COMPARAR_SPIKE

/** JSON con claves ordenadas: el mismo dato da el mismo hash. */
function canonico(x: unknown): string {
  return JSON.stringify(x, (_k, v) =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b)))
      : v,
  )
}
const huella = (x: unknown) => createHash('sha256').update(canonico(x)).digest('hex')

describe.runIf(CLON && SPIKE)('CA-1: la web muestra lo mismo que el tablero de prueba', () => {
  it('vistaHoy y mes iguales en 30 fechas', { timeout: 300_000 }, async () => {
    const { leerTarball } = await import('@/lib/diario/tarball')
    const { armarBoveda } = await import('@/lib/diario/boveda')
    const web = await import('@/lib/diaria')
    const pedir = async (ruta: string) => {
      const r = await fetch(`${SPIKE}${ruta}`)
      if (!r.ok) throw new Error(`tablero de prueba: ${r.status}`)
      return r.json()
    }

    // El commit del clon, el mismo que lee el tablero de prueba (que se
    // reindexa cuando cambia HEAD).
    const sha = execFileSync('git', ['-C', CLON!, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
    const gz = execFileSync('git', ['-C', CLON!, 'archive', '--format=tar.gz', `--prefix=repo-${sha.slice(0, 7)}/`, sha], {
      maxBuffer: 512 << 20,
    })
    const b = await armarBoveda(await leerTarball(Readable.from([gz])), sha)
    await pedir('/api/hoy') // que el tablero de prueba se ponga al día con HEAD

    const fechas = [...b.diarias.keys()].sort().slice(-30)
    let iguales = 0
    let total = 0
    for (const dia of fechas) {
      total += 2
      if (huella(web.vistaHoy(b.diarias, b.historial, b.rutinas, dia)) === huella(await pedir(`/api/hoy?dia=${dia}`))) iguales++
      if (huella(web.mes(b.diarias, dia.slice(0, 7))) === huella(await pedir(`/api/mes?dia=${dia}&mes=${dia.slice(0, 7)}`))) iguales++
    }
    const shaFinal = execFileSync('git', ['-C', CLON!, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
    process.stderr.write(`CA-1: ${iguales}/${total} iguales en ${fechas.length} fechas contra el tablero de prueba; ${b.indice.notas.length} notas, ${b.diarias.size} diarias${shaFinal === sha ? '' : ' (el clon cambió durante la comparación: repetir)'}\n`)
    expect(iguales).toBe(total)
  })
})
