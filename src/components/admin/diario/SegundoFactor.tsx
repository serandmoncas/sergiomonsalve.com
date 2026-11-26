'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Fase = 'cargando' | 'nombre' | 'codigo' | 'fallo'
type Autenticador = { id: string; nombre: string }
type Registro = { factorId: string; qr: string; secret: string }

const ERROR_CODIGO = 'Código no válido. Intenta otra vez.'
const ERROR_GENERAL = 'No se pudo continuar. Recarga la página.'

/** El QR llega como data URL o como SVG crudo, según la versión de Supabase. */
function qrComoUrl(qr: string): string {
  return qr.startsWith('data:') ? qr : `data:image/svg+xml;utf-8,${encodeURIComponent(qr)}`
}

/**
 * Segundo factor del diario (DI-083). En modo "entrar" pide el código del
 * autenticador, o registra uno si no hay ninguno verificado; en modo
 * "agregar" (ya en aal2) registra otro. Al verificar va a `destino` con una
 * carga completa, para que el proxy vea la sesión ya en aal2.
 */
export default function SegundoFactor({ modo, destino }: { modo: 'entrar' | 'agregar'; destino: string }) {
  const [supabase] = useState(createClient)
  const [fase, setFase] = useState<Fase>('cargando')
  const [autenticadores, setAutenticadores] = useState<Autenticador[]>([])
  const [sinVerificar, setSinVerificar] = useState<string[]>([])
  const [elegido, setElegido] = useState('')
  const [nombre, setNombre] = useState('Celular')
  const [registro, setRegistro] = useState<Registro | null>(null)
  const [codigo, setCodigo] = useState('')
  const [error, setError] = useState('')
  const [ocupado, setOcupado] = useState(false)

  useEffect(() => {
    let vivo = true
    supabase.auth.mfa.listFactors().then(({ data, error }) => {
      if (!vivo) return
      if (error || !data) return setFase('fallo')
      const verificados = data.totp
        .filter(f => f.status === 'verified')
        .map(f => ({ id: f.id, nombre: f.friendly_name || 'Autenticador' }))
      setAutenticadores(verificados)
      setElegido(verificados[0]?.id ?? '')
      setSinVerificar(data.all.filter(f => f.factor_type === 'totp' && f.status === 'unverified').map(f => f.id))
      setFase(modo === 'entrar' && verificados.length > 0 ? 'codigo' : 'nombre')
    }, () => vivo && setFase('fallo'))
    return () => { vivo = false }
  }, [supabase, modo])

  async function registrar(e: React.FormEvent) {
    e.preventDefault()
    setOcupado(true)
    setError('')
    try {
      // Un registro a medias de otro intento estorba: se borra antes.
      for (const factorId of sinVerificar) await supabase.auth.mfa.unenroll({ factorId })
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: nombre.trim() || 'Autenticador',
      })
      if (error || !data) throw new Error()
      setSinVerificar([data.id])
      setRegistro({ factorId: data.id, qr: qrComoUrl(data.totp.qr_code), secret: data.totp.secret })
      setFase('codigo')
    } catch {
      setError(ERROR_GENERAL)
    } finally {
      setOcupado(false)
    }
  }

  async function verificar(e: React.FormEvent) {
    e.preventDefault()
    const factorId = registro?.factorId ?? elegido
    setOcupado(true)
    setError('')
    try {
      const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code: codigo.trim() })
      if (error) throw new Error()
      window.location.assign(destino)
    } catch {
      setError(ERROR_CODIGO)
      setCodigo('')
      setOcupado(false)
    }
  }

  const caja = 'w-full bg-surface border border-border rounded px-3 py-2 font-mono text-text'
  const boton = 'mt-4 w-full bg-accent text-background font-mono font-bold rounded px-3 py-2 disabled:opacity-50'

  return (
    <div className="max-w-sm">
      <p className="font-mono text-xs text-accent mb-2">{'//'} diario</p>
      <h1 className="text-2xl font-extrabold text-text mb-6">
        {modo === 'agregar' ? 'Otro autenticador' : 'Segundo factor'}
      </h1>

      {fase === 'cargando' && <p className="text-text-secondary">Cargando…</p>}
      {fase === 'fallo' && <p role="alert" className="text-red-400">{ERROR_GENERAL}</p>}

      {fase === 'nombre' && (
        <form onSubmit={registrar}>
          <p className="text-text-secondary mb-4">
            Registra una app de autenticación (por ejemplo, la de tu celular). Te mostraré un QR para escanearlo.
          </p>
          <label htmlFor="nombre-autenticador" className="block font-mono text-sm mb-1">Nombre del autenticador</label>
          <input id="nombre-autenticador" className={caja} value={nombre} maxLength={40}
            onChange={e => setNombre(e.target.value)} />
          <button type="submit" className={boton} disabled={ocupado}>Registrar</button>
        </form>
      )}

      {fase === 'codigo' && (
        <form onSubmit={verificar}>
          {registro && (
            <div className="mb-6">
              <p className="text-text-secondary mb-3">Escanea el QR con tu app y escribe el código que muestra.</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={registro.qr} alt="Código QR del autenticador" className="bg-white p-2 rounded w-48 h-48" />
              <p className="text-text-secondary text-sm mt-3">Si no puedes escanearlo, escribe esta clave en la app:</p>
              <code className="block font-mono text-sm break-all mt-1">{registro.secret}</code>
            </div>
          )}
          {!registro && autenticadores.length > 1 && (
            <>
              <label htmlFor="autenticador" className="block font-mono text-sm mb-1">Autenticador</label>
              <select id="autenticador" className={`${caja} mb-4`} value={elegido} onChange={e => setElegido(e.target.value)}>
                {autenticadores.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
              </select>
            </>
          )}
          <label htmlFor="codigo" className="block font-mono text-sm mb-1">Código de 6 dígitos</label>
          <input id="codigo" className={caja} value={codigo} inputMode="numeric" autoComplete="one-time-code"
            pattern="[0-9]{6}" maxLength={6} required autoFocus onChange={e => setCodigo(e.target.value)} />
          <button type="submit" className={boton} disabled={ocupado}>Entrar</button>
        </form>
      )}

      {error && fase !== 'fallo' && <p role="alert" className="mt-4 text-red-400">{error}</p>}
    </div>
  )
}
