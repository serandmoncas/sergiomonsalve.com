import { describe, it, expect } from 'vitest'
import { crearIndice, mes, vistaHoy, crearHistorial, rutasDiarias, type VaultFS } from '@/lib/diaria'

const enc = new TextEncoder()
const notas: Record<string, string> = {
  'Diario/2026-11-25.md': '<!-- fixture: sintética -->\n- [ ] Llamar a [[Ana Prueba]]\n',
  'Personas/Ana Prueba.md': '<!-- fixture: sintética -->\n# Ana Prueba\n',
}
const fs: VaultFS = {
  list: async () => Object.keys(notas),
  read: async (r) => enc.encode(notas[r]),
  write: async () => { throw new Error('solo lectura') },
  stat: async (r) => (r in notas ? { mtimeMs: 0, size: notas[r].length } : null),
}

describe('copia del núcleo de DiarIA', () => {
  it('arma índice, Hoy y mes sobre una bóveda sintética', async () => {
    const indice = await crearIndice(fs)
    expect(indice.notas).toHaveLength(2)
    const diarias = new Map(
      [...rutasDiarias(indice.notas)].map(([dia, ruta]) => [dia, { ruta, texto: notas[ruta] }]),
    )
    const hoy = vistaHoy(diarias, crearHistorial(diarias), null, '2026-11-25')
    expect(hoy.hoy.map(i => i.texto)).toEqual(['Llamar a [[Ana Prueba]]'])
    expect(mes(diarias, '2026-11')).toHaveLength(30)
  })
})
