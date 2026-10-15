import { useTranslations } from 'next-intl'
import { DATOS } from '@/lib/ia-autorretrato/datos'
import type { AutorretratoIA } from '@/lib/ia-autorretrato/tipos'

export default function PerfilPrompts({ datos = DATOS }: { datos?: AutorretratoIA }) {
  const t = useTranslations('autorretrato.prompts')
  const p = datos.perfilPrompts
  const cifras: [string, string][] = [
    [String(p.total), t('total')],
    [String(p.medianaCaracteres), t('mediana')],
    [`${p.pctPreguntas}%`, t('preguntas')],
    [`${p.pctEspanol}%`, t('espanol')],
  ]
  return (
    <figure id="perfil-prompts" className="not-italic my-10" aria-label={t('resumen', { total: p.total, mediana: p.medianaCaracteres, espanol: p.pctEspanol })}>
      <figcaption className="font-mono text-xs text-accent mb-3">{t('titulo')}</figcaption>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cifras.map(([valor, etiqueta]) => (
          <div key={etiqueta} className="border border-border p-3">
            <p className="font-mono text-2xl text-text">{valor}</p>
            <p className="text-xs text-text-secondary mt-1">{etiqueta}</p>
          </div>
        ))}
      </div>
    </figure>
  )
}
