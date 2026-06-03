'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'

export default function MarkCompleteButton({
  courseSlug,
  lessonId,
  isCompleted,
}: {
  courseSlug: string
  lessonId: string
  isCompleted: boolean
}) {
  const t = useTranslations('cursos')
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  if (isCompleted) {
    return (
      <span className="font-mono text-xs text-accent">
        ✓ {t('completada')}
      </span>
    )
  }

  async function handleComplete() {
    setLoading(true)
    await fetch(`/api/cursos/${courseSlug}/lecciones/${lessonId}/completar`, { method: 'POST' })
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={handleComplete}
      disabled={loading}
      className="font-mono text-xs text-text-muted border border-border px-4 py-2 rounded-sm hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
    >
      {loading ? '...' : `✓ ${t('marcar_completada')}`}
    </button>
  )
}
