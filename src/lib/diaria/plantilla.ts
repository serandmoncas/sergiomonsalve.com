// copiado de DiarIA@e9253e236b58 — no editar; actualizar con pnpm copiar-nucleo
import { validarDia } from "./fechas";

/**
 * Plantilla de la nota del día (ver docs/specs/2026-11-11-di-019-plantilla.md).
 * Sólo se reconocen marcadores de fecha y título; nada se ejecuta.
 */

/** La plantilla tiene algo que DiarIA no entiende: no se crea la nota a medias. */
export class MarcadorDesconocido extends Error {
  readonly marcador: string;
  constructor(marcador: string) {
    super(`DiarIA no entiende ${marcador} en la plantilla`);
    this.name = "MarcadorDesconocido";
    this.marcador = marcador;
  }
}

// Candidatos: `<% … %>` (o un `<%` sin cerrar, hasta el fin de línea) y `{{ … }}`.
const MARCADOR = /<%.*?%>|<%.*|\{\{.*?\}\}/g;
const AHORA =
  /^<%\s*tp\.date\.now\(\s*(?:(["'])(.*?)\1\s*(?:,\s*(-?\d+)\s*)?)?\)\s*%>$/;
const TITULO = /^<%\s*tp\.file\.title\s*%>$/;
const BASICO = /^\{\{(date|title)(?::(.*))?\}\}$/;

/** La plantilla rellenada para ese día; el resto se copia tal cual. */
export function rellenarPlantilla(
  plantilla: string,
  dia: string,
  titulo: string,
): string {
  validarDia(dia);
  return plantilla.replace(MARCADOR, (marcador) => {
    try {
      return rellenar(marcador, dia, titulo);
    } catch (e) {
      if (e instanceof MarcadorDesconocido)
        throw new MarcadorDesconocido(marcador);
      throw e;
    }
  });
}

function rellenar(marcador: string, dia: string, titulo: string): string {
  if (TITULO.test(marcador)) return titulo;
  const ahora = AHORA.exec(marcador);
  if (ahora) {
    const [, , formato = "YYYY-MM-DD", desplazamiento = "0"] = ahora;
    return formatearFecha(sumarDias(dia, Number(desplazamiento)), formato);
  }
  const basico = BASICO.exec(marcador);
  if (basico?.[1] === "title" && basico[2] === undefined) return titulo;
  if (basico?.[1] === "date")
    return formatearFecha(dia, basico[2] ?? "YYYY-MM-DD");
  throw new MarcadorDesconocido(marcador);
}

const DIAS = [
  "domingo",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
];
const DIAS_CORTOS = ["dom.", "lun.", "mar.", "mié.", "jue.", "vie.", "sáb."];
const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];
const MESES_CORTOS = [
  "ene.",
  "feb.",
  "mar.",
  "abr.",
  "may.",
  "jun.",
  "jul.",
  "ago.",
  "sept.",
  "oct.",
  "nov.",
  "dic.",
];

// De más largo a más corto: `MMMM` antes que `MM` y que `M`.
const TOKENS: [string, (f: Date) => string][] = [
  ["YYYY", (f) => String(f.getUTCFullYear()).padStart(4, "0")],
  ["YY", (f) => String(f.getUTCFullYear() % 100).padStart(2, "0")],
  ["MMMM", (f) => MESES[f.getUTCMonth()]!],
  ["MMM", (f) => MESES_CORTOS[f.getUTCMonth()]!],
  ["MM", (f) => String(f.getUTCMonth() + 1).padStart(2, "0")],
  ["M", (f) => String(f.getUTCMonth() + 1)],
  ["dddd", (f) => DIAS[f.getUTCDay()]!],
  ["ddd", (f) => DIAS_CORTOS[f.getUTCDay()]!],
  ["DD", (f) => String(f.getUTCDate()).padStart(2, "0")],
  ["D", (f) => String(f.getUTCDate())],
];

/** Formato al estilo moment.js, en español; letras desconocidas son un error. */
export function formatearFecha(dia: string, formato: string): string {
  validarDia(dia);
  // Vacío: moment usaría su formato por defecto, que trae horas.
  if (formato === "") throw new MarcadorDesconocido(formato);
  const fecha = new Date(`${dia}T00:00:00Z`);
  let salida = "";
  let i = 0;
  while (i < formato.length) {
    if (formato[i] === "[") {
      const cierre = formato.indexOf("]", i);
      if (cierre === -1) throw new MarcadorDesconocido(formato);
      salida += formato.slice(i + 1, cierre);
      i = cierre + 1;
      continue;
    }
    // `DDD`/`DDDD` son el día del año en moment, no `DD` + `D`.
    if (formato.startsWith("DDD", i)) throw new MarcadorDesconocido(formato);
    const token = TOKENS.find(([t]) => formato.startsWith(t, i));
    if (token) {
      salida += token[1](fecha);
      i += token[0].length;
    } else if (/[A-Za-z]/.test(formato[i]!)) {
      throw new MarcadorDesconocido(formato);
    } else {
      salida += formato[i];
      i++;
    }
  }
  return salida;
}

/** Un desplazamiento que sale de los años 0000–9999 es un marcador que no se entiende. */
function sumarDias(dia: string, dias: number): string {
  const fecha = new Date(`${dia}T00:00:00Z`);
  fecha.setUTCDate(fecha.getUTCDate() + dias);
  const año = fecha.getUTCFullYear();
  if (Number.isNaN(año) || año < 0 || año > 9999)
    throw new MarcadorDesconocido(String(dias));
  return fecha.toISOString().slice(0, 10);
}
