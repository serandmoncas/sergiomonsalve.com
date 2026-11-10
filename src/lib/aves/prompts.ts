import type { Especie, Referencia, Variante } from './tipos'

// Rasgos de campo por variante, en content/aves/prompts/<familia>.json (speciesKey → RasgosEspecie)
export type RasgosEspecie = Partial<Record<Variante, string>>

// Estilo común a todas las ilustraciones: perfil, fondo blanco y proporciones exactas
// para poder componer después las láminas por familia del libro.
export const ESTILO =
  'Scientific field-guide illustration in gouache, single bird, full body, strict side profile facing left, ' +
  'perched on a plain thin bare twig (or standing on flat ground if terrestrial or aquatic), pure white background, ' +
  'no text, no frame, no shadow, even neutral lighting, accurate proportions and plumage colors, ' +
  'bird centered and filling about 70% of the width, 4:3 landscape.'

const VARIANTE_EN: Record<Variante, string> = {
  adulto: 'adult',
  macho: 'adult male',
  hembra: 'adult female',
  juvenil: 'juvenile',
}

export function construirPrompt(e: Especie, variante: Variante, rasgos: string): string {
  const tamano = e.atributos ? `, about ${e.atributos.tamanoCm} cm long` : ''
  return [
    ESTILO,
    `Species: ${e.cientifico} (${e.nombreEn})${tamano}. Plumage: ${VARIANTE_EN[variante]}.`,
    `Key field marks that must be clearly visible and correct: ${rasgos}`,
    'Use the attached reference photos only for plumage and proportions, not for pose or background.',
  ].join('\n\n')
}

const VARIANTES = new Set(['adulto', 'macho', 'hembra', 'juvenil'])

export function validarRasgos(r: unknown): string[] {
  if (!r || typeof r !== 'object') return ['rasgos: debe ser un objeto']
  const errores: string[] = []
  const claves = Object.keys(r)
  for (const k of claves) {
    if (!VARIANTES.has(k)) errores.push(`variante desconocida: ${k}`)
    const v = (r as Record<string, unknown>)[k]
    if (typeof v !== 'string' || !v.trim()) errores.push(`${k}: texto vacío`)
  }
  const tiene = (v: string) => claves.includes(v)
  if (!tiene('adulto') && !tiene('macho')) errores.push('falta "adulto" o el par "macho"/"hembra"')
  if (tiene('adulto') && (tiene('macho') || tiene('hembra'))) errores.push('"adulto" excluye "macho" y "hembra"')
  if (tiene('macho') !== tiene('hembra')) errores.push('"macho" y "hembra" van juntos')
  return errores
}

type ResultadoGbif = { media?: { identifier?: string; license?: string }[]; datasetName?: string }

export function referenciasDesdeGbif(resultados: ResultadoGbif[], max: number): Referencia[] {
  const vistas = new Set<string>()
  const refs: Referencia[] = []
  for (const r of resultados) {
    const foto = r.media?.find(m => m.identifier)
    if (!foto?.identifier || vistas.has(foto.identifier)) continue
    vistas.add(foto.identifier)
    refs.push({ url: foto.identifier, licencia: foto.license ?? '', fuente: r.datasetName ?? '' })
    if (refs.length === max) break
  }
  return refs
}
