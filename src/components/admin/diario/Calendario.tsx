import Link from 'next/link'
import { mesVecino, nombreDelMes } from '@/lib/diario/fecha'
import { urlCalendario, urlNota } from '@/lib/diario/urls'

export type DiaCalendario = { dia: string; existe: boolean; abiertas: number; hechas: number; ruta: string | null }

const SEMANA = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

/** El mes con un enlace por día con nota (DI-084). */
export default function Calendario({ mes, dias, locale, hoy }: {
  mes: string
  dias: DiaCalendario[]
  locale: string
  hoy: string
}) {
  const [a, m] = mes.split('-').map(Number)
  const huecos = (new Date(Date.UTC(a, m - 1, 1)).getUTCDay() + 6) % 7
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Link className="font-mono text-xs text-text-secondary hover:text-accent" href={urlCalendario(locale, mesVecino(mes, -1))}>‹ mes anterior</Link>
        <h2 className="font-bold text-text">{nombreDelMes(mes)}</h2>
        <Link className="font-mono text-xs text-text-secondary hover:text-accent" href={urlCalendario(locale, mesVecino(mes, 1))}>mes siguiente ›</Link>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {SEMANA.map(d => <span key={d} aria-hidden className="font-mono text-[10px] text-text-muted">{d}</span>)}
        {Array.from({ length: huecos }, (_, i) => <span key={`h${i}`} />)}
        {dias.map(d => {
          const numero = String(Number(d.dia.slice(8)))
          const clase = `rounded py-2 ${d.dia === hoy ? 'ring-1 ring-accent' : ''}`
          return d.ruta ? (
            <Link key={d.dia} href={urlNota(locale, d.ruta)} className={`${clase} bg-surface text-text hover:text-accent`}
              title={`${d.abiertas} abiertas · ${d.hechas} hechas`}>
              {numero}
              {d.abiertas > 0 && <span className="block text-[10px] text-text-secondary"> {d.abiertas}</span>}
            </Link>
          ) : (
            <span key={d.dia} className={`${clase} text-text-muted`}>{numero}</span>
          )
        })}
      </div>
    </div>
  )
}
