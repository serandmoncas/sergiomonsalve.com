import Link from 'next/link'
import { urlCalendario, urlHoy, urlNota } from '@/lib/diario/urls'

export default function NavDiario({ locale, notaHoy }: { locale: string; notaHoy?: string | null }) {
  const enlace = 'font-mono text-xs text-text-secondary hover:text-accent'
  return (
    <nav aria-label="Diario" className="flex flex-wrap gap-4 mb-6">
      <Link className={enlace} href={urlHoy(locale)}>Hoy</Link>
      <Link className={enlace} href={urlCalendario(locale)}>Calendario</Link>
      {notaHoy && <Link className={enlace} href={urlNota(locale, notaHoy)}>Nota de hoy</Link>}
    </nav>
  )
}
