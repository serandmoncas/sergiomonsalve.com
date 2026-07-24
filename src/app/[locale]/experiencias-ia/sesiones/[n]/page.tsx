import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { SESIONES, getSesion, getAdjacentSesiones } from '@/lib/experiencias-ia/data'
import PendienteBadge from '@/components/experiencias-ia/PendienteBadge'
import ReferenciaItem from '@/components/experiencias-ia/ReferenciaItem'

export function generateStaticParams() {
  return SESIONES.map(sesion => ({ n: String(sesion.n) }))
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
    description: sesion.resumenCorto,
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

  return (
    <div>
      <p className="eyebrow">
        Sesión {String(sesion.n).padStart(2, '0')} · {sesion.fechaLarga} · {sesion.encargado}
      </p>
      <h1>{sesion.titulo}</h1>

      <div className="det-cols">
        <div className="prose">
          {sesion.resumen.map((parrafo, i) => (
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

          {sesion.decisiones.length > 0 && (
            <>
              <h2>Decisiones</h2>
              <ul>
                {sesion.decisiones.map((decision, i) => (
                  <li key={i}>{decision}</li>
                ))}
              </ul>
            </>
          )}
        </div>

        <div>
          {sesion.pendientes.length > 0 && (
            <div className="side-box">
              <h4>Pendientes</h4>
              {sesion.pendientes.map((pendiente, i) => (
                <PendienteBadge key={i} quien={pendiente.quien} que={pendiente.que} estado={pendiente.estado} />
              ))}
            </div>
          )}

          {sesion.temas.length > 0 && (
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
              <h4>Nuevos integrantes</h4>
              {sesion.nuevos.map(nombre => (
                <p key={nombre}>{nombre}</p>
              ))}
            </div>
          )}

          {sesion.referencias.length > 0 && (
            <div className="side-box">
              <h4>Referencias</h4>
              {sesion.referencias.map((referencia, i) => (
                <ReferenciaItem key={i} referencia={referencia} />
              ))}
            </div>
          )}
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
