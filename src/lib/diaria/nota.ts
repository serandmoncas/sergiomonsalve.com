// copiado de DiarIA@7b76fe16a8dd — no editar; actualizar con pnpm copiar-nucleo
import type { VaultFS } from "./vault-fs";

/**
 * La frontera entre bytes y texto (ver docs/specs/2026-11-10-di-017-byte-a-byte.md).
 * La ida y vuelta es exacta: el BOM queda dentro del texto como "\uFEFF", no se
 * normaliza Unicode ni se tocan los saltos de línea.
 */

/** Los bytes no son UTF-8 válido: la nota no se edita (se convertiría en `\uFFFD`). */
export class NoEsUtf8 extends Error {
  constructor(ruta?: string) {
    super(`${ruta ?? "La nota"} no está en UTF-8: DiarIA no la edita`);
    this.name = "NoEsUtf8";
  }
}

/** El texto tiene medio carácter (un surrogate suelto): guardarlo pondría `\uFFFD`. */
export class TextoRoto extends Error {
  constructor() {
    super("El texto tiene un carácter partido por la mitad: no se guarda");
    this.name = "TextoRoto";
  }
}

// TextEncoder/TextDecoder son estándar (WHATWG) en Node, navegadores y Tauri, pero
// el núcleo no carga los tipos de DOM ni de Node: se declaran aquí.
const { TextDecoder, TextEncoder } = globalThis as unknown as {
  TextDecoder: new (
    codificacion: "utf-8",
    opciones: { fatal: boolean; ignoreBOM: boolean },
  ) => { decode(bytes: Uint8Array): string };
  TextEncoder: new () => { encode(texto: string): Uint8Array };
};

const decodificador = new TextDecoder("utf-8", {
  fatal: true,
  ignoreBOM: true,
});
const codificador = new TextEncoder();
const SURROGATE_SUELTO =
  /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/;

export function decodificar(bytes: Uint8Array): string {
  try {
    return decodificador.decode(bytes);
  } catch {
    throw new NoEsUtf8();
  }
}

export function codificar(texto: string): Uint8Array {
  if (SURROGATE_SUELTO.test(texto)) throw new TextoRoto();
  return codificador.encode(texto);
}

/** Una nota tal como se leyó: los bytes son la referencia para saber si cambió. */
export interface NotaAbierta {
  readonly ruta: string;
  readonly texto: string;
  readonly bytes: Uint8Array;
}

export async function abrirNota(
  fs: VaultFS,
  ruta: string,
): Promise<NotaAbierta> {
  const bytes = await fs.read(ruta);
  try {
    return Object.freeze({ ruta, texto: decodificar(bytes), bytes });
  } catch (e) {
    throw e instanceof NoEsUtf8 ? new NoEsUtf8(ruta) : e;
  }
}

/**
 * Escribe sólo si los bytes cambian (así un guardado sin editar no toca el archivo).
 * Devuelve la nota tal como quedó en disco: el siguiente guardado se compara con
 * ella, no con lo que había al abrir (si no, volver al texto original no se escribiría).
 */
export async function guardarNota(
  fs: VaultFS,
  nota: NotaAbierta,
  texto: string,
): Promise<{ nota: NotaAbierta; escrito: boolean }> {
  const nuevos = codificar(texto);
  if (iguales(nuevos, nota.bytes)) return { nota, escrito: false };
  await fs.write(nota.ruta, nuevos);
  return {
    nota: Object.freeze({ ruta: nota.ruta, texto, bytes: nuevos }),
    escrito: true,
  };
}

function iguales(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}
