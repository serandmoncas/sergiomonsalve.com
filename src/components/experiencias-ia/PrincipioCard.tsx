import type { Principio } from '@/lib/experiencias-ia/data'

export default function PrincipioCard({ principio }: { principio: Principio }) {
  return (
    <div className="card">
      <h3>{principio.titulo}</h3>
      <p>{principio.texto}</p>
    </div>
  )
}
