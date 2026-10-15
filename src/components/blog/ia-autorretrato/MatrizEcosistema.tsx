import { useLocale, useTranslations } from 'next-intl'
import { DATOS } from '@/lib/ia-autorretrato/datos'
import type { AutorretratoIA } from '@/lib/ia-autorretrato/tipos'

export default function MatrizEcosistema({ datos = DATOS }: { datos?: AutorretratoIA }) {
  const t = useTranslations('autorretrato.ecosistema')
  const locale = useLocale() === 'en' ? 'en' : 'es'
  return (
    <figure id="matriz-ecosistema" className="not-italic my-10">
      <figcaption className="font-mono text-xs text-accent mb-3">{t('titulo')}</figcaption>
      <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="font-mono text-xs text-text-secondary">
            <th scope="col" className="py-1 pr-3 font-normal">{t('herramienta')}</th>
            <th scope="col" className="py-1 pr-3 font-normal">{t('uso')}</th>
            <th scope="col" className="py-1 pr-3 font-normal">{t('intensidad')}</th>
            <th scope="col" className="py-1 font-normal hidden sm:table-cell">{t('fuente')}</th>
          </tr>
        </thead>
        <tbody>
          {datos.ecosistema.map(e => (
            <tr key={e.herramienta} className="border-t border-border align-top">
              <td className="py-2 pr-3">
                {e.herramienta}
                <span data-fuente-movil className={`sm:hidden block w-fit mt-1 font-mono text-xs px-1.5 py-0.5 border ${e.fuente === 'medido' ? 'border-accent text-accent' : 'border-dashed border-text-muted text-text-secondary'}`}>
                  {t(e.fuente)}
                </span>
              </td>
              <td className="py-2 pr-3 text-text-secondary">{e.uso[locale]}</td>
              <td className="py-2 pr-3" aria-label={`${e.intensidad}/3`}>
                {[1, 2, 3].map(i => (
                  <span key={i} className={`inline-block w-2 h-2 mr-1 rounded-full ${i <= e.intensidad ? 'bg-accent' : 'border border-text-muted'}`} />
                ))}
              </td>
              <td className="py-2 hidden sm:table-cell">
                <span className={`font-mono text-xs px-1.5 py-0.5 border ${e.fuente === 'medido' ? 'border-accent text-accent' : 'border-dashed border-text-muted text-text-secondary'}`}>
                  {t(e.fuente)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </figure>
  )
}
