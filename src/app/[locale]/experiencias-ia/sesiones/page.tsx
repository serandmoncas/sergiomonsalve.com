import type { Metadata } from 'next'
import { SESIONES } from '@/lib/experiencias-ia/data'
import SesionRow from '@/components/experiencias-ia/SesionRow'

export const metadata: Metadata = {
  title: 'Sesiones — Experiencias IA',
}

export default function SesionesIndexPage() {
  const sesionesOrdenadas = [...SESIONES].sort((a, b) => b.n - a.n)

  return (
    <div>
      <p className="eyebrow">Bitácora</p>
      <h1>Sesiones</h1>
      <div className="ses-list">
        {sesionesOrdenadas.map(sesion => (
          <SesionRow key={sesion.n} sesion={sesion} />
        ))}
      </div>
    </div>
  )
}
