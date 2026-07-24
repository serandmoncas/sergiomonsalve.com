import type { Metadata } from 'next'
import { GRUPO, PARTICIPANTES } from '@/lib/experiencias-ia/data'
import ParticipanteCard from '@/components/experiencias-ia/ParticipanteCard'

export const metadata: Metadata = {
  title: 'Quiénes somos — Experiencias IA',
}

export default function QuienesSomosPage() {
  return (
    <div>
      <p className="eyebrow">El grupo</p>
      <h1>Quiénes somos</h1>
      <p>{GRUPO.descripcion}</p>

      <h2 style={{ marginTop: 40 }}>Cómo funciona</h2>
      <div className="grid g2">
        {GRUPO.principios.map(principio => (
          <div className="card" key={principio.titulo}>
            <h3>{principio.titulo}</h3>
            <p>{principio.texto}</p>
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: 40 }}>Integrantes</h2>
      <div className="grid g3">
        {PARTICIPANTES.map(participante => (
          <ParticipanteCard key={participante.nombre} participante={participante} />
        ))}
      </div>
    </div>
  )
}
