import 'server-only'
import { createHmac } from 'node:crypto'
import { claveUrls } from './github'

const base = (locale: string) => `/${locale === 'en' ? 'en' : 'es'}/admin/diario`

/**
 * Identificador opaco de una nota (DI-084): las URLs, el historial del
 * navegador y los logs de Vercel nunca llevan el nombre de una nota.
 */
export const idNota = (ruta: string) => createHmac('sha256', claveUrls()).update(ruta).digest('hex').slice(0, 20)

export const urlHoy = (locale: string) => base(locale)
export const urlCalendario = (locale: string, mes?: string) =>
  `${base(locale)}/calendario${mes ? `?mes=${mes}` : ''}`
export const urlNota = (locale: string, ruta: string) => `${base(locale)}/nota?n=${idNota(ruta)}`
