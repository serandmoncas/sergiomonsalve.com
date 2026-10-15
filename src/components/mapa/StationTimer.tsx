'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

const DURATION = 300

export default function StationTimer() {
  const t = useTranslations('mapa')
  const [left, setLeft] = useState(DURATION)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      setLeft(prev => {
        if (prev <= 1) {
          setRunning(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [running])

  function handleClick() {
    if (running) return setRunning(false)
    if (left === 0) setLeft(DURATION)
    setRunning(true)
  }

  const label = running ? t('timer.pause') : left === 0 ? t('timer.restart') : left < DURATION ? t('timer.resume') : t('timer.start')
  const mm = String(Math.floor(left / 60)).padStart(2, '0')
  const ss = String(left % 60).padStart(2, '0')

  return (
    <div className="flex items-center gap-2" role="group" aria-label={t('timer.label')}>
      <span className={`font-mono text-sm tabular-nums ${left === 0 ? 'text-accent' : 'text-text-secondary'}`}>{mm}:{ss}</span>
      <button type="button" onClick={handleClick} className="font-mono text-xs border border-border px-3 py-1.5 rounded-sm text-text-secondary hover:border-accent hover:text-accent transition-colors">
        {label}
      </button>
    </div>
  )
}
