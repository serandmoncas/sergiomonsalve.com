import type { Persona } from '@/lib/experiencias-ia/data'

function mesYAnio(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
}

export default function PersonaCard({ persona }: { persona: Persona }) {
  return (
    <div className="card">
      <h3>{persona.nombre}</h3>
      <p className="meta">Desde {mesYAnio(persona.desde)}</p>
      <p>{persona.texto}</p>
    </div>
  )
}
