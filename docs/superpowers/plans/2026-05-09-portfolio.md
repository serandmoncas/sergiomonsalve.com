# Portfolio Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `/portfolio` section with magazine-style project cards, per-project MDX case study pages, a sidebar with stack + links, and OG images — following the exact same patterns as the blog.

**Architecture:** File-based MDX content in `content/portfolio/{locale}/{slug}.mdx`, read by `src/lib/portfolio.ts` (mirrors `posts.ts`). List page renders a 2-column grid of `ProjectCard` (magazine style). Detail page has a full-width header image, MDX prose, and a sidebar with stack tags and external links.

**Tech Stack:** Next.js 16 App Router, next-intl, gray-matter, next-mdx-remote/rsc, Tailwind CSS v4, Vitest + React Testing Library.

---

### Task 1: i18n strings

**Files:**
- Modify: `src/messages/es.json`
- Modify: `src/messages/en.json`

- [ ] **Step 1: Add portfolio strings to es.json**

Open `src/messages/es.json`. Add `"portfolio"` to `"nav"`, add `"portfolioTitle"` and `"portfolioDescription"` to `"meta"`, and add a new top-level `"portfolio"` namespace:

```json
"nav": {
  "about": "Sobre mí",
  "blog": "Blog",
  "portfolio": "Portfolio",
  "recipes": "Recetas",
  "contact": "Contacto"
},
"meta": {
  "heroTitle": "Sergio Monsalve — AI Software Engineer",
  "heroDescription": "Ingeniero de sistemas con más de 13 años de experiencia construyendo soluciones con Python, IA y ciencias de datos. Disponible para freelance y posiciones full-time.",
  "aboutTitle": "Sobre mí",
  "aboutDescription": "Experiencia, stack técnico y CV de Sergio Monsalve, AI Software Engineer especializado en Python, LLMs y arquitecturas de datos.",
  "contactTitle": "Contacto",
  "contactDescription": "Hablemos de tu proyecto. Disponible para freelance, full-time y colaboraciones en Python, IA y desarrollo de software.",
  "blogTitle": "Blog",
  "blogDescription": "Artículos sobre Python, LLMs, pipelines de datos y desarrollo de software en el mundo real.",
  "recipesTitle": "Recetas",
  "recipesDescription": "Recetas de cocina de Sergio Monsalve — vegetarianas, con hongos y de temporada.",
  "portfolioTitle": "Portfolio",
  "portfolioDescription": "Proyectos y casos de estudio de Sergio Monsalve — desarrollo full stack, Python, IA y datos."
},
"portfolio": {
  "comment": "// proyectos",
  "pageTitle": "Proyectos",
  "stack": "// stack",
  "links": "// links",
  "github": "GitHub",
  "demo": "Demo en vivo",
  "viewCase": "Ver caso →",
  "backToPortfolio": "← Portfolio",
  "empty": "próximamente",
  "status": {
    "active": "activo",
    "archived": "archivado"
  }
}
```

- [ ] **Step 2: Add portfolio strings to en.json**

Open `src/messages/en.json`. Make the same additions in English:

```json
"nav": {
  "about": "About",
  "blog": "Blog",
  "portfolio": "Portfolio",
  "recipes": "Recipes",
  "contact": "Contact"
},
"meta": {
  "heroTitle": "Sergio Monsalve — AI Software Engineer",
  "heroDescription": "Systems engineer with 13+ years building solutions with Python, AI, and data science. Available for freelance and full-time positions.",
  "aboutTitle": "About",
  "aboutDescription": "Experience, tech stack, and CV of Sergio Monsalve, AI Software Engineer specializing in Python, LLMs, and data architectures.",
  "contactTitle": "Contact",
  "contactDescription": "Let's talk about your project. Available for freelance, full-time, and collaborations in Python, AI, and software development.",
  "blogTitle": "Blog",
  "blogDescription": "Articles on Python, LLMs, data pipelines, and real-world software development.",
  "recipesTitle": "Recipes",
  "recipesDescription": "Recipes by Sergio Monsalve — vegetarian, mushroom-forward, and seasonal.",
  "portfolioTitle": "Portfolio",
  "portfolioDescription": "Projects and case studies by Sergio Monsalve — full stack development, Python, AI, and data systems."
},
"portfolio": {
  "comment": "// projects",
  "pageTitle": "Projects",
  "stack": "// stack",
  "links": "// links",
  "github": "GitHub",
  "demo": "Live demo",
  "viewCase": "View case →",
  "backToPortfolio": "← Portfolio",
  "empty": "coming soon",
  "status": {
    "active": "active",
    "archived": "archived"
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/messages/es.json src/messages/en.json
git commit -m "feat: add portfolio i18n strings"
```

