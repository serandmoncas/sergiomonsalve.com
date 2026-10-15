import type { Metadata } from 'next'
import { GRUPO, getPersonasVisibles } from '@/lib/experiencias-ia/data'
import PersonaCard from '@/components/experiencias-ia/PersonaCard'

export const metadata: Metadata = {
  title: 'Quiénes somos — Experiencias IA',
}

export default function QuienesSomosPage() {
  const personas = getPersonasVisibles()

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
      {personas.length === 0 ? (
        <div className="side-box">
          <p style={{ margin: 0 }}>
            Pendiente. Le estamos pidiendo a cada integrante que escriba o apruebe su propio texto. Aquí solo aparece
            quien dé su visto bueno.
          </p>
        </div>
      ) : (
        <div className="grid g3">
          {personas.map(persona => (
            <PersonaCard key={persona.nombre} persona={persona} />
          ))}
        </div>
      )}

      <p className="aviso">
        Tratamiento de datos: de cada integrante solo publicamos su nombre y el texto que él o ella misma aprobó, y solo
        con su consentimiento. Si quieres cambiar o retirar el tuyo, escríbele a Sergio por el grupo y lo quitamos.
      </p>
    </div>
  )
}
