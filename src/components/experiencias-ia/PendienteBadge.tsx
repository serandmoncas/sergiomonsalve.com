import type { EstadoPendiente } from '@/lib/experiencias-ia/data'

export default function PendienteBadge({
  quien,
  que,
  estado,
}: {
  quien: string
  que: string
  estado: EstadoPendiente
}) {
  return (
    <div className={`pendiente${estado === 'cerrado' ? ' cerrado' : ''}`}>
      <span>
        <strong>{quien}</strong> — {que}
      </span>
      <span className={`pendiente-estado ${estado}`}>{estado}</span>
    </div>
  )
}
