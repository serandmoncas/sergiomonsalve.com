export type Cuenta = 'smonsalve' | 'serandmoncas'
export type Dominio = 'producto-web' | 'hongos-iot' | 'educacion' | 'agentes' | 'experimentos'
export const DOMINIOS: Dominio[] = ['producto-web', 'hongos-iot', 'educacion', 'agentes', 'experimentos']
export type GrupoHerramienta = 'ejecucion' | 'investigacion' | 'navegador' | 'orquestacion' | 'mcp' | 'edicion'
export type Cuadrante = 'ambos' | 'solo-hablado' | 'solo-construido' | 'ninguno'
export type Rama = 'fundamentos' | 'backend' | 'web' | 'datos-ml' | 'iot' | 'infra' | 'agentes' | 'educacion' | 'escritura'
export const RAMAS: Rama[] = ['fundamentos', 'backend', 'web', 'datos-ml', 'iot', 'infra', 'agentes', 'educacion', 'escritura']
export type Evidencia = 'github' | 'declarado' | 'inferido'

export type NodoCamino = {
  id: string
  etiqueta: string
  etiquetaEn: string
  rama: Rama
  evidencia: Evidencia
  repos?: string[]          // solo repos públicos
  declaradoEn?: string
  primeraEvidencia?: string // YYYY-MM
  hoy?: boolean
}
export type AristaCamino = { de: string; a: string } // "a" depende de "de"
export type Camino = { nodos: NodoCamino[]; aristas: AristaCamino[] }

export type NodoGrafo = { id: string; tipo: 'sergio' | 'persona' | 'modelo' | 'dominio'; etiqueta: string; peso: number; x: number; y: number }
export type AristaGrafo = { de: string; a: string; peso: number }
export type GrafoCoautoria = { era: Cuenta; nodos: NodoGrafo[]; aristas: AristaGrafo[] }
export type NodoDiscurso = { id: string; etiqueta: string; etiquetaEn: string; resaltado: boolean; x: number; y: number }
export type GrafoDiscurso = { nodos: NodoDiscurso[]; aristas: { de: string; a: string; motivo: string }[] }

export type DatoContexto = { cifra: string; mide: string; fuente: string; fecha: string; url: string }
export type ConceptoClasificado = {
  slug: string; termino: string; categoria: string
  hablado: number; preguntado: number; construido: boolean
  cuadrante: Cuadrante; corregido: boolean
}
export type Era = {
  cuenta: Cuenta; desde: string; hasta: string
  commitsPropios: number; reposActivos: number
  medianaMensaje: number; medianaMensajeSinTrailer: number
  coautores: { tipo: 'persona' | 'modelo'; n: number }[]
}
export type ItemEcosistema = { herramienta: string; fuente: 'medido' | 'declarado'; uso: { es: string; en: string }; intensidad: 1 | 2 | 3 }

export type AutorretratoIA = {
  generado: string
  periodo: { desde: string; hasta: string }
  actividadDiaria: { fecha: string; prompts: number; sesiones: number }[]
  commitsPorMes: { mes: string; total: number; coautoriaClaude: number; porTipo: Record<string, number> }[]
  promptsPorDominio: { dominio: Dominio; prompts: number; reposPublicos: string[] }[]
  herramientas: { nombre: string; usos: number; grupo: GrupoHerramienta }[]
  modelos: { modelo: string; respuestas: number }[]
  ecosistema: ItemEcosistema[]
  conceptos: ConceptoClasificado[]
  perfilPrompts: { total: number; medianaCaracteres: number; pctPreguntas: number; pctEspanol: number }
  eras: Era[]
  modelosPorMes: { mes: string; modelo: string; commits: number }[]
  grafoCoautoria: GrafoCoautoria[]
  grafoDiscurso: GrafoDiscurso
  contexto: DatoContexto[]
  camino: Camino
}
