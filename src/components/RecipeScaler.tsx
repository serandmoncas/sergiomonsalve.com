'use client'

import { useState } from 'react'
import { scaleIngredient } from '@/lib/scale-ingredient'

export default function RecipeScaler({
  ingredients,
  baseServings,
  servingsLabel,
  ingredientsLabel,
}: {
  ingredients: string[]
  baseServings: number
  servingsLabel: string
  ingredientsLabel: string
}) {
  const [servings, setServings] = useState(baseServings)
  const factor = servings / baseServings

  return (
    <>
      <div className="flex items-center gap-2 font-mono text-xs text-text-muted mb-8">
        <span>◎</span>
        <button
          onClick={() => setServings(s => Math.max(1, s - 1))}
          className="w-5 h-5 flex items-center justify-center border border-border hover:border-accent hover:text-accent rounded-sm transition-colors"
          aria-label="Reducir porciones"
        >
          −
        </button>
        <span className="text-text tabular-nums w-16 text-center">
          {servings} {servingsLabel}
        </span>
        <button
          onClick={() => setServings(s => Math.min(50, s + 1))}
          className="w-5 h-5 flex items-center justify-center border border-border hover:border-accent hover:text-accent rounded-sm transition-colors"
          aria-label="Aumentar porciones"
        >
          +
        </button>
        {servings !== baseServings && (
          <button
            onClick={() => setServings(baseServings)}
            className="ml-2 font-mono text-[10px] text-text-muted hover:text-accent transition-colors"
            aria-label="Restablecer porciones"
          >
            reset
          </button>
        )}
      </div>

      {ingredients.length > 0 && (
        <div className="border border-border rounded-sm p-5 mb-10 bg-surface">
          <p className="font-mono text-xs text-accent mb-3">// {ingredientsLabel}</p>
          <ul className="space-y-1.5">
            {ingredients.map((item, i) => (
              <li key={i} className="text-xs text-text-secondary flex gap-2">
                <span className="text-accent shrink-0">–</span>
                {scaleIngredient(item, factor)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}
