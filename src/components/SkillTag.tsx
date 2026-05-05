export default function SkillTag({ label }: { label: string }) {
  return (
    <span className="font-mono text-xs text-accent bg-surface border border-border-active px-2 py-0.5 rounded-sm">
      {label}
    </span>
  )
}
