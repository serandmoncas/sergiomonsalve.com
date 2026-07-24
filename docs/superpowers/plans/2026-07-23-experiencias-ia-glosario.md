# Glosario para Experiencias IA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a 40-term glossary to the "Experiencias IA" section — an index page grouped by 4 categories, with each term opening its own detail subpage (definition, optional example, optional external reference, optional link to the originating session).

**Architecture:** A new, isolated data file (`src/lib/experiencias-ia/glosario.ts`) holds all 40 terms — kept separate from `data.ts` so that file's "exact transcription of `data.js`" guarantee stays intact. Two new routes under `src/app/[locale]/experiencias-ia/glosario/` (an index and a `[slug]` detail page) follow the same index+detail pattern already used for sessions. A 6th nav item is added to `ExperienciasNav`.

**Tech Stack:** Next.js 16 App Router, TypeScript, Vitest.

## Global Constraints

- The glossary's content (definitions, examples, references) was authored under an explicit exception to the section's usual "no invented content" rule, granted by Sergio on 2026-07-23 — see `docs/superpowers/specs/2026-07-23-experiencias-ia-glosario-design.md` sections 1 and 4 for the full rationale and the complete, approved 40-term content.
- **Never fabricate a reference URL.** Every `referencia.url` in this plan was independently fetched and confirmed reachable (HTTP 200) on 2026-07-23 before being included here. If a term has no verified reference, its `referencia` field is simply absent — do not add one.
- `data.ts` is NOT modified by this plan — it remains an exact transcription of `data.js`. The glossary is a fully separate file.
- 40 terms total, exactly 10 per category, in this fixed category order: `fundamentos` → `contexto-memoria` → `seguridad-control` → `operacion-evaluacion`.
- `sesionOrigen` (when present) must be a real `n` that exists in `SESIONES` — a broken link to a nonexistent session is a Critical defect.
- Usable at 360px width with no horizontal scroll (same standard as the rest of the section).

---

### Task 1: Modelo de datos del glosario (glosario.ts + tests)

**Files:**
- Create: `src/lib/experiencias-ia/glosario.ts`
- Test: `src/lib/experiencias-ia/__tests__/glosario.test.ts`

**Interfaces:**
- Consumes: nothing new (no dependency on `data.ts` — `sesionOrigen` is a plain `number`, resolved against `SESIONES` only by the pages that render it, in later tasks).
- Produces: types `CategoriaGlosario`, `TipoReferencia`, `ReferenciaGlosario`, `TerminoGlosario`; constants `CATEGORIAS`, `ORDEN_CATEGORIAS`, `GLOSARIO`; functions `getTerminosPorCategoria(categoria: CategoriaGlosario): TerminoGlosario[]`, `getTermino(slug: string): TerminoGlosario | undefined`. Every later task imports from this module — no other task re-declares this content.

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/experiencias-ia/__tests__/glosario.test.ts
import { describe, it, expect } from 'vitest'
import { SESIONES } from '../data'
import {
  GLOSARIO,
  CATEGORIAS,
  ORDEN_CATEGORIAS,
  getTerminosPorCategoria,
  getTermino,
} from '../glosario'

