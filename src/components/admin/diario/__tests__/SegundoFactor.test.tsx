import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

const mfa = vi.hoisted(() => ({
  listFactors: vi.fn(),
  enroll: vi.fn(),
  challengeAndVerify: vi.fn(),
  unenroll: vi.fn(),
}))
vi.mock('@/lib/supabase/client', () => ({ createClient: () => ({ auth: { mfa } }) }))

import SegundoFactor from '../SegundoFactor'

const assign = vi.fn()
const factor = (id: string, nombre: string, status = 'verified') => ({
  id,
  friendly_name: nombre,
  factor_type: 'totp',
  status,
  created_at: '',
  updated_at: '',
})
const sinFactores = { data: { all: [], totp: [], phone: [] }, error: null }
const conFactores = (...f: ReturnType<typeof factor>[]) => ({
  data: { all: f, totp: f.filter(x => x.status === 'verified'), phone: [] },
  error: null,
})
const registro = {
  data: { id: 'f1', type: 'totp', totp: { qr_code: 'data:image/svg+xml;x', secret: 'ABC', uri: 'otpauth://x' } },
  error: null,
}

function escribirCodigo(codigo: string) {
  fireEvent.change(screen.getByLabelText('Código de 6 dígitos'), { target: { value: codigo } })
  fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))
}

