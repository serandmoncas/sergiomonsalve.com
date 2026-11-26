import type { VaultFS } from '@/lib/diaria'

/** Lo que la web guarda con contenido: las notas y el tablero. El resto, solo el nombre. */
export function guardaContenido(ruta: string): boolean {
  return ruta.toLowerCase().endsWith('.md') || ruta.startsWith('Tablero/')
}

export type Cambios = { quitar: string[]; poner: Map<string, Uint8Array>; otros: string[] }

/**
 * La bóveda en memoria, de solo lectura (DI-084). `otros` son archivos de los
 * que solo se sabe el nombre (adjuntos): cuentan para resolver enlaces, pero no
 * se leen. Cada cambio devuelve una instancia nueva.
 */
export class MemoriaFS implements VaultFS {
  private readonly otros: ReadonlySet<string>

  constructor(
    private readonly contenido: ReadonlyMap<string, Uint8Array>,
    otros: Iterable<string>,
  ) {
    this.otros = new Set(otros)
  }

  async list(): Promise<string[]> {
    return [...this.contenido.keys(), ...this.otros]
  }

  async read(ruta: string): Promise<Uint8Array> {
    const datos = this.contenido.get(ruta)
    if (!datos) throw new Error('no está en la bóveda')
    return datos
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async write(_ruta: string, _datos: Uint8Array): Promise<void> {
    throw new Error('solo lectura')
  }

  async stat(ruta: string): Promise<{ mtimeMs: number; size: number } | null> {
    const datos = this.contenido.get(ruta)
    if (datos) return { mtimeMs: 0, size: datos.byteLength }
    return this.otros.has(ruta) ? { mtimeMs: 0, size: 0 } : null
  }

  /** Lee sin promesa (para armar vistas en el servidor), o null. */
  leer(ruta: string): Uint8Array | null {
    return this.contenido.get(ruta) ?? null
  }

  aplicar({ quitar, poner, otros }: Cambios): MemoriaFS {
    const contenido = new Map(this.contenido)
    const nombres = new Set(this.otros)
    for (const r of quitar) {
      contenido.delete(r)
      nombres.delete(r)
    }
    for (const [r, d] of poner) {
      nombres.delete(r)
      contenido.set(r, d)
    }
    for (const r of otros) {
      contenido.delete(r)
      nombres.add(r)
    }
    return new MemoriaFS(contenido, nombres)
  }
}
