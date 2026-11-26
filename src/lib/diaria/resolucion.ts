// copiado de DiarIA@7b76fe16a8dd — no editar; actualizar con pnpm copiar-nucleo
import type { Enlace } from "./enlaces";
import type { Indice } from "./indice";

/** Qué regla encontró la nota (ver docs/specs/2026-11-06-di-013-resolucion-enlaces.md). */
export type Regla =
  | "ruta-exacta"
  | "nombre"
  | "sin-mayusculas"
  | "recortado"
  | "unicode"
  | "misma-nota"
  | "carpeta-movida";

export type Resolucion =
  | { tipo: "nota" | "adjunto"; ruta: string; regla: Regla }
  | { tipo: "ambiguo"; candidatas: readonly string[]; regla: Regla }
  | { tipo: "sin-nota"; nombre: string };

export interface Resolutor {
  resolver(enlace: Enlace, desde: string): Resolucion;
  /** Notas existentes que podrían ser la que el usuario quiso decir (CA-7). */
  parecidas(nombre: string): readonly string[];
}

type Clave = (s: string) => string;

/** Reglas tolerantes, de más estricta a más laxa; cada una incluye las anteriores. */
const TOLERANTES: readonly (readonly [Regla, Clave])[] = [
  ["nombre", (s) => s],
  ["sin-mayusculas", (s) => s.toLowerCase()],
  ["recortado", (s) => s.trim().toLowerCase()],
  ["unicode", (s) => s.trim().toLowerCase().normalize("NFC")],
];

const LAXA: Clave = (s) => s.trim().toLowerCase().normalize("NFC");

const FECHA = /^\d{4}-\d{2}-\d{2}$/;
const MAX_PARECIDAS = 5;

export function crearResolutor(indice: Indice): Resolutor {
  const archivos = [...indice.notas, ...indice.adjuntos];

  // Por regla: clave del nombre → archivos, y clave de la ruta → archivos.
  const porNombre = TOLERANTES.map(([, clave]) =>
    agrupar(archivos, (r) => [clave(nombreEnlazable(r))]),
  );
  const porRuta = TOLERANTES.map(([, clave]) =>
    agrupar(archivos, (r) => [clave(r), clave(sinMd(r))]),
  );

  // Carpetas que existen, comparadas con la regla más laxa.
  const carpetas = new Set<string>();
  for (const ruta of archivos) {
    const tramos = ruta.split("/");
    for (let i = 1; i < tramos.length; i++)
      carpetas.add(LAXA(tramos.slice(0, i).join("/")));
  }

  const nombresNormalizados = indice.notas.map(
    (ruta) => [ruta, normalizarParecido(nombreEnlazable(ruta))] as const,
  );

  function resolver(enlace: Enlace, desde: string): Resolucion {
    const destino = enlace.destino;
    if (destino === "")
      return { tipo: "nota", ruta: desde, regla: "misma-nota" };

    const corte = destino.lastIndexOf("/");
    if (corte === -1) return buscar(destino, porNombre) ?? sinNota(destino);

    // Con "/" cuenta la ruta completa (formato "ruta más corta"): nada de sufijos…
    const porLaRuta = buscar(destino, porRuta);
    if (porLaRuta) return porLaRuta;
    // …salvo si la carpeta escrita ya no existe: entonces, por el nombre (decisión de Sergio).
    if (carpetas.has(LAXA(destino.slice(0, corte)))) return sinNota(destino);
    const porElNombre = buscar(destino.slice(corte + 1), porNombre);
    return porElNombre
      ? { ...porElNombre, regla: "carpeta-movida" }
      : sinNota(destino);
  }

  /** Ruta exacta y luego las reglas tolerantes; `null` si ninguna encuentra nada. */
  function buscar(
    destino: string,
    mapas: readonly Map<string, string[]>[],
  ): Exclude<Resolucion, { tipo: "sin-nota" }> | null {
    const exactas = [destino, destino + ".md"].filter((r) => indice.existe(r));
    if (exactas.length > 0) return decidir(exactas, "ruta-exacta");
    for (const [i, [regla, clave]] of TOLERANTES.entries()) {
      const k = clave(destino);
      const candidatas = unicas([
        ...(mapas[i]?.get(k) ?? []),
        ...(mapas[i]?.get(sinMd(k)) ?? []),
      ]);
      if (candidatas.length > 0) return decidir(candidatas, regla);
    }
    return null;
  }

  function parecidas(nombre: string): readonly string[] {
    const q = normalizarParecido(nombreEnlazable(nombre.trim()));
    if (q === "" || FECHA.test(q)) return [];
    const tope = q.length < 6 ? 1 : 2;

    // Puntos: 0 idéntica sin tildes; 1-2 errores de dedo; después, empieza igual.
    // El error de dedo va antes: "Tomas Ruis" quiso decir "Tomás Ruiz", no "Tomás".
    const puntuadas: [ruta: string, puntos: number][] = [];
    for (const [ruta, n] of nombresNormalizados) {
      const d = distancia(q, n, tope);
      if (d <= tope) puntuadas.push([ruta, d]);
      else if (n.startsWith(q + " ") || q.startsWith(n + " "))
        puntuadas.push([ruta, tope + 1]);
    }
    return puntuadas
      .sort(([ra, pa], [rb, pb]) => pa - pb || (ra < rb ? -1 : 1))
      .slice(0, MAX_PARECIDAS)
      .map(([ruta]) => ruta);
  }

  return Object.freeze({ resolver, parecidas });
}