describe('SegundoFactor', () => {
  beforeEach(() => {
    Object.values(mfa).forEach(f => f.mockReset())
    mfa.unenroll.mockResolvedValue({ data: {}, error: null })
    assign.mockReset()
    Object.defineProperty(window, 'location', { value: { assign }, writable: true })
  })

  it('sin factores verificados pide un nombre y muestra el QR y la clave', async () => {
    mfa.listFactors.mockResolvedValue(sinFactores)
    mfa.enroll.mockResolvedValue(registro)
    render(<SegundoFactor modo="entrar" destino="/es/admin/diario" />)
    const nombre = await screen.findByLabelText('Nombre del autenticador')
    expect(nombre).toHaveValue('Celular')
    fireEvent.change(nombre, { target: { value: 'Mi celular' } })
    fireEvent.click(screen.getByRole('button', { name: 'Registrar' }))
    expect(await screen.findByRole('img')).toHaveAttribute('src', 'data:image/svg+xml;x')
    expect(screen.getByText('ABC')).toBeInTheDocument()
    expect(mfa.enroll).toHaveBeenCalledWith({ factorType: 'totp', friendlyName: 'Mi celular' })
  })

  it('un QR en SVG crudo se convierte en data URL', async () => {
    mfa.listFactors.mockResolvedValue(sinFactores)
    mfa.enroll.mockResolvedValue({
      ...registro,
      data: { ...registro.data, totp: { ...registro.data.totp, qr_code: '<svg>#</svg>' } },
    })
    render(<SegundoFactor modo="entrar" destino="/es/admin/diario" />)
    fireEvent.click(await screen.findByRole('button', { name: 'Registrar' }))
    expect(await screen.findByRole('img')).toHaveAttribute(
      'src',
      'data:image/svg+xml;utf-8,' + encodeURIComponent('<svg>#</svg>'),
    )
  })

  it('registro a medias: borra el factor sin verificar antes de registrar otro', async () => {
    mfa.listFactors.mockResolvedValue(conFactores(factor('u1', 'Celular', 'unverified')))
    mfa.enroll.mockResolvedValue(registro)
    render(<SegundoFactor modo="entrar" destino="/es/admin/diario" />)
    fireEvent.click(await screen.findByRole('button', { name: 'Registrar' }))
    await screen.findByRole('img')
    expect(mfa.unenroll).toHaveBeenCalledWith({ factorId: 'u1' })
    expect(mfa.unenroll.mock.invocationCallOrder[0]).toBeLessThan(mfa.enroll.mock.invocationCallOrder[0])
  })

  it('después del QR, un código bueno verifica el factor nuevo y entra', async () => {
    mfa.listFactors.mockResolvedValue(sinFactores)
    mfa.enroll.mockResolvedValue(registro)
    mfa.challengeAndVerify.mockResolvedValue({ data: {}, error: null })
    render(<SegundoFactor modo="entrar" destino="/es/admin/diario" />)
    fireEvent.click(await screen.findByRole('button', { name: 'Registrar' }))
    await screen.findByRole('img')
    escribirCodigo('123456')
    await waitFor(() => expect(assign).toHaveBeenCalledWith('/es/admin/diario'))
    expect(mfa.challengeAndVerify).toHaveBeenCalledWith({ factorId: 'f1', code: '123456' })
  })

  it('con un factor pide el código y no registra', async () => {
    mfa.listFactors.mockResolvedValue(conFactores(factor('f1', 'Celular')))
    render(<SegundoFactor modo="entrar" destino="/es/admin/diario" />)
    const campo = await screen.findByLabelText('Código de 6 dígitos')
    expect(campo).toHaveAttribute('inputmode', 'numeric')
    expect(campo).toHaveAttribute('autocomplete', 'one-time-code')
    expect(mfa.enroll).not.toHaveBeenCalled()
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  })

  it('con dos factores deja elegir cuál usar', async () => {
    mfa.listFactors.mockResolvedValue(conFactores(factor('f1', 'Celular'), factor('f2', 'Mac')))
    mfa.challengeAndVerify.mockResolvedValue({ data: {}, error: null })
    render(<SegundoFactor modo="entrar" destino="/es/admin/diario" />)
    const select = await screen.findByRole('combobox')
    expect(screen.getByRole('option', { name: 'Mac' })).toBeInTheDocument()
    fireEvent.change(select, { target: { value: 'f2' } })
    escribirCodigo('654321')
    await waitFor(() => expect(mfa.challengeAndVerify).toHaveBeenCalledWith({ factorId: 'f2', code: '654321' }))
  })

  it('código malo muestra el error, limpia el campo y no entra', async () => {
    mfa.listFactors.mockResolvedValue(conFactores(factor('f1', 'Celular')))
    mfa.challengeAndVerify.mockResolvedValue({ data: null, error: { message: 'Invalid TOTP code entered' } })
    render(<SegundoFactor modo="entrar" destino="/es/admin/diario" />)
    await screen.findByLabelText('Código de 6 dígitos')
    escribirCodigo('000000')
    expect(await screen.findByText('Código no válido. Intenta otra vez.')).toBeInTheDocument()
    expect(screen.getByLabelText('Código de 6 dígitos')).toHaveValue('')
    expect(assign).not.toHaveBeenCalled()
  })

  it('código bueno lleva al destino', async () => {
    mfa.listFactors.mockResolvedValue(conFactores(factor('f1', 'Celular')))
    mfa.challengeAndVerify.mockResolvedValue({ data: {}, error: null })
    render(<SegundoFactor modo="entrar" destino="/es/admin/diario/x" />)
    await screen.findByLabelText('Código de 6 dígitos')
    escribirCodigo('123456')
    await waitFor(() => expect(assign).toHaveBeenCalledWith('/es/admin/diario/x'))
  })

  it('en modo agregar registra aunque ya haya factores', async () => {
    mfa.listFactors.mockResolvedValue(conFactores(factor('f1', 'Celular')))
    render(<SegundoFactor modo="agregar" destino="/es/admin/diario" />)
    expect(await screen.findByLabelText('Nombre del autenticador')).toBeInTheDocument()
    expect(screen.queryByLabelText('Código de 6 dígitos')).not.toBeInTheDocument()
  })

  it('si no puede leer los factores lo dice sin detalles', async () => {
    mfa.listFactors.mockResolvedValue({ data: null, error: { message: 'boom' } })
    render(<SegundoFactor modo="entrar" destino="/es/admin/diario" />)
    expect(await screen.findByText('No se pudo continuar. Recarga la página.')).toBeInTheDocument()
    expect(screen.queryByText(/boom/)).not.toBeInTheDocument()
  })
})
