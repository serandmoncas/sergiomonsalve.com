import type { TerminoGlosario } from './glosario'

/** 'y': deben aparecer todas las palabras. 'o': basta con una. */
export type ModoBusqueda = 'y' | 'o'

/** Minúsculas y sin tildes, para que "atencion" encuentre "atención". */
export function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

/**
 * ¿El término coincide con lo que la persona escribió en el buscador?
 * Busca en el nombre y en la definición, sin importar tildes ni mayúsculas.
 */
export function coincide(termino: TerminoGlosario, consulta: string, modo: ModoBusqueda = 'y'): boolean {
  const palabras = normalizar(consulta).split(/\s+/).filter(Boolean)
  if (palabras.length === 0) return true
  const texto = normalizar(`${termino.termino} ${termino.definicion}`)
  return modo === 'y' ? palabras.every(p => texto.includes(p)) : palabras.some(p => texto.includes(p))
}
