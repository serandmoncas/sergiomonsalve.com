// copiado de DiarIA@e9253e236b58 — no editar; actualizar con pnpm copiar-nucleo
/**
 * Identidad de un pendiente entre notas diarias (DI-082, portado del spike
 * vista Hoy): la misma tarea copiada de un día a otro da la misma clave
 * aunque cambien la hora, las fechas o los emojis de Tasks.
 */

// Lo que no es "el pendiente": viñeta, cita y estado.
const PREFIJO = /^(?:[ \t]*>)*[ \t]*(?:[-*+]|\d+[.)])[ \t]+\[.\][ \t]*/;
export const HORA_INICIAL =
  /^([01]?\d|2[0-3]):[0-5]\d(?:\s*-\s*([01]?\d|2[0-3]):[0-5]\d)?\s+/;

/** El texto de la tarea sin viñeta ni estado. */
export function cuerpo(linea: string): string {
  return linea.replace(PREFIJO, "").trim();
}

/** Clave para reconocer el mismo pendiente en notas distintas ("" si no tiene texto). */
export function clave(linea: string): string {
  return cuerpo(linea)
    .replace(HORA_INICIAL, "")
    .normalize("NFC")
    .toLowerCase()
    .replace(/[📅⏳🛫✅➕❌]\s*\d{4}-\d{2}-\d{2}/gu, "")
    .replace(/\d{4}-\d{2}-\d{2}/g, "")
    .replace(/🔁[^📅⏳🛫✅➕❌#]*/gu, "")
    .replace(/#rutina\/\S+/g, "")
    .replace(/[🌙⏫🔼🔽⏬]/gu, "")
    .replace(/\s\^[a-z0-9-]+$/, "")
    .replace(/\[\[([^\]|#]+)(?:[^\]]*)\]\]/g, "$1")
    .replace(/[*_~`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Hora escrita en una tarea, en minutos desde la medianoche. */
export interface Hora {
  ini: number;
  fin: number | null;
  escrita: string;
}

/** "10:00", "10:00 - 11:30" (Day Planner) o "3pm". */
export function horaDe(texto: string): Hora | null {
  const m = texto.match(
    /(?:^|\s)([01]?\d|2[0-3]):([0-5]\d)(?:\s*-\s*([01]?\d|2[0-3]):([0-5]\d))?(?=\s|$)/,
  );
  if (m) {
    const ini = +m[1]! * 60 + +m[2]!;
    return {
      ini,
      fin: m[3] ? +m[3] * 60 + +m[4]! : null,
      escrita: m[0].trim(),
    };
  }
  const p = texto.match(/(?:^|\s)(1[0-2]|0?[1-9])\s?(am|pm|a\.m\.|p\.m\.)/i);
  if (p) {
    const h = (+p[1]! % 12) + (p[2]!.toLowerCase().startsWith("p") ? 12 : 0);
    return { ini: h * 60, fin: null, escrita: p[0].trim() };
  }
  return null;
}