describe('GLOSARIO', () => {
  it('has exactly 40 entries', () => {
    expect(GLOSARIO).toHaveLength(40)
  })

  it('has all unique slugs', () => {
    const slugs = GLOSARIO.map(t => t.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('every sesionOrigen present corresponds to a real session in SESIONES', () => {
    const sesionNumeros = new Set(SESIONES.map(s => s.n))
    const conOrigen = GLOSARIO.filter(t => t.sesionOrigen !== undefined)
    expect(conOrigen.length).toBeGreaterThan(0)
    for (const termino of conOrigen) {
      expect(sesionNumeros.has(termino.sesionOrigen!)).toBe(true)
    }
  })
})

describe('ORDEN_CATEGORIAS', () => {
  it('has the 4 categories in the fixed order', () => {
    expect(ORDEN_CATEGORIAS).toEqual([
      'fundamentos',
      'contexto-memoria',
      'seguridad-control',
      'operacion-evaluacion',
    ])
  })

  it('CATEGORIAS has a human label for every category', () => {
    for (const categoria of ORDEN_CATEGORIAS) {
      expect(CATEGORIAS[categoria]).toBeTruthy()
    }
  })
})

describe('getTerminosPorCategoria', () => {
  it('returns exactly 10 terms for each of the 4 categories', () => {
    for (const categoria of ORDEN_CATEGORIAS) {
      expect(getTerminosPorCategoria(categoria)).toHaveLength(10)
    }
  })
})

describe('getTermino', () => {
  it('returns the term matching the slug', () => {
    const termino = getTermino('prompt-engineering')
    expect(termino?.termino).toBe('Prompt engineering')
  })

  it('returns undefined for a non-existent slug', () => {
    expect(getTermino('no-existe')).toBeUndefined()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npx vitest run src/lib/experiencias-ia/__tests__/glosario.test.ts
```

Expected: FAIL — `../glosario` module does not exist yet.

- [ ] **Step 3: Create `src/lib/experiencias-ia/glosario.ts`**

```ts
// ============================================================
// Glosario de Experiencias IA
// Contenido autorizado bajo excepción explícita a la regla de "no
// inventar contenido" — ver docs/superpowers/specs/2026-07-23-experiencias-ia-glosario-design.md
// secciones 1 y 4. Cada `referencia.url` fue verificada como
// alcanzable (HTTP 200) antes de incluirse aquí — nunca se fabrica
// una URL: si no hay una referencia verificada, el campo se omite.
// ============================================================

export type CategoriaGlosario = 'fundamentos' | 'contexto-memoria' | 'seguridad-control' | 'operacion-evaluacion'
export type TipoReferencia = 'articulo' | 'paper' | 'libro' | 'sitio' | 'video'

export type ReferenciaGlosario = {
  titulo: string
  url: string
  tipo: TipoReferencia
}

export type TerminoGlosario = {
  slug: string
  termino: string
  definicion: string
  categoria: CategoriaGlosario
  sesionOrigen?: number
  ejemplo?: string
  referencia?: ReferenciaGlosario
}

export const CATEGORIAS: Record<CategoriaGlosario, string> = {
  'fundamentos': 'Fundamentos',
  'contexto-memoria': 'Contexto y memoria',
  'seguridad-control': 'Seguridad y control',
  'operacion-evaluacion': 'Operación y evaluación',
}

export const ORDEN_CATEGORIAS: CategoriaGlosario[] = [
  'fundamentos',
  'contexto-memoria',
  'seguridad-control',
  'operacion-evaluacion',
]

export const GLOSARIO: TerminoGlosario[] = [
  // ---------- Fundamentos ----------
  {
    slug: 'prompt-engineering',
    termino: 'Prompt engineering',
    definicion: 'Un turno.',
    categoria: 'fundamentos',
    sesionOrigen: 7,
    ejemplo:
      "Cambiar 'resume esto' por 'resume esto en 3 viñetas, tono neutro, máximo 50 palabras' es prompt engineering: mejorar la instrucción de un solo turno.",
    referencia: {
      titulo: 'Simon Willison — Context engineering',
      url: 'https://simonwillison.net/2025/Jun/27/context-engineering/',
      tipo: 'articulo',
    },
  },
  {
    slug: 'context-engineering',
    termino: 'Context engineering',
    definicion: 'Una sesión.',
    categoria: 'fundamentos',
    sesionOrigen: 7,
    ejemplo:
      'Decidir qué documentos, historial de conversación y resultados de herramientas caben en la ventana de contexto de un agente antes de que responda — no es una instrucción, es diseñar todo el entorno informativo de la tarea.',
    referencia: {
      titulo: 'Simon Willison — Context engineering',
      url: 'https://simonwillison.net/2025/Jun/27/context-engineering/',
      tipo: 'articulo',
    },
  },
  {
    slug: 'harness-engineering',
    termino: 'Harness engineering',
    definicion:
      'Trabajo continuo: horas y cientos de decisiones, con herramientas, validación y restricciones arquitectónicas.',
    categoria: 'fundamentos',
    sesionOrigen: 7,
    ejemplo:
      'Un agente borra un archivo por error una vez; en vez de solo corregirlo, se agrega una regla permanente al harness (por ejemplo, un hook que bloquea `rm -rf` sin confirmación) para que ese error se vuelva estructuralmente imposible.',
    referencia: {
      titulo: 'Mitchell Hashimoto — My AI Adoption Journey (sección "Engineering the harness")',
      url: 'https://mitchellh.com/writing/my-ai-adoption-journey',
      tipo: 'articulo',
    },
  },
  {
    slug: 'patron-de-hashimoto',
    termino: 'Patrón de Hashimoto',
    definicion:
      'Cada error del agente se convierte en un arreglo permanente del entorno; el sistema se realimenta y mejora a sí mismo.',
    categoria: 'fundamentos',
    sesionOrigen: 7,
  },
  {
    slug: 'cinco-primitivas',
    termino: 'Cinco primitivas',
    definicion:
      'Sistema de archivos, ejecución de código, sandbox controlado, memoria persistente y gestión de contexto.',
    categoria: 'fundamentos',
    sesionOrigen: 7,
  },
  {
    slug: 'rag',
    termino: 'RAG (Retrieval-Augmented Generation)',
    definicion:
      'Técnica que recupera información de una fuente externa antes de generar la respuesta, en vez de depender solo del conocimiento entrenado en el modelo.',
    categoria: 'fundamentos',
    ejemplo:
      "Antes de responder una pregunta sobre una póliza de seguros, el sistema busca primero el documento real de esa póliza y se lo pasa al modelo como contexto, en vez de confiar en lo que el modelo 'recuerda' de su entrenamiento.",
    referencia: {
      titulo: 'Lewis et al. — Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks (2020)',
      url: 'https://arxiv.org/abs/2005.11401',
      tipo: 'paper',
    },
  },
  {
    slug: 'mcp',
    termino: 'MCP (Model Context Protocol)',
    definicion:
      'Protocolo abierto para conectar modelos con herramientas y fuentes de datos externas de forma estandarizada.',
    categoria: 'fundamentos',
    ejemplo:
      'Un servidor MCP de Supabase le permite a un agente consultar tablas reales de una base de datos sin que el desarrollador tenga que escribir código de integración a mano.',
    referencia: {
      titulo: 'Anthropic — Introducing the Model Context Protocol',
      url: 'https://www.anthropic.com/news/model-context-protocol',
      tipo: 'articulo',
    },
  },
  {
    slug: 'skills',
    termino: 'Skills',
    definicion:
      'Unidades modulares de comportamiento o conocimiento que se le enseñan a un agente para una tarea específica.',
    categoria: 'fundamentos',
    sesionOrigen: 2,
    ejemplo:
      "Una skill de 'generar factura' le enseña al agente el formato exacto, los campos obligatorios y el tono de las facturas de una empresa específica, para no repetir esas instrucciones cada vez.",
  },
  {
    slug: 'skill-creator',
    termino: 'Skill creator',
    definicion:
      'Skill de Anthropic para construir otras skills; camino para profesionalizar el uso de IA en vez de improvisar cada vez.',
    categoria: 'fundamentos',
    sesionOrigen: 4,
    referencia: {
      titulo: 'Anthropic — Extend Claude with skills (documentación oficial)',
      url: 'https://code.claude.com/docs/en/skills',
      tipo: 'sitio',
    },
  },
  {
    slug: 'agentes',
    termino: 'Agentes',
    definicion: 'Sistemas que usan un modelo para decidir y ejecutar acciones de forma autónoma, no solo responder texto.',
    categoria: 'fundamentos',
    sesionOrigen: 8,
  },

  // ---------- Contexto y memoria ----------
  {
    slug: 'gestion-de-contexto',
    termino: 'Gestión de contexto',
    definicion: 'Administrar qué información cabe y permanece relevante dentro de la ventana de contexto de un modelo.',
    categoria: 'contexto-memoria',
    sesionOrigen: 2,
    ejemplo:
      'Decidir si un historial completo de chat cabe en la ventana de contexto o si hay que resumirlo antes de la siguiente pregunta.',
  },
  {
    slug: 'memoria-persistente',
    termino: 'Memoria persistente',
    definicion: 'Información que un agente conserva entre sesiones, más allá de una sola conversación.',
    categoria: 'contexto-memoria',
    sesionOrigen: 5,
  },
  {
    slug: 'revelacion-progresiva',
    termino: 'Revelación progresiva',
    definicion: 'Entregarle contexto al modelo por capas, según lo va necesitando, en vez de todo de una vez.',
    categoria: 'contexto-memoria',
    ejemplo:
      'En vez de darle a un agente el manual completo de 200 páginas de una vez, se le entrega solo la sección que necesita para el paso actual, y la siguiente cuando la pida.',
  },
  {
    slug: 'poda-de-contexto',
    termino: 'Poda de contexto',
    definicion: 'Eliminar deliberadamente información acumulada que ya no aporta, para no saturar la ventana de contexto.',
    categoria: 'contexto-memoria',
    ejemplo:
      'Borrar deliberadamente los primeros 20 mensajes de una conversación larga cuando ya no aportan, para dejarle espacio a información nueva y relevante.',
  },
  {
    slug: 'obsidian',
    termino: 'Obsidian',
    definicion: 'Herramienta de notas enlazadas usada por varios del grupo como base de un "segundo cerebro".',
    categoria: 'contexto-memoria',
    sesionOrigen: 2,
  },
  {
    slug: 'segundo-cerebro',
    termino: 'Segundo cerebro',
    definicion: 'Sistema personal (típicamente en Obsidian) para centralizar contexto, ideas y notas de forma conectada.',
    categoria: 'contexto-memoria',
    ejemplo:
      "Guardar en Obsidian las notas de cada cliente, enlazadas entre sí, para poder preguntar 'qué sé de este cliente' en vez de buscar en la memoria o en correos sueltos.",
    referencia: {
      titulo: 'Tiago Forte — Building a Second Brain',
      url: 'https://www.buildingasecondbrain.com/book',
      tipo: 'libro',
    },
  },
  {
    slug: 'jarvis',
    termino: 'Jarvis (asistente personal)',
    definicion:
      'Proyecto tipo asistente personal que integra calendario, correo, WhatsApp y notas; limitado hoy por falta de memoria persistente real.',
    categoria: 'contexto-memoria',
    sesionOrigen: 5,
  },
  {
    slug: 'mempalas',
    termino: 'MemPalas',
    definicion:
      'Herramienta de memoria institucional basada en la técnica de palacios de memoria, aplicada a bases de datos no estructuradas.',
    categoria: 'contexto-memoria',
    sesionOrigen: 3,
    ejemplo:
      'Asociar cada proceso interno de una oficina con un lugar imaginario de un edificio conocido, para recordar el orden de los pasos sin necesidad de un manual escrito.',
    referencia: {
      titulo: 'Joshua Foer — Moonwalking with Einstein',
      url: 'https://www.goodreads.com/book/show/6346975-moonwalking-with-einstein',
      tipo: 'libro',
    },
  },
  {
    slug: 'infoxicacion',
    termino: 'Infoxicación',
    definicion:
      'Saturación por exceso de información, concepto de Alfons Cornellá que el grupo adoptó para nombrar la fatiga de estar al día con IA.',
    categoria: 'contexto-memoria',
    sesionOrigen: 2,
  },
  {
    slug: 'encapsulamiento',
    termino: 'Encapsulamiento',
    definicion:
      'Aislar una funcionalidad para que se pueda usar sin conocer su implementación interna — principio de diseño que el grupo aplica también al contexto que se le da a un modelo.',
    categoria: 'contexto-memoria',
    ejemplo:
      'Un componente de interfaz que solo expone un botón con un texto, sin que quien lo usa tenga que saber cómo se implementa el estilo o el evento de clic por dentro.',
  },

  // ---------- Seguridad y control ----------
  {
    slug: 'friccion-productiva',
    termino: 'Fricción productiva',
    definicion:
      'Puertas de diseño que obligan a un acto deliberado antes de avanzar; lo que realmente frena el sesgo de automatización, no la fuerza de voluntad.',
    categoria: 'seguridad-control',
    sesionOrigen: 7,
    ejemplo:
      'Exigir que un plan de implementación sea aprobado explícitamente antes de que el agente toque código — ese paso extra es la fricción que evita que el sesgo de automatización apruebe algo mal sin revisar.',
  },
  {
    slug: 'metodologia-nemesis',
    termino: 'Metodología Némesis',
    definicion:
      'Enfoque de interacción crítica y adversarial con los modelos, para no aceptar sus respuestas sin cuestionarlas.',
    categoria: 'seguridad-control',
    sesionOrigen: 6,
    ejemplo:
      'En vez de aceptar la primera respuesta de un modelo, pedirle explícitamente que argumente el caso contrario, para exponer los puntos débiles del razonamiento original.',
  },
  {
    slug: 'seguridad-en-codigo-generado',
    termino: 'Seguridad en código generado',
    definicion: 'Disciplina de no confiar ciegamente en código producido por IA sin auditoría técnica antes de producción.',
    categoria: 'seguridad-control',
    sesionOrigen: 6,
  },
  {
    slug: 'huellas-de-modelos',
    termino: 'Huellas de modelos',
    definicion: 'Patrones o estilos de escritura identificables que delatan qué modelo generó un texto.',
    categoria: 'seguridad-control',
  },
  {
    slug: 'escepticismo-productivo',
    termino: 'Escepticismo productivo',
    definicion:
      'Postura crítica frente a la automatización total que, en vez de rechazarla, exige supervisión rigurosa.',
    categoria: 'seguridad-control',
  },
  {
    slug: 'auditoria-de-codigo-ia',
    termino: 'Auditoría de código IA',
    definicion:
      'Revisión técnica deliberada de código generado antes de llevarlo a producción, en vez de asumir que "compila" significa "está bien".',
    categoria: 'seguridad-control',
    sesionOrigen: 6,
  },
  {
    slug: 'supervision-humana',
    termino: 'Supervisión humana',
    definicion:
      'Principio recurrente del grupo: la IA multiplica capacidades pero no reemplaza el juicio ni la responsabilidad ética de quien la usa.',
    categoria: 'seguridad-control',
  },
  {
    slug: 'agi',
    termino: 'AGI (inteligencia artificial general)',
    definicion:
      'Hipotética IA con capacidad cognitiva general equivalente o superior a la humana; tema de debate sobre sus argumentos prácticos, no solo especulativos.',
    categoria: 'seguridad-control',
    referencia: {
      titulo: 'Artificial general intelligence',
      url: 'https://en.wikipedia.org/wiki/Artificial_general_intelligence',
      tipo: 'sitio',
    },
  },
  {
    slug: 'etica-y-alucinaciones',
    termino: 'Ética y alucinaciones',
    definicion:
      'Debate fundacional del grupo sobre los riesgos de confiar en respuestas incorrectas generadas con total seguridad, especialmente en derecho y medicina.',
    categoria: 'seguridad-control',
    sesionOrigen: 1,
  },
  {
    slug: 'gsd',
    termino: 'GSD (Getting Stuff Done, marco)',
    definicion:
      'Marco de trabajo orientado a ejecución práctica más que a teoría, promovido como forma de estructurar el uso de IA en tareas reales.',
    categoria: 'seguridad-control',
  },

  // ---------- Operación y evaluación ----------
  {
    slug: 'loop-engineering',
    termino: 'Loop Engineering',
    definicion: 'Complemento del harness engineering enfocado en los ciclos de retroalimentación del desarrollo con agentes.',
    categoria: 'operacion-evaluacion',
    sesionOrigen: 7,
    ejemplo:
      'Un agente de codificación que revisa su propio diff, corre los tests, y si fallan vuelve a intentar antes de reportar terminado — el ciclo completo, no solo la respuesta inicial, es lo que se diseña.',
    referencia: {
      titulo: 'IBM — What Is Loop Engineering?',
      url: 'https://www.ibm.com/think/topics/loop-engineering',
      tipo: 'articulo',
    },
  },
  {
    slug: 'vibe-engineering',
    termino: 'Vibe Engineering',
    definicion:
      'Crítica a la ilusión de velocidad al programar con IA y a la deuda técnica que se acumula cuando no hay disciplina detrás.',
    categoria: 'operacion-evaluacion',
    ejemplo:
      "Aceptar todos los cambios que sugiere un agente sin revisar el diff porque 'se ve bien' es vibe coding; la crítica del grupo es que eso acumula deuda técnica invisible hasta que algo se rompe en producción.",
    referencia: {
      titulo: 'Simon Willison — Not all AI-assisted programming is vibe coding',
      url: 'https://simonwillison.net/2025/Mar/19/vibe-coding/',
      tipo: 'articulo',
    },
  },
  {
    slug: 'backlog-de-tickets',
    termino: 'Backlog de tickets',
    definicion:
      'Dividir un proyecto en tareas discretas y rastreables para mantener control sobre el avance, en vez de avanzar sin estructura.',
    categoria: 'operacion-evaluacion',
    sesionOrigen: 3,
  },
  {
    slug: 'pruebas-automatizadas',
    termino: 'Pruebas automatizadas (Testing)',
    definicion: 'Suite de tests que valida que el código generado por IA realmente funciona, no solo que "se ve bien".',
    categoria: 'operacion-evaluacion',
    ejemplo:
      '9.350 pruebas automatizadas (como las de Jorge Johnson en su proyecto Catalejo) permiten confirmar que un cambio generado por IA no rompió nada, sin tener que revisar manualmente cada línea.',
    referencia: {
      titulo: 'Kent Beck — Test-Driven Development: By Example',
      url: 'https://www.goodreads.com/book/show/6408726',
      tipo: 'libro',
    },
  },
  {
    slug: 'openrouter',
    termino: 'OpenRouter',
    definicion: 'Servicio para gestionar de forma centralizada múltiples llaves de API de distintos proveedores de modelos.',
    categoria: 'operacion-evaluacion',
    sesionOrigen: 7,
    ejemplo:
      'En vez de tener una cuenta y una llave de API distinta para cada proveedor de modelos, OpenRouter centraliza el acceso bajo una sola llave y una sola factura.',
    referencia: {
      titulo: 'OpenRouter — sitio oficial',
      url: 'https://openrouter.ai/about',
      tipo: 'sitio',
    },
  },
  {
    slug: 'modelos-locales',
    termino: 'Modelos locales',
    definicion: 'Modelos ejecutados en hardware propio en vez de la nube, por costo, privacidad o independencia de proveedor.',
    categoria: 'operacion-evaluacion',
    sesionOrigen: 8,
  },
  {
    slug: 'metaaprendizaje',
    termino: 'Metaaprendizaje',
    definicion: 'Usar la IA como mentor para aprender a aprender más rápido, no solo para resolver una tarea puntual.',
    categoria: 'operacion-evaluacion',
    sesionOrigen: 8,
  },
  {
    slug: 'icp',
    termino: 'ICP (perfil de cliente ideal)',
    definicion: 'Definición del cliente ideal usada para calificar leads generados o evaluados con LLMs.',
    categoria: 'operacion-evaluacion',
    sesionOrigen: 5,
    ejemplo:
      "Definir que el cliente ideal de un taller mecánico es 'dueño de flota de más de 5 vehículos en Medellín' para que un LLM califique leads entrantes contra ese perfil, en vez de tratarlos todos igual.",
  },
  {
    slug: 'comunidad-de-practica',
    termino: 'Comunidad de práctica',
    definicion:
      'Modelo de operación del grupo: presentaciones cortas, repositorio compartido, sin tareas obligatorias ni estructura académica rígida.',
    categoria: 'operacion-evaluacion',
    sesionOrigen: 4,
  },
  {
    slug: 'agilismo-en-la-era-de-la-ia',
    termino: 'Agilismo en la era de la IA',
    definicion: 'Pregunta abierta del grupo sobre si el ritmo de la IA implica un retorno a fases de análisis más tipo cascada.',
    categoria: 'operacion-evaluacion',
  },
]

export function getTerminosPorCategoria(categoria: CategoriaGlosario): TerminoGlosario[] {
  return GLOSARIO.filter(t => t.categoria === categoria)
}

export function getTermino(slug: string): TerminoGlosario | undefined {
  return GLOSARIO.find(t => t.slug === slug)
}
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
npx vitest run src/lib/experiencias-ia/__tests__/glosario.test.ts
```

Expected: PASS (all suites).

- [ ] **Step 5: Commit**

```bash
git add src/lib/experiencias-ia/glosario.ts src/lib/experiencias-ia/__tests__/glosario.test.ts
git commit -m "feat(experiencias-ia): add glosario data module

40 terms across 4 categories, per docs/superpowers/specs/2026-07-23-experiencias-ia-glosario-design.md.
data.ts is untouched — this is a separate, explicitly-authorized
content exception, not a transcription of data.js."
```

---

### Task 2: Índice del glosario (TerminoRow + página)

**Files:**
- Create: `src/components/experiencias-ia/TerminoRow.tsx`
- Create: `src/app/[locale]/experiencias-ia/glosario/page.tsx`

**Interfaces:**
- Consumes: `TerminoGlosario`, `CATEGORIAS`, `ORDEN_CATEGORIAS`, `getTerminosPorCategoria` from `@/lib/experiencias-ia/glosario` (Task 1).
- Produces: `TerminoRow({ termino: TerminoGlosario })` — used only by this page.

- [ ] **Step 1: Create `TerminoRow`**

```tsx
// src/components/experiencias-ia/TerminoRow.tsx
import { Link } from '@/i18n/navigation'
import type { TerminoGlosario } from '@/lib/experiencias-ia/glosario'

export default function TerminoRow({ termino }: { termino: TerminoGlosario }) {
  return (
    <Link href={`/experiencias-ia/glosario/${termino.slug}`} className="ses-row">
      <span />
      <span>
        <span className="ses-t">{termino.termino}</span>
        <span className="ses-d">{termino.definicion}</span>
      </span>
      <span />
    </Link>
  )
}
```

- [ ] **Step 2: Create the índice page**

```tsx
// src/app/[locale]/experiencias-ia/glosario/page.tsx
import type { Metadata } from 'next'
import { CATEGORIAS, ORDEN_CATEGORIAS, getTerminosPorCategoria } from '@/lib/experiencias-ia/glosario'
import TerminoRow from '@/components/experiencias-ia/TerminoRow'

export const metadata: Metadata = {
  title: 'Glosario — Experiencias IA',
}

export default function GlosarioIndexPage() {
  return (
    <div>
      <p className="eyebrow">40 términos</p>
      <h1>Glosario</h1>
      {ORDEN_CATEGORIAS.map(categoria => (
        <div key={categoria}>
          <h2 style={{ marginTop: 40 }}>{CATEGORIAS[categoria]}</h2>
          <div className="ses-list">
            {getTerminosPorCategoria(categoria).map(termino => (
              <TerminoRow key={termino.slug} termino={termino} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Manual verification**

```bash
npm run dev &
sleep 4
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/es/experiencias-ia/glosario
kill %1
```

Expected: `200`. Open in a browser and confirm 4 category headings appear in the fixed order, each with 10 term rows, and each row links to `/experiencias-ia/glosario/<slug>`.

- [ ] **Step 4: Commit**

```bash
git add src/components/experiencias-ia/TerminoRow.tsx "src/app/[locale]/experiencias-ia/glosario/page.tsx"
git commit -m "feat(experiencias-ia): add glosario index page"
```

---

### Task 3: Detalle de término

**Files:**
- Create: `src/app/[locale]/experiencias-ia/glosario/[slug]/page.tsx`

**Interfaces:**
- Consumes: `GLOSARIO`, `getTermino` from `@/lib/experiencias-ia/glosario` (Task 1); `getSesion` from `@/lib/experiencias-ia/data`.

- [ ] **Step 1: Implement**

```tsx
// src/app/[locale]/experiencias-ia/glosario/[slug]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { GLOSARIO, getTermino } from '@/lib/experiencias-ia/glosario'
import { getSesion } from '@/lib/experiencias-ia/data'

export function generateStaticParams() {
  return GLOSARIO.map(t => ({ slug: t.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const termino = getTermino(slug)
  if (!termino) return {}
  return {
    title: `${termino.termino} — Glosario — Experiencias IA`,
    description: termino.definicion,
  }
}

export default async function TerminoDetallePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const termino = getTermino(slug)
  if (!termino) notFound()

  const sesion = termino.sesionOrigen ? getSesion(termino.sesionOrigen) : undefined

  return (
    <div>
      <p className="eyebrow">Glosario</p>
      <h1>{termino.termino}</h1>
      <p>{termino.definicion}</p>

      {termino.ejemplo && (
        <div className="side-box">
          <h4>Ejemplo</h4>
          <p>{termino.ejemplo}</p>
        </div>
      )}

      {termino.referencia && (
        <div className="side-box">
          <h4>Referencia</h4>
          <p>
            <a href={termino.referencia.url} target="_blank" rel="noopener noreferrer">
              {termino.referencia.titulo}
            </a>
          </p>
        </div>
      )}

      {sesion && (
        <p>
          <Link href={`/experiencias-ia/sesiones/${sesion.n}`} className="pendiente-origen">
            Sesión {sesion.n}: {sesion.titulo}
          </Link>
        </p>
      )}

      <div className="ses-nav">
        <Link href="/experiencias-ia/glosario">← Glosario</Link>
        <span />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Manual verification — a term with every optional field, one with none, and a 404**

```bash
npm run dev &
sleep 4
curl -s http://localhost:3000/es/experiencias-ia/glosario/harness-engineering -o /tmp/glos1.html -w "%{http_code}\n"
grep -o "Mitchell Hashimoto" /tmp/glos1.html
grep -o "Sesión 7" /tmp/glos1.html
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/es/experiencias-ia/glosario/agilismo-en-la-era-de-la-ia
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/es/experiencias-ia/glosario/no-existe
kill %1
```

Expected: first curl `200` with both greps finding a match (confirms ejemplo/referencia/sesión all render for a fully-populated term); second curl `200` (confirms a term with zero optional fields still renders without crashing); third curl `404`.

- [ ] **Step 3: Commit**

```bash
git add "src/app/[locale]/experiencias-ia/glosario/[slug]/page.tsx"
git commit -m "feat(experiencias-ia): add glosario term detail page

generateStaticParams for all 40 terms; notFound() for unknown slugs;
ejemplo/referencia/sesión de origen all render conditionally."
```

---

### Task 4: Enlace en el nav de la sección

**Files:**
- Modify: `src/components/experiencias-ia/ExperienciasNav.tsx`

**Interfaces:** none new.

- [ ] **Step 1: Add "Glosario" to `VISTAS`**

In `src/components/experiencias-ia/ExperienciasNav.tsx`, add a 6th entry to the `VISTAS` array, after "Quiénes somos":

```tsx
const VISTAS = [
  { href: '/experiencias-ia', label: 'Inicio' },
  { href: '/experiencias-ia/sesiones', label: 'Sesiones' },
  { href: '/experiencias-ia/cronograma', label: 'Cronograma' },
  { href: '/experiencias-ia/backlog', label: 'Backlog' },
  { href: '/experiencias-ia/quienes-somos', label: 'Quiénes somos' },
  { href: '/experiencias-ia/glosario', label: 'Glosario' },
] as const
```

No other change to the file — the existing active-state logic (`pathname.endsWith('/experiencias-ia')` for the root, `pathname.includes(vista.href)` for the rest) already covers `/experiencias-ia/glosario` and `/experiencias-ia/glosario/[slug]` correctly since both contain `/experiencias-ia/glosario`.

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
npm run lint
```

Expected: no new errors (ignore the pre-existing unrelated `ProjectCard.test.tsx` error).

- [ ] **Step 3: Commit**

```bash
git add src/components/experiencias-ia/ExperienciasNav.tsx
git commit -m "feat(experiencias-ia): add Glosario to the section nav"
```

---

### Task 5: Verificación final

**Files:** none (verification only).

- [ ] **Step 1: Full test suite**

```bash
npm run test:run
```

Expected: all tests pass, including the new `glosario.test.ts` (5 new suites, 9 new test cases).

- [ ] **Step 2: Lint and typecheck**

```bash
npm run lint
npx tsc --noEmit
```

Expected: no errors introduced by this feature (ignore the pre-existing unrelated `ProjectCard.test.tsx` error).

- [ ] **Step 3: Production build**

```bash
npm run build
```

Expected: succeeds; route list includes `/[locale]/experiencias-ia/glosario` and `/[locale]/experiencias-ia/glosario/[slug]` (statically generated for the 40 slugs), alongside every pre-existing route unchanged.

- [ ] **Step 4: Mobile-width check at 360px**

```bash
npm run dev &
sleep 4
```

Using a browser resized to 360px (or Playwright's `page.setViewportSize({width: 360, height: 800})` plus `document.documentElement.scrollWidth <= document.documentElement.clientWidth`), check:
- `/es/experiencias-ia/glosario` (index)
- `/es/experiencias-ia/glosario/harness-engineering` (a term with every optional field populated — the longest possible card)
- `/es/experiencias-ia/glosario/patron-de-hashimoto` (a term with no optional fields — the shortest)

Confirm no horizontal scroll on any of the three.

```bash
kill %1
```

- [ ] **Step 5: Spot-check 3 of the 13 verified references still resolve**

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://mitchellh.com/writing/my-ai-adoption-journey
curl -s -o /dev/null -w "%{http_code}\n" https://arxiv.org/abs/2005.11401
curl -s -o /dev/null -w "%{http_code}\n" https://www.anthropic.com/news/model-context-protocol
```

Expected: `200` for all three (they were already verified once during spec-writing; this just confirms nothing changed since).

- [ ] **Step 6: Re-verify every acceptance criterion**

Go through `docs/superpowers/specs/2026-07-23-experiencias-ia-glosario-design.md` section 9 checkbox by checkbox against the running app, and check off (`- [x]`) every one confirmed. If any is not met, do not check it and report it instead of proceeding.

- [ ] **Step 7: Commit the checked-off spec**

```bash
git add docs/superpowers/specs/2026-07-23-experiencias-ia-glosario-design.md
git commit -m "docs: check off acceptance criteria for Experiencias IA glosario"
```
