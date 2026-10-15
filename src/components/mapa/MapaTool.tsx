'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { buildMapPrompt, buildPlan, buildTutorPrompt, type MapaData, type MapaPiece, type PlanCopy } from '@/lib/mapa/plan'
import StationTimer from './StationTimer'
import CopyButton from './CopyButton'
import PlanEmailForm from './PlanEmailForm'

const STORAGE_KEY = 'mapa-habilidad-v1'
const TEXT_FIELDS = ['skill', 'outcome', 'why', 'hours', 'project', 'firstStep', 'weak', 'drill', 'recall', 'feedback', 'reviewDay'] as const
type TextField = (typeof TEXT_FIELDS)[number]
// Mismos límites que mapaDataSchema en el servidor.
const MAX_LENGTH: Partial<Record<TextField, number>> = { project: 400, recall: 600 }

function emptyData(reviewDay: string): MapaData {
  return {
    skill: '', outcome: '', why: '', hours: '3', project: '', firstStep: '', weak: '', drill: '',
    recall: '', feedback: '', reviewDay,
    pieces: Array.from({ length: 5 }, () => ({ text: '', key: false }))
  }
}

function isMapaData(value: unknown): value is MapaData {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return TEXT_FIELDS.every(f => typeof v[f] === 'string') && Array.isArray(v.pieces)
}

const inputClass = 'w-full bg-surface border border-border focus:border-border-active outline-none text-text text-sm px-3 py-2.5 rounded-sm placeholder:text-text-muted transition-colors'
const labelClass = 'flex flex-col gap-1.5 text-sm font-medium text-text'
const hintClass = 'text-xs font-normal text-text-muted'
const smallButton = 'font-mono text-xs border border-border px-3 py-1.5 rounded-sm text-text-secondary hover:border-accent hover:text-accent transition-colors'

