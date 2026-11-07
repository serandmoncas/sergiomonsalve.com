import { useTranslations } from 'next-intl'

const MIRLA_CM = 25
const PALOMA_CM = 33

function Silueta({ alto, clase }: { alto: number; clase: string }) {
  return (
    <svg viewBox="0 0 64 48" style={{ height: alto }} className={`fill-current ${clase}`} aria-hidden="true">
      <path d="M8 30c6-1 11-5 14-10 3-6 9-10 16-10 5 0 9 3 10 7l8 2-8 3c0 9-7 16-17 17l4 7h-4l-4-7c-7-1-13-4-19-9z" />
    </svg>
  )
}

// Dos siluetas a escala: la especie frente a un ave que todo el mundo conoce
export default function ComparadorTamano({ tamanoCm }: { tamanoCm: number }) {
  const t = useTranslations('aves')
  const referenciaCm = tamanoCm < 26 ? MIRLA_CM : PALOMA_CM
  const escala = 80 / Math.max(tamanoCm, referenciaCm) // px por cm; la mayor mide 80 px
  return (
    <div>
      <div className="flex items-end gap-6 h-24">
        <Silueta alto={tamanoCm * escala} clase="text-accent" />
        <Silueta alto={referenciaCm * escala} clase="text-text-muted opacity-50" />
      </div>
      <p className="font-mono text-xs text-text-secondary mt-2">
        {tamanoCm} cm · {t(tamanoCm < 26 ? 'referenciaMirla' : 'referenciaPaloma')}
      </p>
    </div>
  )
}
