export default function MetricaTile({ valor, label }: { valor: number; label: string }) {
  return (
    <div className="metrica">
      <div className="metrica-valor">{valor}</div>
      <div className="metrica-label">{label}</div>
    </div>
  )
}
