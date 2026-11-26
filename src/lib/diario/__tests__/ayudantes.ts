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
