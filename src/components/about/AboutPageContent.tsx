import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { aboutContent, type AboutLocale } from './content'

function bold(text: string) {
  const parts = text.split(/\*\*(.+?)\*\*/g)
  return parts.map((part, i) =>
    i % 2 === 1
      ? <strong key={i} className="text-text font-semibold">{part}</strong>
      : part
  )
}

export default function AboutPageContent({ locale, downloadCvLabel, portfolioLabel, eduTitle }: {
  locale: string
  downloadCvLabel: string
  portfolioLabel: string
  eduTitle: string
}) {
  const c = aboutContent[(locale as AboutLocale) in aboutContent ? (locale as AboutLocale) : 'es']

  return (
    <>
      {/* HERO */}
      <section className="border-b border-border py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_160px] gap-10 items-end">
            <div>
              <p className="font-mono text-xs text-text-muted uppercase tracking-widest mb-5">{c.eyebrow}</p>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.04] mb-6 text-text">
                {c.headline[0]}
                <em className="not-italic text-accent font-extrabold">{c.headline[1]}</em>
                {c.headline[2]}
              </h1>
              <div className="flex flex-wrap gap-3 items-center font-mono text-sm text-text-secondary">
                {c.roles.map((r, i) => (
                  i === 0
                    ? <span key={i} className="border border-border px-3 py-1 rounded-full text-xs bg-surface">{r}</span>
                    : <span key={i}>{r}</span>
                ))}
              </div>
            </div>
            <div className="relative w-36 h-44 rounded-sm overflow-hidden border border-border flex-shrink-0">
              <Image src="/about/sergio-profile.jpg" alt="Sergio Monsalve" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* INTRO LEDE */}
      <section className="border-b border-border py-10">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-8 items-start">
            <p className="font-mono text-xs text-text-muted uppercase tracking-widest pt-1">// quién soy</p>
            <p className="text-xl md:text-2xl leading-relaxed text-text max-w-2xl">
              {c.lede.split('traductor entre datos y decisiones').length > 1
                ? <>
                    {c.lede.split('traductor entre datos y decisiones')[0]}
                    <em className="text-accent not-italic">traductor entre datos y decisiones</em>
                    {c.lede.split('traductor entre datos y decisiones')[1]}
                  </>
                : c.lede.split('translator between data and decisions').length > 1
                ? <>
                    {c.lede.split('translator between data and decisions')[0]}
                    <em className="text-accent not-italic">translator between data and decisions</em>
                    {c.lede.split('translator between data and decisions')[1]}
                  </>
                : c.lede}
            </p>
          </div>
        </div>
      </section>

      {/* STACK */}
      <section className="border-b border-border py-10">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-8 items-start">
            <p className="font-mono text-xs text-text-muted uppercase tracking-widest pt-1">// stack</p>
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-7 mb-8">
                {c.stackGroups.map(group => (
                  <div key={group.label}>
                    <p className="font-mono text-xs text-text-muted uppercase tracking-wider mb-2.5">{group.label}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {group.chips.map(chip => (
                        <span key={chip} className="font-mono text-xs px-2.5 py-1 border border-border bg-surface rounded-sm text-text-secondary">{chip}</span>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <p className="font-mono text-xs text-text-muted uppercase tracking-wider mb-2.5">{c.learning.label}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {c.learning.chips.map(chip => (
                      <span key={chip} className="font-mono text-xs px-2.5 py-1 border border-dashed border-border rounded-sm text-text-muted">{chip}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://orlniujfwolyinsuezcu.supabase.co/storage/v1/object/public/assets/cv-sergio-monsalve.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="inline-flex items-center gap-2 bg-text text-background font-mono text-xs font-bold px-4 py-2.5 rounded-sm hover:bg-accent transition-colors"
                >
                  {downloadCvLabel}
                </a>
                <Link
                  href="/portfolio"
                  className="inline-flex items-center gap-2 border border-border font-mono text-xs text-text-secondary px-4 py-2.5 rounded-sm hover:border-accent hover:text-accent transition-colors"
                >
                  {portfolioLabel}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EXPERIENCE */}
      <section className="border-b border-border py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-8 mb-10">
            <p className="font-mono text-xs text-text-muted uppercase tracking-widest pt-1">{c.experienceLabel}</p>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-text mb-2">{c.experienceTitle}</h2>
              <p className="text-text-secondary text-sm max-w-xl">{c.experienceDesc}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-8">
            <div />
            <div className="border-l border-border pl-7 space-y-10">
              {c.jobs.map((job, i) => (
                <article key={i} className={`relative ${job.muted ? 'opacity-60' : ''}`}>
                  <div className="absolute -left-[30px] top-2 w-2.5 h-2.5 rounded-full border-2 border-text-secondary bg-background"
                    style={job.current ? { background: 'var(--color-accent, #00ff88)', borderColor: 'var(--color-accent, #00ff88)', boxShadow: '0 0 0 4px rgba(0,255,136,0.15)' } : {}}
                  />
                  <div className="flex items-center gap-3 mb-1.5">
                    <p className="font-mono text-xs text-text-muted uppercase tracking-wide">{job.period}</p>
                    {job.current && <span className="font-mono text-xs bg-accent text-background px-1.5 py-0.5 rounded-sm">más reciente</span>}
                  </div>
                  <h3 className="text-lg font-bold text-text mb-0.5">{job.role}</h3>
                  <p className="text-sm text-text-secondary italic mb-3">{job.org}</p>
                  <ul className="space-y-1.5 mb-4">
                    {job.bullets.map((bullet, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-text-secondary">
                        <span className="text-accent font-mono text-xs mt-0.5 flex-shrink-0">▸</span>
                        <span>{bold(bullet)}</span>
                      </li>
                    ))}
                  </ul>
                  {job.chips.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {job.chips.map(chip => (
                        <span key={chip} className="font-mono text-xs px-2 py-0.5 border border-border bg-surface rounded-sm text-text-muted">{chip}</span>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* EDUCATION + NOW */}
      <section className="border-b border-border py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-[180px_1fr_1fr] gap-8 md:gap-10">
            <p className="font-mono text-xs text-text-muted uppercase tracking-widest pt-1">// también</p>
            <div>
              <h2 className="text-xl font-bold text-text mb-5">{eduTitle}</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-mono text-xs text-text-muted uppercase tracking-wide">2024 → 2026</p>
                    <span className="font-mono text-xs bg-accent text-background px-1.5 py-0.5 rounded-sm">cursando</span>
                  </div>
                  <p className="text-sm font-semibold text-text">MSc Engineering (candidate)</p>
                  <p className="text-xs text-text-muted italic">Universidad EAFIT</p>
                </div>
                <div>
                  <p className="font-mono text-xs text-text-muted uppercase tracking-wide mb-1">→ 2013</p>
                  <p className="text-sm font-semibold text-text">BS Systems Engineering</p>
                  <p className="text-xs text-text-muted italic">Universidad EAFIT</p>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-text mb-5">
                {c.nowTitle.split('/now')[0]}<em className="text-accent not-italic">/now</em>
              </h2>
              <div className="space-y-4">
                {c.nowItems.map((item, i) => (
                  <div key={i}>
                    <p className="font-mono text-xs text-text-muted uppercase tracking-wide mb-0.5">{item.period}</p>
                    <p className="text-sm font-semibold text-text">{item.name}</p>
                    <p className="text-xs text-text-muted italic">{item.where}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BEYOND THE CODE — always dark regardless of active skin */}
      <section
        className="py-20 border-y border-border relative overflow-hidden"
        style={{ background: 'var(--about-beyond-bg)' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 80% 20%, color-mix(in srgb, var(--about-beyond-accent) 18%, transparent), transparent 60%), radial-gradient(ellipse at 10% 80%, color-mix(in srgb, var(--about-beyond-accent) 8%, transparent), transparent 50%)',
          }}
        />
        <div className="max-w-5xl mx-auto px-6 relative">
          <p
            className="font-mono text-xs uppercase tracking-widest mb-4"
            style={{ color: 'var(--about-beyond-fg-soft)' }}
          >
            {c.beyondLabel}
          </p>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-10"
            style={{ color: 'var(--about-beyond-fg)' }}
          >
            {c.beyondTitle[0]}
            <em className="not-italic" style={{ color: 'var(--about-beyond-accent)' }}>
              {c.beyondTitle[1]}
            </em>
            {c.beyondTitle[2]}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {c.beyondCards.map((card, i) => (
              <article key={i} className="about-beyond-card p-6 rounded-sm">
                <p
                  className="font-mono text-xs uppercase tracking-widest mb-3"
                  style={{ color: 'var(--about-beyond-accent)' }}
                >
                  {card.glyph}
                </p>
                <h3
                  className="text-base font-bold mb-2"
                  style={{ color: 'var(--about-beyond-fg)' }}
                >
                  {card.title}
                </h3>
                <p
                  className="text-sm leading-relaxed mb-4"
                  style={{ color: 'var(--about-beyond-fg-soft)' }}
                >
                  {card.text}
                </p>
                {card.link && (
                  <a
                    href={card.link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs pb-px transition-opacity hover:opacity-100 opacity-90"
                    style={{
                      color: 'var(--about-beyond-accent)',
                      borderBottom: '1px solid var(--about-beyond-accent)',
                    }}
                  >
                    {card.link.label}
                  </a>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* PARAPENTE QUOTE */}
      <section className="border-b border-border py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
            <div className="relative aspect-[4/3] rounded-sm overflow-hidden border border-border">
              <Image src="/about/sergio-parapente.jpg" alt={c.parapenteAlt} fill className="object-cover object-center" />
            </div>
            <div>
              <blockquote className="text-2xl md:text-3xl font-bold leading-snug text-text mb-6 tracking-tight">
                &ldquo;{c.parapenteQuote.split(c.parapenteQuoteEm)[0]}
                <em className="text-accent not-italic">{c.parapenteQuoteEm}</em>
                {c.parapenteQuote.split(c.parapenteQuoteEm)[1]}&rdquo;
              </blockquote>
              <p className="font-mono text-xs text-text-muted uppercase tracking-widest mb-6">{c.parapenteSource}</p>
              <Link
                href="/blog/2026-05-09-mas-alla-del-codigo"
                className="font-mono text-xs text-text-secondary border border-border px-4 py-2.5 rounded-sm hover:border-accent hover:text-accent transition-colors inline-block"
              >
                {c.parapenteLink}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-b border-border">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-8 items-end">
            <p className="font-mono text-xs text-text-muted uppercase tracking-widest pt-1">{c.ctaLabel}</p>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-text mb-7 max-w-xl leading-snug">
                {c.ctaTitle[0]}
                <em className="text-accent not-italic">{c.ctaTitle[1]}</em>
                {c.ctaTitle[2]}
              </h2>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-text text-background font-mono text-xs font-bold px-4 py-2.5 rounded-sm hover:bg-accent transition-colors"
                >
                  Contacto →
                </Link>
                <a href="https://wa.me/573508025988" target="_blank" rel="noopener noreferrer"
                  className="font-mono text-xs border border-border text-text-secondary px-4 py-2.5 rounded-sm hover:border-accent hover:text-accent transition-colors">
                  {c.ctaWhatsApp}
                </a>
                <a href="https://github.com/serandmoncas" target="_blank" rel="noopener noreferrer"
                  className="font-mono text-xs border border-border text-text-secondary px-4 py-2.5 rounded-sm hover:border-accent hover:text-accent transition-colors">
                  {c.ctaGitHub}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
