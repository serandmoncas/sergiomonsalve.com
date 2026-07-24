import type { Referencia } from '@/lib/experiencias-ia/data'

export default function ReferenciaItem({ referencia }: { referencia: Referencia }) {
  if (!referencia.url) {
    return (
      <p>
        <strong>{referencia.titulo}</strong>
        {referencia.nota && <> — {referencia.nota}</>}
      </p>
    )
  }

  return (
    <p>
      <a href={referencia.url} target="_blank" rel="noopener noreferrer">
        <strong>{referencia.titulo}</strong>
      </a>
      {referencia.nota && <> — {referencia.nota}</>}
    </p>
  )
}
