import { describe, it, expect, vi, beforeEach } from 'vitest'

const { getReader, getManual } = vi.hoisted(() => ({ getReader: vi.fn(), getManual: vi.fn() }))
vi.mock('../access', () => ({ requireReader: getReader }))
vi.mock('../manual', () => ({ getManual }))

import { getManualForReader } from '../lector'

describe('getManualForReader', () => {
  beforeEach(() => { getReader.mockReset(); getManual.mockReset() })

  it('sin lector: sin-acceso y nunca llama getManual', async () => {
    getReader.mockResolvedValue(null)
    expect(await getManualForReader()).toEqual({ ok: false, motivo: 'sin-acceso' })
    expect(getManual).not.toHaveBeenCalled()
  })
  it('manual con error: motivo manual', async () => {
    getReader.mockResolvedValue({ userId: '1' })
    getManual.mockResolvedValue({ ok: false, error: { tipo: 'no-configurado' } })
    expect(await getManualForReader()).toEqual({ ok: false, motivo: 'manual', error: { tipo: 'no-configurado' } })
  })
  it('ok: devuelve manual y lector', async () => {
    getReader.mockResolvedValue({ userId: '1' })
    getManual.mockResolvedValue({ ok: true, manual: { m: 1 } })
    expect(await getManualForReader()).toEqual({ ok: true, manual: { m: 1 }, reader: { userId: '1' } })
  })
})
