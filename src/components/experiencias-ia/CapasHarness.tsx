import { getSesion } from '@/lib/experiencias-ia/data'

export default function CapasHarness() {
  const conceptos = getSesion(7)?.conceptos?.slice(0, 3) ?? []

  return (
    <div className="capas">
      {conceptos.map((concepto, index) => (
        <div className="capa" key={concepto.t}>
          {index < 2 && <i>{concepto.d.replace(/\.$/, '')}</i>}
          <b>{concepto.t}</b>
          <p>{concepto.d}</p>
        </div>
      ))}
    </div>
  )
}