---

### Task 2: Data layer

**Files:**
- Create: `src/lib/portfolio.ts`
- Create: `src/lib/__tests__/portfolio.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/__tests__/portfolio.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { getAllProjects, getProject, getProjectSlugs } from '../portfolio'

describe('getAllProjects', () => {
  it('returns empty array for non-existent locale directory', () => {
    expect(getAllProjects('xx')).toEqual([])
  })
})

describe('getProject', () => {
  it('returns null for a non-existent slug', () => {
    expect(getProject('does-not-exist', 'es')).toBeNull()
  })
})

describe('getProjectSlugs', () => {
  it('returns empty array for non-existent locale directory', () => {
    expect(getProjectSlugs('xx')).toEqual([])
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm run test:run -- src/lib/__tests__/portfolio.test.ts
```

Expected: FAIL — "Cannot find module '../portfolio'"

- [ ] **Step 3: Implement portfolio.ts**

Create `src/lib/portfolio.ts`:

```ts
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const contentRoot = path.join(process.cwd(), 'content/portfolio')

export type ProjectMeta = {
  slug: string
  title: string
  description: string
  date: string
  role: string
  stack: string[]
  github: string
  demo: string
  status: 'active' | 'archived'
  featured: boolean
  image: string
}

export type Project = ProjectMeta & { content: string }

export function getAllProjects(locale: string): ProjectMeta[] {
  const dir = path.join(contentRoot, locale)
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter(f => f.endsWith('.mdx'))
    .map(filename => {
      const slug = filename.replace('.mdx', '')
      const { data } = matter(fs.readFileSync(path.join(dir, filename), 'utf-8'))
      return {
        slug,
        title: data.title as string,
        description: data.description as string,
        date: data.date as string,
        role: data.role as string,
        stack: (data.stack as string[]) ?? [],
        github: (data.github as string) ?? '',
        demo: (data.demo as string) ?? '',
        status: (data.status as 'active' | 'archived') ?? 'active',
        featured: (data.featured as boolean) ?? false,
        image: (data.image as string) ?? '',
      }
    })
    .filter(p => p.title)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getProject(slug: string, locale: string): Project | null {
  const filePath = path.join(contentRoot, locale, `${slug}.mdx`)
  if (!fs.existsSync(filePath)) return null
  const { data, content } = matter(fs.readFileSync(filePath, 'utf-8'))
  return {
    slug,
    title: data.title as string,
    description: data.description as string,
    date: data.date as string,
    role: data.role as string,
    stack: (data.stack as string[]) ?? [],
    github: (data.github as string) ?? '',
    demo: (data.demo as string) ?? '',
    status: (data.status as 'active' | 'archived') ?? 'active',
    featured: (data.featured as boolean) ?? false,
    image: (data.image as string) ?? '',
    content,
  }
}

export function getProjectSlugs(locale: string): string[] {
  const dir = path.join(contentRoot, locale)
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir).filter(f => f.endsWith('.mdx')).map(f => f.replace('.mdx', ''))
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm run test:run -- src/lib/__tests__/portfolio.test.ts
```

Expected: PASS — 3 tests

- [ ] **Step 5: Commit**

