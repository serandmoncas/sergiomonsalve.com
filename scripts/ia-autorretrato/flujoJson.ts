/**
 * Separa una cadena con varios valores JSON pegados (`[...][...]` o `{...}{...}`),
 * como la que produce `gh api --paginate`.
 */
export function leerFlujoJson(texto: string): unknown[] {
  const valores: unknown[] = []
  let profundidad = 0
  let inicio = -1
  let enString = false
  let escape = false
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i]
    if (enString) {
      if (escape) escape = false
      else if (c === '\\') escape = true
      else if (c === '"') enString = false
      continue
    }
    if (c === '"') enString = true
    else if (c === '{' || c === '[') {
      if (profundidad === 0) inicio = i
      profundidad++
    } else if (c === '}' || c === ']') {
      profundidad--
      if (profundidad === 0) valores.push(JSON.parse(texto.slice(inicio, i + 1)))
    }
  }
  return valores
}
