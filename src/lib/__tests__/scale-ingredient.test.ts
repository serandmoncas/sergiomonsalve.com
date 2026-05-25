import { describe, it, expect } from 'vitest'
import { parseIngredient, formatQty, scaleIngredient } from '../scale-ingredient'

describe('parseIngredient', () => {
  it('parses an integer with a unit attached', () => {
    const result = parseIngredient('400g de hongos ostra')
    expect(result).toEqual({ qty: 400, suffix: 'g de hongos ostra' })
  })

  it('parses a plain integer followed by a space', () => {
    const result = parseIngredient('3 limones')
    expect(result).toEqual({ qty: 3, suffix: ' limones' })
  })

  it('parses a decimal quantity', () => {
    const result = parseIngredient('1.5 tazas de caldo')
    expect(result).toEqual({ qty: 1.5, suffix: ' tazas de caldo' })
  })

  it('parses a decimal with comma separator', () => {
    const result = parseIngredient('2,5 kg de harina')
    expect(result).toEqual({ qty: 2.5, suffix: ' kg de harina' })
  })

  it('parses ½ unicode fraction', () => {
    const result = parseIngredient('½ cebolla morada')
    expect(result).toEqual({ qty: 0.5, suffix: ' cebolla morada' })
  })

  it('parses ¼ unicode fraction', () => {
    const result = parseIngredient('¼ taza de aceite')
    expect(result).toEqual({ qty: 0.25, suffix: ' taza de aceite' })
  })

  it('parses ¾ unicode fraction', () => {
    const result = parseIngredient('¾ taza de leche')
    expect(result).toEqual({ qty: 0.75, suffix: ' taza de leche' })
  })

  it('returns null when no leading quantity (renders unchanged)', () => {
    expect(parseIngredient('Sal y pimienta al gusto')).toBeNull()
    expect(parseIngredient('Aceite de oliva')).toBeNull()
  })

  it('returns null when quantity is mid-string (best-effort)', () => {
    expect(parseIngredient('Jugo de 3 limones')).toBeNull()
  })
})

describe('formatQty', () => {
  it('renders whole numbers without decimal', () => {
    expect(formatQty(400)).toBe('400')
    expect(formatQty(1)).toBe('1')
    expect(formatQty(2)).toBe('2')
  })

  it('renders decimals rounded to 1 place', () => {
    expect(formatQty(0.5)).toBe('0.5')
    expect(formatQty(1.5)).toBe('1.5')
  })

  it('drops trailing zero after rounding', () => {
    expect(formatQty(1.0)).toBe('1')
    expect(formatQty(2.0)).toBe('2')
  })

  it('rounds to 1 decimal place', () => {
    // ⅓ * 2 = 0.666... → rounds to 0.7
    expect(formatQty(2 / 3)).toBe('0.7')
  })
})

describe('scaleIngredient', () => {
  it('scales an integer quantity up', () => {
    expect(scaleIngredient('400g de hongos', 2)).toBe('800g de hongos')
  })

  it('scales an integer quantity down', () => {
    expect(scaleIngredient('400g de hongos', 0.5)).toBe('200g de hongos')
  })

  it('scales a unicode fraction', () => {
    expect(scaleIngredient('½ cebolla', 2)).toBe('1 cebolla')
  })

  it('returns non-parseable ingredients unchanged', () => {
    expect(scaleIngredient('Sal y pimienta al gusto', 3)).toBe('Sal y pimienta al gusto')
    expect(scaleIngredient('Aceite de oliva', 0.5)).toBe('Aceite de oliva')
  })

  it('does not scale mid-string quantities (best-effort)', () => {
    expect(scaleIngredient('Jugo de 3 limones', 2)).toBe('Jugo de 3 limones')
  })

  it('uses factor 1 to return original quantity as string', () => {
    expect(scaleIngredient('3 limones', 1)).toBe('3 limones')
  })
})
