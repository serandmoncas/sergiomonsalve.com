import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import { GRUPO, getMetricas, getProximaSesion, getUltimasSesiones } from '@/lib/experiencias-ia/data'
import CapasHarness from '@/components/experiencias-ia/CapasHarness'
import MetricaTile from '@/components/experiencias-ia/MetricaTile'
import PrincipioCard from '@/components/experiencias-ia/PrincipioCard'
import SesionRow from '@/components/experiencias-ia/SesionRow'

export const metadata: Metadata = {
  title: 'Experiencias IA',
  description: GRUPO.descripcion,
}

export default function ExperienciasIAHomePage() {
  const metricas = getMetricas()
  const ultimasSesiones = getUltimasSesiones(3)

  return (
    <div>
      <p className="eyebrow">
        {GRUPO.cadencia} · {GRUPO.lugar}
      </p>
      <h1>{GRUPO.nombre}</h1>
      <p className="lema">&ldquo;{GRUPO.lema}&rdquo;</p>
      <p>{GRUPO.descripcion}</p>

      <div className="principio-madre">
        <p>{GRUPO.principioMadre}</p>
      </div>

      <div className="formato">
        <p className="meta">
          <b>Cómo son las sesiones</b> · próxima: {getProximaSesion().texto}
        </p>
        {GRUPO.formato.map(linea => (
          <p key={linea}>{linea}</p>
        ))}
      </div>

      <CapasHarness />

      <div className="grid g3" style={{ marginTop: 40 }}>
        <div className="card">
          <MetricaTile valor={metricas.totalSesiones} label="Sesiones" />
        </div>
        <div className="card">
          <MetricaTile valor={metricas.totalIntegrantes} label="Integrantes" />
        </div>
        <div className="card">
          <Link href="/experiencias-ia/temas" style={{ color: 'inherit', textDecoration: 'none' }}>
            <MetricaTile valor={metricas.temasPropuestos} label="Temas propuestos" />
          </Link>
        </div>
      </div>

      <h2 style={{ marginTop: 48 }}>Principios</h2>
      <div className="grid g2">
        {GRUPO.principios.map(principio => (
          <PrincipioCard key={principio.titulo} principio={principio} />
        ))}
      </div>

      <h2 style={{ marginTop: 48 }}>Últimas sesiones</h2>
      <div className="ses-list">
        {ultimasSesiones.map(sesion => (
          <SesionRow key={sesion.n} sesion={sesion} />
        ))}
      </div>
    </div>
  )
}
