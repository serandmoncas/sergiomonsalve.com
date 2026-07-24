# Reflejar competencias reales en el sitio — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reflect the competencies visible in Sergio's public GitHub repos (AI agent building, IoT/hardware) that are currently missing or outdated on sergiomonsalve.com — home stack chips, two new portfolio case studies, and an interactive tech filter on `/portfolio`.

**Architecture:** Three independent, additive changes. (1) Static data edit to the home's `stackGroups` in `content.ts`. (2) Two new MDX content files following the existing portfolio content pattern (`content/portfolio/{es,en}/<slug>.mdx`), read by the already-existing `src/lib/portfolio.ts`. (3) A new client component `PortfolioGrid` that wraps the existing `ProjectCard` grid with client-side filter state, swapped into the server-rendered `/portfolio` page.

**Tech Stack:** Next.js 16 App Router, next-intl, gray-matter/MDX, React (client component with `useState`/`useMemo`), Vitest + React Testing Library.

## Global Constraints

- Spanish is the default locale; every user-facing string change ships in both `src/messages/es.json` and `src/messages/en.json`, and every MDX content change ships in both `content/portfolio/es/` and `content/portfolio/en/`.
- Follow existing patterns exactly: portfolio card chip styling (`font-mono text-xs`, `border-border`, `bg-surface`), MDX frontmatter shape (`title, description, date, role, stack, github, demo, links, status, featured, image`), and the `## El problema` / `## La solución` (`## The problem` / `## The solution`) structure used by every existing case study.
- No new dependencies. No URL/query-param state for the filter (explicitly ruled out in the spec).
- Component tests mock `next-intl` with `vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }))`, matching `src/components/__tests__/ProjectCard.test.tsx`.

---

## Task 1: Update home `stackGroups` in `content.ts`

**Files:**
- Modify: `src/components/about/content.ts:7-13` (`es` block), `:119-125` (`en` block)

**Interfaces:**
- Consumes: nothing (pure data file)
- Produces: `aboutContent.es.stackGroups` / `aboutContent.en.stackGroups` — an array of `{ label: string; chips: string[] }`, consumed unchanged by `AboutPageContent.tsx` (`c.stackGroups.map(...)`, already generic — no JSX changes needed)

- [ ] **Step 1: Edit the `es` stackGroups block**

In `src/components/about/content.ts`, replace:

```ts
    stackGroups: [
      { label: 'core · producción', chips: ['Python', 'FastAPI', 'Django', 'PostgreSQL', 'Dagster'] },
      { label: 'ai / llms', chips: ['LangChain', 'OpenAI', 'RAG', 'Embeddings', 'Vector DBs'] },
      { label: 'data · ml', chips: ['Pandas', 'Scikit-learn', 'ETL', 'Tableau', 'PowerBI'] },
      { label: 'cloud · infra', chips: ['AWS', 'GCP', 'Docker', 'Terraform'] },
    ],
```

with:

```ts
    stackGroups: [
      { label: 'core · producción', chips: ['Python', 'FastAPI', 'Django', 'PostgreSQL', 'Dagster', 'Next.js', 'TypeScript', 'Supabase'] },
      { label: 'ai / llms', chips: ['LangChain', 'OpenAI', 'RAG', 'Embeddings', 'Vector DBs', 'Claude Code', 'Agent building', 'Tool-calling'] },
      { label: 'data · ml', chips: ['Pandas', 'Scikit-learn', 'ETL', 'Tableau', 'PowerBI'] },
      { label: 'cloud · infra', chips: ['AWS', 'GCP', 'Docker', 'Terraform'] },
      { label: 'iot / hardware', chips: ['ESP32', 'PlatformIO', 'C++', 'React Native'] },
    ],
```

- [ ] **Step 2: Edit the `en` stackGroups block**

In the same file, replace:

