'use client'

import { useTranslations } from 'next-intl'

export default function ProgressBar({ completed, total }: { completed: number; total: number }) {
  const t = useTranslations('cursos')
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="mb-6">
      <p className="font-mono text-xs text-text-muted mb-2">
        {t('progreso', { completed, total })}
      </p>
      <div className="h-1 bg-surface rounded-full overflow-hidden">
        <div
          className="h-full bg-accent transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
