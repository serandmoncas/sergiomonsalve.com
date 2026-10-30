import type { Atributos, Especie } from '../tipos'

// Crea una especie de prueba; atributos null = especie sin atributos todavía
export function especie(slug: string, extra: Partial<Especie>, atributos: Partial<Atributos> | null = {}): Especie {
  return {
    speciesKey: slug.length, slug, cientifico: slug, nombreEs: slug, nombreEn: slug,
    familia: 'Thraupidae', orden: 'Passeriformes', puestoColombia: 1, registrosColombia: 1,
    puestoLatam: 1, regiones: ['andina'], meses: new Array(12).fill(0), amenaza: null,
    atributos: atributos && {
      tamanoCm: 18, claseTamano: 'mirla', colores: ['azul'], habitats: ['bosque'],
      altitudM: [0, 1000], residencia: 'residente', endemica: false, ...atributos,
    },
    ...extra,
  }
}
