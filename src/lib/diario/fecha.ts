const BOGOTA = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Bogota',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/** "Hoy" del diario: la fecha en Colombia, YYYY-MM-DD. */
export function fechaBogota(ahora: Date): string {
  return BOGOTA.format(ahora)
}

/** El mes pedido (YYYY-MM) si es válido; si no, el mes de `hoy`. */
export function mesDe(param: string | string[] | undefined, hoy: string): string {
  if (typeof param === 'string' && /^(1\d|2\d)\d\d-(0[1-9]|1[0-2])$/.test(param)) return param
  return hoy.slice(0, 7)
}

export function mesVecino(mes: string, delta: number): string {
  const [a, m] = mes.split('-').map(Number)
  const d = new Date(Date.UTC(a, m - 1 + delta, 1))
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

export function nombreDelMes(mes: string): string {
  const [a, m] = mes.split('-').map(Number)
  return new Intl.DateTimeFormat('es', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(Date.UTC(a, m - 1, 1)),
  )
}
