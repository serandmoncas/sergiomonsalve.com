// copiado de DiarIA@3803d65e772c — no editar; actualizar con pnpm copiar-nucleo
import { dentro, rangosDeCodigo } from "./enlaces";
import { validarDia } from "./fechas";
import { finDelFrontmatter } from "./secciones";

/** Una tarea `- [ ]` en formato del plugin Tasks (ver docs/specs/2026-11-11-di-018-tareas.md). */
export interface Tarea {
  /** Inicio de la línea. */
  inicio: number;
  /** Fin de la línea, sin el salto. */
  fin: number;
  /** El carácter entre `[` y `]`. */
  estado: string;
  /** `[x]` o `[X]`. */
  hecha: boolean;
  /** La fecha del `✅` del final, si hay. */
  fecha: string | null;
  /** Tiene `🔁`: al completarla, Tasks crearía la siguiente repetición. */
  recurrente: boolean;
}

/** Completarla desde DiarIA perdería su siguiente repetición. */
export class TareaRecurrente extends Error {
  constructor() {
    super(
      "Esta tarea se repite (🔁): márcala en Obsidian para que cree la siguiente",
    );
    this.name = "TareaRecurrente";
  }
}

// Sangría y citas `>`, viñeta (`-`, `*`, `+`, `1.`, `1)`), `[estado]` y el resto.
const TAREA =
  /^((?:[ \t]*>)*[ \t]*(?:[-*+]|\d+[.)])[ \t]+)\[(.)\](?=[ \t]|$)(.*)$/;
// El `✅ fecha` del final: antes sólo pueden ir un `^id` de bloque y espacios.
const FECHA_FINAL =
  /([ \t]*)✅( ?)(\d{4}-\d{2}-\d{2})((?:[ \t]+\^[A-Za-z0-9-]+)?[ \t]*)$/;
// Lo que va al final y no es "el texto": un `^id` de bloque y espacios.
const COLA = /(?:[ \t]+\^[A-Za-z0-9-]+)?[ \t]*$/;

interface Linea {
  inicio: number;
  fin: number;
  m: RegExpExecArray;
}

function lineasDeTarea(texto: string): Linea[] {
  const codigo = rangosDeCodigo(texto);
  const desde = finDelFrontmatter(texto);
  const lista: Linea[] = [];
  let pos = 0;
  for (const bruta of texto.split("\n")) {
    const bom = pos === 0 && bruta.startsWith("\uFEFF") ? 1 : 0;
    const linea = bruta.slice(bom).replace(/\r$/, "");
    const m = TAREA.exec(linea);
    if (m && pos >= desde && !dentro(codigo, pos))
      lista.push({ inicio: pos + bom, fin: pos + bom + linea.length, m });
    pos += bruta.length + 1;
  }
  return lista;
}

export function tareas(texto: string): readonly Tarea[] {
  return Object.freeze(
    lineasDeTarea(texto).map(({ inicio, fin, m }) => {
      const [, , estado = "", resto = ""] = m;
      return Object.freeze({
        inicio,
        fin,
        estado,
        hecha: estado === "x" || estado === "X",
        fecha: FECHA_FINAL.exec(resto)?.[3] ?? null,
        recurrente: resto.includes("🔁"),
      });
    }),
  );
}

/**
 * Marca la tarea que empieza en `inicio` si está abierta (`[x]` y `✅ hoy` al
 * final del texto) o la desmarca si está hecha (`[ ]` y sin el `✅` del final).
 * Sólo cambia esa línea; no reordena nada.
 */
export function alternarTarea(
  texto: string,
  inicio: number,
  hoy: string,
): string {
  validarDia(hoy);
  const linea = lineasDeTarea(texto).find((l) => l.inicio === inicio);
  if (!linea) throw new RangeError(`No hay una tarea en la posición ${inicio}`);
  const [, prefijo = "", estado = "", resto = ""] = linea.m;
  const final = FECHA_FINAL.exec(resto);

  let nueva: string;
  if (estado === "x" || estado === "X") {
    const sinFecha = final
      ? resto.slice(0, final.index) + (final[4] ?? "")
      : resto;
    nueva = `${prefijo}[ ]${sinFecha}`;
  } else if (estado === " ") {
    if (resto.includes("🔁")) throw new TareaRecurrente();
    const conFecha = final
      ? resto.slice(0, final.index) +
        `${final[1]}✅${final[2]}${hoy}${final[4]}`
      : insertarAntesDeLaCola(resto, ` ✅ ${hoy}`);
    nueva = `${prefijo}[x]${conFecha}`;
  } else {
    throw new RangeError(`La tarea [${estado}] no se marca ni desmarca`);
  }
  return texto.slice(0, linea.inicio) + nueva + texto.slice(linea.fin);
}

function insertarAntesDeLaCola(resto: string, fragmento: string): string {
  const corte = COLA.exec(resto)!.index;
  return resto.slice(0, corte) + fragmento + resto.slice(corte);
}
