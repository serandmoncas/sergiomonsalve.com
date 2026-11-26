// copiado de DiarIA@e9253e236b58 — no editar; actualizar con pnpm copiar-nucleo
/**
 * Vistas Hoy, Día y mes del tablero (DI-082, portadas del spike vista Hoy).
 * Devuelven la misma forma JSON que el spike: CA-1 lo comprueba con hashes.
 */
import { tareas } from "../tareas";
import { diasEntre, sumarDias } from "./dias";
import { ritmoDe, type Diarias, type Historial } from "./historial";
import { clave, cuerpo, horaDe } from "./pendientes";
import { rutinasDelArchivo } from "./rutinas";

/** Días hacia atrás que mira la vista Hoy. */
export const VENTANA = 28;
/** Notas abiertas para contar como arrastrado. */
export const UMBRAL = 3;

interface Aparicion {
  dia: string;
  ruta: string;
  linea: number; // 1-based
  texto: string; // línea completa
}

function abiertas(diarias: Diarias, dia: string): Aparicion[] {
  const n = diarias.get(dia);
  if (!n) return [];
  return tareas(n.texto)
    .filter((t) => t.estado === " ")
    .map((t) => ({
      dia,
      ruta: n.ruta,
      linea: n.texto.slice(0, t.inicio).split("\n").length,
      texto: n.texto.slice(t.inicio, t.fin),
    }))
    .filter((a) => clave(a.texto) !== "");
}

function cerradas(diarias: Diarias, dia: string): Set<string> {
  const n = diarias.get(dia);
  if (!n) return new Set();
  return new Set(
    tareas(n.texto)
      .filter((t) => t.estado !== " ")
      .map((t) => clave(n.texto.slice(t.inicio, t.fin))),
  );
}

/**
 * Para hoy, arrastrados, quedaron atrás y rutinas. `rutinas` es el texto de
 * `Rutinas.md`, o `null` si no existe (entonces salen del historial).
 */