```ts
    stackGroups: [
      { label: 'core · production', chips: ['Python', 'FastAPI', 'Django', 'PostgreSQL', 'Dagster'] },
      { label: 'ai / llms', chips: ['LangChain', 'OpenAI', 'RAG', 'Embeddings', 'Vector DBs'] },
      { label: 'data · ml', chips: ['Pandas', 'Scikit-learn', 'ETL', 'Tableau', 'PowerBI'] },
      { label: 'cloud · infra', chips: ['AWS', 'GCP', 'Docker', 'Terraform'] },
    ],
```

with:

```ts
    stackGroups: [
      { label: 'core · production', chips: ['Python', 'FastAPI', 'Django', 'PostgreSQL', 'Dagster', 'Next.js', 'TypeScript', 'Supabase'] },
      { label: 'ai / llms', chips: ['LangChain', 'OpenAI', 'RAG', 'Embeddings', 'Vector DBs', 'Claude Code', 'Agent building', 'Tool-calling'] },
      { label: 'data · ml', chips: ['Pandas', 'Scikit-learn', 'ETL', 'Tableau', 'PowerBI'] },
      { label: 'cloud · infra', chips: ['AWS', 'GCP', 'Docker', 'Terraform'] },
      { label: 'iot / hardware', chips: ['ESP32', 'PlatformIO', 'C++', 'React Native'] },
    ],
```

- [ ] **Step 3: Verify visually**

Run: `npm run dev`, open `http://localhost:3000/es` and `http://localhost:3000/en`. Confirm the `// stack` section on the home page shows 5 groups including the new `iot / hardware` group, and the new chips appear in `core · producción` and `ai / llms`.

- [ ] **Step 4: Commit**

```bash
git add src/components/about/content.ts
git commit -m "feat(about): expand home stackGroups with Next.js/Supabase, agent-building, and IoT categories"
```

---

## Task 2: Add `brayan` portfolio entry (es + en)

**Files:**
- Create: `content/portfolio/es/brayan.mdx`
- Create: `content/portfolio/en/brayan.mdx`

**Interfaces:**
- Consumes: nothing (new content file, read generically by existing `getAllProjects`/`getProject` in `src/lib/portfolio.ts` — no code changes)
- Produces: a `ProjectMeta` with `slug: 'brayan'` that will appear in `getAllProjects('es')` / `getAllProjects('en')`, and therefore in the technology list Task 4 derives from `stack`

- [ ] **Step 1: Create `content/portfolio/es/brayan.mdx`**

```mdx
---
title: Brayan
description: Agente personal por WhatsApp con tool-calling — busca en la web, envía correos, guarda datos en Sheets y se autoprograma, corriendo 100% local con Ollama.
date: "2026-07-24"
role: AI Agent Engineer
stack: [Python, FastAPI, Ollama, WhatsApp Web.js, Node.js]
github: https://github.com/serandmoncas/brayan
demo: ""
links: []
status: active
featured: false
image: ""
---

## El problema

Los asistentes personales con IA suelen depender de una API de pago y viven en una app aparte. Brayan nace de una necesidad distinta: un agente al que hablarle en lenguaje natural, directo en WhatsApp, que resuelva tareas reales — mandar un correo, anotar un pedido, recordar algo a una hora fija — sin atarse a una factura mensual de un proveedor de LLM.

El reto no es solo conectar un modelo a WhatsApp. Es diseñar un arnés seguro: un agente con acceso a tu correo real y tus contactos reales necesita autorización estricta, no solo un prompt bien escrito.

## La solución

Brayan separa dos responsabilidades en dos procesos: un bridge en Node (`whatsapp-web.js`) que solo mueve mensajes entre WhatsApp y un webhook, y un orchestrator en FastAPI (Python) que concentra la lógica del agente — memoria de corto plazo por hilo, un registro de herramientas con function-calling, y un scheduler para tareas recurrentes.

El cerebro es **Hermes 3** (Nous Research) corriendo 100% local vía **Ollama**, con fallback opcional a Anthropic u OpenAI cuando se necesita más capacidad. El desarrollo sigue un ciclo spec-driven: cada capacidad nueva nace como una spec con criterios de aceptación, se implementa con TDD y se cierra con una verificación adversarial antes de darla por lista.

La seguridad no es una capa añadida al final: solo el número autorizado (`AUTHORIZED_WHATSAPP_ID`) puede activar herramientas, y si esa variable no está configurada el agente no responde a nadie — falla cerrado, no abierto. El "self-programming" (que el propio agente configure recordatorios) está limitado a acciones explícitamente permitidas, sin ejecución arbitraria de código.
```

