import type { Metadata } from 'next'
import { getBitacora } from '@/lib/experiencias-ia/data'
import SesionRow from '@/components/experiencias-ia/SesionRow'

export const metadata: Metadata = {
  title: 'Sesiones — Experiencias IA',
}

export default function SesionesIndexPage() {
  const bitacora = getBitacora()

  return (
    <div>
      <p className="eyebrow">Bitácora</p>
      <h1>Sesiones</h1>
      <div className="ses-list">
        {bitacora.map(sesion => (
          <SesionRow key={sesion.fecha} sesion={sesion} />
        ))}
      </div>
    </div>
  )
}
