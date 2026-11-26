import type { VistaObjetivo as Vista } from '@/lib/diaria'
import AccionesObjetivo from './AccionesObjetivo'

const SEMANA = ['Contactado', 'Respondió', 'Entrevista', 'Oferta', 'Descartado'] as const

function Dato({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="font-mono text-xs text-text-secondary uppercase tracking-widest">{titulo}</dt>
      <dd className="text-base text-text">{children}</dd>
    </div>
  )
}

function Objetivo({ id, vista }: { id: string; vista: Vista }) {
  const n = vista.nota
  const cumplida = vista.contactosHoy >= n.metaDiaria
  return (
    <article className="mb-12">
      <h2 className="text-xl font-bold text-text mb-4">{n.nombre}</h2>
      <dl className="grid gap-3 mb-6 sm:grid-cols-2">
        <Dato titulo="Para qué">{n.paraQue || '—'}</Dato>
        <Dato titulo="Hito actual">{n.hitoActual ?? '—'}</Dato>
        <Dato titulo="Siguiente acción">{n.siguiente || '—'}</Dato>
        <Dato titulo="Contactos">
          <span>{`Hoy ${vista.contactosHoy} de ${n.metaDiaria}`}</span>
          {cumplida && <span className="ml-2 font-mono text-xs text-accent">meta cumplida</span>}
          <span className="block font-mono text-xs text-text-secondary">
            {`${vista.totales.contactos} en total · ideal ${n.metaIdeal} al día`}
          </span>
        </Dato>
      </dl>
      <AccionesObjetivo objetivoId={id} columnas={vista.columnas} />
      <div className="overflow-x-auto mt-8">
        <table aria-label="Por semana" className="font-mono text-xs text-text">
          <thead>
            <tr className="text-text-secondary">
              <th className="text-left pr-3">Semana del</th>
              {SEMANA.map(c => <th key={c} className="pr-3">{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {vista.semanas.map(s => (
              <tr key={s.desde}>
                <td className="pr-3">{s.desde}</td>
                {SEMANA.map(c => (
                  <td key={c} className="pr-3 text-center">{(s as unknown as Record<string, number>)[c] ?? 0}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  )
}

/** El objetivo activo con sus contactos (DI-087). */
export default function VistaObjetivo({ objetivos }: { objetivos: { id: string; vista: Vista }[] }) {
  if (objetivos.length === 0) return <p className="text-text-secondary">No hay objetivo activo.</p>
  return (
    <div>
      {objetivos.map(o => <Objetivo key={o.id} id={o.id} vista={o.vista} />)}
    </div>
  )
}
