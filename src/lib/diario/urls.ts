const base = (locale: string) => `/${locale === 'en' ? 'en' : 'es'}/admin/diario`

export const urlHoy = (locale: string) => base(locale)
export const urlCalendario = (locale: string, mes?: string) =>
  `${base(locale)}/calendario${mes ? `?mes=${mes}` : ''}`
export const urlNota = (locale: string, ruta: string) => `${base(locale)}/nota?ruta=${encodeURIComponent(ruta)}`
