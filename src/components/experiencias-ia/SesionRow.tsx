import { Link } from '@/i18n/navigation'
import type { Sesion } from '@/lib/experiencias-ia/data'

export default function SesionRow({ sesion }: { sesion: Sesion }) {
  return (
    <Link href={`/experiencias-ia/sesiones/${sesion.n}`} className="ses-row">
      <span className="ses-num">{String(sesion.n).padStart(2, '0')}</span>
      <span>
        <span className="ses-t">{sesion.titulo}</span>
        <span className="ses-d">{sesion.resumenCorto}</span>
      </span>
      <span className="ses-f">{sesion.fechaLarga}</span>
    </Link>
  )
}
