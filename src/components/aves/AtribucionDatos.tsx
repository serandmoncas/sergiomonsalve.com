import { useTranslations } from 'next-intl'

// Atribución exigida por la licencia CC BY 4.0 de los datos de GBIF/eBird
export default function AtribucionDatos({ fecha }: { fecha: string }) {
  const t = useTranslations('aves')
  return (
    <p className="font-mono text-[11px] leading-relaxed text-text-muted border-t border-border pt-4 mt-12">
      {t('atribucion', { fecha })}
    </p>
  )
}