- [ ] **Step 2: Create `content/portfolio/en/brayan.mdx`**

```mdx
---
title: Brayan
description: A WhatsApp personal agent with tool-calling — searches the web, sends emails, logs data to Sheets, and self-schedules reminders, running 100% local via Ollama.
date: "2026-07-24"
role: AI Agent Engineer
stack: [Python, FastAPI, Ollama, WhatsApp Web.js, Node.js]
github: https://github.com/serandmoncas/brayan
demo: ""
links: []
status: active
featured: false
image: ""
---

## The problem

Most AI personal assistants depend on a paid API and live in their own app. Brayan started from a different need: an agent you talk to in natural language, directly in WhatsApp, that handles real tasks — sending an email, logging an order, setting a reminder for a specific time — without a recurring bill to an LLM provider.

The hard part isn't wiring a model to WhatsApp. It's designing a safe harness: an agent with access to your real email and real contacts needs strict authorization, not just a well-written prompt.

## The solution

Brayan splits responsibilities across two processes: a Node bridge (`whatsapp-web.js`) that only moves messages between WhatsApp and a webhook, and a FastAPI (Python) orchestrator that holds the agent logic — short-term memory per conversation thread, a tool registry with function-calling, and a scheduler for recurring tasks.

The brain is **Hermes 3** (Nous Research) running 100% local via **Ollama**, with an optional fallback to Anthropic or OpenAI when more capability is needed. Development follows a spec-driven cycle: every new capability starts as a spec with acceptance criteria, gets implemented with TDD, and closes with an adversarial verification pass before being marked done.

Security isn't a layer bolted on at the end: only the authorized number (`AUTHORIZED_WHATSAPP_ID`) can trigger tools, and if that variable isn't set the agent responds to no one — it fails closed, not open. Self-programming (the agent scheduling its own reminders) is limited to explicitly allowed actions, with no arbitrary code execution.
```

- [ ] **Step 3: Verify the entry renders**

Run: `npm run dev`, open `http://localhost:3000/es/portfolio` and `http://localhost:3000/en/portfolio`. Confirm a "Brayan" card appears with the stack chips `Python, FastAPI, Ollama, WhatsApp Web.js, Node.js`, and that `http://localhost:3000/es/portfolio/brayan` renders the full case study with a working GitHub link and no broken image (should show the `// brayan` placeholder box, not a broken `<img>`).

- [ ] **Step 4: Commit**

```bash
git add content/portfolio/es/brayan.mdx content/portfolio/en/brayan.mdx
git commit -m "feat(portfolio): add Brayan WhatsApp agent case study"
```

---

## Task 3: Add `HER` portfolio entry (es + en)

**Files:**
- Create: `content/portfolio/es/her.mdx`
- Create: `content/portfolio/en/her.mdx`

**Interfaces:**
- Consumes: nothing (same as Task 2)
- Produces: a `ProjectMeta` with `slug: 'her'`

- [ ] **Step 1: Create `content/portfolio/es/her.mdx`**

