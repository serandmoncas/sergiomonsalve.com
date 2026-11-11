'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { FILTROS_VACIOS, agruparPorFamilia, filtrarEspecies, type Filtros } from '@/lib/aves/filtros'
import type { ClaseTamano, Color, Especie, Habitat } from '@/lib/aves/tipos'
import TarjetaAve from './TarjetaAve'

const TAMANOS: ClaseTamano[] = ['colibri', 'mirla', 'paloma', 'gallinazo']
const HABITATS: Habitat[] = ['ciudad', 'bosque', 'agua', 'paramo', 'campo']
const COLORES: Record<Color, string> = {
  azul: '#2f6fd6', rojo: '#d63a2f', amarillo: '#f2c230', verde: '#3f9e4d',
  negro: '#111111', cafe: '#8a5a2b', blanco: '#f5f5f5', gris: '#9a9a9a',
}

const claseBoton = (activo: boolean) =>
  `font-mono text-xs px-3 py-1.5 rounded-sm border transition-colors ${
    activo ? 'border-accent text-accent bg-surface' : 'border-border text-text-secondary hover:border-accent'
  }`

const rejilla = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3'

export default function AvesExplorador({ especies }: { especies: Especie[] }) {
  const t = useTranslations('aves')
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_VACIOS)
  const [porFamilia, setPorFamilia] = useState(false)
  const visibles = useMemo(() => filtrarEspecies(especies, filtros), [especies, filtros])

  const alternar = <K extends 'tamano' | 'habitat'>(campo: K, valor: Filtros[K]) =>
    setFiltros(f => ({ ...f, [campo]: f[campo] === valor ? null : valor }))
  const alternarColor = (c: Color) =>
    setFiltros(f => ({ ...f, colores: f.colores.includes(c) ? f.colores.filter(x => x !== c) : [...f.colores, c] }))

  return (
    <div>
      <input
        type="search"
        value={filtros.texto}
        onChange={e => setFiltros(f => ({ ...f, texto: e.target.value }))}
        placeholder={t('buscarPlaceholder')}
        className="w-full bg-surface border border-border rounded-sm px-4 py-3 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-accent mb-6"
      />

      <p className="font-mono text-xs text-text-muted uppercase tracking-widest mb-3">{t('queViste')}</p>
      <div className="space-y-3 mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-text-muted w-16">{t('tamanoLabel')}</span>
          {TAMANOS.map(c => (
            <button key={c} type="button" aria-pressed={filtros.tamano === c} onClick={() => alternar('tamano', c)} className={claseBoton(filtros.tamano === c)}>
              {t(`tamano.${c}`)}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-text-muted w-16">{t('colorLabel')}</span>
          {(Object.keys(COLORES) as Color[]).map(c => (
            <button
              key={c}
              type="button"
              aria-pressed={filtros.colores.includes(c)}
              aria-label={t(`color.${c}`)}
              title={t(`color.${c}`)}
              onClick={() => alternarColor(c)}
              className={`w-7 h-7 rounded-full border-2 transition-transform ${filtros.colores.includes(c) ? 'border-accent scale-110' : 'border-border'}`}
              style={{ backgroundColor: COLORES[c] }}
            />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-text-muted w-16">{t('dondeLabel')}</span>
          {HABITATS.map(h => (
            <button key={h} type="button" aria-pressed={filtros.habitat === h} onClick={() => alternar('habitat', h)} className={claseBoton(filtros.habitat === h)}>
              {t(`habitat.${h}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 mb-6">
        <p className="font-mono text-xs text-text-secondary">{t('resultados', { n: visibles.length })}</p>
        <div className="flex gap-2">
          <button type="button" aria-pressed={!porFamilia} onClick={() => setPorFamilia(false)} className={claseBoton(!porFamilia)}>
            {t('vistaGaleria')}
          </button>
          <button type="button" aria-pressed={porFamilia} onClick={() => setPorFamilia(true)} className={claseBoton(porFamilia)}>
            {t('vistaFamilia')}
          </button>
        </div>
      </div>

      {visibles.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm text-text-secondary mb-4">{t('sinResultados')}</p>
          <button type="button" onClick={() => setFiltros(FILTROS_VACIOS)} className={claseBoton(true)}>
            {t('limpiarFiltros')}
          </button>
        </div>
      ) : porFamilia ? (
        <div className="space-y-10">
          {agruparPorFamilia(visibles).map(g => (
            <section key={g.familia}>
              <h2 className="font-mono text-sm text-text mb-3">
                {g.familia} <span className="text-text-muted">· {g.especies.length}</span>
              </h2>
              <div className={rejilla}>
                {g.especies.map(e => <TarjetaAve key={e.slug} especie={e} />)}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className={rejilla}>
          {visibles.map(e => <TarjetaAve key={e.slug} especie={e} />)}
        </div>
      )}
    </div>
  )
}
