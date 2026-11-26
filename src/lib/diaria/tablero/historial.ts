// copiado de DiarIA@3803d65e772c — no editar; actualizar con pnpm copiar-nucleo
/**
 * Historia de cada pendiente en las notas diarias y su ritmo (DI-082,
 * portado del spike vista Hoy). Una rutina se completa una y otra vez; un
 * pendiente atascado se copia abierto y casi nunca se marca.
 */
import { fechaDeNota } from "../fechas";
import { tareas } from "../tareas";
import { diasEntre, sumarDias } from "./dias";
import { clave, cuerpo } from "./pendientes";

export interface NotaDiaria {
  ruta: string;
  texto: string;
}
/** Notas diarias por día `YYYY-MM-DD`. */
export type Diarias = ReadonlyMap<string, NotaDiaria>;

/** Día → ruta de su nota diaria. Si hay varias para un día, gana la primera. */
export function rutasDiarias(notas: readonly string[]): Map<string, string> {
  const m = new Map<string, string>();
  for (const ruta of notas) {
    const dia = fechaDeNota(ruta);
    if (dia && !m.has(dia)) m.set(dia, ruta);
  }
  return m;
}

export interface Historia {
  /** Días en que aparece, en cualquier estado. */
  dias: string[];
  /** Días en que se marcó hecho. */
  hechas: string[];
  ap: { dia: string; ruta: string; linea: number }[];
  /** Cuerpo de la última aparición. */
  texto: string;
  /** Posición relativa en cada nota: 0 = primera tarea, 1 = última. */
  pos: number[];
}

export interface Historial {
  porClave: ReadonlyMap<string, Historia>;
  dias: readonly string[];
  /** Día → su índice entre las notas diarias ordenadas. */
  posNota: ReadonlyMap<string, number>;
}

export function crearHistorial(diarias: Diarias): Historial {
  const dias = [...diarias.keys()].sort();
  const posNota = new Map(dias.map((d, i) => [d, i]));
  const porClave = new Map<string, Historia>();
  for (const d of dias) {
    const n = diarias.get(d)!;
    const ts = tareas(n.texto);
    for (const [i, t] of ts.entries()) {
      const linea = n.texto.slice(t.inicio, t.fin);
      const k = clave(linea);
      if (!k) continue;
      const h = porClave.get(k) ?? {
        dias: [],
        hechas: [],
        ap: [],
        texto: "",
        pos: [],
      };
      if (h.dias.at(-1) !== d) {
        h.dias.push(d);
        h.pos.push(ts.length > 1 ? i / (ts.length - 1) : 0);
        h.ap.push({
          dia: d,
          ruta: n.ruta,
          linea: n.texto.slice(0, t.inicio).split("\n").length,
        });
      }
      h.texto = cuerpo(linea);
      if (t.hecha && h.hechas.at(-1) !== d) h.hechas.push(d);
      porClave.set(k, h);
    }
  }
  return { porClave, dias, posNota };
}

const NOMBRES: [number, string][] = [
  [1, "diaria"],
  [4, "cada 2–4 días"],
  [10, "semanal"],
  [20, "quincenal"],
  [45, "mensual"],
];

export interface Ritmo {
  cada: number;
  regular: boolean;
  etiqueta: string;
  vecesHecha: number;
  ultimaHecha: string;
  proxima: string;
  /** > 0: ya tocaba. */
  retraso: number;
}

/**
 * Ritmo hasta `base`: mediana de los saltos entre las últimas 10 apariciones.
 * Regular si al menos 6 de cada 10 saltos están cerca de la mediana.
 */
export function ritmoDe(h: Historial, k: string, base: string): Ritmo | null {
  const t = h.porClave.get(k);
  if (!t) return null;
  const hechas = t.hechas.filter((d) => d <= base);
  const dias = t.dias.filter((d) => d <= base).slice(-10);
  if (hechas.length < 2 || dias.length < 3) return null;
  const enDias = dias.slice(1).map((d, i) => diasEntre(dias[i]!, d));
  const enNotas = dias
    .slice(1)
    .map((d, i) => h.posNota.get(d)! - h.posNota.get(dias[i]!)!);
  const med = (x: number[]) => [...x].sort((a, b) => a - b)[x.length >> 1]!;
  // No hay nota todos los días: lo que se repite cada pocos días se mide en
  // notas (una tarea que está en cada nota es diaria aunque haya huecos).
  // Lo semanal o más espaciado sigue en días de calendario.
  const porNotas = med(enDias) < 7;
  const saltos = porNotas ? enNotas : enDias;
  const cada = med(saltos);
  const cerca = saltos.filter((g) => g >= cada * 0.5 && g <= cada * 1.5 + 1);
  const regular = cerca.length / saltos.length >= 0.6;
  const nombre =
    NOMBRES.find(([tope]) => cada <= tope)?.[1] ??
    (cada >= 300 && cada <= 430 ? "anual" : `cada ~${cada} días`);
  const proxima = sumarDias(hechas.at(-1)!, cada); // desde la última vez hecha
  return {
    cada,
    regular,
    etiqueta: regular ? nombre : `sin ritmo fijo, ~cada ${cada} días`,
    vecesHecha: hechas.length,
    ultimaHecha: hechas.at(-1)!,
    proxima,
    retraso: diasEntre(proxima, base),
  };
}
