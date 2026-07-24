# Reflejar competencias reales en el sitio — Design Spec

**Fecha:** 2026-07-24
**Solicitante:** Sergio Monsalve
**Contexto:** Revisión de `https://github.com/serandmoncas?tab=repositories` mostró que varios repos públicos representan competencias que hoy no aparecen (bien, o del todo) en `sergiomonsalve.com`: agent-building / harness engineering (`brayan`, `HER`), IoT/embebidos (`mobile-esp32`/CarritoBot — ya en portfolio, `Bichongos` firmware), y un stack de home (`content.ts`) desactualizado frente a lo que realmente se usa en los proyectos ya publicados (Next.js, TypeScript, Supabase).

Hallazgo clave durante el brainstorming: `/about` ya redirige a `/` porque la home (`AboutPageContent` + `content.ts`) **ya es** una página "about" completa con `stackGroups` categorizados, timeline de experiencia, educación, "/now" y CTA. No se necesita construir una página nueva — el trabajo es actualizar contenido existente y llenar huecos puntuales en `/portfolio`.

## Alcance

Tres cambios independientes, cada uno de bajo riesgo (datos + un componente nuevo):

1. Actualizar `stackGroups` en `src/components/about/content.ts` (es/en).
2. Agregar dos entradas de portfolio: `brayan` y `HER`.
3. Nube de tags interactiva en `/portfolio` que filtra proyectos por tecnología.

Fuera de alcance (decidido explícitamente durante el brainstorming): no se toca la narrativa/timeline de experiencia en la home, no se agrega una entrada de portfolio separada para el firmware IoT de `Bichongos` (ya representado indirectamente vía CarritoBot y la nueva categoría `iot / hardware`), no se filtra por URL/query param (con ~10 proyectos no se justifica).

## 1. `content.ts` — stackGroups actualizados

Archivo: `src/components/about/content.ts` (bloques `es` y `en`, mismo array `stackGroups` en ambos idiomas, valores traducidos donde aplique).

Cambios sobre los 4 grupos existentes + 1 grupo nuevo:

- **`core · producción`**: agregar `Next.js`, `TypeScript`, `Supabase` (ya en uso en sergiomonsalve.com, Bichongos, InteliFin, slogs, SAMA Mobile).
- **`ai / llms`**: agregar `Claude Code`, `Agent building`, `Tool-calling` junto a los existentes (LangChain, OpenAI, RAG, Embeddings, Vector DBs).
- **`data · ml`**: sin cambios.
- **`cloud · infra`**: sin cambios.
- **Nuevo grupo `iot / hardware`**: `ESP32`, `PlatformIO`, `C++`, `React Native` — inserta después de `cloud · infra` y antes del grupo `learning`.
- **`learning · 2026`**: sin cambios (ya cubre "diseño de agentes").

No se modifica la estructura de `AboutPageContent.tsx` — el layout ya itera `c.stackGroups` genéricamente, así que agregar un grupo nuevo funciona sin tocar JSX.

## 2. Nuevas entradas de portfolio

Mismo patrón que las 8 entradas existentes: `content/portfolio/{es,en}/<slug>.mdx`, frontmatter completo, cuerpo en `## El problema` / `## La solución`.

### `brayan.mdx`

```yaml
title: Brayan
description: <resumen 1-2 líneas, tono consistente con el resto>
date: "2026-07-24"
role: AI Agent Engineer
stack: [Python, FastAPI, Ollama, WhatsApp Web.js, Node.js]
github: https://github.com/serandmoncas/brayan
demo: ""
links: []
status: active
featured: false
image: ""
```

Contenido: el problema (asistente personal por WhatsApp sin depender de una API de pago), la solución (arquitectura bridge Node + orchestrator FastAPI, cerebro Hermes 3 local vía Ollama con fallback a Anthropic/OpenAI, tool registry con function-calling, scheduler para "self-programming" seguro, gate de autorización que falla cerrado). Fuente: README del repo (ya leído durante el brainstorming).

