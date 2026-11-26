import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import { vistaObjetivo } from '@/lib/diaria'

const { refrescar } = vi.hoisted(() => ({ refrescar: vi.fn() }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: refrescar }) }))

import VistaObjetivo from '../VistaObjetivo'
import AccionesObjetivo from '../AccionesObjetivo'

const NOTA = `---
estado: activo
inicio: 2026-12-01
meta_diaria: 1
meta_ideal: 3
---
# Plantar árboles

## Para qué
Sombra en el patio.

## Hitos
- [x] Elegir especies
- [ ] Conseguir plántulas

## Siguiente acción
- [ ] Llamar al vivero
`
const CONTACTOS = (extra = '') => `---
kanban-plugin: basic
---

## Por contactar

- [ ] [[Vivero Inventado]]

## Contactado
${extra}
## Respondió
`
const HOY = '2026-12-03'
const vista = (extra = '') => vistaObjetivo('Plantar árboles', NOTA, CONTACTOS(extra), HOY, HOY)

beforeEach(() => {
  refrescar.mockReset()
  vi.stubGlobal('fetch', vi.fn(async () => Response.json({ ok: true })))
})
afterEach(() => vi.unstubAllGlobals())

describe('VistaObjetivo (DI-087)', () => {
  it("muestra para qué, hito actual, siguiente acción y 'Hoy 0 de 1'", () => {
    render(<VistaObjetivo objetivos={[{ id: 'abc', vista: vista() }]} />)
    expect(screen.getByRole('heading', { name: 'Plantar árboles' })).toBeTruthy()
    expect(screen.getByText('Sombra en el patio.')).toBeTruthy()
    expect(screen.getByText('Conseguir plántulas')).toBeTruthy()
    expect(screen.getByText('Llamar al vivero')).toBeTruthy()
    expect(screen.getByText('Hoy 0 de 1')).toBeTruthy()
    expect(screen.queryByText('meta cumplida')).toBeNull()
  })

  it("con un contacto de hoy dice 'Hoy 1 de 1' y la meta cumplida", () => {
    render(<VistaObjetivo objetivos={[{ id: 'abc', vista: vista('\n- [ ] Huerta Prueba (Contactado 2026-12-03)\n') }]} />)
    expect(screen.getByText('Hoy 1 de 1')).toBeTruthy()
    expect(screen.getByText('meta cumplida')).toBeTruthy()
  })

  it('muestra el conteo por semana y las columnas con sus tarjetas', () => {
    render(<VistaObjetivo objetivos={[{ id: 'abc', vista: vista('\n- [ ] Huerta Prueba (Contactado 2026-12-03)\n') }]} />)
    const tabla = screen.getByRole('table', { name: 'Por semana' })
    expect(within(tabla).getByText('2026-11-30')).toBeTruthy()
    const col = screen.getByRole('region', { name: 'Por contactar' })
    expect(within(col).getByText('Vivero Inventado')).toBeTruthy()
  })

  it("sin objetivos activos dice 'No hay objetivo activo.'", () => {
    render(<VistaObjetivo objetivos={[]} />)
    expect(screen.getByText('No hay objetivo activo.')).toBeTruthy()
  })
})

describe('AccionesObjetivo (DI-087)', () => {
  const columnas = () => vista().columnas

  it('mover manda POST con el id opaco y el texto de la tarjeta, y refresca', async () => {
    render(<AccionesObjetivo objetivoId="abc" columnas={columnas()} />)
    fireEvent.change(screen.getByLabelText('Mover Vivero Inventado a'), { target: { value: 'Respondió' } })
    await waitFor(() => expect(refrescar).toHaveBeenCalled())
    const [url, init] = vi.mocked(fetch).mock.calls[0]
    expect(url).toBe('/api/admin/diario/objetivo')
    expect(JSON.parse(String(init?.body))).toEqual({
      objetivo: 'abc',
      tipo: 'mover',
      texto: '[[Vivero Inventado]]',
      a: 'Respondió',
    })
  })

  it('agregar contacto manda a quién, canal y nota', async () => {
    render(<AccionesObjetivo objetivoId="abc" columnas={columnas()} />)
    fireEvent.change(screen.getByLabelText('A quién'), { target: { value: 'Huerta Prueba' } })
    fireEvent.change(screen.getByLabelText('Canal'), { target: { value: 'correo' } })
    fireEvent.click(screen.getByRole('button', { name: 'Agregar contacto' }))
    await waitFor(() => expect(refrescar).toHaveBeenCalled())
    expect(JSON.parse(String(vi.mocked(fetch).mock.calls[0][1]?.body))).toEqual({
      objetivo: 'abc',
      tipo: 'contacto',
      nombre: 'Huerta Prueba',
      canal: 'correo',
      nota: '',
    })
  })

  it('si la acción falla, muestra el error y no refresca', async () => {
    vi.mocked(fetch).mockResolvedValue(Response.json({ ok: false, error: 'el tablero cambió; recarga' }, { status: 409 }))
    render(<AccionesObjetivo objetivoId="abc" columnas={columnas()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Deshacer' }))
    expect(await screen.findByText('el tablero cambió; recarga')).toBeTruthy()
    expect(refrescar).not.toHaveBeenCalled()
  })
})
