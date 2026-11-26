import { requireReader, type Reader } from './access'
import { getManual } from './manual'
import type { Manual, ManualError } from './types'

export type ManualForReader =
  | { ok: true; manual: Manual; reader: Reader }
  | { ok: false; motivo: 'sin-acceso' }
  | { ok: false; motivo: 'manual'; error: ManualError }

/**
 * Entrada única para layouts y páginas: verifica el lector ANTES de tocar el
 * contenido. Los layouts no se reevalúan en navegación del cliente, así que
 * cada página debe llamar esto también.
 */
export async function getManualForReader(): Promise<ManualForReader> {
  const reader = await requireReader()
  if (!reader) return { ok: false, motivo: 'sin-acceso' }
  const res = await getManual()
  if (!res.ok) return { ok: false, motivo: 'manual', error: res.error }
  return { ok: true, manual: res.manual, reader }
}
