'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'

type Status = 'none' | 'pending' | 'approved'

export default function EnrollmentCTA({
  courseSlug,
  initialStatus,
}: {
  courseSlug: string
  initialStatus: Status
}) {
  const t = useTranslations('cursos')
  const router = useRouter()
  const [status, setStatus] = useState<Status>(initialStatus)
  const [loading, setLoading] = useState(false)

  async function handleEnroll() {
    setLoading(true)
    const res = await fetch(`/api/cursos/${courseSlug}/enrollar`, { method: 'POST' })
    if (res.ok) {
      const { enrollment } = await res.json()
      setStatus(enrollment.status as Status)
      if (enrollment.status === 'approved') {
        router.push(`/cursos/${courseSlug}/aprender`)
      }
    }
    setLoading(false)
  }

  if (status === 'approved') {
    return (
      <button
        onClick={() => router.push(`/cursos/${courseSlug}/aprender`)}
        className="font-mono text-xs bg-accent text-background px-6 py-2.5 rounded-sm hover:opacity-90 transition-opacity"
      >
        <span>{t('continuar')}</span> →
      </button>
    )
  }

  if (status === 'pending') {
    return (
      <span className="font-mono text-xs text-text-muted border border-border px-6 py-2.5 rounded-sm">
        <span>{t('pendiente')}</span>
      </span>
    )
  }

  return (
    <button
      onClick={handleEnroll}
      disabled={loading}
      className="font-mono text-xs bg-accent text-background px-6 py-2.5 rounded-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
    >
      <span>{loading ? '...' : t('enroll')}</span> →
    </button>
  )
}
