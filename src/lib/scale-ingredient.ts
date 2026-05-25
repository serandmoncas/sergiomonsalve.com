const FRACTIONS: Record<string, number> = {
  '½': 0.5,
  '¼': 0.25,
  '¾': 0.75,
  '⅓': 1 / 3,
  '⅔': 2 / 3,
  '⅛': 0.125,
  '⅜': 0.375,
  '⅝': 0.625,
  '⅞': 0.875,
}

/**
 * Parses a leading numeric quantity from an ingredient string.
 * Handles integers ("400"), decimals ("1.5"), and unicode fractions ("½").
 * Returns null when no leading quantity is found (ingredient renders unchanged).
 *
 * Examples:
 *   "400g de hongos" → { qty: 400, suffix: "g de hongos" }
 *   "½ cebolla"      → { qty: 0.5, suffix: " cebolla" }
 *   "Sal al gusto"   → null
 */
export function parseIngredient(text: string): { qty: number; suffix: string } | null {
  const trimmed = text.trimStart()

  for (const [frac, val] of Object.entries(FRACTIONS)) {
    if (trimmed.startsWith(frac)) {
      return { qty: val, suffix: trimmed.slice(frac.length) }
    }
  }

  const match = trimmed.match(/^(\d+(?:[.,]\d+)?)(.*)/)
  if (match) {
    return { qty: parseFloat(match[1].replace(',', '.')), suffix: match[2] }
  }

  return null
}

/**
 * Formats a scaled quantity as a clean string.
 * Rounds to 1 decimal place; drops the decimal when the result is a whole number.
 *
 * Examples:
 *   400  → "400"
 *   0.5  → "0.5"
 *   1.0  → "1"
 */
export function formatQty(qty: number): string {
  const rounded = Math.round(qty * 10) / 10
  return String(rounded)
}

/**
 * Scales an ingredient string by the given factor.
 * Non-parseable ingredients (no leading quantity) are returned unchanged.
 *
 * Examples (factor = 0.5):
 *   "400g de hongos" → "200g de hongos"
 *   "½ cebolla"      → "0.3 cebolla"
 *   "Sal al gusto"   → "Sal al gusto"
 */
export function scaleIngredient(text: string, factor: number): string {
  const parsed = parseIngredient(text)
  if (!parsed) return text
  return `${formatQty(parsed.qty * factor)}${parsed.suffix}`
}