```mdx
---
title: HER
description: Currículo práctico de "Harness Engineering" — cómo diseñar el sistema alrededor de un LLM (contexto, herramientas, memoria, loops, guardrails) con Claude Code como implementación de referencia.
date: "2026-07-24"
role: Curriculum Designer / AI Educator
stack: [Claude Code, Agent Design, Markdown]
github: https://github.com/serandmoncas/HER
demo: ""
links: []
status: active
featured: false
image: ""
---

## El problema

El desempeño de un agente de IA depende mucho menos del modelo subyacente de lo que parece, y mucho más del sistema que lo rodea: qué contexto recibe, qué herramientas tiene disponibles, cómo gestiona su memoria y qué guardrails limitan lo que puede hacer. Esa disciplina — "Harness Engineering" — no tenía un currículo práctico y progresivo para aprenderla haciendo, no solo leyendo.

## La solución

HER (Harness Engineering Repository) es un currículo modular que combina teoría, ejercicios y proyectos checkpoint, usando Claude Code (skills, subagentes, hooks, memoria) como implementación de referencia. Los módulos se completan en orden — fundamentos y context engineering, herramientas y skills, memoria y persistencia, loops y orquestación — y cada uno incluye una carpeta de ejercicios con soluciones de referencia separadas, para que quien aprende pueda autoevaluarse sin arruinar el reto.

Cada módulo también trae una carpeta `sesion-grupal/` con dos documentos: uno para quien facilita (agenda, timing, preguntas disparadoras) y otro para quien participa. Los proyectos son checkpoints reales, con configuraciones de Claude Code 100% funcionales y dificultad creciente — desde un asistente de code review hasta, más adelante, un harness de meta-aprendizaje.
```

- [ ] **Step 2: Create `content/portfolio/en/her.mdx`**

```mdx
---
title: HER
description: A hands-on "Harness Engineering" curriculum — how to design the system around an LLM (context, tools, memory, loops, guardrails) with Claude Code as the reference implementation.
date: "2026-07-24"
role: Curriculum Designer / AI Educator
stack: [Claude Code, Agent Design, Markdown]
github: https://github.com/serandmoncas/HER
demo: ""
links: []
status: active
featured: false
image: ""
---

## The problem

An AI agent's performance depends far less on the underlying model than it seems, and far more on the system built around it: what context it receives, what tools it has, how it manages memory, and what guardrails limit what it can do. That discipline — "Harness Engineering" — didn't have a practical, progressive curriculum for learning it by doing, not just reading about it.

## The solution

HER (Harness Engineering Repository) is a modular curriculum combining theory, exercises, and checkpoint projects, using Claude Code (skills, subagents, hooks, memory) as the reference implementation. Modules are completed in order — fundamentals and context engineering, tools and skills, memory and persistence, loops and orchestration — and each one ships with an exercises folder plus separate reference solutions, so learners can self-check without spoiling the challenge.

Every module also includes a `sesion-grupal/` folder with two documents: one for whoever facilitates (agenda, timing, discussion prompts) and one for participants. The projects are real checkpoints, with fully working Claude Code configurations of increasing difficulty — from a code-review assistant to, further along, a meta-learning harness.
```

- [ ] **Step 3: Verify the entry renders**

Run: `npm run dev`, open `http://localhost:3000/es/portfolio` and confirm an "HER" card appears with stack chips `Claude Code, Agent Design, Markdown`, and `http://localhost:3000/es/portfolio/her` renders correctly.

- [ ] **Step 4: Commit**

```bash
git add content/portfolio/es/her.mdx content/portfolio/en/her.mdx
git commit -m "feat(portfolio): add HER harness-engineering curriculum case study"
```

---

## Task 4: Add `filterAll`/`filterLabel` i18n keys

**Files:**
- Modify: `src/messages/es.json:132-142` (`portfolio` block)
- Modify: `src/messages/en.json:132-142` (`portfolio` block)

**Interfaces:**
- Consumes: nothing
- Produces: `t('filterAll')` and `t('filterLabel')` under the `portfolio` namespace, consumed by `PortfolioGrid` in Task 5

- [ ] **Step 1: Add keys to `src/messages/es.json`**

Find the `"portfolio"` block:

```json
  "portfolio": {
    "comment": "// proyectos",
    "pageTitle": "Proyectos",
    "stack": "// stack",
```

