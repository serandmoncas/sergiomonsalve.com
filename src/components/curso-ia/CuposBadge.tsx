import { useTranslations } from 'next-intl'

type Props = { confirmed: number | null; capacity: number; closed: boolean }

export default function CuposBadge({ confirmed, capacity, closed }: Props) {
  const t = useTranslations('cursoIa')
  if (confirmed === null) return null

  const left = Math.max(capacity - confirmed, 0)
  const label = closed ? t('cuposClosed') : left === 0 ? t('cuposFull') : t('cuposLeft', { left, capacity })
  const urgent = !closed && left > 0 && left <= 5

  return (
    <p
      className={`inline-block font-mono text-xs px-3 py-1.5 rounded-sm border ${
        urgent || left === 0 ? 'border-accent text-accent' : 'border-border text-text-secondary'
      }`}
      role="status"
    >
      {label}
    </p>
  )
}
