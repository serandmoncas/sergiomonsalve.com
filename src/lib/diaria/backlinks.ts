// copiado de DiarIA@e9253e236b58 — no editar; actualizar con pnpm copiar-nucleo
import { extraerEnlaces, type Enlace } from "./enlaces";
import { fechaDeNota } from "./fechas";
import type { Resolutor } from "./resolucion";
import { seccionesFechadas, type Seccion } from "./secciones";

export { fechaDeNota } from "./fechas";

/** Una vez que una nota menciona a otra (ver docs/specs/2026-11-06-di-014-backlinks.md). */
export interface Mencion {
  /** Ruta de la nota que menciona. */
  desde: string;
  /** "AAAA-MM-DD": el de la sección fechada que la contiene o, si no, el de la nota diaria. */
  dia?: string;
  /** Línea, empezando en 1. */
  linea: number;
  /** El texto de esa línea, tal cual (sin el "\r" final). */
  contexto: string;
  enlace: Enlace;
  /** El enlace era ambiguo: quizá no se refería a esta nota. */
  posible: boolean;
}

export interface Backlinks {
  de(ruta: string): readonly Mencion[];
  /** Por el nombre escrito; `[[proyecto nuevo ]]` y `[[Proyecto Nuevo]]` son la misma. */
  deSinNota(nombre: string): readonly Mencion[];
}

export function calcularBacklinks(
  notas: Iterable<{ ruta: string; texto: string }>,
  resolutor: Resolutor,
): Backlinks {
  const porRuta = new Map<string, Mencion[]>();
  const porNombre = new Map<string, Mencion[]>();
  const anotar = (mapa: Map<string, Mencion[]>, clave: string, m: Mencion) => {
    const lista = mapa.get(clave);
    if (lista) lista.push(m);
    else mapa.set(clave, [m]);
  };

  for (const { ruta, texto } of notas) {
    const lineas = new Lineas(texto);
    const dias = new Dias(texto, fechaDeNota(ruta));
    for (const enlace of extraerEnlaces(texto)) {
      const res = resolutor.resolver(enlace, ruta);
      const mencion = (posible: boolean): Mencion => {
        const m: Mencion = {
          desde: ruta,
          linea: lineas.numero(enlace.inicio),
          contexto: lineas.texto(enlace.inicio),
          enlace,
          posible,
        };
        const dia = dias.de(enlace.inicio);
        if (dia !== null) m.dia = dia;
        return m;
      };
      switch (res.tipo) {
        case "nota":
        case "adjunto":
          if (res.ruta !== ruta) anotar(porRuta, res.ruta, mencion(false));
          break;
        case "ambiguo":
          for (const c of res.candidatas)
            if (c !== ruta) anotar(porRuta, c, mencion(true));
          break;
        case "sin-nota":
          anotar(porNombre, claveSinNota(res.nombre), mencion(false));
          break;
      }
    }
  }

  for (const lista of [...porRuta.values(), ...porNombre.values()]) {
    lista.sort(masReciente);
    Object.freeze(lista);
  }
  return Object.freeze({
    de: (ruta: string) => porRuta.get(ruta) ?? [],
    deSinNota: (nombre: string) => porNombre.get(claveSinNota(nombre)) ?? [],
  });
}

/** Día descendente; sin día al final; empates por nota y posición. */
function masReciente(a: Mencion, b: Mencion): number {
  if (a.dia !== b.dia) {
    if (a.dia === undefined) return 1;
    if (b.dia === undefined) return -1;
    return a.dia < b.dia ? 1 : -1;
  }
  if (a.desde !== b.desde) return a.desde < b.desde ? -1 : 1;
  return a.enlace.inicio - b.enlace.inicio;
}

function claveSinNota(nombre: string): string {
  const k = nombre.trim().toLowerCase().normalize("NFC");
  return k.endsWith(".md") ? k.slice(0, -".md".length) : k;
}

/** Offsets de inicio de cada línea, para pasar de posición a número de línea. */
class Lineas {
  private readonly inicios: number[] = [0];
  private readonly textoCompleto: string;
  constructor(textoCompleto: string) {
    this.textoCompleto = textoCompleto;
    for (let i = 0; i < textoCompleto.length; i++)
      if (textoCompleto[i] === "\n") this.inicios.push(i + 1);
  }
  /** Índice (0-based) de la línea que contiene `pos`. */
  private indice(pos: number): number {
    let [lo, hi] = [0, this.inicios.length - 1];
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if ((this.inicios[mid] ?? 0) <= pos) lo = mid;
      else hi = mid - 1;
    }
    return lo;
  }
  numero(pos: number): number {
    return this.indice(pos) + 1;
  }
  texto(pos: number): string {
    const i = this.indice(pos);
    const fin = this.inicios[i + 1];
    const linea = this.textoCompleto.slice(
      this.inicios[i],
      fin === undefined ? undefined : fin - 1,
    );
    return linea.replace(/\r$/, "");
  }
}

/** Qué día corresponde a cada posición de una nota, según sus secciones fechadas. */
class Dias {
  private readonly secciones: readonly Seccion[];
  private readonly diaDeLaNota: string | null;
  constructor(texto: string, diaDeLaNota: string | null) {
    this.secciones = seccionesFechadas(texto);
    this.diaDeLaNota = diaDeLaNota;
  }

  /** Sección fechada que contiene `pos` → si no, el día de la nota → si no, `null`. */
  de(pos: number): string | null {
    const s = this.secciones.find((s) => s.inicio <= pos && pos < s.fin);
    return s?.dia ?? this.diaDeLaNota;
  }
}
