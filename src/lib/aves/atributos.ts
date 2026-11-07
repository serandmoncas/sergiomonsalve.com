import { z } from 'zod'
import type { ClaseTamano } from './tipos'

// colibri < 13 cm, mirla < 26, paloma < 40, gallinazo ≥ 40
export function claseDeTamano(cm: number): ClaseTamano {
  if (cm < 13) return 'colibri'
  if (cm < 26) return 'mirla'
  if (cm < 40) return 'paloma'
  return 'gallinazo'
}

const esquema = z
  .object({
    tamanoCm: z.number().positive(),
    claseTamano: z.enum(['colibri', 'mirla', 'paloma', 'gallinazo']),
    colores: z.array(z.enum(['azul', 'rojo', 'amarillo', 'verde', 'negro', 'cafe', 'blanco', 'gris'])).min(1).max(3),
    habitats: z.array(z.enum(['ciudad', 'bosque', 'agua', 'paramo', 'campo'])).min(1).max(3),
    altitudM: z.tuple([z.number().min(0), z.number().min(0)]),
    residencia: z.enum(['residente', 'migratoria-boreal', 'migratoria-austral']),
    endemica: z.boolean(),
  })
  .strict()
  .refine(a => a.altitudM[0] <= a.altitudM[1], { message: 'altitudM: el mínimo es mayor que el máximo', path: ['altitudM'] })
  .refine(a => a.claseTamano === claseDeTamano(a.tamanoCm), {
    message: 'claseTamano no corresponde a tamanoCm',
    path: ['claseTamano'],
  })

export function validarAtributos(a: unknown): string[] {
  const resultado = esquema.safeParse(a)
  return resultado.success ? [] : resultado.error.issues.map(i => `${i.path.join('.')}: ${i.message}`)
}
