import { Link } from '@/i18n/navigation'
import type { TerminoGlosario } from '@/lib/experiencias-ia/glosario'

export default function TerminoRow({ termino }: { termino: TerminoGlosario }) {
  return (
    <Link href={`/experiencias-ia/glosario/${termino.slug}`} className="ses-row">
      <span />
      <span>
        <span className="ses-t">{termino.termino}</span>
        <span className="ses-d">{termino.definicion}</span>
      </span>
      <span />
    </Link>
  )
}
