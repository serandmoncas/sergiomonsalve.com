// copiado de DiarIA@3803d65e772c — no editar; actualizar con pnpm copiar-nucleo
const FECHA = /^(\d{4})-(\d{2})-(\d{2})$/;

/** El día de una nota diaria (`AAAA-MM-DD.md`, en cualquier carpeta), o `null`. */
export function fechaDeNota(ruta: string): string | null {
  const base = ruta.slice(ruta.lastIndexOf("/") + 1);
  if (!base.toLowerCase().endsWith(".md")) return null;
  const nombre = base.slice(0, -".md".length);
  return esFechaValida(nombre) ? nombre : null;
}

/** Un día de entrada mal escrito es un error de programación, no del diario. */
export function validarDia(dia: string): string {
  if (fechaDeNota(`${dia}.md`) !== dia)
    throw new RangeError(
      `No es un día AAAA-MM-DD válido: ${JSON.stringify(dia)}`,
    );
  return dia;
}

function esFechaValida(s: string): boolean {
  const m = FECHA.exec(s);
  if (!m) return false;
  const [a, mes, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const f = new Date(Date.UTC(a, mes - 1, d));
  return (
    f.getUTCFullYear() === a &&
    f.getUTCMonth() === mes - 1 &&
    f.getUTCDate() === d
  );
}
