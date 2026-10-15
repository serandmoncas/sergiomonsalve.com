import { escaparRegex } from './util'

export type ListaNegra = { prompts: string[]; reposPrivados: string[]; personas: string[]; permitidos?: string[] }

const VENTANA = 40

/** Normaliza para comparar: sin tildes, minúsculas, espacios (incl. saltos y NBSP) colapsados. */
function plano(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ')
}

/** Deshace los escapes JSON más comunes para que un texto en JSON compare igual que el original. */
function deshacerEscapes(s: string): string {
  return s.replace(/\\(n|t|"|\\)/g, (_, c: string) => (c === 'n' ? '\n' : c === 't' ? '\t' : c))
}

/** Nombre como palabra completa: no precedido de letra/dígito, no seguido de letra/dígito ni de `-letra`, y con espacios flexibles. */
function patronNombre(nombre: string): RegExp {
  const cuerpo = plano(nombre).trim().split(' ').map(escaparRegex).join('\\s+')
  return new RegExp(`(^|[^a-z0-9])${cuerpo}(?![a-z0-9]|-[a-z0-9])`)
}

/** Devuelve los problemas encontrados en `texto` (JSON publicado o MDX). Vacío = se puede publicar. */
export function verificarPrivacidad(texto: string, lista: ListaNegra): string[] {
  const problemas: string[] = []
  const permitidos = new Set((lista.permitidos ?? []).map(p => plano(p).trim()))

  const P = plano(texto)
  const P2 = plano(deshacerEscapes(texto))

  const ventanas = new Set<string>()
  for (const s of [P, P2]) for (let i = 0; i + VENTANA <= s.length; i++) ventanas.add(s.slice(i, i + VENTANA))

  lista.prompts.forEach((prompt, i) => {
    const q = plano(prompt).trim()
    if (q.length <= VENTANA) return
    for (let j = 0; j + VENTANA <= q.length; j++) {
      if (ventanas.has(q.slice(j, j + VENTANA))) {
        problemas.push(`prompt literal (#${i})`)
        return
      }
    }
  })

  for (const nombre of [...lista.reposPrivados, ...lista.personas]) {
    const n = plano(nombre).trim()
    if (!n || permitidos.has(n)) continue
    const patron = patronNombre(nombre)
    if (patron.test(P) || patron.test(P2)) problemas.push(`nombre privado: ${nombre}`)
  }

  if (/[\w.+-]+@[\w-]+\.[a-z]{2,}/i.test(texto)) problemas.push('correo electrónico')
  if (texto.includes('/Users/')) problemas.push('ruta absoluta /Users/')
  return problemas
}

/**
 * Lista negra de nombres de proyecto: repos privados, claves del mapa de dominios privados y
 * proyectos locales de los prompts que no son repos públicos. Excluye los repos públicos y los `permitidos`.
 */
export function nombresPrivados(o: {
  reposPrivados: string[]
  dominiosPrivados: string[]
  proyectos: string[]
  reposPublicos: string[]
  permitidos?: string[]
}): string[] {
  const excluidos = new Set([...o.reposPublicos, ...(o.permitidos ?? [])].map(n => n.toLowerCase()))
  const vistos = new Set<string>()
  const salida: string[] = []
  for (const n of [...o.reposPrivados, ...o.dominiosPrivados, ...o.proyectos]) {
    const k = n.trim().toLowerCase()
    if (!k || excluidos.has(k) || vistos.has(k)) continue
    vistos.add(k)
    salida.push(n.trim())
  }
  return salida
}