export default function MapaTool({ locale }: { locale: 'es' | 'en' }) {
  const t = useTranslations('mapa')
  const days = t.raw('days') as string[]
  const hoursOptions = t.raw('hoursOptions') as string[]
  const howto = t.raw('howto') as string[]
  const copy = t.raw('plan') as PlanCopy
  const example = t.raw('example') as MapaData
  const [data, setData] = useState<MapaData>(() => emptyData(days[4]))

  useEffect(() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
      // Restore after mount to keep server and client HTML identical on hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (isMapaData(saved)) setData(saved)
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {}
  }, [data])

  const set = (field: TextField) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setData(d => ({ ...d, [field]: e.target.value }))
  const setPieces = (fn: (pieces: MapaPiece[]) => MapaPiece[]) => setData(d => ({ ...d, pieces: fn(d.pieces) }))

  const plan = buildPlan(data, copy)
  const keyCount = data.pieces.filter(p => p.key && p.text.trim()).length

  function field(id: TextField, label: string, placeholder: string, hint?: string, multiline = false) {
    return (
      <label htmlFor={`mapa-${id}`} className={labelClass}>
        {label}
        {hint && <span className={hintClass}>{hint}</span>}
        {multiline ? (
          <textarea id={`mapa-${id}`} rows={3} maxLength={MAX_LENGTH[id] ?? 200} value={data[id]} onChange={set(id)} placeholder={placeholder} className={`${inputClass} resize-y`} />
        ) : (
          <input id={`mapa-${id}`} type="text" maxLength={MAX_LENGTH[id] ?? 200} value={data[id]} onChange={set(id)} placeholder={placeholder} className={inputClass} />
        )}
      </label>
    )
  }

  function station(letter: string, key: 'map' | 'apply' | 'practice' | 'adjust', children: React.ReactNode) {
    return (
      <section className="border border-border rounded-sm p-5 sm:p-7 space-y-5 bg-background">
        <div className="grid grid-cols-[auto_1fr] sm:grid-cols-[auto_1fr_auto] gap-4 items-center">
          <span aria-hidden="true" className="font-mono text-4xl font-bold text-accent w-10 text-center">{letter}</span>
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-text">{t(`stations.${key}.title`)}</h2>
            <p className="text-xs text-text-secondary">{t(`stations.${key}.hint`)}</p>
          </div>
          <div className="col-span-2 sm:col-span-1"><StationTimer /></div>
        </div>
        {children}
      </section>
    )
  }

  function prompt(title: string, text: string) {
    return (
      <div className="bg-surface rounded-sm p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-text">{title}</p>
          <CopyButton text={text} label={t('prompts.copy')} copiedLabel={t('prompts.copied')} className={smallButton} />
        </div>
        <pre className="font-mono text-xs text-text-secondary whitespace-pre-wrap leading-relaxed">{text}</pre>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-16 space-y-10">
      <header className="space-y-4">
        <p className="font-mono text-xs text-accent">{t('comment')}</p>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-text text-balance">{t('title')}</h1>
        <p className="text-sm sm:text-base text-text-secondary leading-relaxed max-w-2xl">{t('lede')}</p>
        <ul className="flex flex-wrap gap-x-5 gap-y-1 font-mono text-xs text-text-muted">
          {howto.map(step => <li key={step}>{step}</li>)}
        </ul>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => setData(example)} className={`${smallButton} border-dashed`}>{t('loadExample')}</button>
          <button type="button" onClick={() => setData(emptyData(days[4]))} className={`${smallButton} border-dashed`}>{t('clear')}</button>
        </div>
      </header>

      <section className="border border-border rounded-sm p-5 sm:p-7 space-y-5 bg-background">
        <div>
          <h2 className="text-xl font-bold text-text">{t('goal.title')}</h2>
          <p className="text-xs text-text-secondary">{t('goal.hint')}</p>
        </div>
        {field('skill', t('goal.skill'), t('goal.skillPh'))}
        {field('outcome', t('goal.outcome'), t('goal.outcomePh'), t('goal.outcomeHint'))}
        <div className="grid gap-5 sm:grid-cols-2">
          {field('why', t('goal.why'), t('goal.whyPh'))}
          <label htmlFor="mapa-hours" className={labelClass}>
            {t('goal.hours')}
            <select id="mapa-hours" value={data.hours} onChange={set('hours')} className={inputClass}>
              {hoursOptions.map(n => <option key={n} value={n}>{t('hoursOption', { n })}</option>)}
            </select>
          </label>
        </div>
      </section>

      {station('M', 'map', (
        <>
          <div className="space-y-2">
            {data.pieces.map((piece, i) => (
              <div key={i} className="grid grid-cols-[auto_1fr_auto] gap-2 items-center">
                <button
                  type="button"
                  aria-pressed={piece.key}
                  aria-label={t('pieces.markKey')}
                  onClick={() => setPieces(ps => ps.map((p, j) => (j === i ? { ...p, key: !p.key } : p)))}
                  className={`w-9 h-9 rounded-sm border text-base ${piece.key ? 'bg-accent border-accent text-background' : 'border-border text-text-muted hover:border-accent'}`}
                >★</button>
                <input
                  type="text"
                  aria-label={t('pieces.label', { n: String(i + 1) })}
                  maxLength={100}
                  value={piece.text}
                  onChange={e => setPieces(ps => ps.map((p, j) => (j === i ? { ...p, text: e.target.value } : p)))}
                  placeholder={t('pieces.placeholder')}
                  className={inputClass}
                />
                <button type="button" aria-label={t('pieces.remove')} onClick={() => setPieces(ps => ps.filter((_, j) => j !== i))} className="w-9 h-9 rounded-sm border border-border text-text-muted hover:border-accent">×</button>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {data.pieces.length < 15 && (
              <button type="button" onClick={() => setPieces(ps => [...ps, { text: '', key: false }])} className={smallButton}>{t('pieces.add')}</button>
            )}
            <span className="font-mono text-xs text-text-muted">{t('pieces.count', { n: String(keyCount) })}</span>
          </div>
          {prompt(t('prompts.mapTitle'), buildMapPrompt(data, copy))}
        </>
      ))}

      {station('A', 'apply', (
        <>
          {field('project', t('fields.project'), t('fields.projectPh'), t('fields.projectHint'), true)}
          {field('firstStep', t('fields.firstStep'), t('fields.firstStepPh'))}
        </>
      ))}

      {station('P', 'practice', (
        <>
          {field('weak', t('fields.weak'), t('fields.weakPh'))}
          {field('drill', t('fields.drill'), t('fields.drillPh'))}
          {field('recall', t('fields.recall'), t('fields.recallPh'), t('fields.recallHint'), true)}
        </>
      ))}

      {station('A', 'adjust', (
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            {field('feedback', t('fields.feedback'), t('fields.feedbackPh'))}
            <label htmlFor="mapa-reviewDay" className={labelClass}>
              {t('fields.reviewDay')}
              <select id="mapa-reviewDay" value={data.reviewDay} onChange={set('reviewDay')} className={inputClass}>
                {days.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </label>
          </div>
          {prompt(t('prompts.tutorTitle'), buildTutorPrompt(data, copy))}
        </>
      ))}

      <section className="border-2 border-accent rounded-sm p-5 sm:p-7 space-y-5">
        <div>
          <p className="font-mono text-xs text-accent">{t('result.label')}</p>
          <h2 className="text-xl font-bold text-text">{t('result.title')}</h2>
          <p className="text-xs text-text-secondary">{t('result.hint')}</p>
        </div>
        <pre data-testid="plan" className="font-mono text-xs sm:text-sm text-text whitespace-pre-wrap leading-relaxed bg-surface border border-border rounded-sm p-4">{plan}</pre>
        <CopyButton text={plan} label={t('result.copy')} copiedLabel={t('result.copied')} className="bg-accent text-background font-mono text-xs font-bold px-5 py-2.5 rounded-sm hover:opacity-90 transition-opacity" />
        <div className="border-t border-border pt-5">
          <PlanEmailForm data={data} locale={locale} />
        </div>
      </section>

      <footer className="space-y-2 text-xs text-text-secondary">
        <p>{t('author')}</p>
        <Link href="/formacion" className="text-accent hover:underline">{t('cta')}</Link>
        <p className="font-mono text-text-muted">{t('storage')}</p>
      </footer>
    </div>
  )
}
