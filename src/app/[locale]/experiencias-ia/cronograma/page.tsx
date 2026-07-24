import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import { CRONOGRAMA, getPendientesAbiertos } from '@/lib/experiencias-ia/data'

export const metadata: Metadata = {
  title: 'Cronograma — Experiencias IA',
}

export default function CronogramaPage() {
  const pendientesAbiertos = getPendientesAbiertos()

  return (
    <div>
      <p className="eyebrow">Próximas sesiones</p>
      <h1>Cronograma</h1>

      <div className="grid g2" style={{ marginTop: 24 }}>
        {CRONOGRAMA.map(sesion => (
          <div className="card" key={sesion.n}>
            <span className={`estado-badge ${sesion.estado}`}>{sesion.estado}</span>
            <h3>
              Sesión {sesion.n}: {sesion.titulo}
            </h3>
            <p className="ses-d">
              {sesion.fecha} · {sesion.encargados.join(', ')}
            </p>
            <ul>
              {sesion.contenido.map((punto, i) => (
                <li key={i}>{punto}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: 48 }}>Pendientes abiertos</h2>
      <div className="side-box">
        {pendientesAbiertos.length === 0 && <p>No hay pendientes abiertos.</p>}
        {pendientesAbiertos.map((pendiente, i) => (
          <div key={i} style={{ marginBottom: 14 }}>
            <p style={{ marginBottom: 2 }}>
              <strong>{pendiente.quien}</strong> — {pendiente.que}
            </p>
            <Link href={`/experiencias-ia/sesiones/${pendiente.sesionN}`} className="ses-f">
              Sesión {pendiente.sesionN}: {pendiente.sesionTitulo}
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