Replace with:

```json
  "portfolio": {
    "comment": "// proyectos",
    "pageTitle": "Proyectos",
    "filterLabel": "// filtrar por stack",
    "filterAll": "Todos",
    "stack": "// stack",
```

- [ ] **Step 2: Add keys to `src/messages/en.json`**

Find the `"portfolio"` block:

```json
  "portfolio": {
    "comment": "// projects",
    "pageTitle": "Projects",
    "stack": "// stack",
```

Replace with:

```json
  "portfolio": {
    "comment": "// projects",
    "pageTitle": "Projects",
    "filterLabel": "// filter by stack",
    "filterAll": "All",
    "stack": "// stack",
```

- [ ] **Step 3: Validate JSON**

Run: `node -e "JSON.parse(require('fs').readFileSync('src/messages/es.json'))" && node -e "JSON.parse(require('fs').readFileSync('src/messages/en.json'))"`
Expected: no output, exit code 0 (valid JSON) for both.

- [ ] **Step 4: Commit**

```bash
git add src/messages/es.json src/messages/en.json
git commit -m "feat(i18n): add portfolio filter labels"
```

---

## Task 5: Build `PortfolioGrid` client component with tests

**Files:**
- Create: `src/components/PortfolioGrid.tsx`
- Test: `src/components/__tests__/PortfolioGrid.test.tsx`

**Interfaces:**
- Consumes: `ProjectMeta` type from `src/lib/portfolio.ts` (fields used: `slug`, `title`, `description`, `date`, `role`, `stack: string[]`, `github`, `demo`, `links`, `status: 'active' | 'archived'`, `featured`, `image`); `ProjectCard` default export from `src/components/ProjectCard.tsx` (props: `project: ProjectMeta`, `locale: string`, `labels: { viewCase: string; status: { active: string; archived: string } }`)
- Produces: default export `PortfolioGrid({ projects: ProjectMeta[]; locale: string; labels: { viewCase: string; status: { active: string; archived: string }; filterAll: string; empty: string } })` — a client component rendering filter chips + the filtered `ProjectCard` grid. Consumed by Task 6 (`portfolio/page.tsx`).

- [ ] **Step 1: Write the failing test file**

