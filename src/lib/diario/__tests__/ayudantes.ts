import { pack as crearPack, type Header } from 'tar-stream'
import { createGzip } from 'node:zlib'
import { Readable } from 'node:stream'

export type Entrada = { nombre: string; contenido?: string; tipo?: Header['type']; enlace?: string }

export const CABECERA = '<!-- fixture: sintética -->\n'

/** Tarball .tar.gz como el de GitHub: todo bajo "owner-repo-sha/". */
export async function tarball(entradas: Entrada[], prefijo = 'serandmoncas-diaria-notas-abc1234/'): Promise<Buffer> {
  const p = crearPack()
  p.entry({ name: prefijo, type: 'directory' })
  for (const e of entradas) {
    const name = e.nombre.startsWith('/') ? e.nombre : prefijo + e.nombre
    if (e.tipo === 'symlink') p.entry({ name, type: 'symlink', linkname: e.enlace ?? 'x' })
    else if (e.tipo === 'directory') p.entry({ name, type: 'directory' })
    else p.entry({ name }, e.contenido ?? '')
  }
  p.finalize()
  const gz = p.pipe(createGzip())
  const partes: Buffer[] = []
  for await (const c of gz) partes.push(c as Buffer)
  return Buffer.concat(partes)
}

/** Un Buffer como ReadableStream web (lo que da fetch). */
export const comoStream = (b: Buffer) => Readable.toWeb(Readable.from([b])) as ReadableStream<Uint8Array>

export const texto = (b: Uint8Array) => new TextDecoder().decode(b)

/** Una bóveda sintética armada como en producción, sin GitHub. */
export async function bovedaDePrueba(notas: Record<string, string>, otros: string[] = [], sha = 'a1') {
  const { MemoriaFS } = await import('../memoria')
  const { armarBoveda } = await import('../boveda')
  const enc = new TextEncoder()
  const fs = new MemoriaFS(new Map(Object.entries(notas).map(([r, t]) => [r, enc.encode(t)])), otros)
  return armarBoveda(fs, sha)
}

export const NOTAS_DE_PRUEBA: Record<string, string> = {
  'Diario/2026-11-20.md': CABECERA + '- [ ] Revisar [[Proyecto Faro]]\n',
  'Diario/2026-11-22.md': CABECERA + '- [ ] Revisar [[Proyecto Faro]]\n- [ ] Comprar pan\n',
  'Diario/2026-11-24.md': CABECERA + '- [ ] Revisar [[Proyecto Faro]]\n- [ ] Comprar pan\n',
  'Diario/2026-11-25.md': CABECERA + '- [ ] Revisar [[Proyecto Faro]]\n- [ ] Llamar a [[Ana Prueba]]\n- [x] Regar ✅ 2026-11-25\n',
  'Personas/Ana Prueba.md': CABECERA + '# Ana Prueba\n',
  'Proyectos/Proyecto Faro.md': CABECERA + '# Proyecto Faro\n',
  'Tablero/Rutinas.md': CABECERA + '- [ ] Regar 🔁 every day\n',
}
