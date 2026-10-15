'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { crearEscena, render, W, H, FUENTE } from '@/lib/ia-autorretrato/caminoEscena'
import { RAMAS, type Camino } from '@/lib/ia-autorretrato/tipos'
import Figura from './Figura'

export default function CaminoMotion({ camino }: { camino: Camino }) {
  const t = useTranslations('autorretrato.camino')
  const tg = useTranslations('autorretrato')
  const en = useLocale() === 'en'
  const escena = useMemo(() => crearEscena(camino), [camino])
  const [tiempo, setTiempo] = useState(0)
  const [reproduciendo, setReproduciendo] = useState(false)
  const [montado, setMontado] = useState(false)
  const [reducido, setReducido] = useState(false)
  const ultimo = useRef<number | null>(null)
  const zona = useRef<HTMLDivElement>(null)
  const manual = useRef(false) // el usuario tomó el control: la visibilidad ya no arranca ni reanuda

  // Movimiento reducido: estado final, sin reproducir.
  useEffect(() => {
    const reduce = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // Sincroniza con una preferencia del navegador (no disponible en SSR); el estado inicial debe ser igual en servidor y cliente.
    /* eslint-disable react-hooks/set-state-in-effect */
    if (reduce) setTiempo(escena.duracion)
    setReducido(reduce)
    setMontado(true)
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [escena.duracion])

  // Autoplay solo con ≥ 50 % visible; pausa al salir. Sin IntersectionObserver no hay autoplay (queda el botón).
  useEffect(() => {
    if (!montado || reducido || typeof IntersectionObserver === 'undefined' || !zona.current) return
    const obs = new IntersectionObserver(entradas => {
      const e = entradas[entradas.length - 1]
      if (!e) return
      const visible = e.isIntersecting && e.intersectionRatio >= 0.5
      if (visible) { if (!manual.current) setReproduciendo(true) } else setReproduciendo(false)
    }, { threshold: [0, 0.5] })
    obs.observe(zona.current)
    return () => obs.disconnect()
  }, [montado, reducido])

  const activo = reproduciendo && tiempo < escena.duracion

  useEffect(() => {
    if (!activo || typeof requestAnimationFrame !== 'function') return
    let id = 0
    const paso = (ahora: number) => {
      const dt = ultimo.current === null ? 0 : (ahora - ultimo.current) / 1000
      ultimo.current = ahora
      setTiempo(prev => Math.min(prev + dt, escena.duracion))
      id = requestAnimationFrame(paso)
    }
    id = requestAnimationFrame(paso)
    return () => { if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(id); ultimo.current = null }
  }, [activo, escena.duracion])

  const cuadro = render(escena, tiempo)
  const porId = new Map(escena.nodos.map(n => [n.id, n]))
  const hoy = escena.nodos.filter(n => n.hoy).length
  const nombre = (n: { etiqueta: string; etiquetaEn: string }) => (en ? n.etiquetaEn : n.etiqueta)
  const anioCuadro = cuadro.anio
  const resumen = t('resumen', { total: escena.nodos.length - hoy, hoy, anio: escena.anioMin })

  return (
    <Figura
      id="camino-motion"
      imgEnSvg
      titulo={t('titulo')}
      resumen={resumen}
      etiquetaDatos={tg('verDatos')}
      tabla={{
        columnas: [t('conocimiento'), t('rama'), t('evidenciaColumna'), t('primeraEvidencia')],
        filas: escena.nodos.map(n => [nombre(n), tg(`ramas.${n.rama}`), t(`evidencia.${n.evidencia}`), n.primeraEvidencia ?? '—']),
      }}
      pie={
        <>
          <div className="flex items-center gap-3 mt-2">
            <button type="button" onClick={() => {
              manual.current = true
              if (activo) { setReproduciendo(false); return }
              if (tiempo >= escena.duracion) setTiempo(0)
              setReproduciendo(true)
            }} className="font-mono text-xs border border-border px-2 py-1 text-text-secondary hover:text-accent">
              {activo ? t('pausa') : t('play')}
            </button>
            <input type="range" min={0} max={escena.duracion} step={0.1} value={tiempo} aria-label={t('tiempo')}
              aria-valuetext={`${anioCuadro ?? t('raices')} · ${t(`fases.${cuadro.fase}`)}`}
              onChange={e => { manual.current = true; setReproduciendo(false); setTiempo(Number(e.target.value)) }} className="flex-1 accent-[var(--color-accent)]" />
          </div>
          <p className="font-mono text-xs text-text-secondary mt-2">
            {(['github', 'declarado', 'inferido'] as const).map(e => (
              <span key={e} className="mr-4">{e === 'github' ? '●' : e === 'declarado' ? '○' : '◌'} {t(`evidencia.${e}`)}</span>
            ))}
          </p>
        </>
      }
    >
      {/* Oculto hasta montar: el servidor no conoce prefers-reduced-motion y evitamos un fotograma vacío. */}
      <div ref={zona} className="overflow-x-auto" tabIndex={0} role="region" aria-label={t('desplazar')} style={{ visibility: montado ? 'visible' : 'hidden' }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ minWidth: 600 }} role="img" aria-label={resumen}>
          {RAMAS.map((r, i) => (
            <text key={r} x={4} y={(i / RAMAS.length) * H + 16} fontSize={FUENTE} fill="var(--color-text-muted)">{tg(`ramas.${r}`)}</text>
          ))}
          <text x={W - 8} y={30} textAnchor="end" fontSize={28} fontFamily="var(--font-mono)" fill="var(--color-accent)">
            {cuadro.fase === 'raices' ? t('raices') : cuadro.anio}
          </text>
          <text x={W - 8} y={56} textAnchor="end" fontSize={FUENTE} fill="var(--color-text-secondary)">{t(`fases.${cuadro.fase}`)}</text>
          {escena.aristas.map(a => {
            const de = porId.get(a.de)
            const ha = porId.get(a.a)
            if (!de || !ha) return null
            const o = Math.min(cuadro.opacidad[a.de] ?? 0, cuadro.opacidad[a.a] ?? 0)
            return <line key={`${a.de}-${a.a}`} x1={de.x * W} y1={de.y * H} x2={ha.x * W} y2={ha.y * H}
              stroke="var(--color-text-muted)" strokeOpacity={0.5 * o} />
          })}
          {escena.nodos.map(n => {
            const etiquetado = n.hoy || (anioCuadro !== null && n.anio === anioCuadro)
            return (
              <g key={n.id} data-nodo={n.id} opacity={cuadro.opacidad[n.id]}>
                <title>{nombre(n)}</title>
                <circle cx={n.x * W} cy={n.y * H} r={n.hoy ? 7 : 5}
                  fill={n.evidencia === 'github' ? 'var(--color-accent)' : 'var(--color-background)'}
                  stroke={n.evidencia === 'inferido' ? 'var(--color-text-muted)' : 'var(--color-accent)'}
                  strokeDasharray={n.evidencia === 'inferido' ? '2 2' : undefined} strokeWidth={1.5} />
                {etiquetado && (
                  <text x={n.x > 0.75 ? n.x * W - 11 : n.x * W + 11} y={n.y * H + 5} fontSize={FUENTE}
                    textAnchor={n.x > 0.75 ? 'end' : 'start'}
                    fill={n.hoy ? 'var(--color-text)' : 'var(--color-text-secondary)'}>{nombre(n)}</text>
                )}
              </g>
            )
          })}
        </svg>
      </div>
    </Figura>
  )
}
