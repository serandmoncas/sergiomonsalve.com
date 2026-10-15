/**
 * Exporta la escena del camino y un prompt listo para pegar en /motion de claude.ai.
 * Salida privada: .ia-autorretrato/escena-motion.json y .ia-autorretrato/prompt-motion.md
 *
 * Uso: npx tsx scripts/ia-autorretrato/escena-motion.ts
 */
import fs from 'node:fs'
import path from 'node:path'
import { DATOS } from '@/lib/ia-autorretrato/datos'
import { crearEscena } from '@/lib/ia-autorretrato/caminoEscena'

const dir = path.join(process.cwd(), '.ia-autorretrato')
fs.mkdirSync(dir, { recursive: true })
const escena = crearEscena(DATOS.camino)
fs.writeFileSync(path.join(dir, 'escena-motion.json'), JSON.stringify(escena, null, 2))

const hoy = escena.nodos.filter(n => n.hoy).map(n => n.etiqueta).join(', ')
const porAnio = new Map<number, string[]>()
for (const n of escena.nodos) if (n.anio !== null && !n.hoy) porAnio.set(n.anio, [...(porAnio.get(n.anio) ?? []), n.etiqueta])
const lineaTiempo = [...porAnio.entries()].sort((a, b) => b[0] - a[0]).map(([a, ns]) => `- ${a}: ${ns.join(', ')}`).join('\n')
const raices = escena.nodos.filter(n => n.anio === null).map(n => n.etiqueta).join(', ')

const prompt = `/motion Crea un explicador animado de ${escena.duracion} segundos llamado "El camino hacia atrás".

Fases:
1. Hoy (0–${escena.fases[0].fin}s): aparecen las tecnologías que uso hoy: ${hoy}.
2. Rebobinar (${escena.fases[1].inicio}–${escena.fases[1].fin}s): un contador de año baja de ${escena.anioMax} a ${escena.anioMin}; en cada año se encienden los conocimientos que aprendí entonces:
${lineaTiempo}
3. Raíces (${escena.fases[2].inicio}–${escena.fases[2].fin}s): aparecen los fundamentos sin fecha (líneas punteadas): ${raices}.
4. De vuelta a hoy (${escena.fases[3].inicio}–${escena.duracion}s): el contador sube de ${escena.anioMin} a ${escena.anioMax} y cada conocimiento se resalta cuando llega su año.

Estilo: fondo oscuro #0f0f0f, acento #00ff88, tipografía monoespaciada para los años. Círculo lleno = evidencia en GitHub; círculo vacío = declarado; punteado = inferido.
Los datos completos (nodos con x, y, año y aristas) están en el JSON adjunto.`
fs.writeFileSync(path.join(dir, 'prompt-motion.md'), prompt)
console.log('✓ .ia-autorretrato/escena-motion.json y prompt-motion.md')
