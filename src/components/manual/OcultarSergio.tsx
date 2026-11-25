'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

const CLAVE = 'manual.ocultarDesdeAqui'
const ATTR = 'data-ocultar-desde-aqui'

function aplicar(oculto: boolean) {
  if (oculto) document.documentElement.setAttribute(ATTR, '')
  else document.documentElement.removeAttribute(ATTR)
}

// Interruptor de la barra: esconde las capas "desde aquí" (CSS en globals.css).
export function OcultarSergio() {
  const t = useTranslations('manual')
  const [oculto, setOculto] = useState(false)

  useEffect(() => {
    let guardado = false
    try {
      guardado = localStorage.getItem(CLAVE) === '1'
    } catch {
      // Sin almacenamiento: la preferencia vale solo para esta visita.
    }
    // Leer localStorage solo es posible tras montar (evita desajuste de hidratación).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOculto(guardado)
    aplicar(guardado)
    // Al salir del manual no debe quedar el atributo en el resto del sitio.
    return () => document.documentElement.removeAttribute(ATTR)
  }, [])

  function alternar() {
    const nuevo = !oculto
    setOculto(nuevo)
    aplicar(nuevo)
    try {
      localStorage.setItem(CLAVE, nuevo ? '1' : '0')
    } catch {
      // Ignorar: ver arriba.
    }
  }

  return (
    <button type="button" onClick={alternar} aria-pressed={oculto} className="ml-auto text-text-muted hover:text-accent">
      {oculto ? t('desdeAqui.mostrar') : t('desdeAqui.ocultar')}
    </button>
  )
}
