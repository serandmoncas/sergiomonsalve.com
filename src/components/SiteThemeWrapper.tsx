'use client'

import { useSyncExternalStore } from 'react'
import SkinSwitcher, { type SkinId } from './about/SkinSwitcher'

const STORAGE_KEY = 'sm-skin'
const VALID_SKINS: SkinId[] = ['crema', 'bosque', 'terminal']
const DEFAULT_SKIN: SkinId = 'crema'

// Same-tab writes don't fire the 'storage' event, so notify subscribers manually.
const listeners = new Set<() => void>()
// Fallback for when localStorage is unavailable (e.g. blocked storage).
let memorySkin: SkinId = DEFAULT_SKIN

function subscribe(listener: () => void) {
  listeners.add(listener)
  window.addEventListener('storage', listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', listener)
  }
}

function getSnapshot(): SkinId {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as SkinId | null
    if (saved && VALID_SKINS.includes(saved)) return saved
  } catch {}
  return memorySkin
}

function getServerSnapshot(): SkinId {
  return DEFAULT_SKIN
}

export default function SiteThemeWrapper({ children }: { children: React.ReactNode }) {
  const skin = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  function handleChange(newSkin: SkinId) {
    memorySkin = newSkin
    try {
      localStorage.setItem(STORAGE_KEY, newSkin)
    } catch {}
    listeners.forEach(l => l())
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
