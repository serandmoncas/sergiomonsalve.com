// copiado de DiarIA@7b76fe16a8dd — no editar; actualizar con pnpm copiar-nucleo
/** Un wikilink tal como está escrito en la nota (ver docs/rea/resolucion-de-enlaces.md). */
export interface Enlace {
  /** Tal cual, sin recortar; "" = misma nota (`[[#Sección]]`). */
  destino: string;
  /** Tras "#". */
  seccion?: string;
  /** Tras "#^". */
  bloque?: string;
  /** Texto visible, tras "|". */
  alias?: string;
  /** `![[…]]`. */
  incrustado: boolean;
  /** Offset de "[[" (o del "!" si es incrustado). */
  inicio: number;
  /** Offset justo tras "]]". */
  fin: number;
}

export type Rango = readonly [inicio: number, fin: number];

const WIKILINK = /(!?)\[\[([^[\]\n]+)\]\]/g;
// Admite sangría (viñetas anidadas, tabulador) y prefijos de cita "> ".
const VALLA = /^[ \t]*(?:>[ \t]*)*(`{3,}|~{3,})(.*)$/;

/** Extrae los wikilinks de una nota, ignorando los que están en código. No modifica nada. */
export function extraerEnlaces(texto: string): Enlace[] {
  const codigo = rangosDeCodigo(texto);
  const enlaces: Enlace[] = [];
  for (const m of texto.matchAll(WIKILINK)) {
    const inicio = m.index;
    if (dentro(codigo, inicio)) continue;
    const enlace = interpretar(
      m[2] ?? "",
      m[1] === "!",
      inicio,
      inicio + m[0].length,
    );
    if (enlace) enlaces.push(enlace);
  }
  return enlaces;
}

function interpretar(
  cuerpo: string,
  incrustado: boolean,
  inicio: number,
  fin: number,
): Enlace | null {
  let objetivo = cuerpo;
  let alias: string | undefined;
  const barra = cuerpo.indexOf("|");
  if (barra !== -1) {
    // En tablas se escribe `[[a\|b]]`: la "\" no forma parte del destino.
    objetivo = cuerpo.slice(0, cuerpo[barra - 1] === "\\" ? barra - 1 : barra);
    alias = cuerpo.slice(barra + 1);
  }

  let destino = objetivo;
  let seccion: string | undefined;
  let bloque: string | undefined;
  const almohadilla = objetivo.indexOf("#");
  if (almohadilla !== -1) {
    destino = objetivo.slice(0, almohadilla);
    const resto = objetivo.slice(almohadilla + 1);
    if (resto.startsWith("^")) bloque = resto.slice(1);
    else seccion = resto;
  }

  if (destino.trim() === "" && seccion === undefined && bloque === undefined)
    return null;

  const enlace: Enlace = { destino, incrustado, inicio, fin };
  if (seccion !== undefined) enlace.seccion = seccion;
  if (bloque !== undefined) enlace.bloque = bloque;
  if (alias !== undefined) enlace.alias = alias;
  return enlace;
}

/** Rangos [inicio, fin) de bloques con valla (``` o ~~~) y de código en línea. */
export function rangosDeCodigo(texto: string): Rango[] {
  const rangos: Rango[] = [];
  let valla: string | null = null;
  let inicioBloque = 0;
  let pos = 0;
  for (const linea of texto.split("\n")) {
    const finLinea = pos + linea.length + 1;
    // El BOM de la primera línea no impide que sea una valla.
    const sinBom = pos === 0 ? linea.replace(/^\uFEFF/, "") : linea;
    const m = VALLA.exec(sinBom.replace(/\r$/, ""));
    const marca = m?.[1];
    const resto = m?.[2] ?? "";
    if (valla === null) {
      // "```x```" en una línea es código en línea: la info string de una
      // valla de comillas invertidas no puede contener comillas invertidas.
      if (marca && !(marca[0] === "`" && resto.includes("`"))) {
        valla = marca;
        inicioBloque = pos;
      } else {
        for (const r of codigoEnLinea(linea, pos)) rangos.push(r);
      }
    } else if (
      marca !== undefined &&
      marca[0] === valla[0] &&
      marca.length >= valla.length &&
      resto.trim() === ""
    ) {
      rangos.push([inicioBloque, finLinea]);
      valla = null;
    }
    pos = finLinea;
  }
  if (valla !== null) rangos.push([inicioBloque, texto.length]);
  return rangos;
}

/** Código en línea: una tira de N comillas invertidas cierra con otra de exactamente N. */
function codigoEnLinea(linea: string, desplazamiento: number): Rango[] {
  const rangos: Rango[] = [];
  const tiras = [...linea.matchAll(/`+/g)];
  for (let i = 0; i < tiras.length; i++) {
    const abre = tiras[i]!;
    const j = tiras.findIndex(
      (t, k) => k > i && t[0].length === abre[0].length,
    );
    if (j === -1) continue;
    const cierra = tiras[j]!;
    rangos.push([
      desplazamiento + abre.index,
      desplazamiento + cierra.index + cierra[0].length,
    ]);
    i = j;
  }
  return rangos;
}

export function dentro(rangos: Rango[], pos: number): boolean {
  return rangos.some(([a, b]) => pos >= a && pos < b);
}
