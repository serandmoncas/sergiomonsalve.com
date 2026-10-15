import type { Metadata } from 'next'
import { GLOSARIO } from '@/lib/experiencias-ia/glosario'
import GlosarioBuscador from '@/components/experiencias-ia/GlosarioBuscador'

export const metadata: Metadata = {
  title: 'Glosario — Experiencias IA',
}

export default function GlosarioIndexPage() {
  return (
    <div>
      <p className="eyebrow">{GLOSARIO.length} términos</p>
      <h1>Glosario</h1>
      <GlosarioBuscador terminos={GLOSARIO} />
    </div>
  )
}
