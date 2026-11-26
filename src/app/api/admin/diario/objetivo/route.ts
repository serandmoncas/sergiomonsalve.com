import { NextResponse } from 'next/server'
import { requireAdminAal2 } from '@/lib/auth/admin'
import { CABECERAS_DIARIO } from '@/lib/auth/cabeceras-diario'
import { fechaBogota } from '@/lib/diario/fecha'
import { ejecutarAccion, type Accion } from '@/lib/diario/objetivo'

export const dynamic = 'force-dynamic'

const responder = (cuerpo: unknown, status: number) => NextResponse.json(cuerpo, { status, headers: CABECERAS_DIARIO })

const cadena = (x: unknown) => (typeof x === 'string' ? x : undefined)

/** Solo los campos de cada tipo, y solo como texto. */
function leerAccion(c: Record<string, unknown>): Accion | null {
  switch (c.tipo) {
    case 'contacto':
      return { tipo: 'contacto', nombre: cadena(c.nombre), canal: cadena(c.canal), nota: cadena(c.nota) }
    case 'mover':
      return { tipo: 'mover', texto: cadena(c.texto), a: cadena(c.a) }
    case 'deshacer':
      return { tipo: 'deshacer' }
    default:
      return null
  }
}

const sinIndefinidos = <T extends object>(o: T) =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as T

/**
 * Acciones del objetivo (DI-087): agregar contacto, mover tarjeta, deshacer.
 * Solo POST, desde el propio sitio, con sesión de admin en aal2.
 */
export async function POST(req: Request) {
  const acceso = await requireAdminAal2()
  if (acceso instanceof NextResponse) return acceso
  if (req.headers.get('origin') !== new URL(req.url).origin) return responder({ ok: false, error: 'origen' }, 403)
  let cuerpo: unknown
  try {
    cuerpo = await req.json()
  } catch {
    return responder({ ok: false, error: 'cuerpo inválido' }, 400)
  }
  if (!cuerpo || typeof cuerpo !== 'object' || Array.isArray(cuerpo)) {
    return responder({ ok: false, error: 'cuerpo inválido' }, 400)
  }
  const c = cuerpo as Record<string, unknown>
  const accion = leerAccion(c)
  if (typeof c.objetivo !== 'string' || !accion) return responder({ ok: false, error: 'cuerpo inválido' }, 400)
  const r = await ejecutarAccion(c.objetivo, sinIndefinidos(accion), fechaBogota(new Date()))
  if (r.ok) return responder({ ok: true }, 200)
  return responder({ ok: false, error: r.error }, r.estado)
}
