export type Region = 'andina' | 'caribe' | 'pacifica' | 'orinoquia' | 'amazonia' | 'insular'
export type ClaseTamano = 'colibri' | 'mirla' | 'paloma' | 'gallinazo'
export type Color = 'azul' | 'rojo' | 'amarillo' | 'verde' | 'negro' | 'cafe' | 'blanco' | 'gris'
export type Habitat = 'ciudad' | 'bosque' | 'agua' | 'paramo' | 'campo'
export type Residencia = 'residente' | 'migratoria-boreal' | 'migratoria-austral'
export type Amenaza = 'CR' | 'EN' | 'VU' | null

// Una entrada de content/aves/catalogo.json, generada desde GBIF
export type EspecieBase = {
  speciesKey: number
  slug: string
  cientifico: string
  nombreEs: string
  nombreEn: string
  familia: string
  orden: string
  puestoColombia: number
  registrosColombia: number
  puestoLatam: number | null // null = fuera del top 4000 de Latinoamérica
  regiones: Region[] // de más a menos registros
  meses: number[] // 12 valores 0–100 de presencia relativa al esfuerzo del mes, enero primero
  amenaza: Amenaza
}

// Atributos de identificación, por speciesKey en content/aves/atributos/<familia>.json
export type Atributos = {
  tamanoCm: number
  claseTamano: ClaseTamano
  colores: Color[]
  habitats: Habitat[]
  altitudM: [number, number]
  residencia: Residencia
  endemica: boolean
}

export type Especie = EspecieBase & { atributos: Atributos | null }

export type Catalogo = { consultado: string; especies: EspecieBase[] }
