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
