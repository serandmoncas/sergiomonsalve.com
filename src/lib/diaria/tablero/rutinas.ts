// copiado de DiarIA@7b76fe16a8dd — no editar; actualizar con pnpm copiar-nucleo
/**
 * `Rutinas.md` (DI-082, portado del spike vista Hoy): una línea por rutina en
 * formato del plugin Tasks, `- [ ] Texto 🔁 every …`, con pausa (🛫) y
 * terminada (`[-] … ❌`). La frecuencia manda; la historia de las notas
 * diarias dice cuándo se hizo por última vez.
 */
import { diasEntre, sumarDias } from "./dias";
import { ritmoDe, type Historial } from "./historial";
import { clave, HORA_INICIAL } from "./pendientes";

export interface ReglaRutina {
  cada: number;
  unidad: "dias" | "meses";
  texto: string;
}

const distintivo = (r: ReglaRutina) =>
  r.unidad === "meses" ? (r.cada >= 12 ? "A" : "M") : r.cada >= 7 ? "S" : "D";
const NOMBRE = { D: "diaria", S: "semanal", M: "mensual", A: "anual" };

/** De un ritmo en días a la regla de Tasks más cercana. */
export function reglaDe(cada: number): string {
  if (cada <= 1) return "every day";
  if (cada <= 4) return `every ${cada} days`;
  if (cada <= 10) return "every week";
  if (cada <= 20) return "every 2 weeks";
  if (cada <= 45) return "every month";
  return "every year";
}

export function leerRegla(t: string): ReglaRutina | null {
  const r = t.trim().toLowerCase();
  let m: RegExpMatchArray | null;
  if (/^every day\b/.test(r)) return { cada: 1, unidad: "dias", texto: r };
  if ((m = r.match(/^every (\d+) days?\b/)))
    return { cada: +m[1]!, unidad: "dias", texto: r };
  if (/^every week\b/.test(r)) return { cada: 7, unidad: "dias", texto: r };
  if ((m = r.match(/^every (\d+) weeks?\b/)))
    return { cada: 7 * +m[1]!, unidad: "dias", texto: r };
  if (/^every month\b/.test(r)) return { cada: 1, unidad: "meses", texto: r };
  if ((m = r.match(/^every (\d+) months?\b/)))
    return { cada: +m[1]!, unidad: "meses", texto: r };
  if (/^every year\b/.test(r)) return { cada: 12, unidad: "meses", texto: r };
  return null;
}

export function sumarRegla(dia: string, r: ReglaRutina): string {
  if (r.unidad === "dias") return sumarDias(dia, r.cada);
  const t = new Date(`${dia}T00:00:00Z`);
  t.setUTCMonth(t.getUTCMonth() + r.cada);
  return t.toISOString().slice(0, 10);
}

export interface Rutina {
  clave: string;
  texto: string;
  regla: string;
  distintivo: "D" | "S" | "M" | "A";
  nombre: string;
  /** En días (los meses cuentan 30). */
  cada: number;
  ultimaHecha: string | null;
  vecesHecha: number;
  proxima: string;
  /** ≥ 0: toca. */
  retraso: number;
  pausadaHasta: string | null;
  toca: boolean;
  dias: number;
  notas: number;
  apariciones: { dia: string; ruta: string; linea: number }[];
  /** Línea en `Rutinas.md`, de base 1. */
  lineaArchivo: number;
  original: string;
}

/** Las rutinas activas de `Rutinas.md` y si tocan el `dia` dado. */
export function rutinasDelArchivo(
  texto: string,
  h: Historial,
  dia: string,
): Rutina[] {
  const out: Rutina[] = [];
  for (const [n, l] of texto.split("\n").entries()) {
    // Solo las activas: `[-]` (terminada) o `[x]` quedan fuera de la vista.
    const m = l.match(/^\s*[-*+] \[ \]\s+(.*?)\s*🔁\s*(.+?)\s*$/u);
    if (!m) continue;
    // Pausa: fecha de inicio de Tasks (🛫). Antes de esa fecha no se muestra.
    const pausadaHasta = l.match(/🛫\s*(\d{4}-\d{2}-\d{2})/u)?.[1] ?? null;
    const regla = leerRegla(m[2]!);
    if (!regla) continue;
    const t = m[1]!.trim();
    const k = clave(t);
    const hist = h.porClave.get(k);
    const hechas = (hist?.hechas ?? []).filter((d) => d <= dia);
    const ultimaHecha = hechas.at(-1) ?? null;
    const proxima = ultimaHecha ? sumarRegla(ultimaHecha, regla) : dia;
    const ap = (hist?.ap ?? []).filter((a) => a.dia <= dia).slice(-10);
    const d = distintivo(regla);
    out.push({
      clave: k,
      texto: t,
      regla: regla.texto,
      distintivo: d,
      nombre: NOMBRE[d],
      cada: regla.unidad === "dias" ? regla.cada : regla.cada * 30,
      ultimaHecha,
      vecesHecha: hechas.length,
      proxima,
      retraso: diasEntre(proxima, dia),
      pausadaHasta: pausadaHasta && pausadaHasta > dia ? pausadaHasta : null,
      toca: proxima <= dia && !(pausadaHasta && pausadaHasta > dia),
      dias: ultimaHecha ? diasEntre(ultimaHecha, dia) : 0,
      notas: hechas.length,
      apariciones: ap,
      lineaArchivo: n + 1,
      original: l,
    });
  }
  return out;
}

