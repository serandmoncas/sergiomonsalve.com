'use client'

import { useState } from 'react'

export default function CopyButton({ text, label, copiedLabel, className }: {
  text: string
  label: string
  copiedLabel: string
  className?: string
}) {
  const [copied, setCopied] = useState(false)

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <button type="button" onClick={handleClick} className={className}>
      {copied ? copiedLabel : label}
    </button>
  )
}
