// Tipos del Manual de Usuario (sección privada del sitio).

export type Capa = 'todos' | 'otros' | 'desdeAqui'

// Un bloque "> [!desde-aqui] <Voz>": la voz y el markdown sin los "> ".
export type DesdeAqui = { voz: string; md: string }

export type Nota = {
  slug: string
  titulo: string
  estado: 'semilla' | 'brote' | 'perenne'
  confianza: string
  iaCapas: Partial<Record<'todos' | 'otros' | 'desde_aqui', string>>
  voces: string[]
  fuentes: string[]
  verificado: string | null
  terminos: string[]
  entrada: string // md entre el H1 y la primera sección
  capas: { todos?: string; otros?: string; desdeAqui?: DesdeAqui[] }
  llevar?: string // md de "## Para llevarte"
  enlacesRaw: string[] // destinos crudos de wikilinks en cuerpo + relacionados
}

export type ParseResult =
  | { ok: true; nota: Nota }
  | { ok: false; slug: string; error: string }

// Una entrada del índice numerado del manual.
export type Entrada = {
  n: number
  titulo: string
  puerta?: string
  confianza: string
  nota?: string // slug de la nota, si ya existe
  recorrido?: string // slug del recorrido, si la entrada abre uno
}

export type Indice = { secciones: { id: string; titulo: string; entradas: Entrada[] }[] }

// `pasos` son los destinos crudos de los wikilinks, en orden.
export type Recorrido = {
  slug: string
  nombre: string
  paraQuien?: string
  resultado?: string
  pasos: string[]
}

export type Resolver = (raw: string) => { tipo: 'nota' | 'recorrido'; slug: string } | null

export type Grafo = {
  nodes: { id: string; titulo: string; existe: boolean }[]
  links: { source: string; target: string }[]
}