/** Una sola candidata gana; si hay varias, gana la única de la raíz; si no, ambiguo. */
function decidir(
  candidatas: readonly string[],
  regla: Regla,
): Exclude<Resolucion, { tipo: "sin-nota" }> {
  const ganadora = desempatar(candidatas);
  if (ganadora === null) {
    return { tipo: "ambiguo", candidatas: [...candidatas].sort(), regla };
  }
  return { tipo: esNota(ganadora) ? "nota" : "adjunto", ruta: ganadora, regla };
}

/** "La raíz gana" (decisión de Sergio, DI-013). `null` = no se adivina. */
function desempatar(candidatas: readonly string[]): string | null {
  if (candidatas.length === 1) return candidatas[0] ?? null;
  const enRaiz = candidatas.filter((r) => !r.includes("/"));
  return enRaiz.length === 1 ? (enRaiz[0] ?? null) : null;
}

function sinNota(nombre: string): Resolucion {
  return { tipo: "sin-nota", nombre };
}

function agrupar(
  rutas: readonly string[],
  claves: (ruta: string) => string[],
): Map<string, string[]> {
  const mapa = new Map<string, string[]>();
  for (const ruta of rutas) {
    for (const k of new Set(claves(ruta))) {
      const lista = mapa.get(k);
      if (lista) lista.push(ruta);
      else mapa.set(k, [ruta]);
    }
  }
  return mapa;
}

function unicas(rutas: string[]): string[] {
  return [...new Set(rutas)];
}

function esNota(ruta: string): boolean {
  return ruta.toLowerCase().endsWith(".md");
}

function sinMd(s: string): string {
  return esNota(s) ? s.slice(0, -".md".length) : s;
}

/** Cómo se enlaza un archivo por nombre: nota sin `.md`, adjunto con su extensión. */
function nombreEnlazable(ruta: string): string {
  const base = ruta.slice(ruta.lastIndexOf("/") + 1);
  return sinMd(base);
}

/** Para "parecidas": sin tildes (é→e, ñ→n), minúsculas, recortado. */
function normalizarParecido(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim()
    .normalize("NFC");
}

/** Distancia de edición (Levenshtein); deja de calcular en cuanto supera `tope`. */
function distancia(a: string, b: string, tope: number): number {
  if (Math.abs(a.length - b.length) > tope) return tope + 1;
  let previa = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const actual = [i];
    let minimo = i;
    for (let j = 1; j <= b.length; j++) {
      const costo = a[i - 1] === b[j - 1] ? 0 : 1;
      const v = Math.min(
        (previa[j] ?? 0) + 1,
        (actual[j - 1] ?? 0) + 1,
        (previa[j - 1] ?? 0) + costo,
      );
      actual.push(v);
      minimo = Math.min(minimo, v);
    }
    if (minimo > tope) return tope + 1;
    previa = actual;
  }
  return previa[b.length] ?? tope + 1;
}
