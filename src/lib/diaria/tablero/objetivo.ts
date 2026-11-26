// copiado de DiarIA@e9253e236b58 — no editar; actualizar con pnpm copiar-nucleo
/**
 * Un objetivo con su tablero de contactos (DI-082, portado del spike).
 *
 * - `<Objetivo>.md`: propiedades + "Para qué", "Hitos", "Siguiente acción".
 * - `<Objetivo> - contactos.md`: tablero del plugin Kanban de Obsidian,
 *   `## Columna` y una tarjeta por línea `- [ ] …`. Cada tarjeta guarda su
 *   historia al final: `(Contactado 2026-12-02) (Respondió …)`.
 *
 * Todo es texto entrante y texto saliente: leer y guardar es del llamador.
 */

export const COLUMNAS = [
  "Por contactar",
  "Contactado",
  "Respondió",
  "Entrevista",
  "Oferta",
  "Descartado",
] as const;
export type Columna = (typeof COLUMNAS)[number];

const EVENTO = new RegExp(
  `\\((${COLUMNAS.join("|")}) (\\d{4}-\\d{2}-\\d{2})\\)`,
  "gu",
);

export function leerObjetivo(nombre: string, t: string) {
  const prop = (k: string) =>
    t.match(new RegExp(`^${k}:\\s*"?(.*?)"?\\s*$`, "m"))?.[1] ?? null;
  const seccion = (titulo: string) => {
    const m = t.match(
      new RegExp(`^## ${titulo}\\s*\\n([\\s\\S]*?)(?=^## |$(?![\\s\\S]))`, "m"),
    );
    return (m?.[1] ?? "").trim();
  };
  const hitos = seccion("Hitos")
    .split("\n")
    .map((l) => l.match(/^\s*- \[(.)\]\s+(.*)$/))
    .filter(Boolean)
    .map((m) => ({ hecho: m![1] !== " ", texto: m![2]!.trim() }));
  return {
    nombre,
    area: prop("area")?.replace(/\[\[|\]\]/g, "") ?? null,
    estado: prop("estado"),
    inicio: prop("inicio"),
    apetito: prop("apetito"),
    indicador: prop("indicador"),
    metaDiaria: Number(prop("meta_diaria") ?? 1),
    metaIdeal: Number(prop("meta_ideal") ?? 3),
    paraQue: seccion("Para qué").replace(/\n+/g, " "),
    hitoActual: hitos.find((h) => !h.hecho)?.texto ?? null,
    hitos,
    siguiente: seccion("Siguiente acción")
      .replace(/^\s*- \[.\]\s*/gm, "")
      .split("\n")[0]
      ?.trim(),
  };
}
export type Objetivo = ReturnType<typeof leerObjetivo>;

interface Tarjeta {
  linea: number;
  texto: string;
  nombre: string;
  persona: boolean;
  eventos: { columna: string; fecha: string }[];
}

function tarjeta(t: string, linea: number): Tarjeta {
  const eventos = [...t.matchAll(EVENTO)].map((m) => ({
    columna: m[1]!,
    fecha: m[2]!,
  }));
  const limpio = t.replace(EVENTO, "").replace(/\s+/g, " ").trim();
  return {
    linea,
    texto: t,
    nombre: limpio,
    persona: /\[\[[^\]]+\]\]/.test(limpio),
    eventos,
  };
}

