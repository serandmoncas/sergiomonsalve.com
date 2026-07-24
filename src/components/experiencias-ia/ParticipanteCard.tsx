import type { Participante } from '@/lib/experiencias-ia/data'

export default function ParticipanteCard({ participante }: { participante: Participante }) {
  return (
    <div className="card">
      <h3>{participante.nombre}</h3>
      <p className="ses-d">
        {participante.rol} · {participante.campo}
      </p>
      <p>{participante.bio}</p>
      <div>
        {participante.tags.map(tag => (
          <span className="tag" key={tag}>
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}
