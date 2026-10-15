import type { Metadata } from 'next'
import { getProyectosPublicados } from '@/lib/experiencias-ia/data'

export const metadata: Metadata = {
  title: 'Taller — Experiencias IA',
}

export default function TallerPage() {
  const proyectos = getProyectosPublicados()

  return (
    <div>
      <p className="eyebrow">Lo que hemos mostrado</p>
      <h1>Taller</h1>
      <p>
        Proyectos que los integrantes han mostrado en sesión. Cada ficha aparece solo si su autor lo autoriza, y sin
        enlaces de descarga: mostrar algo aquí no es comprometerse a darle soporte.
      </p>

      {proyectos.length === 0 ? (
        <div className="side-box" style={{ marginTop: 24 }}>
          <p style={{ margin: 0 }}>Pendiente. Estamos pidiendo permiso a cada autor antes de publicar su ficha.</p>
        </div>
      ) : (
        <div className="grid g2" style={{ marginTop: 24 }}>
          {proyectos.map(p => (
            <div className="card" key={`${p.autor}-${p.proyecto}`}>
              <h3>{p.proyecto}</h3>
              <p className="meta">{p.autor}</p>
              <p>{p.descripcion}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
