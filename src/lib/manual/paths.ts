// Rutas sin locale: para usar con el Link de i18n.
export const MANUAL_BASE = '/manual-de-usuario'
// Ruta absoluta con locale: para redirecciones.
export const MANUAL_ES_BASE = '/es/manual-de-usuario'

export const notaHref = (slug: string, r?: string) =>
  `${MANUAL_BASE}/n/${slug}${r ? `?r=${encodeURIComponent(r)}` : ''}`
export const recorridoHref = (slug: string) => `${MANUAL_BASE}/r/${slug}`
export const mapaHref = () => `${MANUAL_BASE}/mapa`
export const grafoHref = () => `${MANUAL_BASE}/grafo`
