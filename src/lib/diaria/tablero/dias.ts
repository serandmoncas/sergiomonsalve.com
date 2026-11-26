// copiado de DiarIA@e9253e236b58 — no editar; actualizar con pnpm copiar-nucleo
/** Fechas `YYYY-MM-DD` en UTC, sin reloj: "hoy" siempre llega como argumento. */

export function sumarDias(dia: string, n: number): string {
  const t = new Date(`${dia}T00:00:00Z`);
  t.setUTCDate(t.getUTCDate() + n);
  return t.toISOString().slice(0, 10);
}

export function diasEntre(a: string, b: string): number {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);
}