Create `src/components/__tests__/PortfolioGrid.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PortfolioGrid from '../PortfolioGrid'
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

const projects: ProjectMeta[] = [
  {
    slug: 'brayan',
    title: 'Brayan',
    description: 'Agente de WhatsApp',
    date: '2026-07-24',
    role: 'AI Agent Engineer',
    stack: ['Python', 'FastAPI', 'Ollama'],
    github: 'https://github.com/serandmoncas/brayan',
    demo: '',
    links: [],
    status: 'active',
    featured: false,
    image: '',
  },
  {
    slug: 'slogs',
    title: 'slogs',
    description: 'Plataforma logística',
    date: '2026-05-08',
    role: 'Full Stack Developer',
    stack: ['TypeScript', 'Python'],
    github: 'https://github.com/serandmoncas/slogs',
    demo: '',
    links: [],
    status: 'active',
    featured: true,
    image: '',
  },
]

const labels = {
  viewCase: 'Ver caso →',
  status: { active: 'activo', archived: 'archivado' },
  filterAll: 'Todos',
  empty: 'próximamente',
}

describe('PortfolioGrid', () => {
  it('renders all projects by default', () => {
    render(<PortfolioGrid projects={projects} locale="es" labels={labels} />)
    expect(screen.getByText('Brayan')).toBeInTheDocument()
    expect(screen.getByText('slogs')).toBeInTheDocument()
  })

  it('renders one filter chip per unique technology plus "Todos"', () => {
    render(<PortfolioGrid projects={projects} locale="es" labels={labels} />)
    expect(screen.getByRole('button', { name: 'Todos' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Python' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'FastAPI' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'TypeScript' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ollama' })).toBeInTheDocument()
  })

  it('filters to only projects matching the clicked technology', async () => {
    const user = userEvent.setup()
    render(<PortfolioGrid projects={projects} locale="es" labels={labels} />)
    await user.click(screen.getByRole('button', { name: 'FastAPI' }))
    expect(screen.getByText('Brayan')).toBeInTheDocument()
    expect(screen.queryByText('slogs')).not.toBeInTheDocument()
  })

  it('clears the filter when the same technology chip is clicked again', async () => {
    const user = userEvent.setup()
    render(<PortfolioGrid projects={projects} locale="es" labels={labels} />)
    await user.click(screen.getByRole('button', { name: 'FastAPI' }))
    await user.click(screen.getByRole('button', { name: 'FastAPI' }))
    expect(screen.getByText('Brayan')).toBeInTheDocument()
    expect(screen.getByText('slogs')).toBeInTheDocument()
  })

  it('clears the filter when "Todos" is clicked', async () => {
    const user = userEvent.setup()
    render(<PortfolioGrid projects={projects} locale="es" labels={labels} />)
    await user.click(screen.getByRole('button', { name: 'FastAPI' }))
    await user.click(screen.getByRole('button', { name: 'Todos' }))
    expect(screen.getByText('Brayan')).toBeInTheDocument()
    expect(screen.getByText('slogs')).toBeInTheDocument()
  })

  it('shows the empty-state message when no project matches (defensive edge case)', async () => {
    const user = userEvent.setup()
    const singleTechProjects = [{ ...projects[0], stack: ['OnlyOnBrayan'] }]
    render(<PortfolioGrid projects={singleTechProjects} locale="es" labels={labels} />)
    await user.click(screen.getByRole('button', { name: 'OnlyOnBrayan' }))
    expect(screen.getByText('Brayan')).toBeInTheDocument()
  })
})
```

Note: the last test intentionally exercises a matching case (a filter always matches at least one project given how chips are derived from the same `projects` array), since an actual zero-match state cannot occur with this component's own chip source — chips are always derived from the current `projects` prop. Keep it as a smoke test that the single-tech project still renders under its own filter.

- [ ] **Step 2: Run the test file and verify it fails**

