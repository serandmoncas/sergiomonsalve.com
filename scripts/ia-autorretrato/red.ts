import { normalizar } from '@/lib/experiencias-ia/buscar'
import type { Cuenta, GrafoCoautoria, GrafoDiscurso, NodoGrafo } from '@/lib/ia-autorretrato/tipos'
import type { CommitNormalizado } from './commits'
import { contiene } from './conceptos'
import { dominioDe } from './dominios'

const r3 = (n: number) => Math.round(n * 1000) / 1000

export function grafoCoautoria(era: Cuenta, commits: CommitNormalizado[]): GrafoCoautoria {
  const ordenados = commits
    .filter(c => !c.esBot)
    .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.repo.localeCompare(b.repo) || a.autor.localeCompare(b.autor))

  const autores = new Map<string, { tipo: NodoGrafo['tipo']; etiqueta: string; orden: number; peso: number }>()
  const pesos = new Map<string, number>()
  const personas = new Map<string, string>()

  const sumar = (id: string, tipo: NodoGrafo['tipo'], etiqueta: string, dominio: string) => {
    const a = autores.get(id) ?? { tipo, etiqueta, orden: autores.size, peso: 0 }
    a.peso++
    autores.set(id, a)
    const clave = `${id}|dominio:${dominio}`
    pesos.set(clave, (pesos.get(clave) ?? 0) + 1)
  }

  for (const c of ordenados) {
    const dominio = dominioDe(c.repo)
    if (c.esSergio) sumar('sergio', 'sergio', 'Sergio', dominio)
    else if (c.autorClaude) sumar('modelo:Claude (autor)', 'modelo', 'Claude (autor)', dominio)
    else {
      if (!personas.has(c.autor)) personas.set(c.autor, `persona-${personas.size + 1}`)
      const id = personas.get(c.autor)!
      sumar(id, 'persona', `Persona ${id.split('-')[1]}`, dominio)
    }
    for (const m of c.modelos) sumar(`modelo:${m}`, 'modelo', m, dominio)
  }

  const aristas = [...pesos.entries()]
    .map(([k, peso]) => { const [de, a] = k.split('|'); return { de, a, peso } })
    .sort((x, y) => x.de.localeCompare(y.de) || x.a.localeCompare(y.a))

  const pesoDominio = new Map<string, number>()
  for (const a of aristas) pesoDominio.set(a.a, (pesoDominio.get(a.a) ?? 0) + a.peso)

  const listaAutores = [...autores.entries()].sort(([ia, a], [ib, b]) =>
    (ia === 'sergio' ? -1 : ib === 'sergio' ? 1 : a.orden - b.orden))
  const listaDominios = [...pesoDominio.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))

  const nodos: NodoGrafo[] = [
    ...listaAutores.map(([id, a], i) => ({ id, tipo: a.tipo, etiqueta: a.etiqueta, peso: a.peso, x: 0.32, y: r3((i + 1) / (listaAutores.length + 1)) })),
    ...listaDominios.map(([id, peso], i) => ({ id, tipo: 'dominio' as const, etiqueta: id.replace('dominio:', ''), peso, x: 0.72, y: r3((i + 1) / (listaDominios.length + 1)) })),
  ]
  return { era, nodos, aristas }
}

export type ConceptoDiscurso = { id: string; etiqueta: string; etiquetaEn: string; variantes: string[] }
export type RelacionDiscurso = { de: string; a: string; motivo: string }

export function grafoDiscurso(conceptos: ConceptoDiscurso[], relaciones: RelacionDiscurso[], prompts: string[]): GrafoDiscurso {
  const textos = prompts.map(normalizar)
  const n = conceptos.length
  return {
    nodos: conceptos.map((c, i) => {
      const angulo = -Math.PI / 2 + (2 * Math.PI * i) / n
      return {
        id: c.id, etiqueta: c.etiqueta, etiquetaEn: c.etiquetaEn,
        resaltado: textos.some(t => c.variantes.some(v => contiene(t, normalizar(v)))),
        x: r3(0.5 + 0.38 * Math.cos(angulo)),
        y: r3(0.5 + 0.38 * Math.sin(angulo)),
      }
    }),
    aristas: relaciones.map(r => ({ de: r.de, a: r.a, motivo: r.motivo })),
  }
}