```bash
git add src/lib/portfolio.ts src/lib/__tests__/portfolio.test.ts
git commit -m "feat: portfolio data layer"
```

---

### Task 3: ProjectCard component

**Files:**
- Create: `src/components/ProjectCard.tsx`
- Create: `src/components/__tests__/ProjectCard.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `src/components/__tests__/ProjectCard.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProjectCard from '../ProjectCard'
import type { ProjectMeta } from '@/lib/portfolio'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))
vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))
vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}))

const mockProject: ProjectMeta = {
  slug: 'slogs',
  title: 'slogs',
  description: 'Plataforma logística full-stack',
  date: '2026-05-08',
  role: 'Full Stack Developer',
  stack: ['TypeScript', 'Python'],
  github: 'https://github.com/serandmoncas/slogs',
  demo: '',
  status: 'active',
  featured: true,
  image: '/portfolio/slogs.png',
}

const labels = {
  viewCase: 'Ver caso →',
  status: { active: 'activo', archived: 'archivado' },
}

describe('ProjectCard', () => {
  it('renders project title', () => {
    render(<ProjectCard project={mockProject} locale="es" labels={labels} />)
    expect(screen.getByText('slogs')).toBeInTheDocument()
  })

  it('renders project description', () => {
    render(<ProjectCard project={mockProject} locale="es" labels={labels} />)
    expect(screen.getByText('Plataforma logística full-stack')).toBeInTheDocument()
  })

  it('renders all stack tags', () => {
    render(<ProjectCard project={mockProject} locale="es" labels={labels} />)
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
    expect(screen.getByText('Python')).toBeInTheDocument()
  })

  it('renders a link to the detail page', () => {
    render(<ProjectCard project={mockProject} locale="es" labels={labels} />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/portfolio/slogs')
  })

  it('renders the CTA text', () => {
    render(<ProjectCard project={mockProject} locale="es" labels={labels} />)
    expect(screen.getByText('Ver caso →')).toBeInTheDocument()
  })

  it('renders the status badge', () => {
    render(<ProjectCard project={mockProject} locale="es" labels={labels} />)
    expect(screen.getByText('activo')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm run test:run -- src/components/__tests__/ProjectCard.test.tsx
```

Expected: FAIL — "Cannot find module '../ProjectCard'"

- [ ] **Step 3: Implement ProjectCard.tsx**

Create `src/components/ProjectCard.tsx`:

```tsx
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import type { ProjectMeta } from '@/lib/portfolio'

type Labels = {
  viewCase: string
  status: { active: string; archived: string }
}

export default function ProjectCard({
  project,
  locale,
  labels,
}: {
  project: ProjectMeta
  locale: string
  labels: Labels
}) {
  return (
    <Link
      href={`/portfolio/${project.slug}`}
      locale={locale as 'es' | 'en'}
      className="block border border-border hover:border-accent transition-colors rounded-sm group overflow-hidden"
    >
      <div className="relative aspect-video bg-surface">
        {project.image ? (
          <Image
            src={project.image}
            alt={project.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono text-xs text-text-muted">// {project.slug}</span>
          </div>
        )}
        <span className="absolute top-2 right-2 font-mono text-xs bg-background/80 px-2 py-0.5 rounded-sm text-text-muted border border-border">
          {labels.status[project.status]}
        </span>
      </div>
      <div className="p-5">
        <h2 className="text-sm font-bold text-text group-hover:text-accent transition-colors mb-1">
          {project.title}
        </h2>
        <p className="text-xs text-text-secondary leading-relaxed mb-3">
          {project.description}
        </p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.stack.map(tech => (
            <span
              key={tech}
              className="font-mono text-xs text-accent bg-surface border border-border-active px-2 py-0.5 rounded-sm"
            >
              {tech}
            </span>
          ))}
        </div>
        <span className="font-mono text-xs text-accent group-hover:underline">
          {labels.viewCase}
        </span>
      </div>
    </Link>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm run test:run -- src/components/__tests__/ProjectCard.test.tsx
```

Expected: PASS — 6 tests

- [ ] **Step 5: Commit**

```bash
git add src/components/ProjectCard.tsx src/components/__tests__/ProjectCard.test.tsx
git commit -m "feat: ProjectCard component (magazine style)"
```

---

### Task 4: Nav update

**Files:**
- Modify: `src/components/Nav.tsx`
- Modify: `src/components/__tests__/Nav.test.tsx`

- [ ] **Step 1: Update the Nav test first**

Open `src/components/__tests__/Nav.test.tsx`. Replace the existing `'renders About and Contact links'` test and add a portfolio link assertion:

```tsx
it('renders all nav links', () => {
  render(<Nav />)
  expect(screen.getByRole('link', { name: /about/i })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /blog/i })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /portfolio/i })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /recipes/i })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /contact/i })).toBeInTheDocument()
})
```

- [ ] **Step 2: Run Nav test to verify it fails**

```bash
npm run test:run -- src/components/__tests__/Nav.test.tsx
```

Expected: FAIL — "Unable to find an accessible element with the role 'link' and name /portfolio/i"

- [ ] **Step 3: Add Portfolio link to Nav.tsx**

Open `src/components/Nav.tsx`. Add the Portfolio link between Blog and Recipes:

```tsx
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import LocaleSwitcher from './LocaleSwitcher'

