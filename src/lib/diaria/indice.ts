// copiado de DiarIA@e9253e236b58 — no editar; actualizar con pnpm copiar-nucleo
import type { VaultFS } from "./vault-fs";

/** Qué archivos existen en la bóveda, según DiarIA. */
export interface Indice {
  /** Rutas de notas `.md`, ordenadas. */
  readonly notas: readonly string[];
  /** El resto de archivos visibles, ordenados. */
  readonly adjuntos: readonly string[];
  /** ¿Existe esta ruta exacta (nota o adjunto)? */
  existe(ruta: string): boolean;
  /** Nombre sin `.md` → todas las notas con ese nombre, homónimos incluidos. */
  porNombre(nombre: string): readonly string[];
}

/** Un archivo existe para DiarIA si ningún segmento de su ruta empieza por "." (`.obsidian/`, `.git/`, `.DS_Store`…). */
export function esVisible(ruta: string): boolean {
  return ruta.split("/").every((segmento) => !segmento.startsWith("."));
}

export async function crearIndice(fs: VaultFS): Promise<Indice> {
  const visibles = (await fs.list()).filter(esVisible).sort();
  const notas = Object.freeze(visibles.filter(esNota));
  const adjuntos = Object.freeze(visibles.filter((r) => !esNota(r)));
  const rutas = new Set(visibles);

  const nombres = new Map<string, string[]>();
  for (const nota of notas) {
    const nombre = nombreDeNota(nota);
    const lista = nombres.get(nombre);
    if (lista) lista.push(nota);
    else nombres.set(nombre, [nota]);
  }
  for (const lista of nombres.values()) Object.freeze(lista);

  return Object.freeze({
    notas,
    adjuntos,
    existe: (ruta: string) => rutas.has(ruta),
    porNombre: (nombre: string) => nombres.get(nombre) ?? [],
  });
}

function esNota(ruta: string): boolean {
  return ruta.toLowerCase().endsWith(".md");
}

function nombreDeNota(ruta: string): string {
  const base = ruta.slice(ruta.lastIndexOf("/") + 1);
  return base.slice(0, -".md".length);
}
