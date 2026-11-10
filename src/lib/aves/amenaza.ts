const CATEGORIAS = new Set(['CR', 'EN', 'VU'])

// CSV de content/aves/fuentes/res-0126-2024-aves.csv: "cientifico,categoria", líneas "#" son comentarios
export function parsearAmenazas(csv: string): Map<string, 'CR' | 'EN' | 'VU'> {
  const amenazas = new Map<string, 'CR' | 'EN' | 'VU'>()
  for (const linea of csv.split(/\r?\n/)) {
    if (!linea.trim() || linea.startsWith('#') || linea.startsWith('cientifico,')) continue
    const [cientifico, categoria] = linea.split(',').map(c => c.trim())
    if (CATEGORIAS.has(categoria)) amenazas.set(cientifico.toLowerCase(), categoria as 'CR' | 'EN' | 'VU')
  }
  return amenazas
}
