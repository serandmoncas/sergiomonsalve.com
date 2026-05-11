'use client'

import { useState, useEffect } from 'react'
import SkinSwitcher, { type SkinId } from './about/SkinSwitcher'

const STORAGE_KEY = 'sm-skin'
const VALID_SKINS: SkinId[] = ['crema', 'bosque', 'terminal']
const DEFAULT_SKIN: SkinId = 'crema'

export default function SiteThemeWrapper({ children }: { children: React.ReactNode }) {
  const [skin, setSkin] = useState<SkinId>(DEFAULT_SKIN)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as SkinId | null
      if (saved && VALID_SKINS.includes(saved)) setSkin(saved)
    } catch {}
  }, [])

  function handleChange(newSkin: SkinId) {
    setSkin(newSkin)
    try {
      localStorage.setItem(STORAGE_KEY, newSkin)
    } catch {}
  }

  return (
    <div
      data-skin={skin}
      className="bg-background text-text min-h-screen flex flex-col"
      style={{ transition: 'background-color 240ms ease, color 240ms ease' }}
    >
      {children}
      <SkinSwitcher skin={skin} onChange={handleChange} />
    </div>
  )
}