export default function Nav() {
  const t = useTranslations('nav')

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-border bg-background/90 backdrop-blur-sm">
      <Link href="/" className="font-mono text-sm font-bold text-accent">
        SM
      </Link>
      <div className="flex items-center gap-6">
        <Link href="/about" className="text-xs text-text-secondary hover:text-text transition-colors">
          {t('about')}
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
        <Link href="/contact" className="text-xs text-text-secondary hover:text-text transition-colors">
          {t('contact')}
        </Link>
        <LocaleSwitcher />
      </div>
    </nav>
  )
}
```

- [ ] **Step 4: Run all Nav tests to verify they pass**

```bash
npm run test:run -- src/components/__tests__/Nav.test.tsx
```

Expected: PASS — all tests

- [ ] **Step 5: Commit**

```bash
git add src/components/Nav.tsx src/components/__tests__/Nav.test.tsx
git commit -m "feat: add Portfolio link to Nav"
```

---

### Task 5: Portfolio list page

**Files:**
- Create: `src/app/[locale]/portfolio/page.tsx`

- [ ] **Step 1: Create the list page**

Create `src/app/[locale]/portfolio/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { getAllProjects } from '@/lib/portfolio'
import ProjectCard from '@/components/ProjectCard'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  return {
    title: t('portfolioTitle'),
    description: t('portfolioDescription'),
    alternates: {
      canonical: `/${locale}/portfolio`,
      languages: { es: '/es/portfolio', en: '/en/portfolio' },
    },
  }
}

