/**
 * Audio del video 9:16, sintetizado (libre de derechos por construcción):
 * un fondo ambiental suave, un tic en cada cambio de año y una campana en cada cambio de fase.
 */
export const MUESTREO = 44100

export type CuadroSonido = { t: number; anio: number | null; fase: string }
export type Evento = { t: number; tipo: 'anio' | 'fase' }

/** Recorre los cuadros en orden y marca dónde cambia la fase (campana) o el año (tic). */
export function eventosDeSonido(cuadros: CuadroSonido[]): Evento[] {
  const eventos: Evento[] = []
  for (let i = 1; i < cuadros.length; i++) {
    const antes = cuadros[i - 1]
    const ahora = cuadros[i]
    if (ahora.fase !== antes.fase) eventos.push({ t: ahora.t, tipo: 'fase' })
    else if (ahora.anio !== antes.anio) eventos.push({ t: ahora.t, tipo: 'anio' })
  }
  return eventos
}

const seno = (f: number, t: number) => Math.sin(2 * Math.PI * f * t)

/** WAV PCM mono 16 bits. Determinista: misma entrada, mismos bytes. */
export function sintetizarWav(duracion: number, eventos: Evento[]): Buffer {
  const n = Math.round(duracion * MUESTREO)
  const muestras = new Float64Array(n)
  const fundido = Math.min(2 * MUESTREO, Math.floor(n / 4))

  // Fondo: acorde suave (La, Mi, La) con un vaivén lento de volumen.
  for (let i = 0; i < n; i++) {
    const t = i / MUESTREO
    const vaiven = 0.75 + 0.25 * Math.sin(2 * Math.PI * 0.1 * t)
    muestras[i] = 0.055 * vaiven * (seno(110, t) + seno(164.81, t) + 0.6 * seno(220, t))
  }

  // Tics y campanas con decaimiento exponencial.
  for (const e of eventos) {
    const inicio = Math.round(e.t * MUESTREO)
    const [frecs, amp, tau] = e.tipo === 'anio' ? [[1318.5, 2637], 0.2, 0.05] as const : [[659.25, 987.77], 0.16, 0.6] as const
    const largo = Math.min(n - inicio, Math.round(tau * 6 * MUESTREO))
    for (let k = 0; k < largo; k++) {
      const t = k / MUESTREO
      const env = Math.exp(-t / tau)
      muestras[inicio + k] += amp * env * (seno(frecs[0], t) + 0.35 * seno(frecs[1], t))
    }
  }

  // Fundido de entrada y salida sobre la mezcla completa (empieza y termina en 0 exacto).
  const datos = Buffer.alloc(n * 2)
  for (let i = 0; i < n; i++) {
    const env = Math.min(1, i / fundido, (n - 1 - i) / fundido)
    const v = Math.max(-1, Math.min(1, muestras[i] * env))
    datos.writeInt16LE(Math.round(v * 32767 * 0.9), i * 2)
  }

  const cabecera = Buffer.alloc(44)
  cabecera.write('RIFF', 0, 'ascii')
  cabecera.writeUInt32LE(36 + datos.length, 4)
  cabecera.write('WAVE', 8, 'ascii')
  cabecera.write('fmt ', 12, 'ascii')
  cabecera.writeUInt32LE(16, 16)
  cabecera.writeUInt16LE(1, 20) // PCM
  cabecera.writeUInt16LE(1, 22) // mono
  cabecera.writeUInt32LE(MUESTREO, 24)
  cabecera.writeUInt32LE(MUESTREO * 2, 28)
  cabecera.writeUInt16LE(2, 32)
  cabecera.writeUInt16LE(16, 34)
  cabecera.write('data', 36, 'ascii')
  cabecera.writeUInt32LE(datos.length, 40)
  return Buffer.concat([cabecera, datos])
}
