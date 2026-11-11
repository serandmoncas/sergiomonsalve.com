import { describe, it, expect } from 'vitest'
import { eventosDeSonido, sintetizarWav, MUESTREO } from '../audio'

describe('eventosDeSonido', () => {
  it('marca un tic en cada cambio de año y una campana en cada cambio de fase', () => {
    const cuadros = [
      { t: 0, anio: 2026, fase: 'presente' },
      { t: 1, anio: 2026, fase: 'rebobinar' },
      { t: 2, anio: 2025, fase: 'rebobinar' },
      { t: 3, anio: 2025, fase: 'rebobinar' },
      { t: 4, anio: null, fase: 'raices' },
    ]
    expect(eventosDeSonido(cuadros)).toEqual([
      { t: 1, tipo: 'fase' },
      { t: 2, tipo: 'anio' },
      { t: 4, tipo: 'fase' },
    ])
  })
  it('un cambio de fase y de año en el mismo cuadro es solo una campana', () => {
    expect(eventosDeSonido([
      { t: 0, anio: 2013, fase: 'raices' },
      { t: 1, anio: 2014, fase: 'avanzar' },
    ])).toEqual([{ t: 1, tipo: 'fase' }])
  })
})

describe('sintetizarWav', () => {
  const wav = sintetizarWav(2, [{ t: 0.5, tipo: 'anio' }, { t: 1, tipo: 'fase' }])

  it('es un WAV PCM mono de 16 bits con la duración pedida', () => {
    expect(wav.toString('ascii', 0, 4)).toBe('RIFF')
    expect(wav.toString('ascii', 8, 12)).toBe('WAVE')
    expect(wav.readUInt16LE(22)).toBe(1) // canales
    expect(wav.readUInt32LE(24)).toBe(MUESTREO)
    expect(wav.readUInt16LE(34)).toBe(16) // bits
    expect(wav.readUInt32LE(40)).toBe(2 * MUESTREO * 2) // bytes de datos
  })

  it('no satura y arranca y termina en silencio (fundidos)', () => {
    let max = 0
    for (let i = 44; i < wav.length; i += 2) max = Math.max(max, Math.abs(wav.readInt16LE(i)))
    expect(max).toBeLessThan(32767)
    expect(wav.readInt16LE(44)).toBe(0)
    expect(wav.readInt16LE(wav.length - 2)).toBe(0)
  })

  it('es determinista', () => {
    expect(sintetizarWav(2, [{ t: 0.5, tipo: 'anio' }]).equals(sintetizarWav(2, [{ t: 0.5, tipo: 'anio' }]))).toBe(true)
  })
})