export default async function PortfolioPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'portfolio' })
  const projects = getAllProjects(locale)

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <p className="font-mono text-xs text-text-muted mb-3">{t('comment')}</p>
      <h1 className="text-3xl font-extrabold tracking-tight text-text mb-10">
        {t('pageTitle')}
      </h1>
      {projects.length === 0 ? (
        <p className="font-mono text-xs text-text-muted">{t('empty')}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {projects.map(project => (
            <ProjectCard
              key={project.slug}
              project={project}
              locale={locale}
              labels={{
                viewCase: t('viewCase'),
                status: {
                  active: t('status.active'),
                  archived: t('status.archived'),
                },
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify the page builds**

```bash
npm run build 2>&1 | tail -20
```

Expected: no errors related to portfolio list page.

- [ ] **Step 3: Verify the page loads in dev**

```bash
npm run dev
```

Open http://localhost:3000/es/portfolio — should show `// proyectos` header and "próximamente" (no content yet). Open http://localhost:3000/en/portfolio — should show English strings.

- [ ] **Step 4: Commit**

```bash
git add src/app/\[locale\]/portfolio/page.tsx
git commit -m "feat: portfolio list page"
```

---

### Task 6: Portfolio detail page

**Files:**
- Create: `src/app/[locale]/portfolio/[slug]/page.tsx`

- [ ] **Step 1: Create the detail page**

Create `src/app/[locale]/portfolio/[slug]/page.tsx`:

```tsx
import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { getProject, getProjectSlugs } from '@/lib/portfolio'
import MDXContent from '@/components/MDXContent'

export function generateStaticParams({ params: { locale } }: { params: { locale: string } }) {
  return getProjectSlugs(locale).map(slug => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const project = getProject(slug, locale)
  if (!project) return {}
  return {
    title: project.title,
    description: project.description,
    alternates: { canonical: `/${locale}/portfolio/${slug}` },
  }
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const project = getProject(slug, locale)
  if (!project) notFound()

  const t = await getTranslations({ locale, namespace: 'portfolio' })

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <Link
        href="/portfolio"
        className="font-mono text-xs text-text-muted hover:text-accent transition-colors mb-10 block"
      >
        {t('backToPortfolio')}
      </Link>

      {project.image && (
        <div className="relative aspect-video w-full mb-8 rounded-sm overflow-hidden border border-border">
          <Image src={project.image} alt={project.title} fill className="object-cover" />
        </div>
      )}

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="font-mono text-xs text-text-muted">{project.date}</span>
          <span className="font-mono text-xs bg-surface border border-border px-2 py-0.5 rounded-sm text-text-muted">
            {t(`status.${project.status}`)}
          </span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-text mb-1">
          {project.title}
        </h1>
        <p className="font-mono text-xs text-text-muted">{project.role}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1 min-w-0">
          <div className="mdx-prose">
            <MDXContent source={project.content} />
          </div>
        </div>

        <aside className="lg:w-56 flex-shrink-0 space-y-8">
          {project.stack.length > 0 && (
            <div>
              <p className="font-mono text-xs text-text-muted mb-3">{t('stack')}</p>
              <div className="flex flex-wrap gap-1.5">
                {project.stack.map(tech => (
                  <span
                    key={tech}
                    className="font-mono text-xs text-accent bg-surface border border-border-active px-2 py-0.5 rounded-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {(project.github || project.demo) && (
            <div>
              <p className="font-mono text-xs text-text-muted mb-3">{t('links')}</p>
              <div className="flex flex-col gap-2">
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-text-secondary hover:text-accent transition-colors"
                  >
                    {t('github')} ↗
                  </a>
                )}
                {project.demo && (
                  <a
                    href={project.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-text-secondary hover:text-accent transition-colors"
                  >
                    {t('demo')} ↗
                  </a>
                )}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify the build passes**

```bash
npm run build 2>&1 | tail -20
```

Expected: no errors. (No slugs exist yet so `generateStaticParams` returns `[]` — that's fine.)

- [ ] **Step 3: Commit**

```bash
git add "src/app/[locale]/portfolio/[slug]/page.tsx"
git commit -m "feat: portfolio detail page with MDX prose and sidebar"
```

---

### Task 7: OG image per project

**Files:**
- Create: `src/app/[locale]/portfolio/[slug]/opengraph-image.tsx`

- [ ] **Step 1: Create the OG image route**

Create `src/app/[locale]/portfolio/[slug]/opengraph-image.tsx`:

```tsx
import { ImageResponse } from 'next/og'
import { getProject } from '@/lib/portfolio'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OgImage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const project = getProject(slug, locale)

  return new ImageResponse(
    <div
      style={{
        background: '#0f0f0f',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: 80,
      }}
    >
      <p
        style={{
          color: '#555',
          fontFamily: 'monospace',
          fontSize: 18,
          margin: 0,
          marginBottom: 8,
        }}
      >
        {project?.role}
      </p>
      <p
        style={{
          color: '#888',
          fontFamily: 'monospace',
          fontSize: 20,
          margin: 0,
          marginBottom: 16,
        }}
      >
        {project?.date}
      </p>
      <h1
        style={{
          color: '#ffffff',
          fontFamily: 'sans-serif',
          fontSize: 72,
          fontWeight: 800,
          lineHeight: 1.1,
          margin: 0,
          marginBottom: 40,
        }}
      >
        {project?.title}
      </h1>
      <p
        style={{
          color: '#00ff88',
          fontFamily: 'monospace',
          fontSize: 24,
          margin: 0,
        }}
      >
        sergiomonsalve.com
      </p>
    </div>,
    { ...size }
  )
}
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build 2>&1 | tail -20
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "src/app/[locale]/portfolio/[slug]/opengraph-image.tsx"
git commit -m "feat: per-project OG image"
```

---

### Task 8: First project content (slogs)

**Files:**
- Create: `content/portfolio/es/slogs.mdx`
- Create: `content/portfolio/en/slogs.mdx`
- Create: `public/portfolio/.gitkeep`

- [ ] **Step 1: Create the screenshot directory**

```bash
mkdir -p public/portfolio
touch public/portfolio/.gitkeep
```

Add a screenshot of slogs to `public/portfolio/slogs.png`. If not available yet, leave the file absent — the card will render a placeholder instead.

- [ ] **Step 2: Create the Spanish MDX file**

Create `content/portfolio/es/slogs.mdx`:

```mdx
---
title: slogs
description: Plataforma logística full-stack con dashboard en tiempo real, gestión de rutas y seguimiento de envíos.
date: 2026-05-08
role: Full Stack Developer
stack: [TypeScript, Python, FastAPI, Next.js, PostgreSQL]
github: https://github.com/serandmoncas/slogs
demo: ""
status: active
featured: true
image: /portfolio/slogs.png
---

## El problema

[Describe el problema de negocio que resuelve slogs — qué proceso logístico estaba roto o era ineficiente.]

## La solución

[Describe la solución: qué construiste, cómo funciona el dashboard, qué flujos cubre.]

## Decisiones técnicas

[Explica por qué elegiste este stack — FastAPI para el backend, Next.js para el frontend, PostgreSQL para la base de datos. Qué trade-offs consideraste.]

## Resultados

[Métricas, aprendizajes, o lo que lograste con este proyecto.]
```

- [ ] **Step 3: Create the English MDX file**

Create `content/portfolio/en/slogs.mdx`:

```mdx
---
title: slogs
description: Full-stack logistics platform with real-time dashboard, route management, and shipment tracking.
date: 2026-05-08
role: Full Stack Developer
stack: [TypeScript, Python, FastAPI, Next.js, PostgreSQL]
github: https://github.com/serandmoncas/slogs
demo: ""
status: active
featured: true
image: /portfolio/slogs.png
---

## The problem

[Describe the business problem slogs solves — what logistics process was broken or inefficient.]

## The solution

[Describe the solution: what you built, how the dashboard works, what flows it covers.]

## Technical decisions

[Explain why you chose this stack — FastAPI for the backend, Next.js for the frontend, PostgreSQL for the database. What trade-offs did you consider.]

## Results

[Metrics, learnings, or what you achieved with this project.]
```

- [ ] **Step 4: Verify the project appears on /portfolio**

```bash
npm run dev
```

Open http://localhost:3000/es/portfolio — the slogs card should appear. Click it — the detail page at `/es/portfolio/slogs` should load with the sidebar showing the stack and GitHub link.

- [ ] **Step 5: Run all tests**

```bash
npm run test:run
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add content/portfolio/ public/portfolio/.gitkeep
git commit -m "feat: add slogs project content"
```

---

### Final: Full build verification

- [ ] **Step 1: Run lint**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 2: Run production build**

```bash
npm run build
```

Expected: no errors. Portfolio routes should appear in the output.

- [ ] **Step 3: Commit and push**

```bash
git push origin main
```

Vercel will auto-deploy. Verify https://sergiomonsalve.com/es/portfolio loads correctly.
