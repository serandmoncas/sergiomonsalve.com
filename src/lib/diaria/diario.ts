// copiado de DiarIA@7b76fe16a8dd — no editar; actualizar con pnpm copiar-nucleo
import { fechaDeNota, validarDia as validar } from "./fechas";
import type { Indice } from "./indice";

/** Qué hacer al abrir un día (ver docs/specs/2026-11-06-di-015-notas-diarias.md). */
export type Apertura =
  | { tipo: "existe"; ruta: string }
  /** Varias notas y no exactamente una en la raíz: no se adivina. */
  | { tipo: "varias"; rutas: readonly string[] }
  /** El día no tiene nota: se crearía en la raíz. */
  | { tipo: "crear"; ruta: string };

export interface Diario {
  /** Días con nota, de más antiguo a más reciente. */
  readonly dias: readonly string[];
  /** Las notas de ese día; la de la raíz, primero. */
  notasDe(dia: string): readonly string[];
  abrir(dia: string): Apertura;
  /** El día con nota más cercano antes de `dia`, o `null`. */
  anterior(dia: string): string | null;
  /** El día con nota más cercano después de `dia`, o `null`. */
  siguiente(dia: string): string | null;
}

/** "AAAA-MM-DD" de `ahora` en esa zona horaria (por defecto, la del sistema). */
export function hoy(ahora: Date, zonaHoraria?: string): string {
  // Por partes: el orden y los separadores cambian según el idioma que tenga el motor.
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: zonaHoraria,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(ahora);
  const parte = (tipo: Intl.DateTimeFormatPartTypes) =>
    partes.find((p) => p.type === tipo)?.value ?? "";
  return `${parte("year")}-${parte("month")}-${parte("day")}`;
}

export function crearDiario(indice: Indice): Diario {
  const porDia = new Map<string, string[]>();
  for (const ruta of indice.notas) {
    const dia = fechaDeNota(ruta);
    if (dia === null) continue;
    const lista = porDia.get(dia);
    if (lista) lista.push(ruta);
    else porDia.set(dia, [ruta]);
  }
  for (const lista of porDia.values()) {
    lista.sort((a, b) => Number(enRaiz(b)) - Number(enRaiz(a)) || orden(a, b));
    Object.freeze(lista);
  }
  const dias = Object.freeze([...porDia.keys()].sort());

  /** Cuántos días con nota hay antes de `dia` (búsqueda binaria). */
  const antesDe = (dia: string): number => {
    let [lo, hi] = [0, dias.length];
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if ((dias[mid] ?? "") < dia) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  };

  const notasDe = (dia: string) => porDia.get(validar(dia)) ?? [];

  return Object.freeze({
    dias,
    notasDe,
    abrir(dia: string): Apertura {
      const notas = notasDe(dia);
      const [primera] = notas;
      if (primera === undefined) return { tipo: "crear", ruta: `${dia}.md` };
      // "La raíz gana" sólo si hay una sola en la raíz (como en DI-013).
      if (notas.length === 1 || notas.filter(enRaiz).length === 1)
        return { tipo: "existe", ruta: primera };
      return { tipo: "varias", rutas: notas };
    },
    anterior: (dia: string) => dias[antesDe(validar(dia)) - 1] ?? null,
    siguiente(dia: string) {
      const i = antesDe(validar(dia));
      return (dias[i] === dia ? dias[i + 1] : dias[i]) ?? null;
    },
  });
}

function enRaiz(ruta: string): boolean {
  return !ruta.includes("/");
}

function orden(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
