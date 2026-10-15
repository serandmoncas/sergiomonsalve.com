import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { getSesionesDocumentadas, getSesion, getAdjacentSesiones } from '@/lib/experiencias-ia/data'
import ReferenciaItem from '@/components/experiencias-ia/ReferenciaItem'

export function generateStaticParams() {
  return getSesionesDocumentadas().map(sesion => ({ n: String(sesion.n) }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ n: string }>
}): Promise<Metadata> {
  const { n } = await params
  const sesion = getSesion(Number(n))
  if (!sesion) return {}
  return {
    title: `Sesión ${sesion.n}: ${sesion.titulo} — Experiencias IA`,
    description: sesion.gancho,
  }
}

export default async function SesionDetallePage({
  params,
}: {
  params: Promise<{ n: string }>
}) {
  const { n } = await params
  const sesion = getSesion(Number(n))
  if (!sesion) notFound()

  const { anterior, siguiente } = getAdjacentSesiones(sesion.n)
  const tieneDetalleLargo =
    (sesion.resumen?.length ?? 0) > 0 || (sesion.conceptos?.length ?? 0) > 0 || (sesion.decisiones?.length ?? 0) > 0

  return (
    <div>
      <p className="eyebrow">
        Sesión {String(sesion.n).padStart(2, '0')} · {sesion.fechaLarga}
        {sesion.encargado && <> · {sesion.encargado}</>}
      </p>
      <h1>{sesion.titulo}</h1>

      <div className="det-cols">
        <div className="prose">
          <p className="gancho">{sesion.gancho}</p>

          {sesion.hallazgos && sesion.hallazgos.length > 0 && (
            <>
              <h2>Hallazgos</h2>
              <ul className="hallazgos">
                {sesion.hallazgos.map((hallazgo, i) => (
                  <li key={i}>{hallazgo}</li>
                ))}
              </ul>
            </>
          )}

          {tieneDetalleLargo && (
            <details className="det-largo">
              <summary>Ver el detalle largo</summary>

              {sesion.resumen?.map((parrafo, i) => (
                <p key={i}>{parrafo}</p>
              ))}

              {sesion.conceptos && sesion.conceptos.length > 0 && (
                <>
                  <h2>Conceptos</h2>
                  <div className="grid g2">
                    {sesion.conceptos.map(concepto => (
                      <div className="card" key={concepto.t}>
                        <h3>{concepto.t}</h3>
                        <p>{concepto.d}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {sesion.decisiones && sesion.decisiones.length > 0 && (
                <>
                  <h2>Decisiones</h2>
                  <ul>
                    {sesion.decisiones.map((decision, i) => (
                      <li key={i}>{decision}</li>
                    ))}
                  </ul>
                </>
              )}
            </details>
          )}
        </div>

        <div>
          {sesion.asistentes && sesion.asistentes.length > 0 && (
            <div className="side-box">
              <h4>Asistentes</h4>
              <p style={{ margin: 0 }}>{sesion.asistentes.join(', ')}</p>
            </div>
          )}

          {sesion.temas && sesion.temas.length > 0 && (
            <div className="side-box">
              <h4>Temas</h4>
              {sesion.temas.map(tema => (
                <span className="tag" key={tema}>
                  {tema}
                </span>
              ))}
            </div>
          )}

          {sesion.nuevos && sesion.nuevos.length > 0 && (
            <div className="side-box">
              <h4>Caras nuevas</h4>
              {sesion.nuevos.map(nombre => (
                <p key={nombre}>{nombre}</p>
              ))}
            </div>
          )}

          <div className="side-box">
            <h4>Enlaces</h4>
            {sesion.enlaces.length > 0 ? (
              sesion.enlaces.map((referencia, i) => <ReferenciaItem key={i} referencia={referencia} />)
            ) : (
              <p className="meta" style={{ margin: 0 }}>
                Pendiente
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="ses-nav">
        {anterior ? (
          <Link href={`/experiencias-ia/sesiones/${anterior.n}`}>
            ← Sesión {anterior.n}: {anterior.titulo}
          </Link>
        ) : (
          <span />
        )}
        {siguiente ? (
          <Link href={`/experiencias-ia/sesiones/${siguiente.n}`}>
            Sesión {siguiente.n}: {siguiente.titulo} →
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  )
}
