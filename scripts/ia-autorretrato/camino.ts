import type { AristaCamino, Camino, NodoCamino } from '@/lib/ia-autorretrato/tipos'
import { aCsv, deCsv } from './csv'

/** Prerrequisitos transitivos de `id` (todo lo que hubo que aprender antes). */
export function ancestros(id: string, aristas: AristaCamino[]): Set<string> {
  const vistos = new Set<string>()
  const pila = [id]
  while (pila.length) {
    const actual = pila.pop()!
    for (const a of aristas) if (a.a === actual && !vistos.has(a.de)) { vistos.add(a.de); pila.push(a.de) }
  }
  return vistos
}

export function validarCamino(nodos: NodoCamino[], aristas: AristaCamino[]): string[] {
  const errores: string[] = []
  const ids = new Set<string>()
  for (const n of nodos) {
    if (ids.has(n.id)) errores.push(`id repetido: ${n.id}`)
    ids.add(n.id)
  }
  for (const a of aristas) if (!ids.has(a.de) || !ids.has(a.a)) errores.push(`arista a nodo desconocido: ${a.de}→${a.a}`)

  // Kahn: si no se pueden ordenar todos, hay un ciclo.
  const entrada = new Map([...ids].map(id => [id, 0]))
  for (const a of aristas) if (entrada.has(a.a)) entrada.set(a.a, entrada.get(a.a)! + 1)
  const cola = [...entrada.entries()].filter(([, g]) => g === 0).map(([id]) => id)
  let ordenados = 0
  while (cola.length) {
    const id = cola.shift()!
    ordenados++
    for (const a of aristas) if (a.de === id && entrada.has(a.a)) {
      entrada.set(a.a, entrada.get(a.a)! - 1)
      if (entrada.get(a.a) === 0) cola.push(a.a)
    }
  }
  if (ordenados < ids.size) errores.push('ciclo en el camino')

  const fundamentos = new Set(nodos.filter(n => n.rama === 'fundamentos').map(n => n.id))
  for (const n of nodos.filter(n => n.hoy)) {
    if (![...ancestros(n.id, aristas)].some(id => fundamentos.has(id))) errores.push(`"${n.id}" (hoy) no llega a ningún fundamento`)
  }
  return errores
}

/** Calcula `primeraEvidencia` (YYYY-MM) desde los commits. Los inferidos no llevan fecha. */
export function enriquecerCamino(nodos: NodoCamino[], primeraPorRepo: Map<string, string>): NodoCamino[] {
  return nodos.map(n => {
    if (n.evidencia === 'inferido') {
      const copia = { ...n }
      delete copia.primeraEvidencia
      return copia
    }
    const fechas = (n.repos ?? []).map(r => primeraPorRepo.get(r.toLowerCase())).filter((f): f is string => Boolean(f))
    if (n.primeraEvidencia) fechas.push(n.primeraEvidencia)
    const primera = fechas.sort()[0]
    return primera ? { ...n, primeraEvidencia: primera } : n
  })
}

export function reposNoPublicos(nodos: NodoCamino[], reposPublicos: string[]): string[] {
  const publicos = new Set(reposPublicos.map(r => r.toLowerCase()))
  return [...new Set(nodos.flatMap(n => n.repos ?? []).filter(r => !publicos.has(r.toLowerCase())))]
}

/** CSV de los nodos inferidos para que Sergio escriba "si" o "no" en `aprobado`. */
export function revisionCamino(nodos: NodoCamino[]): string {
  return aCsv([['id', 'etiqueta', 'rama', 'aprobado'], ...nodos.filter(n => n.evidencia === 'inferido').map(n => [n.id, n.etiqueta, n.rama, ''])])
}

function leerRevision(csv: string): { cabecera: string[]; filas: string[][]; iId: number; iOk: number } {
  const texto = csv.replace(/^\uFEFF/, '')
  const primeraLinea = texto.split(/\r?\n/)[0] ?? ''
  const separador = primeraLinea.includes(';') && !primeraLinea.includes(',') ? ';' : ','
  const [cabecera = [], ...filas] = deCsv(texto, separador)
  const iId = cabecera.indexOf('id')
  const iOk = cabecera.indexOf('aprobado')
  if (iId < 0 || iOk < 0) throw new Error('CSV de revisión del camino sin columna "id"/"aprobado"')
  return { cabecera, filas, iId, iOk }
}

/** true si Sergio escribió al menos un valor en `aprobado`; un CSV en blanco es "sin revisar". */
export function revisionRespondida(csv: string): boolean {
  const { filas, iOk } = leerRevision(csv)
  return filas.some(f => (f[iOk] ?? '').trim() !== '')
}

/** Solo entran los inferidos con "si". Los demás salen junto con sus aristas. */
export function aplicarRevision(camino: Camino, csv: string): Camino {
  const { filas, iId, iOk } = leerRevision(csv)
  const aprobados = new Set(filas.filter(f => (f[iOk] ?? '').trim().toLowerCase() === 'si').map(f => f[iId]))
  const nodos = camino.nodos.filter(n => n.evidencia !== 'inferido' || aprobados.has(n.id))
  const ids = new Set(nodos.map(n => n.id))
  return { nodos, aristas: camino.aristas.filter(a => ids.has(a.de) && ids.has(a.a)) }
}
