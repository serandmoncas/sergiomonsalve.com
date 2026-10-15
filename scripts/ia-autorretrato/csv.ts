const celda = (v: string | number | boolean) => {
  const s = String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function aCsv(filas: (string | number | boolean)[][]): string {
  return filas.map(f => f.map(celda).join(',')).join('\n') + '\n'
}

export function deCsv(texto: string, separador = ','): string[][] {
  const filas: string[][] = []
  let fila: string[] = []
  let actual = ''
  let comillas = false
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i]
    if (comillas) {
      if (c === '"' && texto[i + 1] === '"') { actual += '"'; i++ }
      else if (c === '"') comillas = false
      else actual += c
    } else if (c === '"') comillas = true
    else if (c === separador) { fila.push(actual); actual = '' }
    else if (c === '\n') { fila.push(actual); filas.push(fila); fila = []; actual = '' }
    else if (c !== '\r') actual += c
  }
  if (actual || fila.length) { fila.push(actual); filas.push(fila) }
  return filas
}