function leerTablero(texto: string) {
  const lineas = texto.split("\n");
  const columnas = new Map<string, { linea: number; tarjetas: Tarjeta[] }>();
  let actual: string | null = null;
  lineas.forEach((l, i) => {
    const h = l.match(/^## (.+?)\s*$/);
    if (h) {
      actual = h[1]!;
      columnas.set(actual, { linea: i, tarjetas: [] });
      return;
    }
    const c = l.match(/^- \[(.)\] (.*)$/);
    if (c && actual) columnas.get(actual)!.tarjetas.push(tarjeta(c[2]!, i));
  });
  return { lineas, columnas };
}

// Lunes de la semana de una fecha (semanas de lunes a domingo).
const lunes = (d: string) => {
  const t = new Date(`${d}T00:00:00Z`);
  t.setUTCDate(t.getUTCDate() - ((t.getUTCDay() + 6) % 7));
  return t.toISOString().slice(0, 10);
};

/** Objetivo, columnas y conteo semanal hasta `hasta` (o hasta hoy, si es después). */
export function vistaObjetivo(
  nombre: string,
  notaTexto: string,
  contactos: string,
  hoy: string,
  hasta: string,
) {
  const nota = leerObjetivo(nombre, notaTexto);
  const { columnas } = leerTablero(contactos);
  const todas = [...columnas.values()].flatMap((c) => c.tarjetas);
  const eventos = todas.flatMap((t) => t.eventos);
  const contactosHoy = eventos.filter(
    (e) => e.columna === "Contactado" && e.fecha === hoy,
  ).length;
  // Conteo por semana desde la semana del inicio (o del primer evento).
  const primero = [
    nota.inicio ?? hoy,
    ...eventos.map((e) => e.fecha),
  ].sort()[0]!;
  const semanas: Record<string, Record<string, number>> = {};
  for (let d = lunes(primero); d <= lunes(hoy > hasta ? hoy : hasta);) {
    semanas[d] = Object.fromEntries(COLUMNAS.slice(1).map((c) => [c, 0]));
    const t = new Date(`${d}T00:00:00Z`);
    t.setUTCDate(t.getUTCDate() + 7);
    d = t.toISOString().slice(0, 10);
  }
  for (const e of eventos) {
    const s = semanas[lunes(e.fecha)];
    if (s && e.columna in s) s[e.columna]!++;
  }
  const personas = todas.filter((t) => t.persona);
  return {
    nota,
    hoy,
    contactosHoy,
    columnas: [...columnas].map(([n, c]) => ({
      nombre: n,
      tarjetas: c.tarjetas.map(
        ({ linea, texto, nombre: nn, persona, eventos: ev }) => ({
          id: linea,
          texto,
          nombre: nn,
          persona,
          eventos: ev,
          desde: ev.at(-1)?.fecha ?? null,
        }),
      ),
    })),
    semanas: Object.entries(semanas).map(([desde, c]) => ({ desde, ...c })),
    totales: {
      contactos: eventos.filter((e) => e.columna === "Contactado").length,
      personas: personas.length,
      personasContactadas: personas.filter((t) => t.eventos.length).length,
    },
  };
}
export type VistaObjetivo = ReturnType<typeof vistaObjetivo>;

type Cambio = { texto: string } | { error: string };

/** Sin saltos de línea ni eventos, aunque vengan anidados (`(Ofe(Oferta …)rta …)`). */
function limpiarCampo(x: unknown): string {
  let t = String(x ?? "").replace(/[\r\n]+/g, " ");
  for (let antes = ""; antes !== t;) {
    antes = t;
    t = t.replace(EVENTO, "");
  }
  return t.trim().slice(0, 200);
}

/** Una tarjeta nueva al final de "Contactado", con la fecha de hoy. */
export function agregarContacto(
  contactos: string,
  b: { nombre?: string; canal?: string; nota?: string },
  hoy: string,
): Cambio {
  const nombre = limpiarCampo(b.nombre);
  if (!nombre) return { error: "falta a quién" };
  const partes = [nombre, limpiarCampo(b.canal), limpiarCampo(b.nota)].filter(
    Boolean,
  );
  const { lineas, columnas } = leerTablero(contactos);
  const col = columnas.get("Contactado");
  if (!col) return { error: "el tablero no tiene la columna Contactado" };
  const fin = col.tarjetas.at(-1)?.linea ?? col.linea + 1;
  lineas.splice(fin + 1, 0, `- [ ] ${partes.join(" · ")} (Contactado ${hoy})`);
  return { texto: lineas.join("\n") };
}

/**
 * Mueve la tarjeta cuyo texto es exactamente `texto` al final de la columna
 * `a`, con su evento. Se busca por texto y no por línea para poder repetir la
 * acción sobre una versión nueva del archivo (DI-087).
 */
export function moverTarjeta(
  contactos: string,
  b: { texto?: string; a?: string },
  hoy: string,
): Cambio {
  const a = String(b.a) as Columna;
  if (!COLUMNAS.includes(a)) return { error: "columna desconocida" };
  const { lineas, columnas } = leerTablero(contactos);
  const iguales = [...columnas.values()]
    .flatMap((c) => c.tarjetas)
    .filter((t) => b.texto && t.texto === b.texto);
  // Si no está o hay dos iguales, no se adivina.
  if (iguales.length === 0) return { error: "el tablero cambió; recarga" };
  if (iguales.length > 1)
    return { error: "hay dos tarjetas iguales; corrige el archivo a mano" };
  const id = iguales[0]!.linea;
  const actual = lineas[id]!;
  const destino = columnas.get(a);
  if (!destino) return { error: `el tablero no tiene la columna ${a}` };
  lineas.splice(id, 1);
  // La línea del destino se recalcula tras quitar la tarjeta.
  const ajusta = (n: number) => (n > id ? n - 1 : n);
  const fin = ajusta(destino.tarjetas.at(-1)?.linea ?? destino.linea + 1);
  const nueva =
    a === "Por contactar"
      ? actual
      : `${actual.replace(/[ \t]+$/, "")} (${a} ${hoy})`;
  lineas.splice(Math.max(fin + 1, ajusta(destino.linea) + 1), 0, nueva);
  return { texto: lineas.join("\n") };
}
