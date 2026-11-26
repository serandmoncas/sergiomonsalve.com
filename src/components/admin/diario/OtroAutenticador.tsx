'use client'

import { useState } from 'react'
import SegundoFactor from './SegundoFactor'

/** Botón para registrar otro autenticador (celular y Mac), ya en aal2. */
export default function OtroAutenticador({ destino }: { destino: string }) {
  const [abierto, setAbierto] = useState(false)
  if (abierto) return <SegundoFactor modo="agregar" destino={destino} />
  return (
    <button type="button" onClick={() => setAbierto(true)}
      className="font-mono text-xs border border-border rounded px-3 py-2 text-text-secondary hover:text-accent">
      Registrar otro autenticador
    </button>
  )
}
