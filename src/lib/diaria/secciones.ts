// copiado de DiarIA@e9253e236b58 — no editar; actualizar con pnpm copiar-nucleo
import { dentro, extraerEnlaces, rangosDeCodigo } from "./enlaces";
import { fechaDeNota, validarDia } from "./fechas";

/** Una sección `#`/`##` cuyo título empieza por un enlace a un día (ver docs/specs/2026-11-09-di-016-secciones-fechadas.md). */
export interface Seccion {
  dia: string;
  /** Inicio de la línea del encabezado. */
  inicio: number;
  /** Inicio de la línea siguiente al encabezado. */
  contenido: number;
  /** Inicio del siguiente `#`/`##` (con fecha o sin ella), o el final del texto. */
  fin: number;
  nivel: 1 | 2;
}

// `#` o `##` (hasta 3 espacios de sangría, como en Markdown) seguido de espacio.
const ENCABEZADO = /^ {0,3}(#{1,2})[ \t]+(.*)$/;

interface Encabezado {
  inicio: number;
  contenido: number;
  nivel: 1 | 2;
  dia: string | null;
}

/** Todos los `#`/`##` fuera de código y de frontmatter, en orden. */
function encabezados(texto: string): Encabezado[] {
  const codigo = rangosDeCodigo(texto);
  const desde = finDelFrontmatter(texto);
  const lista: Encabezado[] = [];
  let pos = 0;
  for (const bruta of texto.split("\n")) {
    const siguiente = pos + bruta.length + 1;
    const bom = pos === 0 && bruta.startsWith("\uFEFF") ? 1 : 0;
    const m = ENCABEZADO.exec(bruta.slice(bom).replace(/\r$/, ""));
    if (m && pos >= desde && !dentro(codigo, pos)) {
      lista.push({
        inicio: pos + bom,
        contenido: Math.min(siguiente, texto.length),
        nivel: m[1] === "#" ? 1 : 2,
        dia: fechaDelTitulo(m[2] ?? ""),
      });
    }
    pos = siguiente;
  }
  return lista;
}

export function seccionesFechadas(texto: string): readonly Seccion[] {
  const todos = encabezados(texto);
  const secciones: Seccion[] = [];
  for (const [i, e] of todos.entries()) {
    if (e.dia === null) continue;
    secciones.push(
      Object.freeze({
        dia: e.dia,
        inicio: e.inicio,
        contenido: e.contenido,
        fin: todos[i + 1]?.inicio ?? texto.length,
        nivel: e.nivel,
      }),
    );
  }
  return Object.freeze(secciones);
}

/** La sección de ese día; si está repetida, la de más arriba. */
export function buscarSeccion(texto: string, dia: string): Seccion | null {
  validarDia(dia);
  return seccionesFechadas(texto).find((s) => s.dia === dia) ?? null;
}

/** La sección quedaría dentro de un bloque de código sin cerrar: no se esconde ahí. */
export class CodigoSinCerrar extends Error {
  constructor(dia: string) {
    super(
      `La sección del ${dia} quedaría dentro de un bloque de código sin cerrar`,
    );
    this.name = "CodigoSinCerrar";
  }
}

/**
 * El texto con la sección del día en su sitio (si no existía) y dónde escribir.
 * Lo que había queda intacto: sólo se añade el bloque nuevo.
 */
export function insertarSeccion(
  texto: string,
  dia: string,
): { texto: string; cursor: number } {
  const r = colocar(texto, dia);
  // Comprobación final: lo escrito en el cursor tiene que quedar en la sección.
  const s = buscarSeccion(r.texto, dia);
  if (!s || r.cursor < s.contenido || r.cursor > s.fin)
    throw new CodigoSinCerrar(dia);
  return r;
}

function colocar(
  texto: string,
  dia: string,
): { texto: string; cursor: number } {
  const eol = texto.includes("\r\n") ? "\r\n" : "\n";
  const existente = buscarSeccion(texto, dia);
  if (existente) return dondeEscribir(texto, existente, eol);
  const secciones = seccionesFechadas(texto);
  const encabezado = `${"#".repeat(secciones[0]?.nivel ?? 1)} [[${dia}]]`;

  // Antes de la primera más antigua (de la más reciente a la más antigua)…
  const masAntigua = secciones.find((s) => s.dia < dia);
  // …o tras la última fechada; sin fechadas, tras el bloque de encabezado.
  const posicion =
    masAntigua?.inicio ??
    secciones.at(-1)?.fin ??
    encabezados(texto)[0]?.inicio ??
    texto.length;

  if (posicion < texto.length) {
    // Delante de un encabezado: la sección y una línea en blanco antes de él.
    const bloque = encabezado + eol + eol;
    return {
      texto:
        texto.slice(0, posicion) + bloque + eol + eol + texto.slice(posicion),
      cursor: posicion + bloque.length,
    };
  }
  // Al final: separada de lo anterior por una línea en blanco.
  const contenido = texto.replace(/^\uFEFF/, "");
  const separacion =
    contenido === "" || contenido.endsWith(eol + eol)
      ? ""
      : contenido.endsWith(eol)
        ? eol
        : eol + eol;
  const nuevo = texto + separacion + encabezado + eol + eol;
  return { texto: nuevo, cursor: nuevo.length };
}

/**
 * El contenido de una sección que ya existe, saltando la línea en blanco tras el
 * encabezado. Si no tiene ninguna línea propia, se le abre una (sólo se añade).
 */
function dondeEscribir(
  texto: string,
  s: Seccion,
  eol: string,
): { texto: string; cursor: number } {
  if (s.contenido === s.fin) {
    const sinSalto = s.fin === texto.length && !/\n$/.test(texto);
    if (sinSalto) {
      // El encabezado es la última línea, sin salto: el cursor estaría en el título.
      const nuevo = texto + eol + eol;
      return { texto: nuevo, cursor: nuevo.length };
    }
    if (s.fin < texto.length) {
      // Pegada al siguiente encabezado: lo escrito lo rompería.
      return {
        texto: texto.slice(0, s.fin) + eol + eol + eol + texto.slice(s.fin),
        cursor: s.fin + eol.length,
      };
    }
  }
  const linea = /^\r?\n/.exec(texto.slice(s.contenido, s.fin));
  const cursor =
    linea && s.contenido + linea[0].length < s.fin
      ? s.contenido + linea[0].length
      : s.contenido;
  return { texto, cursor };
}

/**
 * Si el título empieza por un enlace a un día, ese día. Vale cualquier forma que
 * el resolutor entiende: `[[2030-01-15|martes]]`, `[[ 2030-01-15 ]]`,
 * `[[2030-01-15.md]]` y la ruta `[[900 📔 Diario/…/2030-01-15]]`.
 */
function fechaDelTitulo(titulo: string): string | null {
  const [primero] = extraerEnlaces(titulo);
  if (!primero || primero.inicio !== 0 || primero.incrustado) return null;
  return (
    fechaDeNota(primero.destino.trim() + ".md") ??
    fechaDeNota(primero.destino.trim())
  );
}

/** Dónde acaba el frontmatter (`---` en la primera línea hasta el siguiente `---`), o 0. */
export function finDelFrontmatter(texto: string): number {
  const lineas = texto.replace(/^\uFEFF/, "").split("\n");
  if (lineas[0]?.replace(/\r$/, "") !== "---") return 0;
  let pos = texto.startsWith("\uFEFF") ? 1 : 0;
  for (const [i, bruta] of lineas.entries()) {
    pos += bruta.length + 1;
    if (i > 0 && bruta.replace(/\r$/, "") === "---")
      return Math.min(pos, texto.length);
  }
  return 0;
}
