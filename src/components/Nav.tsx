import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { createClient } from '@/lib/supabase/server'
import LocaleSwitcher from './LocaleSwitcher'
import MenuMovil, { type GrupoMenu } from './MenuMovil'
import UserMenu from './UserMenu'

export default async function Nav() {
  const t = await getTranslations('nav')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Las mismas opciones, agrupadas, para el menú del celular y la tablet.
  const grupos: GrupoMenu[] = [
    { items: [
      { href: '/biografia', label: t('biografia') },
      { href: '/blog', label: t('blog') },
      { href: '/portfolio', label: t('portfolio') },
      { href: '/recipes', label: t('recipes') },
    ] },
    { titulo: t('grupoAprender'), items: [
      { href: '/formacion', label: t('formacion') },
      { href: '/cursos', label: t('cursos') },
      { href: '/carpinteria', label: t('carpinteria') },
      { href: '/biblioteca', label: t('biblioteca') },
      { href: t('aprenderHref'), label: t('aprender'), estatico: true },
      { href: '/aprendizaje-en-el-tiempo', label: t('lineaAprendizaje') },
      { href: t('dineroHref'), label: t('dinero'), estatico: true },
    ] },
    { items: [
      { href: '/guestbook', label: t('guestbook') },
      { href: '/contact', label: t('contact') },
    ] },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-border bg-background/90 backdrop-blur-sm">
      <Link href="/" className="font-mono text-sm font-bold text-accent">
        SM
      </Link>
      {/* Computador (≥ xl): el menú completo en una fila. Mide ~1130 px, por eso no se muestra antes de xl. */}
      <div className="hidden xl:flex items-center gap-6">
        <Link href="/biografia" className="text-xs text-text-secondary hover:text-text transition-colors">
          {t('biografia')}
        </Link>
        <Link href="/blog" className="text-xs text-text-secondary hover:text-text transition-colors">
          {t('blog')}
        </Link>
        <Link href="/portfolio" className="text-xs text-text-secondary hover:text-text transition-colors">
          {t('portfolio')}
        </Link>
        <Link href="/recipes" className="text-xs text-text-secondary hover:text-text transition-colors">
          {t('recipes')}
        </Link>
        <Link href="/formacion" className="text-xs text-text-secondary hover:text-text transition-colors">
          {t('formacion')}
        </Link>
        <Link href="/cursos" className="text-xs text-text-secondary hover:text-text transition-colors">
          {t('cursos')}
        </Link>
        <Link href="/carpinteria" className="text-xs text-text-secondary hover:text-text transition-colors">
          {t('carpinteria')}
        </Link>
        <Link href="/biblioteca" className="text-xs text-text-secondary hover:text-text transition-colors">
          {t('biblioteca')}
        </Link>
        {/* Página estática en public/: va con <a> porque no pasa por las rutas con idioma */}
        <a href={t('aprenderHref')} className="text-xs text-text-secondary hover:text-text transition-colors">
          {t('aprender')}
        </a>
        <Link href="/aprendizaje-en-el-tiempo" className="text-xs text-text-secondary hover:text-text transition-colors">
          {t('lineaAprendizaje')}
        </Link>
        <a href={t('dineroHref')} className="text-xs text-text-secondary hover:text-text transition-colors">
          {t('dinero')}
        </a>
        <Link href="/guestbook" className="text-xs text-text-secondary hover:text-text transition-colors">
          {t('guestbook')}
        </Link>
        <Link href="/contact" className="text-xs text-text-secondary hover:text-text transition-colors">
          {t('contact')}
        </Link>
        <LocaleSwitcher />
        <UserMenu isLoggedIn={!!user} />
      </div>
      {/* Celular y tablet: idioma, sesión y el botón ☰ */}
      <div className="flex xl:hidden items-center gap-4">
        <LocaleSwitcher />
        <UserMenu isLoggedIn={!!user} />
        <MenuMovil grupos={grupos} textos={{ abrir: t('menuAbrir'), cerrar: t('menuCerrar') }} />
      </div>
    </nav>
  )
}