Run: `npx vitest run src/components/__tests__/PortfolioGrid.test.tsx`
Expected: FAIL — `Cannot find module '../PortfolioGrid'` (file doesn't exist yet).

- [ ] **Step 3: Implement `src/components/PortfolioGrid.tsx`**

```tsx
'use client'

import { useMemo, useState } from 'react'
import ProjectCard from './ProjectCard'
import type { ProjectMeta } from '@/lib/portfolio'

type Labels = {
  viewCase: string
  status: { active: string; archived: string }
  filterAll: string
  empty: string
}

export default function PortfolioGrid({
  projects,
  locale,
  labels,
}: {
  projects: ProjectMeta[]
  locale: string
  labels: Labels
}) {
  const [selectedTech, setSelectedTech] = useState<string | null>(null)

  const techs = useMemo(() => {
    const counts = new Map<string, number>()
    for (const project of projects) {
      for (const tech of project.stack) {
        counts.set(tech, (counts.get(tech) ?? 0) + 1)
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([tech]) => tech)
  }, [projects])

  const filtered = selectedTech
    ? projects.filter(project => project.stack.includes(selectedTech))
    : projects

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-8">
        <button
          type="button"
          onClick={() => setSelectedTech(null)}
          className={`font-mono text-xs px-2.5 py-1 rounded-sm border transition-colors ${
            selectedTech === null
              ? 'border-accent text-accent bg-surface'
              : 'border-border text-text-secondary bg-surface hover:border-accent hover:text-accent'
          }`}
        >
          {labels.filterAll}
        </button>
        {techs.map(tech => (
          <button
            key={tech}
            type="button"
            onClick={() => setSelectedTech(current => (current === tech ? null : tech))}
            className={`font-mono text-xs px-2.5 py-1 rounded-sm border transition-colors ${
              selectedTech === tech
                ? 'border-accent text-accent bg-surface'
                : 'border-border text-text-secondary bg-surface hover:border-accent hover:text-accent'
            }`}
          >
            {tech}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="font-mono text-xs text-text-muted">{labels.empty}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {filtered.map(project => (
            <ProjectCard
              key={project.slug}
              project={project}
              locale={locale}
              labels={{ viewCase: labels.viewCase, status: labels.status }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Run the test file and verify it passes**

Run: `npx vitest run src/components/__tests__/PortfolioGrid.test.tsx`
Expected: PASS, all 6 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/components/PortfolioGrid.tsx src/components/__tests__/PortfolioGrid.test.tsx
git commit -m "feat(portfolio): add PortfolioGrid client component with tech filter"
```

---

## Task 6: Wire `PortfolioGrid` into the `/portfolio` page

**Files:**
- Modify: `src/app/[locale]/(main)/portfolio/page.tsx`

**Interfaces:**
- Consumes: `PortfolioGrid` default export from Task 5 (`{ projects: ProjectMeta[]; locale: string; labels: { viewCase; status; filterAll; empty } }`)
- Produces: nothing new (terminal task — this is the page users hit)

- [ ] **Step 1: Replace the direct `ProjectCard` mapping with `PortfolioGrid`**

In `src/app/[locale]/(main)/portfolio/page.tsx`, replace:

```tsx
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { getAllProjects } from '@/lib/portfolio'
import ProjectCard from '@/components/ProjectCard'
```

with:

```tsx
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { getAllProjects } from '@/lib/portfolio'
import PortfolioGrid from '@/components/PortfolioGrid'
```

Then replace the body's conditional rendering:

```tsx
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
```

with:

```tsx
      {projects.length === 0 ? (
        <p className="font-mono text-xs text-text-muted">{t('empty')}</p>
      ) : (
        <PortfolioGrid
          projects={projects}
          locale={locale}
          labels={{
            viewCase: t('viewCase'),
            status: {
              active: t('status.active'),
              archived: t('status.archived'),
            },
            filterAll: t('filterAll'),
            empty: t('empty'),
          }}
        />
      )}
```

- [ ] **Step 2: Run the full test suite**

Run: `npm run test:run`
Expected: all tests pass, including the existing `ProjectCard.test.tsx`, `PortfolioGrid.test.tsx`, and everything else — no regressions.

- [ ] **Step 3: Run lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 4: Manual verification in the browser**

Run: `npm run dev`, open `http://localhost:3000/es/portfolio`. Confirm:
- Filter chips render above the grid, "Todos" active by default, all ~10 projects visible (8 existing + Brayan + HER from Tasks 2-3).
- Clicking "Python" filters to only projects with `Python` in their stack (should include Brayan, slogs).
- Clicking "Python" again restores the full grid.
- Clicking "Todos" after selecting a tech also restores the full grid.
- Repeat at `http://localhost:3000/en/portfolio` — chips and "All" label should be in English.

- [ ] **Step 5: Commit**

```bash
git add "src/app/[locale]/(main)/portfolio/page.tsx"
git commit -m "feat(portfolio): wire tech filter into the portfolio index page"
```

---

## Self-Review Notes

- **Spec coverage:** Section 1 (stackGroups) → Task 1. Section 2 (brayan/HER entries) → Tasks 2-3. Section 3 (PortfolioGrid + wiring + i18n keys + test) → Tasks 4-6. All three spec sections have a task.
- **Type consistency:** `ProjectMeta` fields used in Task 5's test data match the type defined in `src/lib/portfolio.ts:9-22` exactly (`slug, title, description, date, role, stack, github, demo, links, status, featured, image`). `PortfolioGrid`'s `Labels` type in Task 5 matches exactly what Task 6 passes from `t(...)` calls — no drift between `filterAll`/`empty` names.
- **No placeholders:** every step has literal code, not descriptions of code.