// Texto de la rutina para el archivo: sin fechas ni emojis de Tasks.
const limpiarTexto = (t: string) =>
  t
    .replace(/[📅⏳🛫✅➕❌]\s*\d{4}-\d{2}-\d{2}/gu, "")
    .replace(/🔁[^📅⏳🛫✅➕❌#]*/gu, "")
    .replace(/#rutina\/\S+/g, "")
    .replace(/\s\^[a-z0-9-]+$/, "")
    .replace(/\s+/g, " ")
    .trim();

/** Primera propuesta de `Rutinas.md`, armada con el historial hasta `hoy`. */
export function proponerRutinas(
  h: Historial,
  hoy: string,
): { texto: string; cuantas: number } {
  // La última nota hasta hoy: puede haber notas diarias con fecha futura.
  const fin = h.dias.filter((d) => d <= hoy).at(-1);
  const filas: { cada: number; linea: string }[] = [];
  if (fin) {
    const desde = sumarDias(fin, -120); // solo rutinas vivas en los últimos 4 meses
    for (const [k, t] of h.porClave) {
      if ((t.dias.at(-1) ?? "") < desde) continue;
      const r = ritmoDe(h, k, fin);
      if (!r?.regular) continue;
      if (r.cada > 45 && (r.cada < 300 || r.cada > 430)) continue;
      filas.push({
        cada: r.cada,
        linea: `- [ ] ${limpiarTexto(t.texto)} 🔁 ${reglaDe(r.cada)}`,
      });
    }
  }
  filas.sort((a, b) => a.cada - b.cada);
  const grupos: [string, (c: number) => boolean][] = [
    ["Diarias y cada pocos días", (c) => c <= 4],
    ["Semanales y quincenales", (c) => c > 4 && c <= 20],
    ["Mensuales", (c) => c > 20 && c <= 45],
    ["Anuales", (c) => c > 45],
  ];
  const texto = [
    "# Rutinas",
    "",
    "<!-- Propuesta armada de tus notas diarias (vista Hoy, spike). Corrígela:",
    "     borra lo que no sea rutina, cambia la frecuencia (every day, every 3 days,",
    "     every week, every 2 weeks, every month, every year) o agrega las que falten.",
    "     La vista Hoy la vuelve a leer en cada recarga. -->",
    "",
    ...grupos.flatMap(([titulo, f]) => {
      const l = filas.filter((x) => f(x.cada)).map((x) => x.linea);
      return l.length ? [`## ${titulo}`, "", ...l, ""] : [];
    }),
  ].join("\n");
  return { texto, cuantas: filas.length };
}

const FECHA = /^\d{4}-\d{2}-\d{2}$/;

/** Reemplaza la regla 🔁 y conserva las fechas que la siguen. */
export function cambiarFrecuencia(linea: string, regla: string): string | null {
  if (!leerRegla(regla)) return null;
  const sinFin = linea.replace(/[ \t]+$/, "");
  return sinFin.replace(/🔁[^📅⏳🛫✅➕❌]*/u, (m) =>
    m.trimEnd().length < m.length
      ? `🔁 ${regla.trim()} `
      : `🔁 ${regla.trim()}`,
  );
}

/** Pausa hasta `fecha` (🛫), reemplazando una pausa anterior. */
export function pausarRutina(linea: string, fecha: string): string | null {
  if (!FECHA.test(fecha)) return null;
  const sinFin = linea.replace(/[ \t]+$/, "");
  return /🛫\s*\d{4}-\d{2}-\d{2}/u.test(sinFin)
    ? sinFin.replace(/🛫\s*\d{4}-\d{2}-\d{2}/u, `🛫 ${fecha}`)
    : `${sinFin} 🛫 ${fecha}`;
}

/** Cierra el ciclo: `[-]` con la fecha de hoy. */
export function terminarRutina(linea: string, dia: string): string {
  const sinFin = linea.replace(/[ \t]+$/, "");
  return `${sinFin.replace("[ ]", "[-]")} ❌ ${dia}`;
}

const hhmm = (m: number) =>
  `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

/** Pone al inicio un bloque de una hora desde `ini` (minutos), o lo quita con `null`. */
export function fijarHora(linea: string, ini: number | null): string | null {
  const m = linea.match(/^(\s*[-*+] \[.\]\s+)(.*)$/);
  if (!m) return null;
  if (ini != null && !(ini >= 0 && ini < 24 * 60)) return null;
  const resto = m[2]!.replace(HORA_INICIAL, "");
  return (
    m[1]! +
    (ini == null ? "" : `${hhmm(ini)} - ${hhmm(Math.min(ini + 60, 1439))} `) +
    resto
  );
}
