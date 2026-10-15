import { Link } from '@/i18n/navigation'
import { esSinRegistro, type EntradaSesion } from '@/lib/experiencias-ia/data'

export default function SesionRow({ sesion }: { sesion: EntradaSesion }) {
  if (esSinRegistro(sesion)) {
    return (
      <div className="ses-row sin-registro">
        <span className="ses-num">—</span>
        <span>
          <span className="ses-t">{sesion.nota ?? 'Sin registro'}</span>
          <span className="ses-d">No hay transcripción de este encuentro.</span>
        </span>
        <span className="ses-f">{sesion.fechaLarga}</span>
      </div>
    )
  }

  return (
    <Link href={`/experiencias-ia/sesiones/${sesion.n}`} className="ses-row">
      <span className="ses-num">{String(sesion.n).padStart(2, '0')}</span>
      <span>
        <span className="ses-t">{sesion.titulo}</span>
        <span className="ses-d">{sesion.gancho}</span>
      </span>
      <span className="ses-f">{sesion.fechaLarga}</span>
    </Link>
  )
}
