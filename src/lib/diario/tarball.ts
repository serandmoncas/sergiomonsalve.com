import { Readable } from 'node:stream'
import { createGunzip } from 'node:zlib'
import { extract } from 'tar-stream'
import { MemoriaFS, guardaContenido } from './memoria'

/**
 * La ruta dentro de la bóveda, o null si hay que ignorar la entrada. Quita el
 * primer segmento ("owner-repo-sha/") y rechaza rutas absolutas, con "..",
 * "." o vacías, y todo `.obsidian/`.
 */
export function rutaSegura(nombre: string): string | null {
  if (nombre.startsWith('/') || nombre.includes('\\') || nombre.includes('\0')) return null
  const partes = nombre.split('/').slice(1)
  if (partes.length === 0 || partes.some(p => p === '' || p === '.' || p === '..')) return null
  const ruta = partes.join('/').normalize('NFC')
  if (ruta === '.obsidian' || ruta.startsWith('.obsidian/')) return null
  return ruta
}

/** Lee un .tar.gz de GitHub en streaming y arma la bóveda en memoria. Nada va a disco. */
export async function leerTarball(gz: ReadableStream<Uint8Array> | NodeJS.ReadableStream): Promise<MemoriaFS> {
  const entrada = gz instanceof ReadableStream
    ? Readable.fromWeb(gz as import('node:stream/web').ReadableStream<Uint8Array>)
    : (gz as NodeJS.ReadableStream)
  const contenido = new Map<string, Uint8Array>()
  const otros: string[] = []
  const tar = extract()
  const gunzip = createGunzip()

  const listo = new Promise<void>((resolver, rechazar) => {
    const fallar = (e: unknown) => rechazar(e instanceof Error ? e : new Error('tarball roto'))
    gunzip.on('error', fallar)
    tar.on('error', fallar)
    if ('on' in entrada) (entrada as Readable).on('error', fallar)
    tar.on('finish', () => resolver())
    tar.on('entry', (cabecera, flujo, siguiente) => {
      const ruta = cabecera.type === 'file' ? rutaSegura(cabecera.name) : null
      if (!ruta || !guardaContenido(ruta)) {
        if (ruta) otros.push(ruta)
        flujo.on('end', siguiente)
        flujo.resume()
        return
      }
      const partes: Buffer[] = []
      flujo.on('data', (c: unknown) => { partes.push(c as Buffer) })
      flujo.on('end', () => {
        contenido.set(ruta, new Uint8Array(Buffer.concat(partes)))
        siguiente()
      })
    })
  })
  ;(entrada as Readable).pipe(gunzip).pipe(tar)
  await listo
  return new MemoriaFS(contenido, otros)
}
