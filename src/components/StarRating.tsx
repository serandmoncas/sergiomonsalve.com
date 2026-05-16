export default function StarRating({ rating }: { rating: number | null }) {
  if (rating === null) return null
  return (
    <div className="flex gap-0.5 text-sm" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map(n => (
        <span key={n} className={n <= rating ? 'text-accent' : 'text-border'}>
          ★
        </span>
      ))}
    </div>
  )
}