export function vistaHoy(
  diarias: Diarias,
  h: Historial,
  rutinas: string | null,
  dia: string,
) {
  const base = h.dias.filter((d) => d <= dia).at(-1);
  if (!base)
    return {
      dia,
      base: null,
      hoy: [],
      arrastrados: [],
      atras: [],
      rutinas: [],
      rutinasLuego: [],
      medidas: {},
    };
  // La ventana y el arrastre se cuentan desde la última nota, no desde `dia`:
  // si la copia es de hace días, contar desde hoy inflaría todo.
  const desde = sumarDias(base, -(VENTANA - 1));
  const ventana = h.dias.filter((d) => d >= desde && d <= base);

  const porClave = new Map<string, Aparicion[]>();
  for (const d of ventana)
    for (const a of abiertas(diarias, d)) {
      const k = clave(a.texto);
      const l = porClave.get(k) ?? [];
      if (!l.some((x) => x.dia === a.dia)) l.push(a);
      porClave.set(k, l);
    }

  const enBase = new Set(abiertas(diarias, base).map((a) => clave(a.texto)));
  const items = [...enBase].map((k) => {
    const ap = porClave.get(k)!.sort((a, b) => a.dia.localeCompare(b.dia));
    const ultima = ap.at(-1)!;
    return {
      clave: k,
      texto: cuerpo(ultima.texto),
      notas: ap.length,
      dias: diasEntre(ap[0]!.dia, base),
      tope: ap[0]!.dia === ventana[0], // empezó antes de la ventana
      primera: ap[0]!.dia,
      apariciones: ap.map(({ dia, ruta, linea }) => ({ dia, ruta, linea })),
    };
  });
  // Quedaron atrás: abiertos en una nota de la ventana, que no siguen abiertos
  // en la última y no se cerraron en una nota posterior.
  const cierres = ventana.map((d) => [d, cerradas(diarias, d)] as const);
  const atras = [...porClave]
    .filter(([k]) => !enBase.has(k))
    .map(([k, ap]) => {
      ap.sort((a, b) => a.dia.localeCompare(b.dia));
      return { k, ap, ultima: ap.at(-1)! };
    })
    .filter(
      ({ k, ultima }) => !cierres.some(([d, c]) => d >= ultima.dia && c.has(k)),
    )
    .map(({ k, ap, ultima }) => ({
      clave: k,
      texto: cuerpo(ultima.texto),
      notas: ap.length,
      dias: diasEntre(ultima.dia, base),
      tope: false,
      primera: ap[0]!.dia,
      ultimaVez: ultima.dia,
      apariciones: ap.map(({ dia, ruta, linea }) => ({ dia, ruta, linea })),
    }))
    .sort((a, b) => b.dias - a.dias);
  // Las rutinas salen de los otros grupos: no son atrasos.
  const conRitmo = [...items, ...atras].map((i) => ({
    ...i,
    ritmo: ritmoDe(h, i.clave, base),
  }));
  const delArchivo =
    rutinas === null ? null : rutinasDelArchivo(rutinas, h, dia);
  const tocan = delArchivo
    ? delArchivo
        .filter((r) => r.toca)
        .sort((a, b) => a.cada - b.cada || b.retraso - a.retraso)
    : conRitmo
        .filter((i) => i.ritmo)
        .sort((a, b) => b.ritmo!.retraso - a.ritmo!.retraso);
  const rutinasLuego = (delArchivo ?? [])
    .filter((r) => !r.toca)
    .sort((a, b) => a.proxima.localeCompare(b.proxima));
  const esRutina = new Set([
    ...tocan.map((i) => i.clave),
    ...rutinasLuego.map((i) => i.clave),
    // con archivo, solo cuenta como rutina lo que está en el archivo
    ...(delArchivo ? [] : conRitmo.filter((i) => i.ritmo).map((i) => i.clave)),
  ]);
  atras.splice(0, atras.length, ...atras.filter((i) => !esRutina.has(i.clave)));
  const pendientes = items.filter((i) => !esRutina.has(i.clave));
  const arrastrados = pendientes
    .filter((i) => i.notas >= UMBRAL)
    .sort((a, b) => b.dias - a.dias || b.notas - a.notas);
  const hoy = pendientes.filter((i) => i.notas < UMBRAL);

  // Riesgo del spike: pendientes "nuevos" que se parecen a uno anterior
  // (mismos primeros 20 caracteres) pero no se juntaron.
  const prefijos = new Map<string, number>();
  for (const k of porClave.keys()) {
    const p = k.slice(0, 20);
    prefijos.set(p, (prefijos.get(p) ?? 0) + 1);
  }
  const sueltos = hoy.filter(
    (i) =>
      i.clave.length >= 20 && (prefijos.get(i.clave.slice(0, 20)) ?? 0) > 1,
  ).length;

  return {
    dia,
    base,
    notaHoy: diarias.get(dia)?.ruta ?? null,
    ventana: { desde, notas: ventana.length },
    hoy,
    arrastrados,
    atras,
    rutinas: tocan,
    rutinasLuego,
    rutinasDesde: delArchivo ? "archivo" : "historial",
    medidas: {
      rutinas: tocan.length,
      quedaronAtras: atras.length,
      abiertosEnBase: items.length,
      arrastrados: arrastrados.length,
      parecidosSinJuntar: sueltos,
    },
  };
}
export type VistaHoy = ReturnType<typeof vistaHoy>;

/** Cada día del mes `YYYY-MM`: si tiene nota y cuántas tareas abiertas y hechas. */
export function mes(diarias: Diarias, m: string) {
  const [a, mm] = m.split("-").map(Number) as [number, number];
  const dias = new Date(Date.UTC(a, mm, 0)).getUTCDate();
  return Array.from({ length: dias }, (_, i) => {
    const dia = `${m}-${String(i + 1).padStart(2, "0")}`;
    const n = diarias.get(dia);
    const ts = n ? tareas(n.texto) : [];
    return {
      dia,
      existe: !!n,
      abiertas: ts.filter((t) => t.estado === " ").length,
      hechas: ts.filter((t) => t.hecha).length,
    };
  });
}

const mediana = (x: number[]) =>
  [...x].sort((a, b) => a - b)[x.length >> 1] ?? 0;
const DESDE = 6 * 60; // el día del horario: 6:00 a 23:00
const HASTA = 23 * 60;

