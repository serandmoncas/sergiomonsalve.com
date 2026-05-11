'use client'

const SKINS = [
  { id: 'crema' as const, label: 'Crema', bg: '#f4f1ea', accent: '#b4501a' },
  { id: 'bosque' as const, label: 'Bosque', bg: '#ecebe0', accent: '#3d6b3a' },
  { id: 'terminal' as const, label: 'Terminal', bg: '#0e1117', accent: '#7ee787' },
]

export type SkinId = 'crema' | 'bosque' | 'terminal'

export default function SkinSwitcher({
  skin,
  onChange,
}: {
  skin: SkinId
  onChange: (skin: SkinId) => void
}) {
  return (
    <div
      role="group"
      aria-label="Cambiar skin"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full border border-border bg-background px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-widest text-text-muted shadow-lg"
      style={{ transition: 'background-color 240ms ease, border-color 240ms ease, color 240ms ease' }}
    >
      <span className="hidden sm:inline-block min-w-[58px] text-text-muted">
        // {skin}
      </span>
      <div className="flex gap-1.5">
        {SKINS.map(s => (
          <button
            key={s.id}
            type="button"
            aria-label={`Skin ${s.label}`}
            aria-pressed={skin === s.id}
            onClick={() => onChange(s.id)}
            className="relative w-5 h-5 rounded-full p-0 cursor-pointer transition-transform hover:scale-110"
            style={{
              backgroundColor: s.bg,
              border: skin === s.id
                ? '1.5px solid #000'
                : '1.5px solid rgba(128,128,128,0.35)',
              boxShadow: skin === s.id
                ? '0 0 0 2px var(--color-background), 0 0 0 3.5px #555'
                : undefined,
            }}
          >
            <span
              aria-hidden
              className="absolute inset-1 rounded-full"
              style={{ backgroundColor: s.accent }}
            />
          </button>
        ))}
      </div>
    </div>
  )
}
