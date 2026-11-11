import fs from 'fs'
import os from 'os'
import path from 'path'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { aprobar, rechazar } from '../acciones'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

let raiz: string
const leer = () => JSON.parse(fs.readFileSync(path.join(raiz, 'ilustraciones.json'), 'utf-8'))['1'][0]

beforeEach(() => {
  raiz = fs.mkdtempSync(path.join(os.tmpdir(), 'aves-'))
  fs.writeFileSync(
    path.join(raiz, 'ilustraciones.json'),
    JSON.stringify({ '1': [{ variante: 'adulto', estado: 'revisada-auto', archivo: 'x--adulto', referencias: [], nota: '', actualizado: '2026-10-01' }] })
  )
  vi.stubEnv('AVES_RAIZ', raiz)
  vi.stubEnv('NODE_ENV', 'development')
})

afterEach(() => {
  vi.unstubAllEnvs()
  fs.rmSync(raiz, { recursive: true, force: true })
})

describe('acciones de revisión', () => {
  it('aprobar pasa la ilustración a aprobada', async () => {
    await aprobar('x--adulto')
    expect(leer().estado).toBe('aprobada')
  })

  it('rechazar guarda la nota', async () => {
    await rechazar('x--adulto', 'cola demasiado larga')
    expect(leer()).toMatchObject({ estado: 'rechazada', nota: 'cola demasiado larga' })
  })

  it('en producción no hace nada y lanza error', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    await expect(aprobar('x--adulto')).rejects.toThrow()
    expect(leer().estado).toBe('revisada-auto')
  })
})
