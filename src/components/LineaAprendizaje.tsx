import { useTranslations } from 'next-intl'

// Tema «Aprendizaje» del visor histórico (proyecto ClaudeDataViz): cronología generada con Claude
// a partir de Wikipedia y revisada a mano. El visor vive en su propio despliegue y se embebe aquí.
export const URL_VISOR = 'https://visor-historico.vercel.app/tema/generado/aprendizaje'

export default function LineaAprendizaje() {
  const t = useTranslations('lineaAprendizaje')
  return (
    <div className="px-4 sm:px-6 py-10 space-y-6">
      <header className="max-w-4xl mx-auto space-y-4">
        <p className="font-mono text-xs text-accent">{t('comment')}</p>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-text text-balance">
          {t('title')}
        </h1>
        <p className="max-w-2xl text-sm sm:text-base text-text-secondary leading-relaxed">{t('lede')}</p>
        <a
          href={URL_VISOR}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block font-mono text-xs text-accent hover:underline"
        >
          {t('fullscreen')} ↗
        </a>
      </header>
      <iframe
        src={URL_VISOR}
        title={t('iframeTitle')}
        loading="lazy"
        className="block w-full max-w-7xl mx-auto rounded-lg border border-border"
        style={{ height: 'calc(100vh - 7rem)', minHeight: 720 }}
      />
    </div>
  )
}
