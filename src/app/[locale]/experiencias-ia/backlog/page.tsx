import type { Metadata } from 'next'
import { BACKLOG } from '@/lib/experiencias-ia/data'
import BacklogFilter from '@/components/experiencias-ia/BacklogFilter'

export const metadata: Metadata = {
  title: 'Backlog — Experiencias IA',
}

export default function BacklogPage() {
  return (
    <div>
      <p className="eyebrow">Temas propuestos</p>
      <h1>Backlog</h1>
      <BacklogFilter items={BACKLOG} />
    </div>
  )
}