/** Las tareas de un día con su orden propuesto: hora escrita o posición habitual. */
export function vistaDia(
  diarias: Diarias,
  h: Historial,
  rutinas: string | null,
  dia: string,
) {
  const n = diarias.get(dia);
  const ts = n ? tareas(n.texto) : [];
  // Posición habitual: mediana de su lugar en notas anteriores a este día.
  const previasDe = (k: string) => {
    const t = h.porClave.get(k);
    return (t?.pos ?? []).filter((_, j) => t!.dias[j]! < dia);
  };
  const lugar = (p: number) =>
    p < 0.34 ? "al inicio" : p > 0.66 ? "al final" : "a mitad";
  const lista = ts.map((t, i) => {
    const linea = n!.texto.slice(t.inicio, t.fin);
    const k = clave(linea);
    const c = cuerpo(linea);
    const previas = previasDe(k);
    const hoy = ts.length > 1 ? i / (ts.length - 1) : 0;
    const hora = horaDe(c);
    const pos = previas.length >= 2 ? mediana(previas) : hoy;
    const motivo = hora
      ? `hora escrita ${hora.escrita}`
      : previas.length >= 2
        ? `suele ir ${lugar(pos)} (en ${previas.length} notas)`
        : "su lugar en la nota";
    return {
      clave: k,
      texto: c,
      estado: t.estado,
      hecha: t.hecha,
      linea: n!.texto.slice(0, t.inicio).split("\n").length,
      original: linea,
      indice: i,
      hora,
      // Minuto estimado del día para ordenar: la hora escrita manda; si no,
      // la posición habitual se reparte entre las 6:00 y las 23:00.
      estimado: hora ? hora.ini : Math.round(DESDE + pos * (HASTA - DESDE)),
      motivo,
      notas: previas.length,
      origen: "nota",
    };
  });
  // Lo que no está en la nota pero toca ese día: las rutinas que tocan y, si el
  // día no tiene nota, los pendientes abiertos de la última nota.
  const v = vistaHoy(diarias, h, rutinas, dia);
  const ya = new Set(lista.map((t) => t.clave));
  const extra = [
    ...v.rutinas.map((i) => ({ i, origen: "rutina" })),
    ...(n ? [] : v.hoy.map((i) => ({ i, origen: "pendiente" }))),
  ]
    .filter(({ i }) => !ya.has(i.clave) && (ya.add(i.clave), true))
    .map(({ i, origen }, j) => {
      const previas = previasDe(i.clave);
      const hora = horaDe(i.texto);
      const pos = previas.length >= 2 ? mediana(previas) : 0.5;
      const de =
        origen === "rutina"
          ? `rutina ${(i as { nombre?: string }).nombre ?? ""}`.trim()
          : "pendiente de la última nota";
      return {
        clave: i.clave,
        texto: i.texto,
        estado: " ",
        hecha: false,
        linea: 0,
        original: "", // no está en la nota: sería una línea nueva
        indice: lista.length + j,
        hora,
        estimado: hora ? hora.ini : Math.round(DESDE + pos * (HASTA - DESDE)),
        motivo: hora
          ? `${de} · hora escrita ${hora.escrita}`
          : previas.length >= 2
            ? `${de} · suele ir ${lugar(pos)}`
            : de,
        notas: previas.length,
        origen,
        // para fijar la hora en Rutinas.md
        lineaArchivo: (i as { lineaArchivo?: number }).lineaArchivo ?? null,
        archivo: (i as { original?: string }).original ?? null,
      };
    });
  const todas = [...lista, ...extra];
  const propuesto = [...todas].sort(
    (a, b) => a.estimado - b.estimado || a.indice - b.indice,
  );
  return {
    dia,
    nota: n?.ruta ?? null,
    tareas: todas,
    orden: propuesto.map((t) => t.indice),
    conHora: todas.filter((t) => t.hora).length,
    conHistorial: todas.filter((t) => t.notas >= 2).length,
    deLaNota: lista.length,
    rutinas: extra.filter((t) => t.origen === "rutina").length,
    pendientes: extra.filter((t) => t.origen === "pendiente").length,
  };
}
export type VistaDia = ReturnType<typeof vistaDia>;
