import type { Metadata } from 'next'
import { GRUPO, TEMAS_FUERA, getTemasOrdenados } from '@/lib/experiencias-ia/data'

export const metadata: Metadata = {
  title: 'Próximos temas — Experiencias IA',
}

function fechaCorta(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
}

export default function TemasPage() {
  const temas = getTemasOrdenados()

  return (
    <div>
      <p className="eyebrow">Próxima sesión: {GRUPO.proximaSesion}</p>
      <h1>Próximos temas</h1>
      <p>
        Propuestas voluntarias. Quien propone un tema no queda comprometido a nada: si alguien quiere contar algo
        sobre él, bienvenido.
      </p>

      <div className="grid g2" style={{ marginTop: 24 }}>
        {temas.map(tema => (
          <div className="card" key={tema.tema}>
            <h3>{tema.tema}</h3>
            <p className="meta">
              <b>Propone</b> {tema.propone}
              {tema.surgio && <> · surgió el {fechaCorta(tema.surgio)}</>}
            </p>
            {tema.nota && <p>{tema.nota}</p>}
          </div>
        ))}
      </div>

      {TEMAS_FUERA.length > 0 && (
        <div className="side-box" style={{ marginTop: 32 }}>
          <h4>Salieron de la lista</h4>
          {TEMAS_FUERA.map(t => (
            <p key={t.tema}>
              <strong>{t.tema}.</strong> {t.nota}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