### `her.mdx`

```yaml
title: HER
description: <resumen 1-2 líneas>
date: "2026-07-24"
role: Curriculum Designer / AI Educator
stack: [Claude Code, Agent Design, Markdown]
github: https://github.com/serandmoncas/HER
demo: ""
links: []
status: active
featured: false
image: ""
```

Contenido: el problema (falta de un currículo práctico de "harness engineering" — el diseño del sistema alrededor de un LLM: contexto, herramientas, memoria, loops, guardrails), la solución (módulos progresivos con teoría + ejercicios + sesión grupal, proyectos checkpoint con configuraciones de Claude Code funcionales). Fuente: README del repo.

Ambas entradas usan `image: ""` — `ProjectCard` y la página de detalle ya manejan ese caso mostrando el placeholder `// <slug>` existente; no se generan imágenes nuevas.

Sergio escribe/ajusta la copia final de `description` y el cuerpo MDX en revisión; el spec fija estructura y contenido factual, no la redacción palabra por palabra.

## 3. Nube de competencias interactiva en `/portfolio`

**Nuevo componente:** `src/components/PortfolioGrid.tsx` (client component).

```ts
'use client'
function PortfolioGrid({
  projects: ProjectMeta[],
  locale: string,
  labels: { viewCase, status, filterAll },
}) { ... }
```

- Deriva la lista de tecnologías únicas de `projects[].stack` con `useMemo`, ordenadas por frecuencia descendente (más usada primero; empates en orden alfabético).
- Estado local `selectedTech: string | null` vía `useState`. Un chip "Todos" (`labels.filterAll`) siempre visible y activo por defecto.
- Clic en un chip de tecnología → `selectedTech = tech`, filtra `projects` a los que incluyen esa tecnología en `stack`. Clic en el mismo chip otra vez, o en "Todos" → limpia el filtro.
- Chips de filtro reutilizan el estilo visual ya usado en `ProjectCard` para los chips de stack (mismo `font-mono text-xs`, borde, `bg-surface`), con el chip activo distinguido por `border-accent text-accent`.
- Grilla de resultados: misma estructura `grid grid-cols-1 sm:grid-cols-2 gap-6` que hoy, mapeando a `<ProjectCard>` sin cambios en ese componente.
- Sin resultados (edge case, poco probable con el catálogo actual): reutiliza el mensaje `t('empty')`.

**Cambio en `src/app/[locale]/(main)/portfolio/page.tsx`:** sigue siendo server component, sigue llamando `getAllProjects(locale)`, pero en vez de mapear `ProjectCard` directamente renderiza `<PortfolioGrid projects={projects} locale={locale} labels={{...}} />`. El bloque `projects.length === 0` (estado vacío global) se mantiene en el server component, antes de montar `PortfolioGrid`.

**i18n:** namespace `portfolio` en `es.json`/`en.json`, dos claves nuevas:
- `filterAll`: "Todos" / "All"
- `filterLabel`: "// filtrar por stack" / "// filter by stack"

## Testing

- Test de componente para `PortfolioGrid` (co-ubicado en `src/components/__tests__/`): render inicial muestra todos los proyectos, clic en un chip filtra correctamente, clic de nuevo limpia el filtro. Mock de `next-intl` según convención del repo.
- Sin tests nuevos para `content.ts` (datos estáticos) ni para las entradas MDX (contenido, no lógica) — consistente con cómo se tratan las entradas de portfolio existentes.

## Riesgo y reversibilidad

Los tres cambios son aditivos y de bajo riesgo: `content.ts` es un archivo de datos, las entradas MDX son archivos nuevos que no afectan nada existente, y `PortfolioGrid` reemplaza el mapeo directo en un único page.tsx sin tocar `ProjectCard` ni `lib/portfolio.ts`. Revertir cualquiera de los tres no afecta a los otros dos.
