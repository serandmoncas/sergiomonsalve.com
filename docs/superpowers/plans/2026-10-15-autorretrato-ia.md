# Autorretrato con IA — Implementation Plan

> Nombres de proyectos privados redactados (ejemplos: `repo-secreto`, `PROY-X`).

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publicar en sergiomonsalve.com un post bilingüe con un análisis de datos reales sobre cómo Sergio usa la IA (Claude Code, dos cuentas de GitHub, glosario, contexto público), con 9 visualizaciones, una animación "Rebobinar" con el mecanismo de Claude Motion y un Claude Dashboard del camino de aprendizaje.

**Architecture:** Un pipeline offline en TypeScript (`scripts/ia-autorretrato/`, `npx tsx`) lee los datos locales y de GitHub, los clasifica y escribe **un solo** `data/ia-autorretrato.json` con solo agregados. Antes de escribir pasa un filtro de privacidad que hace fallar el proceso si algo no corresponde. Los componentes React/SVG (`src/components/blog/ia-autorretrato/`) importan ese JSON y se registran en `MDXContent`. La lógica pura compartida (tipos, escena del Motion) vive en `src/lib/ia-autorretrato/`.

**Tech Stack:** Next.js 16 App Router, React 19, next-intl, next-mdx-remote/rsc, Tailwind v4, Vitest + Testing Library (jsdom), `gh` CLI, `npx tsx`. Sin dependencias nuevas.

**Spec:** `docs/superpowers/specs/2026-10-15-autorretrato-ia-design.md` (+ anexo `docs/superpowers/specs/anexos/autorretrato-ia/contexto-discurso.md`)

## Global Constraints

- Rama de trabajo: `feat/post-autorretrato-ia`. No se hace push a `main` (los push a `main` despliegan a producción).
- **El repo es público.** El único artefacto de datos que se commitea es `data/ia-autorretrato.json` (solo agregados). Todo lo privado va en `.ia-autorretrato/`, que va en `.gitignore`.
- El JSON publicado no contiene: texto de prompts (fragmentos literales de >40 caracteres), nombres de repos privados, nombres de personas distintas de Sergio, correos ni rutas `/Users/`.
- Los coautores humanos aparecen como "Persona 1, 2…", nunca con su nombre.
- Cuentas de GitHub: solo `serandmoncas` y `smonsalve`. La cuenta `sergio-operions` **no** se usa.
- Identidades de Sergio en `smonsalve`: cualquier autor cuyo nombre empiece por `Sergio`, y `horus`. Repos excluidos de `smonsalve`: `lacasona-errbit`, `leclub` y los forks (`--source`).
- Herramientas declaradas (no medidas): ChatGPT/OpenAI, Claude.ai, Gemini/Antigravity, Cursor, Ollama. Claude Code es la única medida.
- Las citas de prompts (5–8) solo entran en el MDX si Sergio las aprueba una por una. El JSON nunca las lleva.
- Las fechas por día se calculan en hora de Bogotá (`America/Bogota`).
- Colores: solo tokens del sitio (`var(--color-accent)`, `var(--color-text)`, `var(--color-text-secondary)`, `var(--color-text-muted)`, `var(--color-border)`, `var(--color-surface)`). Cambian solos con `[data-skin="crema"]`.
- Sin scroll horizontal de página a 360 px: los SVG usan `width="100%"` + `viewBox`.
- Cada gráfico: `role="img"` + `aria-label` con la cifra clave + `<details>` con la tabla de datos.
- Textos de interfaz en `src/messages/{es,en}.json` bajo el namespace `autorretrato`.
- Tests junto al código en `__tests__/`. Mock de next-intl en componentes: `vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key, useLocale: () => 'es' }))`.
- Desviación aprobada de la spec: `actividadDiaria` usa `history.jsonl` (`{fecha, prompts, sesiones}`) porque `~/.claude/stats-cache.json` dejó de actualizarse el 2026-05-22.
- Antes de escribir cualquier gráfico, carga el skill `dataviz` (forma, marcas, etiquetas). Para el dashboard, sigue las instrucciones del tipo Dashboard que devuelve su creación.

## Review Focus

1. **Una línea corrupta en `history.jsonl` o en un `.jsonl` de sesión** (escritura cortada, JSON inválido): se ignora esa línea y el pipeline sigue. Test en Task 4.
2. **Un prompt escrito cerca de la medianoche** (p. ej. 2026-10-15T03:00Z): cuenta como día de Bogotá (2026-10-14), no UTC. Test en Task 2 (`diaBogota`) y Task 4.
3. **Una palabra común del glosario dentro de otra** ("contexto" en "contextos", "agente" en "reagente"): no cuenta como uso salvo que haya sinónimo explícito. Test en Task 6.
4. **Un nombre de repo privado o de un colaborador pegado a mano en el MDX** (por ejemplo, dentro de una cita): la verificación final lo detecta igual que en el JSON. Test en Task 7 y paso en Task 19.
5. **Datos vacíos** (sin días de actividad, un mes sin commits, máximo 0): los gráficos se dibujan sin `NaN`/`Infinity` en el markup. Test en Task 12.

---

## File Structure

```
.gitignore                                         (modificar: + /.ia-autorretrato/)
data/ia-autorretrato.json                          (generado; único dato publicado)
src/lib/ia-autorretrato/
  tipos.ts                 tipos del JSON publicado y del camino
  ejemplo.ts               EJEMPLO: AutorretratoIA pequeño para tests
  datos.ts                 DATOS: importa data/ia-autorretrato.json
  caminoEscena.ts          crearEscena + render(escena, t) puro (Motion)
  __tests__/caminoEscena.test.ts
scripts/ia-autorretrato/
  util.ts                  escaparRegex, mediana, diaBogota
  flujoJson.ts             leerFlujoJson (JSON concatenado del API)
  identidades.ts           esSergio, esBot, normalizarModelo, REPOS_EXCLUIDOS, PERMITIDOS
  commits.ts               CommitCrudo/CommitNormalizado, normalizarCommit, filtrarCommits
  github.ts                gh I/O + caché: listarRepos, descargarCommits, descargarManifiestos, descargarCuenta
  agregadosGithub.ts       calcularEra, commitsPorMes, modelosPorMes, primeraFechaPorRepo
  claudeCode.ts            leerHistorial, actividadDiaria, leerSesiones, perfilPrompts, seleccionarCitas
  dominios.ts              dominioDe, promptsPorDominio
  csv.ts                   aCsv, deCsv
  conceptos.ts             variantes, contiene, clasificarConceptos, revisionConceptos, leerCorrecciones
  privacidad.ts            verificarPrivacidad
  red.ts                   grafoCoautoria, grafoDiscurso
  camino.ts                validarCamino, ancestros, enriquecerCamino, revisionCamino, aplicarRevision
  camino.json              DAG de conocimiento (editable)
  contexto.json            cifras externas + conceptos y relaciones del discurso
  declarado.json           herramientas declaradas
  index.ts                 orquestador
  escribir-ejemplo.ts      escribe EJEMPLO en data/ (arranque)
  escena-motion.ts         exporta escena + prompt para /motion
  dashboard.ts             exporta datasets del Dashboard
  verificar-urls.ts        comprueba las URLs de contexto.json
  verificar-mdx.ts         privacidad sobre los .mdx del post
  __tests__/*.test.ts
src/components/blog/ia-autorretrato/
  Figura.tsx  CalendarioActividad.tsx  BarrasHerramientas.tsx  CoautoriaMensual.tsx
  MatrizEcosistema.tsx  CuadranteConceptos.tsx  PerfilPrompts.tsx
  RedCoautoria.tsx  MapaDiscurso.tsx  CaminoMotion.tsx
  __tests__/*.test.tsx
src/components/MDXContent.tsx                      (modificar: registrar componentes)
src/messages/es.json, src/messages/en.json         (modificar: namespace autorretrato)
content/blog/es/YYYY-MM-DD-autorretrato-ia.mdx     (crear; fecha = día de publicación)
content/blog/en/YYYY-MM-DD-autorretrato-ia.mdx
```

---

### Task 1: Tipos, ejemplo, datos y gitignore

**Files:**
- Create: `src/lib/ia-autorretrato/tipos.ts`, `src/lib/ia-autorretrato/ejemplo.ts`, `src/lib/ia-autorretrato/datos.ts`, `scripts/ia-autorretrato/escribir-ejemplo.ts`, `src/lib/ia-autorretrato/__tests__/ejemplo.test.ts`
- Modify: `.gitignore`
- Generate: `data/ia-autorretrato.json`

**Interfaces:**
- Produces: todos los tipos de `tipos.ts` (abajo), `EJEMPLO: AutorretratoIA`, `DATOS: AutorretratoIA`, `RAMAS: Rama[]`, `DOMINIOS: Dominio[]`.

- [ ] **Step 1: Crear `src/lib/ia-autorretrato/tipos.ts`**

```ts
export type Cuenta = 'smonsalve' | 'serandmoncas'
export type Dominio = 'producto-web' | 'hongos-iot' | 'educacion' | 'agentes' | 'experimentos'
export const DOMINIOS: Dominio[] = ['producto-web', 'hongos-iot', 'educacion', 'agentes', 'experimentos']
export type GrupoHerramienta = 'ejecucion' | 'investigacion' | 'navegador' | 'orquestacion' | 'mcp' | 'edicion'
export type Cuadrante = 'ambos' | 'solo-hablado' | 'solo-construido' | 'ninguno'
export type Rama = 'fundamentos' | 'backend' | 'web' | 'datos-ml' | 'iot' | 'infra' | 'agentes' | 'educacion' | 'escritura'
export const RAMAS: Rama[] = ['fundamentos', 'backend', 'web', 'datos-ml', 'iot', 'infra', 'agentes', 'educacion', 'escritura']
export type Evidencia = 'github' | 'declarado' | 'inferido'

export type NodoCamino = {
  id: string
  etiqueta: string
  etiquetaEn: string
  rama: Rama
  evidencia: Evidencia
  repos?: string[]          // solo repos públicos
  declaradoEn?: string
  primeraEvidencia?: string // YYYY-MM
  hoy?: boolean
}
export type AristaCamino = { de: string; a: string } // "a" depende de "de"
export type Camino = { nodos: NodoCamino[]; aristas: AristaCamino[] }

export type NodoGrafo = { id: string; tipo: 'sergio' | 'persona' | 'modelo' | 'dominio'; etiqueta: string; peso: number; x: number; y: number }
export type AristaGrafo = { de: string; a: string; peso: number }
export type GrafoCoautoria = { era: Cuenta; nodos: NodoGrafo[]; aristas: AristaGrafo[] }
export type NodoDiscurso = { id: string; etiqueta: string; etiquetaEn: string; resaltado: boolean; x: number; y: number }
export type GrafoDiscurso = { nodos: NodoDiscurso[]; aristas: { de: string; a: string; motivo: string }[] }

export type DatoContexto = { cifra: string; mide: string; fuente: string; fecha: string; url: string }
export type ConceptoClasificado = {
  slug: string; termino: string; categoria: string
  hablado: number; preguntado: number; construido: boolean
  cuadrante: Cuadrante; corregido: boolean
}
export type Era = {
  cuenta: Cuenta; desde: string; hasta: string
  commitsPropios: number; reposActivos: number
  medianaMensaje: number; medianaMensajeSinTrailer: number
  coautores: { tipo: 'persona' | 'modelo'; n: number }[]
}
export type ItemEcosistema = { herramienta: string; fuente: 'medido' | 'declarado'; uso: { es: string; en: string }; intensidad: 1 | 2 | 3 }

export type AutorretratoIA = {
  generado: string
  periodo: { desde: string; hasta: string }
  actividadDiaria: { fecha: string; prompts: number; sesiones: number }[]
  commitsPorMes: { mes: string; total: number; coautoriaClaude: number; porTipo: Record<string, number> }[]
  promptsPorDominio: { dominio: Dominio; prompts: number; reposPublicos: string[] }[]
  herramientas: { nombre: string; usos: number; grupo: GrupoHerramienta }[]
  modelos: { modelo: string; respuestas: number }[]
  ecosistema: ItemEcosistema[]
  conceptos: ConceptoClasificado[]
  perfilPrompts: { total: number; medianaCaracteres: number; pctPreguntas: number; pctEspanol: number }
  eras: Era[]
  modelosPorMes: { mes: string; modelo: string; commits: number }[]
  grafoCoautoria: GrafoCoautoria[]
  grafoDiscurso: GrafoDiscurso
  contexto: DatoContexto[]
  camino: Camino
}
```

- [ ] **Step 2: Crear `src/lib/ia-autorretrato/ejemplo.ts`**

```ts
import type { AutorretratoIA } from './tipos'

/** Datos inventados y pequeños, solo para tests y para arrancar antes de la primera corrida real. */
export const EJEMPLO: AutorretratoIA = {
  generado: '2026-10-15T00:00:00.000Z',
  periodo: { desde: '2026-10-05', hasta: '2026-10-14' },
  actividadDiaria: [
    { fecha: '2026-10-05', prompts: 3, sesiones: 1 },
    { fecha: '2026-10-07', prompts: 10, sesiones: 2 },
    { fecha: '2026-10-14', prompts: 6, sesiones: 1 },
  ],
  commitsPorMes: [
    { mes: '2026-08', total: 10, coautoriaClaude: 6, porTipo: { feat: 4, docs: 6 } },
    { mes: '2026-10', total: 20, coautoriaClaude: 19, porTipo: { feat: 10, docs: 10 } },
  ],
  promptsPorDominio: [
    { dominio: 'producto-web', prompts: 12, reposPublicos: ['sergiomonsalve.com'] },
    { dominio: 'hongos-iot', prompts: 7, reposPublicos: [] },
  ],
  herramientas: [
    { nombre: 'Bash', usos: 30, grupo: 'ejecucion' },
    { nombre: 'WebSearch', usos: 5, grupo: 'investigacion' },
  ],
  modelos: [
    { modelo: 'claude-opus-5-5', respuestas: 80 },
    { modelo: 'claude-opus-5', respuestas: 20 },
  ],
  ecosistema: [
    { herramienta: 'Claude Code', fuente: 'medido', uso: { es: 'Agente de código', en: 'Coding agent' }, intensidad: 3 },
    { herramienta: 'ChatGPT', fuente: 'declarado', uso: { es: 'Consultas', en: 'Questions' }, intensidad: 2 },
  ],
  conceptos: [
    { slug: 'rag', termino: 'RAG', categoria: 'fundamentos', hablado: 3, preguntado: 0, construido: true, cuadrante: 'ambos', corregido: false },
    { slug: 'mcp', termino: 'MCP', categoria: 'operacion-evaluacion', hablado: 0, preguntado: 2, construido: false, cuadrante: 'ninguno', corregido: false },
  ],
  perfilPrompts: { total: 19, medianaCaracteres: 120, pctPreguntas: 30, pctEspanol: 90 },
  eras: [
    { cuenta: 'smonsalve', desde: '2013-01-18', hasta: '2025-12-03', commitsPropios: 420, reposActivos: 60, medianaMensaje: 14, medianaMensajeSinTrailer: 14, coautores: [{ tipo: 'persona', n: 3 }, { tipo: 'modelo', n: 0 }] },
    { cuenta: 'serandmoncas', desde: '2026-02-25', hasta: '2026-10-15', commitsPropios: 1443, reposActivos: 32, medianaMensaje: 139, medianaMensajeSinTrailer: 88, coautores: [{ tipo: 'persona', n: 0 }, { tipo: 'modelo', n: 6 }] },
  ],
  modelosPorMes: [
    { mes: '2026-08', modelo: 'Claude Opus 5', commits: 6 },
    { mes: '2026-10', modelo: 'Claude Opus 5.5', commits: 19 },
  ],
  grafoCoautoria: [
    {
      era: 'smonsalve',
      nodos: [
        { id: 'sergio', tipo: 'sergio', etiqueta: 'Sergio', peso: 10, x: 0.32, y: 0.333 },
        { id: 'persona-1', tipo: 'persona', etiqueta: 'Persona 1', peso: 3, x: 0.32, y: 0.667 },
        { id: 'dominio:producto-web', tipo: 'dominio', etiqueta: 'producto-web', peso: 13, x: 0.72, y: 0.5 },
      ],
      aristas: [
        { de: 'sergio', a: 'dominio:producto-web', peso: 10 },
        { de: 'persona-1', a: 'dominio:producto-web', peso: 3 },
      ],
    },
    {
      era: 'serandmoncas',
      nodos: [
        { id: 'sergio', tipo: 'sergio', etiqueta: 'Sergio', peso: 20, x: 0.32, y: 0.333 },
        { id: 'modelo:Claude Opus 5.5', tipo: 'modelo', etiqueta: 'Claude Opus 5.5', peso: 19, x: 0.32, y: 0.667 },
        { id: 'dominio:agentes', tipo: 'dominio', etiqueta: 'agentes', peso: 39, x: 0.72, y: 0.5 },
      ],
      aristas: [
        { de: 'sergio', a: 'dominio:agentes', peso: 20 },
        { de: 'modelo:Claude Opus 5.5', a: 'dominio:agentes', peso: 19 },
      ],
    },
  ],
  grafoDiscurso: {
    nodos: [
      { id: 'vibe-coding', etiqueta: 'vibe coding', etiquetaEn: 'vibe coding', resaltado: true, x: 0.82, y: 0.5 },
      { id: 'agentic-engineering', etiqueta: 'ingeniería agéntica', etiquetaEn: 'agentic engineering', resaltado: false, x: 0.18, y: 0.5 },
    ],
    aristas: [{ de: 'vibe-coding', a: 'agentic-engineering', motivo: 'mismo acto, distinto grado de revisión' }],
  },
  contexto: [
    { cifra: '~4%', mide: 'Commits públicos diarios en GitHub con firma de Claude Code', fuente: 'SemiAnalysis vía Xataka', fecha: '2026-02-06', url: 'https://www.xataka.com/robotica-e-ia/claude-code-esta-siendo-gran-favorito-programadores-que-firma-4-todo-que-se-sube-a-github' },
  ],
  camino: {
    nodos: [
      { id: 'logica', etiqueta: 'Lógica y algoritmos', etiquetaEn: 'Logic and algorithms', rama: 'fundamentos', evidencia: 'inferido' },
      { id: 'python', etiqueta: 'Python', etiquetaEn: 'Python', rama: 'backend', evidencia: 'github', repos: ['POCVT'], primeraEvidencia: '2014-10' },
      { id: 'fastapi', etiqueta: 'FastAPI', etiquetaEn: 'FastAPI', rama: 'backend', evidencia: 'github', repos: ['brayan'], primeraEvidencia: '2025-11', hoy: true },
    ],
    aristas: [{ de: 'logica', a: 'python' }, { de: 'python', a: 'fastapi' }],
  },
}
```

- [ ] **Step 3: Crear `src/lib/ia-autorretrato/datos.ts`**

```ts
import datos from '../../../data/ia-autorretrato.json'
import type { AutorretratoIA } from './tipos'

/** El único dato publicado del post: lo genera `npx tsx scripts/ia-autorretrato/index.ts`. */
export const DATOS = datos as unknown as AutorretratoIA
```

- [ ] **Step 4: Crear `scripts/ia-autorretrato/escribir-ejemplo.ts` y generar el JSON inicial**

```ts
/**
 * Escribe datos de ejemplo en data/ia-autorretrato.json para que el sitio compile
 * antes de la primera corrida real del pipeline.
 *
 * Uso: npx tsx scripts/ia-autorretrato/escribir-ejemplo.ts
 */
import fs from 'node:fs'
import path from 'node:path'
import { EJEMPLO } from '@/lib/ia-autorretrato/ejemplo'

const destino = path.join(process.cwd(), 'data/ia-autorretrato.json')
fs.writeFileSync(destino, JSON.stringify(EJEMPLO, null, 2) + '\n')
console.log(`Ejemplo escrito en ${path.relative(process.cwd(), destino)}`)
```

Run: `npx tsx scripts/ia-autorretrato/escribir-ejemplo.ts`
Expected: `Ejemplo escrito en data/ia-autorretrato.json`

- [ ] **Step 5: Agregar a `.gitignore`** (al final)

```
# autorretrato IA: cachés, revisiones y citas privadas
/.ia-autorretrato/
```

- [ ] **Step 6: Test de forma `src/lib/ia-autorretrato/__tests__/ejemplo.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { EJEMPLO } from '../ejemplo'
import { DATOS } from '../datos'
import { RAMAS } from '../tipos'

describe('datos del autorretrato', () => {
  it('el JSON publicado tiene todas las claves del tipo', () => {
    expect(Object.keys(DATOS).sort()).toEqual(Object.keys(EJEMPLO).sort())
  })
  it('cada nodo del camino usa una rama conocida', () => {
    for (const n of DATOS.camino.nodos) expect(RAMAS).toContain(n.rama)
  })
})
```

Run: `npx vitest run src/lib/ia-autorretrato`
Expected: PASS (2 tests)

- [ ] **Step 7: Commit**

```bash
git add .gitignore src/lib/ia-autorretrato scripts/ia-autorretrato/escribir-ejemplo.ts data/ia-autorretrato.json
git commit -m "feat(autorretrato): tipos, datos de ejemplo y carpeta privada ignorada"
```

---

### Task 2: Utilidades, flujo JSON, identidades, commits y descarga de GitHub

**Files:**
- Create: `scripts/ia-autorretrato/util.ts`, `flujoJson.ts`, `identidades.ts`, `commits.ts`, `github.ts`
- Test: `scripts/ia-autorretrato/__tests__/util.test.ts`, `commits.test.ts`, `github.test.ts`

**Interfaces:**
- Consumes: `Cuenta` (Task 1)
- Produces:
  - `escaparRegex(s: string): string`, `mediana(xs: number[]): number`, `diaBogota(ms: number): string` (YYYY-MM-DD)
  - `leerFlujoJson(texto: string): unknown[]`
  - `esSergio(autor: string): boolean`, `esBot(autor: string): boolean`, `normalizarModelo(nombre: string): string`, `REPOS_EXCLUIDOS: Record<Cuenta, string[]>`, `PERMITIDOS: string[]`
  - `type CommitCrudo = { repo: string; fecha: string; autor: string; email: string; msg: string }`
  - `type CommitNormalizado = { cuenta: Cuenta; repo: string; fecha: string; mes: string; autor: string; esSergio: boolean; autorClaude: boolean; esBot: boolean; modelos: string[]; tipo: string; largoMensaje: number; largoSinTrailer: number }`
  - `coautores(msg)`, `tipoDe(msg)`, `sinTrailer(msg)`, `normalizarCommit(cuenta, c)`, `filtrarCommits(cuenta, cs)`, `tieneIA(c)`, `esPropio(c)`
  - `type Ejecutor = (args: string[]) => string`, `type RepoInfo = { nombre: string; privado: boolean; lenguaje: string | null }`, `type DescargaCuenta = { cuenta: Cuenta; repos: RepoInfo[]; commits: CommitCrudo[]; manifiestos: Record<string, string[]> }`
  - `listarRepos(cuenta, run?)`, `descargarCommits(cuenta, repo, run?)`, `descargarManifiestos(cuenta, repo, run?)`, `descargarCuenta(cuenta, dirCache, refrescar?, run?)`

- [ ] **Step 1: Tests que fallan**

`scripts/ia-autorretrato/__tests__/util.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { diaBogota, escaparRegex, mediana } from '../util'
import { leerFlujoJson } from '../flujoJson'

describe('util', () => {
  it('mediana de pares, impares y vacío', () => {
    expect(mediana([3, 1, 2])).toBe(2)
    expect(mediana([1, 2, 3, 4])).toBe(3) // (2+3)/2 redondeado
    expect(mediana([])).toBe(0)
  })
  it('escapa caracteres de regex', () => {
    expect(new RegExp(escaparRegex('a.b(c)')).test('a.b(c)')).toBe(true)
    expect(new RegExp(escaparRegex('a.b')).test('axb')).toBe(false)
  })
  it('diaBogota usa la hora de Colombia, no UTC', () => {
    expect(diaBogota(Date.parse('2026-10-15T03:00:00Z'))).toBe('2026-10-14')
    expect(diaBogota(Date.parse('2026-10-15T06:00:00Z'))).toBe('2026-10-15')
  })
})

describe('leerFlujoJson', () => {
  it('separa arreglos concatenados (salida de gh --paginate)', () => {
    expect(leerFlujoJson('[1,2][3]')).toEqual([[1, 2], [3]])
  })
  it('separa objetos en la misma línea y respeta llaves dentro de strings', () => {
    expect(leerFlujoJson('{"a":"}{"}{"b":"[\\"x"}\n')).toEqual([{ a: '}{' }, { b: '["x' }])
  })
})
```

`scripts/ia-autorretrato/__tests__/commits.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { esBot, esSergio, normalizarModelo } from '../identidades'
import { coautores, esPropio, filtrarCommits, normalizarCommit, sinTrailer, tieneIA, tipoDe } from '../commits'

const msg = 'feat(blog): nuevo post\n\nCuerpo.\n\nCo-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>'

describe('identidades', () => {
  it('reconoce a Sergio, incluido horus', () => {
    for (const a of ['Sergio Monsalve', 'Sergio', 'Sergio Monsalve at x230', 'horus', 'serandmoncas']) expect(esSergio(a)).toBe(true)
    expect(esSergio('Persona X')).toBe(false)
  })
  it('reconoce bots', () => {
    expect(esBot('Vercel')).toBe(true)
    expect(esBot('dependabot[bot]')).toBe(true)
    expect(esBot('Sergio')).toBe(false)
  })
  it('normaliza el nombre del modelo', () => {
    expect(normalizarModelo('Claude Opus 5 (1M context)')).toBe('Claude Opus 5')
    expect(normalizarModelo('Claude Haiku 4.5 (200k)')).toBe('Claude Haiku 4.5')
  })
})

describe('commits', () => {
  it('extrae coautores, tipo y mensaje sin trailer', () => {
    expect(coautores(msg)).toEqual(['Claude Opus 5 (1M context)'])
    expect(tipoDe(msg)).toBe('feat')
    expect(tipoDe('fix!: algo')).toBe('fix')
    expect(tipoDe('cambios varios')).toBe('otro')
    expect(sinTrailer(msg)).toBe('feat(blog): nuevo post\n\nCuerpo.')
  })
  it('normaliza un commit co-firmado', () => {
    const c = normalizarCommit('serandmoncas', { repo: 'HER', fecha: '2026-10-15T03:00:00Z', autor: 'Sergio Monsalve', email: 'x@y.z', msg })
    expect(c).toMatchObject({ fecha: '2026-10-14', mes: '2026-10', esSergio: true, autorClaude: false, modelos: ['Claude Opus 5'], tipo: 'feat' })
    expect(c.largoSinTrailer).toBeLessThan(c.largoMensaje)
    expect(tieneIA(c)).toBe(true)
    expect(esPropio(c)).toBe(true)
  })
  it('Claude como autor principal cuenta como IA y como propio', () => {
    const c = normalizarCommit('serandmoncas', { repo: 'New-Old-School', fecha: '2026-10-01T12:00:00Z', autor: 'Claude', email: '', msg: 'docs: x' })
    expect(c.autorClaude).toBe(true)
    expect(tieneIA(c)).toBe(true)
    expect(esPropio(c)).toBe(true)
  })
  it('excluye repos con historial ajeno en smonsalve', () => {
    const crudos = ['lacasona-errbit', 'leclub', 'lacasona'].map(repo => ({ repo, fecha: '2013-05-05T00:00:00Z', autor: 'horus', email: '', msg: 'x' }))
    expect(filtrarCommits('smonsalve', crudos).map(c => c.repo)).toEqual(['lacasona'])
  })
})
```

`scripts/ia-autorretrato/__tests__/github.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { descargarCommits, descargarManifiestos, listarRepos } from '../github'

const pagina = (n: number) => JSON.stringify([{ commit: { author: { date: `2026-0${n}-01T12:00:00Z`, name: 'Sergio', email: 's@x.y' }, message: `m${n}` } }])

describe('github', () => {
  it('lee páginas concatenadas de commits', () => {
    const run = () => pagina(1) + pagina(2)
    const cs = descargarCommits('serandmoncas', 'HER', run)
    expect(cs.map(c => c.msg)).toEqual(['m1', 'm2'])
    expect(cs[0]).toMatchObject({ repo: 'HER', autor: 'Sergio' })
  })
  it('un repo vacío (gh falla con 409) devuelve lista vacía', () => {
    const run = () => { throw new Error('HTTP 409: Git Repository is empty.') }
    expect(descargarCommits('smonsalve', 'vacio', run)).toEqual([])
  })
  it('ignora objetos que no son commits', () => {
    const run = () => '{"message":"Git Repository is empty."}' + pagina(3)
    expect(descargarCommits('smonsalve', 'x', run)).toHaveLength(1)
  })
  it('lista repos con privacidad y lenguaje', () => {
    const run = () => JSON.stringify([{ name: 'HER', isPrivate: false, primaryLanguage: { name: 'Python' } }, { name: 'repo-secreto', isPrivate: true, primaryLanguage: null }])
    expect(listarRepos('serandmoncas', run)).toEqual([
      { nombre: 'HER', privado: false, lenguaje: 'Python' },
      { nombre: 'repo-secreto', privado: true, lenguaje: null },
    ])
  })
  it('decodifica manifiestos en base64 y omite los que no existen', () => {
    const run = (args: string[]) => {
      if (args[1].endsWith('package.json')) return Buffer.from('{"dependencies":{"next":"16"}}').toString('base64') + '\n'
      throw new Error('404')
    }
    expect(descargarManifiestos('serandmoncas', 'x', run)).toEqual(['{"dependencies":{"next":"16"}}'])
  })
})
```

- [ ] **Step 2: Correr y verificar que fallan**

Run: `npx vitest run scripts/ia-autorretrato`
Expected: FAIL ("Failed to resolve import '../util'" y similares)

- [ ] **Step 3: Implementar `util.ts`**

```ts
export function escaparRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function mediana(xs: number[]): number {
  if (xs.length === 0) return 0
  const s = [...xs].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2)
}

const FORMATO_DIA = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit' })

/** YYYY-MM-DD en hora de Bogotá. */
export function diaBogota(ms: number): string {
  return FORMATO_DIA.format(new Date(ms))
}
```

- [ ] **Step 4: Implementar `flujoJson.ts`**

```ts
/**
 * Separa una cadena con varios valores JSON pegados (`[...][...]` o `{...}{...}`),
 * como la que produce `gh api --paginate`.
 */
export function leerFlujoJson(texto: string): unknown[] {
  const valores: unknown[] = []
  let profundidad = 0
  let inicio = -1
  let enString = false
  let escape = false
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i]
    if (enString) {
      if (escape) escape = false
      else if (c === '\\') escape = true
      else if (c === '"') enString = false
      continue
    }
    if (c === '"') enString = true
    else if (c === '{' || c === '[') {
      if (profundidad === 0) inicio = i
      profundidad++
    } else if (c === '}' || c === ']') {
      profundidad--
      if (profundidad === 0) valores.push(JSON.parse(texto.slice(inicio, i + 1)))
    }
  }
  return valores
}
```

- [ ] **Step 5: Implementar `identidades.ts`**

```ts
import type { Cuenta } from '@/lib/ia-autorretrato/tipos'

/** Repos con historial ajeno (upstream de Errbit y Heroku) que no son trabajo de Sergio. */
export const REPOS_EXCLUIDOS: Record<Cuenta, string[]> = {
  smonsalve: ['lacasona-errbit', 'leclub'],
  serandmoncas: [],
}

/** Palabras que coinciden con un nombre de la lista negra pero no identifican a nadie. */
export const PERMITIDOS = ['estudiante']

/** `horus` era Sergio (confirmado el 2026-10-15). */
export function esSergio(autor: string): boolean {
  const a = autor.trim()
  return a.startsWith('Sergio') || a === 'horus' || a === 'serandmoncas' || a === 'smonsalve'
}

export function esBot(autor: string): boolean {
  const a = autor.trim()
  return a.endsWith('[bot]') || a === 'Vercel' || a === 'GitHub'
}

/** "Claude Opus 5 (1M context)" → "Claude Opus 5" */
export function normalizarModelo(nombre: string): string {
  return nombre.replace(/\s*\([^)]*\)/g, '').replace(/\s+/g, ' ').trim()
}
```

- [ ] **Step 6: Implementar `commits.ts`**

```ts
import type { Cuenta } from '@/lib/ia-autorretrato/tipos'
import { esBot, esSergio, normalizarModelo, REPOS_EXCLUIDOS } from './identidades'
import { diaBogota } from './util'

export type CommitCrudo = { repo: string; fecha: string; autor: string; email: string; msg: string }

export type CommitNormalizado = {
  cuenta: Cuenta
  repo: string
  fecha: string // YYYY-MM-DD, Bogotá
  mes: string   // YYYY-MM
  autor: string // solo en memoria: nunca se publica
  esSergio: boolean
  autorClaude: boolean
  esBot: boolean
  modelos: string[]
  tipo: string
  largoMensaje: number
  largoSinTrailer: number
}

const TRAILER = /^Co-Authored-By:\s*(.+?)\s*<[^>]*>\s*$/gim

export function coautores(msg: string): string[] {
  return [...msg.matchAll(TRAILER)].map(m => m[1].trim())
}

export function tipoDe(msg: string): string {
  const m = msg.match(/^([a-z]+)(\([^)]*\))?!?:/i)
  return m ? m[1].toLowerCase() : 'otro'
}

export function sinTrailer(msg: string): string {
  return msg.split(/\n\s*Co-Authored-By:/i)[0].trim()
}

export function normalizarCommit(cuenta: Cuenta, c: CommitCrudo): CommitNormalizado {
  const fecha = diaBogota(Date.parse(c.fecha))
  const modelos = [...new Set(coautores(c.msg).filter(n => /claude/i.test(n)).map(normalizarModelo))]
  return {
    cuenta,
    repo: c.repo,
    fecha,
    mes: fecha.slice(0, 7),
    autor: c.autor,
    esSergio: esSergio(c.autor),
    autorClaude: c.autor.trim() === 'Claude',
    esBot: esBot(c.autor),
    modelos,
    tipo: tipoDe(c.msg),
    largoMensaje: c.msg.trim().length,
    largoSinTrailer: sinTrailer(c.msg).length,
  }
}

export function filtrarCommits(cuenta: Cuenta, commits: CommitCrudo[]): CommitNormalizado[] {
  const excluidos = new Set(REPOS_EXCLUIDOS[cuenta])
  return commits.filter(c => !excluidos.has(c.repo)).map(c => normalizarCommit(cuenta, c))
}

export const tieneIA = (c: CommitNormalizado) => c.autorClaude || c.modelos.length > 0
export const esPropio = (c: CommitNormalizado) => !c.esBot && (c.esSergio || c.autorClaude)
```

- [ ] **Step 7: Implementar `github.ts`**

```ts
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import type { Cuenta } from '@/lib/ia-autorretrato/tipos'
import type { CommitCrudo } from './commits'
import { leerFlujoJson } from './flujoJson'

export type Ejecutor = (args: string[]) => string
export type RepoInfo = { nombre: string; privado: boolean; lenguaje: string | null }
export type DescargaCuenta = { cuenta: Cuenta; repos: RepoInfo[]; commits: CommitCrudo[]; manifiestos: Record<string, string[]> }

export const gh: Ejecutor = args =>
  execFileSync('gh', args, { encoding: 'utf8', maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'pipe'] })

const MANIFIESTOS = ['package.json', 'requirements.txt', 'pyproject.toml', 'platformio.ini', 'Gemfile', 'go.mod']

type CommitApi = { commit: { author: { date: string; name: string; email: string }; message: string } }
const esCommitApi = (x: unknown): x is CommitApi =>
  typeof x === 'object' && x !== null && 'commit' in x

/** Repos propios (sin forks) de la cuenta. */
export function listarRepos(cuenta: Cuenta, run: Ejecutor = gh): RepoInfo[] {
  const salida = run(['repo', 'list', cuenta, '--limit', '300', '--source', '--json', 'name,isPrivate,primaryLanguage'])
  const repos = JSON.parse(salida) as { name: string; isPrivate: boolean; primaryLanguage: { name: string } | null }[]
  return repos.map(r => ({ nombre: r.name, privado: r.isPrivate, lenguaje: r.primaryLanguage?.name ?? null }))
}

export function descargarCommits(cuenta: Cuenta, repo: string, run: Ejecutor = gh): CommitCrudo[] {
  let salida: string
  try {
    salida = run(['api', `repos/${cuenta}/${repo}/commits?per_page=100`, '--paginate'])
  } catch {
    return [] // repo vacío (409) o inaccesible
  }
  return leerFlujoJson(salida)
    .flatMap(v => (Array.isArray(v) ? v : [v]))
    .filter(esCommitApi)
    .map(c => ({ repo, fecha: c.commit.author.date, autor: c.commit.author.name, email: c.commit.author.email, msg: c.commit.message }))
}

export function descargarManifiestos(cuenta: Cuenta, repo: string, run: Ejecutor = gh): string[] {
  return MANIFIESTOS.flatMap(ruta => {
    try {
      const b64 = run(['api', `repos/${cuenta}/${repo}/contents/${ruta}`, '--jq', '.content'])
      return [Buffer.from(b64.replace(/\s/g, ''), 'base64').toString('utf8')]
    } catch {
      return []
    }
  })
}

/** Descarga (o lee de caché) todo lo de una cuenta. La caché vive en .ia-autorretrato/ (ignorado). */
export function descargarCuenta(cuenta: Cuenta, dirCache: string, refrescar = false, run: Ejecutor = gh): DescargaCuenta {
  const archivo = path.join(dirCache, `github-${cuenta}.json`)
  if (!refrescar && fs.existsSync(archivo)) return JSON.parse(fs.readFileSync(archivo, 'utf8'))
  const repos = listarRepos(cuenta, run)
  const commits: CommitCrudo[] = []
  const manifiestos: Record<string, string[]> = {}
  for (const r of repos) {
    console.log(`  ${cuenta}/${r.nombre}`)
    commits.push(...descargarCommits(cuenta, r.nombre, run))
    manifiestos[r.nombre] = descargarManifiestos(cuenta, r.nombre, run)
  }
  const descarga = { cuenta, repos, commits, manifiestos }
  fs.writeFileSync(archivo, JSON.stringify(descarga))
  return descarga
}
```

- [ ] **Step 8: Correr los tests**

Run: `npx vitest run scripts/ia-autorretrato`
Expected: PASS (todos)

- [ ] **Step 9: Commit**

```bash
git add scripts/ia-autorretrato
git commit -m "feat(autorretrato): identidades, normalización de commits y descarga de GitHub con caché"
```

---

### Task 3: Agregados de GitHub (eras, meses, modelos, primera evidencia)

**Files:**
- Create: `scripts/ia-autorretrato/agregadosGithub.ts`
- Test: `scripts/ia-autorretrato/__tests__/agregadosGithub.test.ts`

**Interfaces:**
- Consumes: `CommitNormalizado`, `esPropio`, `tieneIA` (Task 2), `mediana` (Task 2), `Era`, `Cuenta`, `AutorretratoIA['commitsPorMes']`, `AutorretratoIA['modelosPorMes']` (Task 1)
- Produces: `calcularEra(cuenta: Cuenta, commits: CommitNormalizado[]): Era`, `commitsPorMes(commits): AutorretratoIA['commitsPorMes']`, `modelosPorMes(commits): AutorretratoIA['modelosPorMes']`, `primeraFechaPorRepo(commits): Map<string, string>` (clave: repo en minúsculas; valor YYYY-MM)

- [ ] **Step 1: Test que falla**

```ts
import { describe, it, expect } from 'vitest'
import { normalizarCommit } from '../commits'
import { calcularEra, commitsPorMes, modelosPorMes, primeraFechaPorRepo } from '../agregadosGithub'

const T = 'Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>'
const c = (repo: string, fecha: string, autor: string, msg: string) =>
  normalizarCommit('serandmoncas', { repo, fecha: `${fecha}T12:00:00Z`, autor, email: '', msg })

const commits = [
  c('HER', '2026-07-01', 'Sergio Monsalve', `feat: a\n\n${T}`),
  c('HER', '2026-07-02', 'Sergio Monsalve', 'fix: b'),
  c('Bichongos', '2026-08-01', 'Sergio', `docs: c\n\n${T}`),
  c('New-Old-School', '2026-10-01', 'Claude', 'docs: d'),
  c('x', '2026-10-02', 'Vercel', 'chore: bot'),
  c('lacasona', '2026-10-03', 'Persona X', 'cambio'),
]

describe('agregados de GitHub', () => {
  it('era: propios excluye bots y personas; cuenta modelos y personas', () => {
    const e = calcularEra('serandmoncas', commits)
    expect(e.commitsPropios).toBe(4)
    expect(e.reposActivos).toBe(3)
    expect(e.desde).toBe('2026-07-01')
    expect(e.hasta).toBe('2026-10-01')
    expect(e.coautores).toEqual([{ tipo: 'persona', n: 1 }, { tipo: 'modelo', n: 1 }])
    expect(e.medianaMensajeSinTrailer).toBeLessThanOrEqual(e.medianaMensaje)
  })
  it('commits por mes con coautoría y tipo', () => {
    expect(commitsPorMes(commits)).toEqual([
      { mes: '2026-07', total: 2, coautoriaClaude: 1, porTipo: { feat: 1, fix: 1 } },
      { mes: '2026-08', total: 1, coautoriaClaude: 1, porTipo: { docs: 1 } },
      { mes: '2026-10', total: 1, coautoriaClaude: 1, porTipo: { docs: 1 } },
    ])
  })
  it('modelos por mes incluye a Claude como autor', () => {
    expect(modelosPorMes(commits)).toEqual([
      { mes: '2026-07', modelo: 'Claude Sonnet 5', commits: 1 },
      { mes: '2026-08', modelo: 'Claude Sonnet 5', commits: 1 },
      { mes: '2026-10', modelo: 'Claude (autor)', commits: 1 },
    ])
  })
  it('primera fecha por repo en minúsculas', () => {
    const m = primeraFechaPorRepo(commits)
    expect(m.get('her')).toBe('2026-07')
    expect(m.has('x')).toBe(false) // solo propios
  })
})
```

- [ ] **Step 2: Correr y ver que falla**

Run: `npx vitest run scripts/ia-autorretrato/__tests__/agregadosGithub.test.ts`
Expected: FAIL ("Failed to resolve import '../agregadosGithub'")

- [ ] **Step 3: Implementar `agregadosGithub.ts`**

```ts
import type { AutorretratoIA, Cuenta, Era } from '@/lib/ia-autorretrato/tipos'
import { esPropio, tieneIA, type CommitNormalizado } from './commits'
import { mediana } from './util'

export function calcularEra(cuenta: Cuenta, commits: CommitNormalizado[]): Era {
  const propios = commits.filter(esPropio)
  const fechas = propios.map(c => c.fecha).sort()
  const personas = new Set(commits.filter(c => !c.esBot && !c.esSergio && !c.autorClaude).map(c => c.autor))
  const modelos = new Set(commits.flatMap(c => c.modelos))
  return {
    cuenta,
    desde: fechas[0] ?? '',
    hasta: fechas.at(-1) ?? '',
    commitsPropios: propios.length,
    reposActivos: new Set(propios.map(c => c.repo)).size,
    medianaMensaje: mediana(propios.map(c => c.largoMensaje)),
    medianaMensajeSinTrailer: mediana(propios.map(c => c.largoSinTrailer)),
    coautores: [{ tipo: 'persona', n: personas.size }, { tipo: 'modelo', n: modelos.size }],
  }
}

export function commitsPorMes(commits: CommitNormalizado[]): AutorretratoIA['commitsPorMes'] {
  const meses = new Map<string, AutorretratoIA['commitsPorMes'][number]>()
  for (const c of commits.filter(esPropio)) {
    const m = meses.get(c.mes) ?? { mes: c.mes, total: 0, coautoriaClaude: 0, porTipo: {} }
    m.total++
    if (tieneIA(c)) m.coautoriaClaude++
    m.porTipo[c.tipo] = (m.porTipo[c.tipo] ?? 0) + 1
    meses.set(c.mes, m)
  }
  return [...meses.values()].sort((a, b) => a.mes.localeCompare(b.mes))
}

export function modelosPorMes(commits: CommitNormalizado[]): AutorretratoIA['modelosPorMes'] {
  const cuenta = new Map<string, number>()
  for (const c of commits.filter(esPropio)) {
    const modelos = c.modelos.length ? c.modelos : c.autorClaude ? ['Claude (autor)'] : []
    for (const m of modelos) cuenta.set(`${c.mes}|${m}`, (cuenta.get(`${c.mes}|${m}`) ?? 0) + 1)
  }
  return [...cuenta.entries()]
    .map(([k, commits]) => { const [mes, modelo] = k.split('|'); return { mes, modelo, commits } })
    .sort((a, b) => a.mes.localeCompare(b.mes) || a.modelo.localeCompare(b.modelo))
}

export function primeraFechaPorRepo(commits: CommitNormalizado[]): Map<string, string> {
  const primera = new Map<string, string>()
  for (const c of commits.filter(esPropio)) {
    const clave = c.repo.toLowerCase()
    const actual = primera.get(clave)
    if (!actual || c.mes < actual) primera.set(clave, c.mes)
  }
  return primera
}
```

- [ ] **Step 4: Correr el test**

Run: `npx vitest run scripts/ia-autorretrato/__tests__/agregadosGithub.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add scripts/ia-autorretrato
git commit -m "feat(autorretrato): agregados de GitHub por era, mes y modelo"
```

---

### Task 4: Datos de Claude Code (historial, sesiones, perfil, citas)

**Files:**
- Create: `scripts/ia-autorretrato/claudeCode.ts`
- Test: `scripts/ia-autorretrato/__tests__/claudeCode.test.ts`

**Interfaces:**
- Consumes: `diaBogota`, `mediana` (Task 2), `GrupoHerramienta`, `AutorretratoIA` (Task 1)
- Produces:
  - `type Prompt = { texto: string; proyecto: string; fecha: string; sesion: string }`
  - `leerHistorial(texto: string): Prompt[]`
  - `actividadDiaria(prompts: Prompt[]): AutorretratoIA['actividadDiaria']`
  - `nombreHerramienta(n: string): string`, `grupoDe(nombre: string): GrupoHerramienta`
  - `leerSesiones(textos: string[]): { herramientas: AutorretratoIA['herramientas']; modelos: AutorretratoIA['modelos'] }`
  - `perfilPrompts(prompts: Prompt[]): AutorretratoIA['perfilPrompts']`
  - `seleccionarCitas(prompts: Prompt[], max?: number): Prompt[]`

- [ ] **Step 1: Test que falla**

```ts
import { describe, it, expect } from 'vitest'
import { actividadDiaria, grupoDe, leerHistorial, leerSesiones, nombreHerramienta, perfilPrompts, seleccionarCitas } from '../claudeCode'

const linea = (display: string, iso: string, project = '/Users/x/Code/HER', sessionId = 's1') =>
  JSON.stringify({ display, pastedContents: {}, timestamp: Date.parse(iso), project, sessionId })

describe('historial', () => {
  it('lee prompts, ignora líneas corruptas y vacías, fecha en Bogotá', () => {
    const texto = [
      linea('hola, ¿qué es RAG?', '2026-10-15T03:00:00Z'),
      '{"display": "cortad',
      linea('   ', '2026-10-15T12:00:00Z'),
      linea('arma el pipeline', '2026-10-15T12:00:00Z', '/Users/x/Code/sergiomonsalve.com', 's2'),
    ].join('\n')
    const ps = leerHistorial(texto)
    expect(ps).toHaveLength(2)
    expect(ps[0]).toMatchObject({ fecha: '2026-10-14', proyecto: 'HER', sesion: 's1' })
    expect(ps[1].proyecto).toBe('sergiomonsalve.com')
  })
  it('actividad diaria cuenta prompts y sesiones distintas', () => {
    const ps = leerHistorial([
      linea('a', '2026-10-15T12:00:00Z', '/p/A', 's1'),
      linea('b', '2026-10-15T13:00:00Z', '/p/A', 's1'),
      linea('c', '2026-10-15T14:00:00Z', '/p/A', 's2'),
      linea('d', '2026-10-16T14:00:00Z', '/p/A', 's3'),
    ].join('\n'))
    expect(actividadDiaria(ps)).toEqual([
      { fecha: '2026-10-15', prompts: 3, sesiones: 2 },
      { fecha: '2026-10-16', prompts: 1, sesiones: 1 },
    ])
  })
})

describe('sesiones', () => {
  it('cuenta herramientas y modelos; ignora <synthetic> y líneas rotas', () => {
    const a = (model: string, tools: string[]) => JSON.stringify({ type: 'assistant', message: { model, content: tools.map(name => ({ type: 'tool_use', name })) } })
    const texto = [a('claude-opus-5-5', ['Bash', 'Bash', 'mcp__claude-in-chrome__navigate']), a('<synthetic>', ['Bash']), 'xx{', a('claude-opus-5', ['Read'])].join('\n')
    const r = leerSesiones([texto])
    expect(r.modelos).toEqual([{ modelo: 'claude-opus-5', respuestas: 1 }, { modelo: 'claude-opus-5-5', respuestas: 1 }])
    expect(r.herramientas).toEqual([
      { nombre: 'Bash', usos: 2, grupo: 'ejecucion' },
      { nombre: 'mcp:claude-in-chrome', usos: 1, grupo: 'navegador' }, // empate: orden alfabético (localeCompare)
      { nombre: 'Read', usos: 1, grupo: 'edicion' },
    ])
  })
  it('agrupa herramientas', () => {
    expect(nombreHerramienta('mcp__plugin_playwright_playwright__browser_click')).toBe('mcp:plugin_playwright_playwright')
    expect(grupoDe('mcp:plugin_playwright_playwright')).toBe('navegador')
    expect(grupoDe('mcp:railway')).toBe('mcp')
    expect(grupoDe('WebFetch')).toBe('investigacion')
    expect(grupoDe('Agent')).toBe('orquestacion')
  })
})

describe('perfil y citas', () => {
  const ps = leerHistorial([
    linea('¿qué es un embedding?', '2026-10-15T12:00:00Z'),
    linea('arma el pipeline de datos con los commits y escribe la spec', '2026-10-15T12:00:00Z'),
    linea('/clear', '2026-10-15T12:00:00Z'),
    linea('please fix the tests and the build', '2026-10-15T12:00:00Z'),
  ].join('\n'))
  it('perfil excluye comandos y calcula porcentajes enteros', () => {
    const p = perfilPrompts(ps)
    expect(p.total).toBe(3)
    expect(p.pctPreguntas).toBe(33)
    expect(p.pctEspanol).toBe(67)
  })
  it('citas: solo prompts de largo medio, sin URLs ni comandos', () => {
    const largo = 'quiero que el análisis muestre cómo cambió mi forma de escribir commits desde que trabajo con agentes'
    const cs = seleccionarCitas(leerHistorial([linea(largo, '2026-10-15T12:00:00Z'), linea('mira https://x.y ' + largo, '2026-10-15T12:00:00Z'), linea('corto', '2026-10-15T12:00:00Z')].join('\n')))
    expect(cs.map(c => c.texto)).toEqual([largo])
  })
})
```

- [ ] **Step 2: Correr y ver que falla**

Run: `npx vitest run scripts/ia-autorretrato/__tests__/claudeCode.test.ts`
Expected: FAIL ("Failed to resolve import '../claudeCode'")

- [ ] **Step 3: Implementar `claudeCode.ts`**

```ts
import path from 'node:path'
import type { AutorretratoIA, GrupoHerramienta } from '@/lib/ia-autorretrato/tipos'
import { diaBogota, mediana } from './util'

export type Prompt = { texto: string; proyecto: string; fecha: string; sesion: string }

function* lineasJson(texto: string): Generator<Record<string, unknown>> {
  for (const linea of texto.split('\n')) {
    if (!linea.trim()) continue
    try {
      yield JSON.parse(linea)
    } catch {
      // línea cortada o corrupta: se ignora
    }
  }
}

export function leerHistorial(texto: string): Prompt[] {
  const prompts: Prompt[] = []
  for (const r of lineasJson(texto)) {
    const display = typeof r.display === 'string' ? r.display.trim() : ''
    if (!display || typeof r.timestamp !== 'number') continue
    prompts.push({
      texto: display,
      proyecto: path.basename(String(r.project ?? '')),
      fecha: diaBogota(r.timestamp),
      sesion: String(r.sessionId ?? ''),
    })
  }
  return prompts
}

export function actividadDiaria(prompts: Prompt[]): AutorretratoIA['actividadDiaria'] {
  const dias = new Map<string, { prompts: number; sesiones: Set<string> }>()
  for (const p of prompts) {
    const d = dias.get(p.fecha) ?? { prompts: 0, sesiones: new Set<string>() }
    d.prompts++
    d.sesiones.add(p.sesion)
    dias.set(p.fecha, d)
  }
  return [...dias.entries()]
    .map(([fecha, d]) => ({ fecha, prompts: d.prompts, sesiones: d.sesiones.size }))
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
}

export function nombreHerramienta(n: string): string {
  return n.startsWith('mcp__') ? `mcp:${n.split('__')[1]}` : n
}

export function grupoDe(nombre: string): GrupoHerramienta {
  if (nombre === 'Bash') return 'ejecucion'
  if (nombre === 'WebSearch' || nombre === 'WebFetch') return 'investigacion'
  if (/chrome|playwright|browser/i.test(nombre)) return 'navegador'
  if (nombre.startsWith('mcp:')) return 'mcp'
  if (['Read', 'Write', 'Edit', 'NotebookEdit'].includes(nombre)) return 'edicion'
  return 'orquestacion'
}

const ordenarConteo = <T extends string>(m: Map<T, number>) =>
  [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))

export function leerSesiones(textos: string[]): Pick<AutorretratoIA, 'herramientas' | 'modelos'> {
  const herramientas = new Map<string, number>()
  const modelos = new Map<string, number>()
  for (const texto of textos) {
    for (const r of lineasJson(texto)) {
      if (r.type !== 'assistant') continue
      const msg = r.message as { model?: string; content?: unknown } | undefined
      if (!msg?.model || msg.model === '<synthetic>') continue
      modelos.set(msg.model, (modelos.get(msg.model) ?? 0) + 1)
      for (const c of Array.isArray(msg.content) ? msg.content : []) {
        if (c?.type === 'tool_use' && typeof c.name === 'string') {
          const n = nombreHerramienta(c.name)
          herramientas.set(n, (herramientas.get(n) ?? 0) + 1)
        }
      }
    }
  }
  return {
    herramientas: ordenarConteo(herramientas).slice(0, 15).map(([nombre, usos]) => ({ nombre, usos, grupo: grupoDe(nombre) })),
    modelos: ordenarConteo(modelos).map(([modelo, respuestas]) => ({ modelo, respuestas })),
  }
}

const PALABRAS_ES = new Set(['el', 'la', 'de', 'que', 'y', 'en', 'los', 'las', 'por', 'para', 'con', 'una', 'un', 'es', 'como', 'mi', 'del'])
const PALABRAS_EN = new Set(['the', 'and', 'of', 'to', 'is', 'in', 'for', 'with', 'that', 'this', 'it', 'on', 'please'])
const INICIO_PREGUNTA = /^[¿]?(que|qué|como|cómo|por que|por qué|cual|cuál|cuales|what|how|why|can|could|is|are|do|does)\b/i

function idioma(texto: string): 'es' | 'en' | null {
  const palabras = texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').split(/[^a-z]+/)
  const es = palabras.filter(p => PALABRAS_ES.has(p)).length
  const en = palabras.filter(p => PALABRAS_EN.has(p)).length
  if (es === 0 && en === 0) return null
  return es >= en ? 'es' : 'en'
}

const esComando = (p: Prompt) => p.texto.startsWith('/')

export function perfilPrompts(prompts: Prompt[]): AutorretratoIA['perfilPrompts'] {
  const utiles = prompts.filter(p => !esComando(p))
  const preguntas = utiles.filter(p => /\?\s*$/.test(p.texto) || INICIO_PREGUNTA.test(p.texto)).length
  const idiomas = utiles.map(p => idioma(p.texto)).filter(Boolean)
  const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 0)
  return {
    total: utiles.length,
    medianaCaracteres: mediana(utiles.map(p => p.texto.length)),
    pctPreguntas: pct(preguntas, utiles.length),
    pctEspanol: pct(idiomas.filter(i => i === 'es').length, idiomas.length),
  }
}

/** Candidatas para que Sergio elija citas. Se escriben solo en .ia-autorretrato/ (privado). */
export function seleccionarCitas(prompts: Prompt[], max = 30): Prompt[] {
  const aptas = prompts.filter(p =>
    !esComando(p) && p.texto.length >= 60 && p.texto.length <= 280 &&
    !/https?:\/\/|@|\/Users\//.test(p.texto) && idioma(p.texto) === 'es')
  const porMes = new Map<string, Prompt>()
  for (const p of aptas) {
    const clave = `${p.fecha.slice(0, 7)}|${p.proyecto}`
    const actual = porMes.get(clave)
    if (!actual || p.texto.length > actual.texto.length) porMes.set(clave, p)
  }
  return [...porMes.values()].sort((a, b) => a.fecha.localeCompare(b.fecha)).slice(0, max)
}
```

- [ ] **Step 4: Correr el test**

Run: `npx vitest run scripts/ia-autorretrato/__tests__/claudeCode.test.ts`
Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add scripts/ia-autorretrato
git commit -m "feat(autorretrato): lectura del historial y sesiones de Claude Code"
```

---

### Task 5: Dominios

**Files:**
- Create: `scripts/ia-autorretrato/dominios.ts`
- Test: `scripts/ia-autorretrato/__tests__/dominios.test.ts`

**Interfaces:**
- Consumes: `Prompt` (Task 4), `Dominio`, `AutorretratoIA` (Task 1)
- Produces: `DOMINIO_POR_PROYECTO: Record<string, Dominio>` (claves en minúsculas), `dominioDe(proyectoORepo: string): Dominio`, `promptsPorDominio(prompts: Prompt[], reposPublicos: string[]): AutorretratoIA['promptsPorDominio']`

- [ ] **Step 1: Test que falla**

```ts
import { describe, it, expect } from 'vitest'
import { dominioDe, promptsPorDominio } from '../dominios'
import type { Prompt } from '../claudeCode'

const p = (proyecto: string): Prompt => ({ texto: 'x', proyecto, fecha: '2026-10-15', sesion: 's' })

describe('dominios', () => {
  it('mapea sin importar mayúsculas y usa experimentos por defecto', () => {
    expect(dominioDe('Repo-Secreto')).toBe('hongos-iot')
    expect(dominioDe('repo-secreto')).toBe('hongos-iot')
    expect(dominioDe('HER')).toBe('agentes')
    expect(dominioDe('Code')).toBe('experimentos')
    expect(dominioDe('desconocido')).toBe('experimentos')
  })
  it('agrupa prompts y solo lista repos públicos con la grafía de GitHub', () => {
    const r = promptsPorDominio([p('sergiomonsalve.com'), p('sergiomonsalve.com'), p('repo-secreto'), p('InteFin')], ['sergiomonsalve.com', 'InteFin'])
    expect(r).toEqual([
      { dominio: 'producto-web', prompts: 3, reposPublicos: ['InteFin', 'sergiomonsalve.com'] },
      { dominio: 'hongos-iot', prompts: 1, reposPublicos: [] },
    ])
  })
})
```

- [ ] **Step 2: Correr y ver que falla**

Run: `npx vitest run scripts/ia-autorretrato/__tests__/dominios.test.ts`
Expected: FAIL ("Failed to resolve import '../dominios'")

- [ ] **Step 3: Implementar `dominios.ts`**

```ts
import type { AutorretratoIA, Dominio } from '@/lib/ia-autorretrato/tipos'
import type { Prompt } from './claudeCode'

/** Proyecto local o repo → dominio. Claves en minúsculas. Editable por Sergio. */
export const DOMINIO_POR_PROYECTO: Record<string, Dominio> = {
  'sergiomonsalve.com': 'producto-web', 'intefin': 'producto-web', 'slogs': 'producto-web',
  'sama-mobile': 'producto-web', 'dharmastudio.art': 'producto-web', 'personalpage': 'producto-web',
  'pp_nextjs': 'producto-web', 'personal_page': 'producto-web',
  'bichongos.store': 'producto-web',
  'bichongos': 'hongos-iot',
  'mobile-esp32': 'hongos-iot',
  // (otros proyectos privados: viven en .ia-autorretrato/dominios-privados.json)
  'curso-cultivo-de-orellanas-': 'hongos-iot',
  'expia': 'educacion', 'especializacion-ia': 'educacion',
  'medmap': 'educacion', 'tesismaestria': 'educacion',
  'stemedu': 'educacion', 'new-old-school': 'educacion', 'claudedataviz': 'educacion',
  'her': 'agentes', 'brayan': 'agentes',
}

export function dominioDe(proyectoORepo: string): Dominio {
  return DOMINIO_POR_PROYECTO[proyectoORepo.toLowerCase()] ?? 'experimentos'
}

export function promptsPorDominio(prompts: Prompt[], reposPublicos: string[]): AutorretratoIA['promptsPorDominio'] {
  const publicos = new Map(reposPublicos.map(r => [r.toLowerCase(), r]))
  const porDominio = new Map<Dominio, { prompts: number; repos: Set<string> }>()
  for (const p of prompts) {
    const dominio = dominioDe(p.proyecto)
    const d = porDominio.get(dominio) ?? { prompts: 0, repos: new Set<string>() }
    d.prompts++
    const publico = publicos.get(p.proyecto.toLowerCase())
    if (publico) d.repos.add(publico)
    porDominio.set(dominio, d)
  }
  return [...porDominio.entries()]
    .map(([dominio, d]) => ({ dominio, prompts: d.prompts, reposPublicos: [...d.repos].sort((a, b) => a.localeCompare(b)) }))
    .sort((a, b) => b.prompts - a.prompts)
}
```

- [ ] **Step 4: Correr el test**

Run: `npx vitest run scripts/ia-autorretrato/__tests__/dominios.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add scripts/ia-autorretrato
git commit -m "feat(autorretrato): dominios de proyectos y prompts por dominio"
```

---

### Task 6: CSV y clasificador de conceptos

**Files:**
- Create: `scripts/ia-autorretrato/csv.ts`, `scripts/ia-autorretrato/conceptos.ts`
- Test: `scripts/ia-autorretrato/__tests__/conceptos.test.ts`

**Interfaces:**
- Consumes: `normalizar` de `@/lib/experiencias-ia/buscar`, `escaparRegex` (Task 2), `ConceptoClasificado`, `Cuadrante` (Task 1), `TerminoGlosario` de `@/lib/experiencias-ia/glosario`
- Produces: `aCsv(filas: (string | number | boolean)[][]): string`, `deCsv(texto: string): string[][]`, `variantes(termino: string): string[]`, `contiene(textoNormalizado: string, variante: string): boolean`, `esOracionPregunta(o: string): boolean`, `clasificarConceptos(glosario: Pick<TerminoGlosario,'slug'|'termino'|'categoria'>[], prompts: string[], senalesCodigo: string, correcciones?: Map<string, Cuadrante>): ConceptoClasificado[]`, `revisionConceptos(cs: ConceptoClasificado[]): string`, `leerCorrecciones(csv: string): Map<string, Cuadrante>`

- [ ] **Step 1: Test que falla**

```ts
import { describe, it, expect } from 'vitest'
import { aCsv, deCsv } from '../csv'
import { clasificarConceptos, contiene, leerCorrecciones, revisionConceptos, variantes } from '../conceptos'

const glosario = [
  { slug: 'rag', termino: 'Retrieval-Augmented Generation (RAG)', categoria: 'contexto-memoria' },
  { slug: 'contexto', termino: 'Contexto', categoria: 'contexto-memoria' },
  { slug: 'mcp', termino: 'MCP', categoria: 'operacion-evaluacion' },
  { slug: 'fine-tuning', termino: 'Fine-tuning', categoria: 'fundamentos' },
]

describe('csv', () => {
  it('ida y vuelta con comas y comillas', () => {
    const filas = [['a', 'b,c', 'd "e"'], ['1', '2', '3']]
    expect(deCsv(aCsv(filas))).toEqual(filas)
  })
})

describe('conceptos', () => {
  it('variantes incluyen la sigla entre paréntesis y sinónimos', () => {
    expect(variantes('Retrieval-Augmented Generation (RAG)')).toEqual(expect.arrayContaining(['retrieval-augmented generation', 'rag']))
    expect(variantes('MCP')).toContain('model context protocol')
  })
  it('coincidencia por palabra completa: contexto no está en contextos', () => {
    expect(contiene('usa el contexto', 'contexto')).toBe(true)
    expect(contiene('los contextos largos', 'contexto')).toBe(false)
    expect(contiene('el rag-pipeline', 'rag')).toBe(true)
  })
  it('clasifica: hablado, preguntado, construido y cuadrante', () => {
    const prompts = ['¿Qué es MCP?', 'Agrega RAG al buscador. Usa el contexto del glosario.', 'explícame qué es fine-tuning']
    const r = Object.fromEntries(clasificarConceptos(glosario, prompts, 'next pgvector supabase').map(c => [c.slug, c]))
    expect(r.rag).toMatchObject({ hablado: 1, preguntado: 0, construido: true, cuadrante: 'ambos' })
    expect(r.contexto).toMatchObject({ hablado: 1, construido: false, cuadrante: 'solo-hablado' })
    expect(r.mcp).toMatchObject({ hablado: 0, preguntado: 1, cuadrante: 'ninguno' })
    expect(r['fine-tuning']).toMatchObject({ hablado: 0, preguntado: 1 })
  })
  it('las correcciones de Sergio mandan y quedan marcadas', () => {
    const csv = revisionConceptos(clasificarConceptos(glosario, [], ''))
    const filas = deCsv(csv)
    expect(filas[0]).toEqual(['slug', 'termino', 'categoria', 'hablado', 'preguntado', 'construido', 'cuadrante', 'correccion'])
    filas[3][7] = 'ambos' // mcp
    const correcciones = leerCorrecciones(aCsv(filas))
    expect(correcciones.get('mcp')).toBe('ambos')
    const mcp = clasificarConceptos(glosario, [], '', correcciones).find(c => c.slug === 'mcp')!
    expect(mcp).toMatchObject({ cuadrante: 'ambos', corregido: true })
  })
  it('una corrección inválida falla con el slug', () => {
    expect(() => leerCorrecciones('slug,termino,categoria,hablado,preguntado,construido,cuadrante,correccion\nmcp,MCP,x,0,0,false,ninguno,quizas\n')).toThrow(/mcp/)
  })
})
```

- [ ] **Step 2: Correr y ver que falla**

Run: `npx vitest run scripts/ia-autorretrato/__tests__/conceptos.test.ts`
Expected: FAIL ("Failed to resolve import '../csv'")

- [ ] **Step 3: Implementar `csv.ts`**

```ts
const celda = (v: string | number | boolean) => {
  const s = String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function aCsv(filas: (string | number | boolean)[][]): string {
  return filas.map(f => f.map(celda).join(',')).join('\n') + '\n'
}

export function deCsv(texto: string): string[][] {
  const filas: string[][] = []
  let fila: string[] = []
  let actual = ''
  let comillas = false
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i]
    if (comillas) {
      if (c === '"' && texto[i + 1] === '"') { actual += '"'; i++ }
      else if (c === '"') comillas = false
      else actual += c
    } else if (c === '"') comillas = true
    else if (c === ',') { fila.push(actual); actual = '' }
    else if (c === '\n') { fila.push(actual); filas.push(fila); fila = []; actual = '' }
    else if (c !== '\r') actual += c
  }
  if (actual || fila.length) { fila.push(actual); filas.push(fila) }
  return filas
}
```

- [ ] **Step 4: Implementar `conceptos.ts`**

```ts
import { normalizar } from '@/lib/experiencias-ia/buscar'
import type { ConceptoClasificado, Cuadrante } from '@/lib/ia-autorretrato/tipos'
import { aCsv, deCsv } from './csv'
import { escaparRegex } from './util'

type EntradaGlosario = { slug: string; termino: string; categoria: string }

/** Clave: variante normalizada del término. Editable. */
export const SINONIMOS: Record<string, string[]> = {
  llm: ['llms', 'modelo de lenguaje', 'modelos de lenguaje'],
  mcp: ['model context protocol'],
  rag: ['retrieval augmented generation', 'retrieval-augmented generation'],
  agente: ['agentes'],
  embeddings: ['embedding'],
}

/** Señales en manifiestos y lenguajes que indican que el concepto está construido. */
export const SENALES_CODIGO: Record<string, RegExp> = {
  rag: /pgvector|chromadb|faiss|pinecone|embedding/,
  embeddings: /embedding|sentence-transformers|pgvector/,
  agente: /anthropic|openai|langchain|crewai|ollama/,
  mcp: /modelcontextprotocol/,
}

export function variantes(termino: string): string[] {
  const base = normalizar(termino).trim()
  const sinParentesis = base.replace(/\s*\([^)]*\)\s*/g, ' ').trim()
  const dentro = [...base.matchAll(/\(([^)]+)\)/g)].map(m => m[1].trim())
  const todas = new Set([base, sinParentesis, ...dentro].filter(v => v.length >= 2))
  for (const v of [...todas]) for (const s of SINONIMOS[v] ?? []) todas.add(s)
  return [...todas]
}

export function contiene(textoNormalizado: string, variante: string): boolean {
  return new RegExp(`(^|[^a-z0-9])${escaparRegex(variante)}([^a-z0-9]|$)`).test(textoNormalizado)
}

const INTERROGATIVOS = /(que es|que son|que significa|explicame|como funciona|what is|what are|what does)/

export function esOracionPregunta(oracion: string): boolean {
  const o = oracion.trim()
  return o.endsWith('?') || INTERROGATIVOS.test(o)
}

const oraciones = (texto: string) => normalizar(texto).split(/(?<=[.!?\n])\s+/).filter(Boolean)

export function clasificarConceptos(
  glosario: EntradaGlosario[],
  prompts: string[],
  senalesCodigo: string,
  correcciones: Map<string, Cuadrante> = new Map(),
): ConceptoClasificado[] {
  const porPrompt = prompts.map(oraciones)
  return glosario.map(g => {
    const vars = variantes(g.termino)
    let hablado = 0
    let preguntado = 0
    for (const os of porPrompt) {
      const conTermino = os.filter(o => vars.some(v => contiene(o, v)))
      if (conTermino.length === 0) continue
      if (conTermino.every(esOracionPregunta)) preguntado++
      else hablado++
    }
    const construido = vars.some(v => contiene(senalesCodigo, v) || (SENALES_CODIGO[v]?.test(senalesCodigo) ?? false))
    const calculado: Cuadrante = hablado > 0
      ? (construido ? 'ambos' : 'solo-hablado')
      : (construido ? 'solo-construido' : 'ninguno')
    return {
      slug: g.slug, termino: g.termino, categoria: g.categoria,
      hablado, preguntado, construido,
      cuadrante: correcciones.get(g.slug) ?? calculado,
      corregido: correcciones.has(g.slug),
    }
  })
}

const CABECERA = ['slug', 'termino', 'categoria', 'hablado', 'preguntado', 'construido', 'cuadrante', 'correccion']
const CUADRANTES: Cuadrante[] = ['ambos', 'solo-hablado', 'solo-construido', 'ninguno']

/** CSV para que Sergio revise. La columna `correccion` vacía = de acuerdo. */
export function revisionConceptos(cs: ConceptoClasificado[]): string {
  return aCsv([CABECERA, ...cs.map(c => [c.slug, c.termino, c.categoria, c.hablado, c.preguntado, c.construido, c.cuadrante, ''])])
}

export function leerCorrecciones(csv: string): Map<string, Cuadrante> {
  const [cabecera, ...filas] = deCsv(csv)
  const iSlug = cabecera.indexOf('slug')
  const iCorr = cabecera.indexOf('correccion')
  const correcciones = new Map<string, Cuadrante>()
  for (const f of filas) {
    const valor = (f[iCorr] ?? '').trim()
    if (!valor) continue
    if (!CUADRANTES.includes(valor as Cuadrante)) throw new Error(`Corrección inválida para "${f[iSlug]}": ${valor}`)
    correcciones.set(f[iSlug], valor as Cuadrante)
  }
  return correcciones
}
```

- [ ] **Step 5: Correr el test**

Run: `npx vitest run scripts/ia-autorretrato/__tests__/conceptos.test.ts`
Expected: PASS (6 tests)

- [ ] **Step 6: Commit**

```bash
git add scripts/ia-autorretrato
git commit -m "feat(autorretrato): clasificador de conceptos hablado/construido/preguntado con revisión en CSV"
```

---

### Task 7: Filtro de privacidad

**Files:**
- Create: `scripts/ia-autorretrato/privacidad.ts`
- Test: `scripts/ia-autorretrato/__tests__/privacidad.test.ts`

**Interfaces:**
- Consumes: `escaparRegex` (Task 2)
- Produces: `type ListaNegra = { prompts: string[]; reposPrivados: string[]; personas: string[]; permitidos?: string[] }`, `verificarPrivacidad(texto: string, lista: ListaNegra): string[]` (lista de problemas; vacía = OK)

- [ ] **Step 1: Test que falla**

```ts
import { describe, it, expect } from 'vitest'
import { verificarPrivacidad } from '../privacidad'

const prompt = 'arma un análisis de mis commits del proyecto con el cliente y compáralo con la propuesta privada'
const lista = { prompts: [prompt, 'corto'], reposPrivados: ['repo-secreto', 'PROY-X'], personas: ['Persona Real', 'estudiante'], permitidos: ['estudiante'] }

describe('privacidad', () => {
  it('JSON limpio pasa', () => {
    expect(verificarPrivacidad(JSON.stringify({ dominio: 'hongos-iot', repos: ['repo-secreto-backend-publico'] }), { ...lista, reposPrivados: ['PROY-X'] })).toEqual([])
  })
  it('rechaza un prompt literal', () => {
    expect(verificarPrivacidad(JSON.stringify({ x: prompt }), lista)).toEqual([expect.stringMatching(/prompt literal/)])
  })
  it('rechaza un repo privado como palabra completa, sin importar mayúsculas', () => {
    expect(verificarPrivacidad('{"repo":"Repo-Secreto"}', lista)).toEqual(['nombre privado: repo-secreto'])
    expect(verificarPrivacidad('{"repo":"repo-secreto-mobile"}', lista)).toEqual([])
  })
  it('rechaza personas reales, salvo palabras permitidas', () => {
    expect(verificarPrivacidad('{"n":"Persona Real"}', lista)).toEqual(['nombre privado: Persona Real'])
    expect(verificarPrivacidad('{"n":"estudiante"}', lista)).toEqual([])
  })
  it('rechaza correos y rutas absolutas', () => {
    expect(verificarPrivacidad('{"a":"x@y.co","b":"/Users/sergio/x"}', lista)).toEqual(['correo electrónico', 'ruta absoluta /Users/'])
  })
  it('sirve para un MDX: un repo privado pegado en una cita se detecta', () => {
    expect(verificarPrivacidad('> "revisa PROY-X antes del viernes"', { ...lista, prompts: [] })).toEqual(['nombre privado: PROY-X'])
  })
})
```

Nota: en el primer caso `repo-secreto-backend-publico` no dispara `repo-secreto` porque la frontera de palabra incluye `-`.

- [ ] **Step 2: Correr y ver que falla**

Run: `npx vitest run scripts/ia-autorretrato/__tests__/privacidad.test.ts`
Expected: FAIL ("Failed to resolve import '../privacidad'")

- [ ] **Step 3: Implementar `privacidad.ts`**

```ts
import { escaparRegex } from './util'

export type ListaNegra = { prompts: string[]; reposPrivados: string[]; personas: string[]; permitidos?: string[] }

/** Devuelve los problemas encontrados en `texto` (JSON publicado o MDX). Vacío = se puede publicar. */
export function verificarPrivacidad(texto: string, lista: ListaNegra): string[] {
  const problemas: string[] = []
  const permitidos = new Set((lista.permitidos ?? []).map(p => p.toLowerCase()))

  for (const p of lista.prompts) {
    const t = p.trim()
    if (t.length <= 40) continue
    const fragmento = JSON.stringify(t).slice(1, 41)
    if (texto.includes(fragmento) || texto.includes(t.slice(0, 40))) problemas.push(`prompt literal: "${t.slice(0, 20)}…"`)
  }

  const minusculas = texto.toLowerCase()
  for (const nombre of [...lista.reposPrivados, ...lista.personas]) {
    const n = nombre.toLowerCase()
    if (permitidos.has(n)) continue
    if (new RegExp(`(^|[^a-z0-9._-])${escaparRegex(n)}([^a-z0-9._-]|$)`).test(minusculas)) problemas.push(`nombre privado: ${nombre}`)
  }

  if (/[\w.+-]+@[\w-]+\.[a-z]{2,}/i.test(texto)) problemas.push('correo electrónico')
  if (texto.includes('/Users/')) problemas.push('ruta absoluta /Users/')
  return problemas
}
```

- [ ] **Step 4: Correr el test**

Run: `npx vitest run scripts/ia-autorretrato/__tests__/privacidad.test.ts`
Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add scripts/ia-autorretrato
git commit -m "feat(autorretrato): filtro de privacidad para el JSON y el MDX"
```

---

### Task 8: Grafos de coautoría y del discurso

**Files:**
- Create: `scripts/ia-autorretrato/red.ts`
- Test: `scripts/ia-autorretrato/__tests__/red.test.ts`

**Interfaces:**
- Consumes: `CommitNormalizado` (Task 2), `dominioDe` (Task 5), `contiene` (Task 6), `normalizar`, `Cuenta`, `GrafoCoautoria`, `GrafoDiscurso` (Task 1)
- Produces:
  - `grafoCoautoria(era: Cuenta, commits: CommitNormalizado[]): GrafoCoautoria`. Ids: `sergio`, `persona-N`, `modelo:<nombre>`, `dominio:<dominio>`; layout: autores en x=0.32, dominios en x=0.72, y=(i+1)/(n+1) redondeado a 3 decimales.
  - `type ConceptoDiscurso = { id: string; etiqueta: string; etiquetaEn: string; variantes: string[] }`, `type RelacionDiscurso = { de: string; a: string; motivo: string }`
  - `grafoDiscurso(conceptos: ConceptoDiscurso[], relaciones: RelacionDiscurso[], prompts: string[]): GrafoDiscurso` (círculo: x=0.5+0.38·cos, y=0.5+0.38·sin, desde −π/2)

- [ ] **Step 1: Test que falla**

```ts
import { describe, it, expect } from 'vitest'
import { normalizarCommit } from '../commits'
import { grafoCoautoria, grafoDiscurso } from '../red'

const c = (repo: string, fecha: string, autor: string, msg = 'x') =>
  normalizarCommit('smonsalve', { repo, fecha: `${fecha}T12:00:00Z`, autor, email: '', msg })

describe('grafo de coautoría', () => {
  const commits = [
    c('lacasona', '2013-02-19', 'Persona Real'),
    c('lacasona', '2013-02-20', 'horus'),
    c('Zpp', '2015-03-27', 'Otra Persona'),
    c('HER', '2026-07-01', 'Sergio', 'feat: a\n\nCo-Authored-By: Claude Sonnet 5 <n@a.com>'),
    c('x', '2026-07-01', 'Vercel'),
  ]
  const g = grafoCoautoria('smonsalve', commits)

  it('anonimiza personas en orden de aparición y no publica nombres', () => {
    const json = JSON.stringify(g)
    expect(json).not.toMatch(/Persona Real|Otra Persona|Vercel/)
    expect(g.nodos.filter(n => n.tipo === 'persona').map(n => n.etiqueta)).toEqual(['Persona 1', 'Persona 2'])
  })
  it('Sergio va primero y los modelos son nodos propios', () => {
    const autores = g.nodos.filter(n => n.tipo !== 'dominio')
    expect(autores[0].id).toBe('sergio')
    expect(g.nodos.some(n => n.id === 'modelo:Claude Sonnet 5')).toBe(true)
  })
  it('aristas autor→dominio con peso', () => {
    expect(g.aristas).toContainEqual({ de: 'sergio', a: 'dominio:agentes', peso: 1 })
    expect(g.aristas).toContainEqual({ de: 'persona-1', a: 'dominio:experimentos', peso: 1 })
  })
  it('layout determinista', () => {
    expect(grafoCoautoria('smonsalve', [...commits].reverse())).toEqual(g)
    for (const n of g.nodos) expect(n.x).toBe(n.tipo === 'dominio' ? 0.72 : 0.32)
  })
})

describe('grafo del discurso', () => {
  it('resalta conceptos presentes en los prompts y ubica en círculo', () => {
    const g = grafoDiscurso(
      [
        { id: 'vibe-coding', etiqueta: 'vibe coding', etiquetaEn: 'vibe coding', variantes: ['vibe coding'] },
        { id: 'deuda-tecnica', etiqueta: 'deuda técnica', etiquetaEn: 'technical debt', variantes: ['deuda tecnica'] },
      ],
      [{ de: 'vibe-coding', a: 'deuda-tecnica', motivo: 'x' }],
      ['Esto huele a Deuda Técnica'],
    )
    expect(g.nodos.map(n => n.resaltado)).toEqual([false, true])
    expect(g.nodos[0]).toMatchObject({ x: 0.5, y: 0.12 })
    expect(g.aristas).toHaveLength(1)
  })
})
```

- [ ] **Step 2: Correr y ver que falla**

Run: `npx vitest run scripts/ia-autorretrato/__tests__/red.test.ts`
Expected: FAIL ("Failed to resolve import '../red'")

- [ ] **Step 3: Implementar `red.ts`**

```ts
import { normalizar } from '@/lib/experiencias-ia/buscar'
import type { Cuenta, GrafoCoautoria, GrafoDiscurso, NodoGrafo } from '@/lib/ia-autorretrato/tipos'
import type { CommitNormalizado } from './commits'
import { contiene } from './conceptos'
import { dominioDe } from './dominios'

const r3 = (n: number) => Math.round(n * 1000) / 1000

export function grafoCoautoria(era: Cuenta, commits: CommitNormalizado[]): GrafoCoautoria {
  const ordenados = commits
    .filter(c => !c.esBot)
    .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.repo.localeCompare(b.repo) || a.autor.localeCompare(b.autor))

  const autores = new Map<string, { tipo: NodoGrafo['tipo']; etiqueta: string; orden: number; peso: number }>()
  const pesos = new Map<string, number>()
  const personas = new Map<string, string>()

  const sumar = (id: string, tipo: NodoGrafo['tipo'], etiqueta: string, dominio: string) => {
    const a = autores.get(id) ?? { tipo, etiqueta, orden: autores.size, peso: 0 }
    a.peso++
    autores.set(id, a)
    const clave = `${id}|dominio:${dominio}`
    pesos.set(clave, (pesos.get(clave) ?? 0) + 1)
  }

  for (const c of ordenados) {
    const dominio = dominioDe(c.repo)
    if (c.esSergio) sumar('sergio', 'sergio', 'Sergio', dominio)
    else if (c.autorClaude) sumar('modelo:Claude (autor)', 'modelo', 'Claude (autor)', dominio)
    else {
      if (!personas.has(c.autor)) personas.set(c.autor, `persona-${personas.size + 1}`)
      const id = personas.get(c.autor)!
      sumar(id, 'persona', `Persona ${id.split('-')[1]}`, dominio)
    }
    for (const m of c.modelos) sumar(`modelo:${m}`, 'modelo', m, dominio)
  }

  const aristas = [...pesos.entries()]
    .map(([k, peso]) => { const [de, a] = k.split('|'); return { de, a, peso } })
    .sort((x, y) => x.de.localeCompare(y.de) || x.a.localeCompare(y.a))

  const pesoDominio = new Map<string, number>()
  for (const a of aristas) pesoDominio.set(a.a, (pesoDominio.get(a.a) ?? 0) + a.peso)

  const listaAutores = [...autores.entries()].sort(([ia, a], [ib, b]) =>
    (ia === 'sergio' ? -1 : ib === 'sergio' ? 1 : a.orden - b.orden))
  const listaDominios = [...pesoDominio.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))

  const nodos: NodoGrafo[] = [
    ...listaAutores.map(([id, a], i) => ({ id, tipo: a.tipo, etiqueta: a.etiqueta, peso: a.peso, x: 0.32, y: r3((i + 1) / (listaAutores.length + 1)) })),
    ...listaDominios.map(([id, peso], i) => ({ id, tipo: 'dominio' as const, etiqueta: id.replace('dominio:', ''), peso, x: 0.72, y: r3((i + 1) / (listaDominios.length + 1)) })),
  ]
  return { era, nodos, aristas }
}

export type ConceptoDiscurso = { id: string; etiqueta: string; etiquetaEn: string; variantes: string[] }
export type RelacionDiscurso = { de: string; a: string; motivo: string }

export function grafoDiscurso(conceptos: ConceptoDiscurso[], relaciones: RelacionDiscurso[], prompts: string[]): GrafoDiscurso {
  const textos = prompts.map(normalizar)
  const n = conceptos.length
  return {
    nodos: conceptos.map((c, i) => {
      const angulo = -Math.PI / 2 + (2 * Math.PI * i) / n
      return {
        id: c.id, etiqueta: c.etiqueta, etiquetaEn: c.etiquetaEn,
        resaltado: textos.some(t => c.variantes.some(v => contiene(t, normalizar(v)))),
        x: r3(0.5 + 0.38 * Math.cos(angulo)),
        y: r3(0.5 + 0.38 * Math.sin(angulo)),
      }
    }),
    aristas: relaciones.map(r => ({ de: r.de, a: r.a, motivo: r.motivo })),
  }
}
```

- [ ] **Step 4: Correr el test**

Run: `npx vitest run scripts/ia-autorretrato/__tests__/red.test.ts`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add scripts/ia-autorretrato
git commit -m "feat(autorretrato): grafos de coautoría (anónimos) y del discurso"
```

---

### Task 9: El camino hacia atrás (DAG)

**Files:**
- Create: `scripts/ia-autorretrato/camino.ts`, `scripts/ia-autorretrato/camino.json`
- Test: `scripts/ia-autorretrato/__tests__/camino.test.ts`

**Interfaces:**
- Consumes: `NodoCamino`, `AristaCamino`, `Camino` (Task 1), `aCsv`, `deCsv` (Task 6)
- Produces: `validarCamino(nodos, aristas): string[]`, `ancestros(id: string, aristas: AristaCamino[]): Set<string>`, `enriquecerCamino(nodos: NodoCamino[], primeraPorRepo: Map<string, string>): NodoCamino[]`, `reposNoPublicos(nodos: NodoCamino[], reposPublicos: string[]): string[]`, `revisionCamino(nodos: NodoCamino[]): string`, `aplicarRevision(camino: Camino, csv: string): Camino`

- [ ] **Step 1: Crear `scripts/ia-autorretrato/camino.json`** (borrador aprobado el 2026-10-15; los ⚪ se confirman en la revisión de Task 11)

```json
{
  "nodos": [
    { "id": "logica", "etiqueta": "Lógica y algoritmos", "etiquetaEn": "Logic and algorithms", "rama": "fundamentos", "evidencia": "inferido" },
    { "id": "algebra-lineal", "etiqueta": "Álgebra lineal", "etiquetaEn": "Linear algebra", "rama": "fundamentos", "evidencia": "inferido" },
    { "id": "estadistica", "etiqueta": "Estadística", "etiquetaEn": "Statistics", "rama": "fundamentos", "evidencia": "inferido" },
    { "id": "redes", "etiqueta": "Redes y protocolos", "etiquetaEn": "Networking and protocols", "rama": "fundamentos", "evidencia": "inferido" },
    { "id": "electronica", "etiqueta": "Electrónica básica", "etiquetaEn": "Basic electronics", "rama": "fundamentos", "evidencia": "inferido" },
    { "id": "linux-shell", "etiqueta": "Linux y la terminal", "etiquetaEn": "Linux and the shell", "rama": "fundamentos", "evidencia": "inferido" },
    { "id": "teoria-aprendizaje", "etiqueta": "Teorías del aprendizaje", "etiquetaEn": "Learning theories", "rama": "fundamentos", "evidencia": "inferido" },
    { "id": "escritura-academica", "etiqueta": "Lectura y escritura académica", "etiquetaEn": "Academic reading and writing", "rama": "fundamentos", "evidencia": "inferido" },

    { "id": "programacion", "etiqueta": "Programación (Ruby, Java, C++)", "etiquetaEn": "Programming (Ruby, Java, C++)", "rama": "backend", "evidencia": "github", "repos": ["test_projects", "BluetoothController", "tesis"] },
    { "id": "rails", "etiqueta": "Ruby on Rails", "etiquetaEn": "Ruby on Rails", "rama": "backend", "evidencia": "github", "repos": ["lacasona", "test_projects", "bailando"] },
    { "id": "sql", "etiqueta": "SQL y modelo relacional", "etiquetaEn": "SQL and relational modeling", "rama": "backend", "evidencia": "github", "repos": ["lacasona"] },
    { "id": "http-apis", "etiqueta": "APIs HTTP / REST", "etiquetaEn": "HTTP / REST APIs", "rama": "backend", "evidencia": "github", "repos": ["API_REST", "flask_restfull_test1", "flask-api-todo-firebase"] },
    { "id": "tipado", "etiqueta": "Tipado estático (Java, Go)", "etiquetaEn": "Static typing (Java, Go)", "rama": "backend", "evidencia": "github", "repos": ["Zpp", "retoprog", "GoProLang", "SamLearnsGo"] },
    { "id": "python", "etiqueta": "Python", "etiquetaEn": "Python", "rama": "backend", "evidencia": "github", "repos": ["POCVT", "ProgPyIntro", "microcourse"] },
    { "id": "django", "etiqueta": "Django", "etiquetaEn": "Django", "rama": "backend", "evidencia": "github", "repos": ["InmoCode", "hellodjango"] },
    { "id": "flask", "etiqueta": "Flask", "etiquetaEn": "Flask", "rama": "backend", "evidencia": "github", "repos": ["flask_heroku", "flask_template"] },
    { "id": "html-css", "etiqueta": "HTML y CSS", "etiquetaEn": "HTML and CSS", "rama": "web", "evidencia": "github", "repos": ["paisahuevo", "smonsalve.github.io"] },
    { "id": "javascript", "etiqueta": "JavaScript", "etiquetaEn": "JavaScript", "rama": "web", "evidencia": "github", "repos": ["personal", "ST0240-20162", "js_course"] },
    { "id": "react", "etiqueta": "React", "etiquetaEn": "React", "rama": "web", "evidencia": "inferido" },
    { "id": "cpp", "etiqueta": "C++", "etiquetaEn": "C++", "rama": "iot", "evidencia": "github", "repos": ["tesis"] },
    { "id": "sensores", "etiqueta": "Sensores y Raspberry Pi", "etiquetaEn": "Sensors and Raspberry Pi", "rama": "iot", "evidencia": "github", "repos": ["temp_hum", "pimon"] },
    { "id": "android-bt", "etiqueta": "Android + Bluetooth", "etiquetaEn": "Android + Bluetooth", "rama": "iot", "evidencia": "github", "repos": ["BluetoothController"] },
    { "id": "git", "etiqueta": "Git", "etiquetaEn": "Git", "rama": "infra", "evidencia": "github", "repos": ["intro-git"] },
    { "id": "heroku", "etiqueta": "Heroku", "etiquetaEn": "Heroku", "rama": "infra", "evidencia": "github", "repos": ["flask_heroku"] },
    { "id": "pandas", "etiqueta": "Análisis de datos (Pandas)", "etiquetaEn": "Data analysis (Pandas)", "rama": "datos-ml", "evidencia": "github", "repos": ["DS4A", "ds4a-w4"] },
    { "id": "ml", "etiqueta": "Machine learning (scikit-learn)", "etiquetaEn": "Machine learning (scikit-learn)", "rama": "datos-ml", "evidencia": "github", "repos": ["ds4a-w4", "ingSisAnon_titanic"] },
    { "id": "scraping", "etiqueta": "Web scraping", "etiquetaEn": "Web scraping", "rama": "datos-ml", "evidencia": "github", "repos": ["Prod_scrap", "scrapy_tut"] },
    { "id": "visualizacion", "etiqueta": "Visualización (Dash)", "etiquetaEn": "Visualization (Dash)", "rama": "datos-ml", "evidencia": "github", "repos": ["dash_demo", "M4"] },
    { "id": "diseno-experimental", "etiqueta": "Diseño experimental (oTree)", "etiquetaEn": "Experimental design (oTree)", "rama": "datos-ml", "evidencia": "github", "repos": ["OtreeExp", "otreecourse.github.io"] },
    { "id": "embeddings", "etiqueta": "Embeddings", "etiquetaEn": "Embeddings", "rama": "datos-ml", "evidencia": "declarado", "declaradoEn": "about: stackGroups (Embeddings)" },
    { "id": "prompting", "etiqueta": "Prompting", "etiquetaEn": "Prompting", "rama": "agentes", "evidencia": "inferido" },
    { "id": "llm-apis", "etiqueta": "APIs de LLM", "etiquetaEn": "LLM APIs", "rama": "agentes", "evidencia": "github", "repos": ["demo_crew_ai", "brayan"] },
    { "id": "tool-calling", "etiqueta": "Tool-calling", "etiquetaEn": "Tool calling", "rama": "agentes", "evidencia": "declarado", "declaradoEn": "about: stackGroups (Tool-calling)" },
    { "id": "latex", "etiqueta": "Escritura técnica en LaTeX", "etiquetaEn": "Technical writing in LaTeX", "rama": "escritura", "evidencia": "github", "repos": ["Bioinfo", "OA", "Epi", "progcomp"] },
    { "id": "contenidos", "etiqueta": "Producción de contenidos educativos", "etiquetaEn": "Educational content production", "rama": "educacion", "evidencia": "github", "repos": ["OA"] },
    { "id": "docencia", "etiqueta": "Docencia en programación", "etiquetaEn": "Teaching programming", "rama": "educacion", "evidencia": "github", "repos": ["progcomp", "ProgCompMon", "ProgPyIntro", "Python2022-1", "python_comfama_202211"] },
    { "id": "maestria", "etiqueta": "Maestría en educación", "etiquetaEn": "Master's in education", "rama": "educacion", "evidencia": "github", "repos": ["TesisMaestria"] },
    { "id": "metaaprendizaje", "etiqueta": "Metaaprendizaje", "etiquetaEn": "Meta-learning", "rama": "educacion", "evidencia": "github", "repos": [] },

    { "id": "agentes-harness", "etiqueta": "Agentes y harness engineering", "etiquetaEn": "Agents and harness engineering", "rama": "agentes", "evidencia": "github", "repos": ["HER", "brayan"], "hoy": true },
    { "id": "claude-code", "etiqueta": "Claude Code", "etiquetaEn": "Claude Code", "rama": "agentes", "evidencia": "github", "repos": ["sergiomonsalve.com", "HER"], "primeraEvidencia": "2026-02", "hoy": true },
    { "id": "mcp", "etiqueta": "MCP", "etiquetaEn": "MCP", "rama": "agentes", "evidencia": "declarado", "declaradoEn": "Claude Code: herramientas MCP registradas", "primeraEvidencia": "2026-05", "hoy": true },
    { "id": "evals", "etiqueta": "Evaluación de agentes", "etiquetaEn": "Agent evaluation", "rama": "agentes", "evidencia": "declarado", "declaradoEn": "about: tesis (mayo 2026)", "primeraEvidencia": "2026-05", "hoy": true },
    { "id": "rag", "etiqueta": "RAG y bases vectoriales", "etiquetaEn": "RAG and vector databases", "rama": "datos-ml", "evidencia": "declarado", "declaradoEn": "about: stackGroups (RAG, Vector DBs)", "hoy": true },
    { "id": "dagster", "etiqueta": "Pipelines de datos (Dagster, ETL)", "etiquetaEn": "Data pipelines (Dagster, ETL)", "rama": "datos-ml", "evidencia": "declarado", "declaradoEn": "about: stackGroups (Dagster, ETL)", "hoy": true },
    { "id": "nextjs-ts", "etiqueta": "Next.js + TypeScript", "etiquetaEn": "Next.js + TypeScript", "rama": "web", "evidencia": "github", "repos": ["pp_nextjs", "sergiomonsalve.com"], "hoy": true },
    { "id": "react-native", "etiqueta": "React Native", "etiquetaEn": "React Native", "rama": "web", "evidencia": "github", "repos": ["mobile-esp32", "sama-mobile"], "hoy": true },
    { "id": "supabase", "etiqueta": "Supabase / Postgres", "etiquetaEn": "Supabase / Postgres", "rama": "backend", "evidencia": "github", "repos": ["sergiomonsalve.com", "InteFin"], "hoy": true },
    { "id": "fastapi", "etiqueta": "FastAPI", "etiquetaEn": "FastAPI", "rama": "backend", "evidencia": "github", "repos": ["FastApi_BP", "fa_todo", "brayan"], "hoy": true },
    { "id": "esp32", "etiqueta": "ESP32 + PlatformIO + MQTT", "etiquetaEn": "ESP32 + PlatformIO + MQTT", "rama": "iot", "evidencia": "github", "repos": ["Bichongos", "mobile-esp32"], "primeraEvidencia": "2026-02", "hoy": true },
    { "id": "deploy", "etiqueta": "Deploy (Vercel, Railway)", "etiquetaEn": "Deploy (Vercel, Railway)", "rama": "infra", "evidencia": "github", "repos": ["sergiomonsalve.com"], "hoy": true },
    { "id": "specs-docs", "etiqueta": "Specs y docs escritos con Claude", "etiquetaEn": "Specs and docs written with Claude", "rama": "escritura", "evidencia": "github", "repos": ["sergiomonsalve.com", "HER"], "hoy": true },
    { "id": "mapa", "etiqueta": "Método MAPA / formación", "etiquetaEn": "MAPA method / training", "rama": "educacion", "evidencia": "declarado", "declaradoEn": "about: Oct 2026", "primeraEvidencia": "2026-10", "hoy": true }
  ],
  "aristas": [
    { "de": "logica", "a": "programacion" }, { "de": "logica", "a": "sql" },
    { "de": "programacion", "a": "rails" }, { "de": "programacion", "a": "python" },
    { "de": "programacion", "a": "tipado" }, { "de": "programacion", "a": "cpp" },
    { "de": "programacion", "a": "android-bt" }, { "de": "programacion", "a": "javascript" },
    { "de": "programacion", "a": "docencia" },
    { "de": "sql", "a": "rails" }, { "de": "rails", "a": "http-apis" }, { "de": "redes", "a": "http-apis" },
    { "de": "python", "a": "django" }, { "de": "python", "a": "flask" },
    { "de": "python", "a": "pandas" }, { "de": "python", "a": "scraping" },
    { "de": "http-apis", "a": "flask" }, { "de": "flask", "a": "fastapi" },
    { "de": "http-apis", "a": "fastapi" }, { "de": "tipado", "a": "fastapi" },
    { "de": "sql", "a": "supabase" }, { "de": "http-apis", "a": "supabase" },
    { "de": "html-css", "a": "javascript" }, { "de": "javascript", "a": "react" },
    { "de": "react", "a": "nextjs-ts" }, { "de": "tipado", "a": "nextjs-ts" },
    { "de": "react", "a": "react-native" }, { "de": "android-bt", "a": "react-native" },
    { "de": "electronica", "a": "sensores" }, { "de": "cpp", "a": "esp32" },
    { "de": "sensores", "a": "esp32" }, { "de": "redes", "a": "esp32" },
    { "de": "linux-shell", "a": "git" }, { "de": "git", "a": "heroku" }, { "de": "linux-shell", "a": "heroku" },
    { "de": "git", "a": "deploy" }, { "de": "heroku", "a": "deploy" },
    { "de": "estadistica", "a": "pandas" }, { "de": "pandas", "a": "ml" }, { "de": "estadistica", "a": "ml" },
    { "de": "pandas", "a": "visualizacion" },
    { "de": "ml", "a": "embeddings" }, { "de": "algebra-lineal", "a": "embeddings" },
    { "de": "embeddings", "a": "rag" }, { "de": "sql", "a": "rag" },
    { "de": "scraping", "a": "dagster" }, { "de": "pandas", "a": "dagster" }, { "de": "visualizacion", "a": "dagster" },
    { "de": "estadistica", "a": "diseno-experimental" }, { "de": "diseno-experimental", "a": "evals" },
    { "de": "llm-apis", "a": "evals" },
    { "de": "escritura-academica", "a": "prompting" }, { "de": "prompting", "a": "llm-apis" },
    { "de": "http-apis", "a": "llm-apis" }, { "de": "llm-apis", "a": "tool-calling" },
    { "de": "tool-calling", "a": "agentes-harness" },
    { "de": "http-apis", "a": "mcp" }, { "de": "mcp", "a": "agentes-harness" },
    { "de": "llm-apis", "a": "claude-code" }, { "de": "linux-shell", "a": "claude-code" },
    { "de": "git", "a": "claude-code" }, { "de": "claude-code", "a": "agentes-harness" },
    { "de": "escritura-academica", "a": "latex" }, { "de": "latex", "a": "specs-docs" },
    { "de": "claude-code", "a": "specs-docs" },
    { "de": "escritura-academica", "a": "contenidos" }, { "de": "contenidos", "a": "docencia" },
    { "de": "teoria-aprendizaje", "a": "maestria" }, { "de": "diseno-experimental", "a": "maestria" },
    { "de": "docencia", "a": "maestria" }, { "de": "maestria", "a": "metaaprendizaje" },
    { "de": "metaaprendizaje", "a": "mapa" }, { "de": "docencia", "a": "mapa" },
    { "de": "agentes-harness", "a": "mapa" }
  ]
}
```

- [ ] **Step 2: Test que falla**

```ts
import { describe, it, expect } from 'vitest'
import type { Camino } from '@/lib/ia-autorretrato/tipos'
import CAMINO from '../camino.json'
import { ancestros, aplicarRevision, enriquecerCamino, reposNoPublicos, revisionCamino, validarCamino } from '../camino'
import { deCsv, aCsv } from '../csv'

const camino = CAMINO as unknown as Camino

describe('camino.json', () => {
  it('es válido: ids únicos, aristas conocidas, acíclico, cada nodo de hoy llega a un fundamento', () => {
    expect(validarCamino(camino.nodos, camino.aristas)).toEqual([])
  })
  it('tiene entre 50 y 70 nodos', () => {
    expect(camino.nodos.length).toBeGreaterThanOrEqual(50)
    expect(camino.nodos.length).toBeLessThanOrEqual(70)
  })
})

describe('validarCamino', () => {
  const n = (id: string, rama: 'fundamentos' | 'backend' = 'backend', hoy = false) =>
    ({ id, etiqueta: id, etiquetaEn: id, rama, evidencia: 'github' as const, hoy })
  it('detecta ciclos', () => {
    expect(validarCamino([n('a'), n('b')], [{ de: 'a', a: 'b' }, { de: 'b', a: 'a' }])).toContain('ciclo en el camino')
  })
  it('detecta un nodo de hoy sin fundamento', () => {
    expect(validarCamino([n('x', 'backend', true)], [])).toContain('"x" (hoy) no llega a ningún fundamento')
  })
  it('detecta aristas a nodos inexistentes', () => {
    expect(validarCamino([n('a')], [{ de: 'a', a: 'z' }])).toContain('arista a nodo desconocido: a→z')
  })
})

describe('enriquecer, revisión', () => {
  it('ancestros son transitivos', () => {
    expect([...ancestros('fastapi', camino.aristas)]).toEqual(expect.arrayContaining(['flask', 'python', 'programacion', 'logica']))
  })
  it('primera evidencia = mínimo entre repos y fecha declarada; inferidos sin fecha', () => {
    const r = enriquecerCamino(camino.nodos, new Map([['flask_heroku', '2020-10'], ['flask_template', '2022-08'], ['bichongos', '2026-06']]))
    const porId = Object.fromEntries(r.map(x => [x.id, x]))
    expect(porId.flask.primeraEvidencia).toBe('2020-10')
    expect(porId.esp32.primeraEvidencia).toBe('2026-02') // la declarada es anterior
    expect(porId.logica.primeraEvidencia).toBeUndefined()
  })
  it('reposNoPublicos lista repos del camino que no están en la lista pública', () => {
    expect(reposNoPublicos(camino.nodos, ['HER'])).toContain('brayan')
  })
  it('aplicar revisión: los inferidos marcados "no" salen con sus aristas', () => {
    const filas = deCsv(revisionCamino(camino.nodos))
    expect(filas[0]).toEqual(['id', 'etiqueta', 'rama', 'aprobado'])
    for (const f of filas.slice(1)) f[3] = f[0] === 'react' ? 'no' : 'si'
    const r = aplicarRevision(camino, aCsv(filas))
    expect(r.nodos.some(x => x.id === 'react')).toBe(false)
    expect(r.aristas.some(a => a.de === 'react' || a.a === 'react')).toBe(false)
  })
  it('aplicar revisión: un inferido sin respuesta también sale', () => {
    const filas = deCsv(revisionCamino(camino.nodos)).map((f, i) => (i === 0 ? f : [...f.slice(0, 3), f[0] === 'logica' ? '' : 'si']))
    expect(aplicarRevision(camino, aCsv(filas)).nodos.some(x => x.id === 'logica')).toBe(false)
  })
})
```

- [ ] **Step 3: Correr y ver que falla**

Run: `npx vitest run scripts/ia-autorretrato/__tests__/camino.test.ts`
Expected: FAIL ("Failed to resolve import '../camino'")

- [ ] **Step 4: Implementar `camino.ts`**

```ts
import type { AristaCamino, Camino, NodoCamino } from '@/lib/ia-autorretrato/tipos'
import { aCsv, deCsv } from './csv'

/** Prerrequisitos transitivos de `id` (todo lo que hubo que aprender antes). */
export function ancestros(id: string, aristas: AristaCamino[]): Set<string> {
  const vistos = new Set<string>()
  const pila = [id]
  while (pila.length) {
    const actual = pila.pop()!
    for (const a of aristas) if (a.a === actual && !vistos.has(a.de)) { vistos.add(a.de); pila.push(a.de) }
  }
  return vistos
}

export function validarCamino(nodos: NodoCamino[], aristas: AristaCamino[]): string[] {
  const errores: string[] = []
  const ids = new Set<string>()
  for (const n of nodos) {
    if (ids.has(n.id)) errores.push(`id repetido: ${n.id}`)
    ids.add(n.id)
  }
  for (const a of aristas) if (!ids.has(a.de) || !ids.has(a.a)) errores.push(`arista a nodo desconocido: ${a.de}→${a.a}`)

  // Kahn: si no se pueden ordenar todos, hay un ciclo.
  const entrada = new Map([...ids].map(id => [id, 0]))
  for (const a of aristas) if (entrada.has(a.a)) entrada.set(a.a, entrada.get(a.a)! + 1)
  const cola = [...entrada.entries()].filter(([, g]) => g === 0).map(([id]) => id)
  let ordenados = 0
  while (cola.length) {
    const id = cola.shift()!
    ordenados++
    for (const a of aristas) if (a.de === id && entrada.has(a.a)) {
      entrada.set(a.a, entrada.get(a.a)! - 1)
      if (entrada.get(a.a) === 0) cola.push(a.a)
    }
  }
  if (ordenados < ids.size) errores.push('ciclo en el camino')

  const fundamentos = new Set(nodos.filter(n => n.rama === 'fundamentos').map(n => n.id))
  for (const n of nodos.filter(n => n.hoy)) {
    if (![...ancestros(n.id, aristas)].some(id => fundamentos.has(id))) errores.push(`"${n.id}" (hoy) no llega a ningún fundamento`)
  }
  return errores
}

/** Calcula `primeraEvidencia` (YYYY-MM) desde los commits. Los inferidos no llevan fecha. */
export function enriquecerCamino(nodos: NodoCamino[], primeraPorRepo: Map<string, string>): NodoCamino[] {
  return nodos.map(n => {
    if (n.evidencia === 'inferido') {
      const { primeraEvidencia: _omitida, ...resto } = n
      return resto
    }
    const fechas = (n.repos ?? []).map(r => primeraPorRepo.get(r.toLowerCase())).filter((f): f is string => Boolean(f))
    if (n.primeraEvidencia) fechas.push(n.primeraEvidencia)
    const primera = fechas.sort()[0]
    return primera ? { ...n, primeraEvidencia: primera } : n
  })
}

export function reposNoPublicos(nodos: NodoCamino[], reposPublicos: string[]): string[] {
  const publicos = new Set(reposPublicos.map(r => r.toLowerCase()))
  return [...new Set(nodos.flatMap(n => n.repos ?? []).filter(r => !publicos.has(r.toLowerCase())))]
}

/** CSV de los nodos inferidos para que Sergio escriba "si" o "no" en `aprobado`. */
export function revisionCamino(nodos: NodoCamino[]): string {
  return aCsv([['id', 'etiqueta', 'rama', 'aprobado'], ...nodos.filter(n => n.evidencia === 'inferido').map(n => [n.id, n.etiqueta, n.rama, ''])])
}

/** Solo entran los inferidos con "si". Los demás salen junto con sus aristas. */
export function aplicarRevision(camino: Camino, csv: string): Camino {
  const [cabecera, ...filas] = deCsv(csv)
  const iId = cabecera.indexOf('id')
  const iOk = cabecera.indexOf('aprobado')
  const aprobados = new Set(filas.filter(f => (f[iOk] ?? '').trim().toLowerCase() === 'si').map(f => f[iId]))
  const nodos = camino.nodos.filter(n => n.evidencia !== 'inferido' || aprobados.has(n.id))
  const ids = new Set(nodos.map(n => n.id))
  return { nodos, aristas: camino.aristas.filter(a => ids.has(a.de) && ids.has(a.a)) }
}
```

- [ ] **Step 5: Correr el test**

Run: `npx vitest run scripts/ia-autorretrato/__tests__/camino.test.ts`
Expected: PASS (10 tests)

- [ ] **Step 6: Commit**

```bash
git add scripts/ia-autorretrato
git commit -m "feat(autorretrato): DAG del camino de aprendizaje con validación y revisión"
```

---

### Task 10: Contexto, declarado y orquestador (primera corrida real)

**Files:**
- Create: `scripts/ia-autorretrato/contexto.json`, `scripts/ia-autorretrato/declarado.json`, `scripts/ia-autorretrato/index.ts`
- Test: `scripts/ia-autorretrato/__tests__/contexto.test.ts`
- Generate: `data/ia-autorretrato.json` (real), `.ia-autorretrato/{conceptos-revision.csv, camino-revision.csv, citas-candidatas.json}` (privados)

**Interfaces:**
- Consumes: todo lo de Tasks 2–9, `GLOSARIO` de `@/lib/experiencias-ia/glosario`
- Produces: `data/ia-autorretrato.json` que cumple `AutorretratoIA`. Comando: `npx tsx scripts/ia-autorretrato/index.ts [--refrescar]`

- [ ] **Step 1: Crear `scripts/ia-autorretrato/contexto.json`** (cifras y URLs del anexo, verificadas el 2026-10-15)

```json
{
  "datos": [
    { "cifra": "75%", "mide": "Código nuevo de Google generado por IA y revisado por humanos", "fuente": "Sundar Pichai vía The Decoder", "fecha": "2026-04", "url": "https://the-decoder.com/google-says-75-percent-of-its-new-code-is-now-written-by-ai/" },
    { "cifra": "~4%", "mide": "Commits públicos diarios en GitHub con firma de Claude Code", "fuente": "SemiAnalysis vía Xataka", "fecha": "2026-02-06", "url": "https://www.xataka.com/robotica-e-ia/claude-code-esta-siendo-gran-favorito-programadores-que-firma-4-todo-que-se-sube-a-github" },
    { "cifra": "~50%", "mide": "Estimación externa de líneas fusionadas escritas por IA en Anthropic (frente al \"90%\" declarado)", "fuente": "Ryan Greenblatt, Redwood Research", "fecha": "2025-10-22", "url": "https://blog.redwoodresearch.org/p/is-90-of-code-at-anthropic-being" },
    { "cifra": "+19% / −20%", "mide": "Tiempo real con IA frente al percibido en devs OSS experimentados (RCT)", "fuente": "METR", "fecha": "2025-07-10", "url": "https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/" },
    { "cifra": "84% / 46%", "mide": "Devs que usan o planean usar IA / que desconfían de su precisión", "fuente": "Stack Overflow Developer Survey 2025", "fecha": "2025-07", "url": "https://survey.stackoverflow.co/2025/ai" },
    { "cifra": "8x", "mide": "Aumento de bloques de código duplicado (211M de líneas, 2020–2024)", "fuente": "GitClear vía DevClass", "fecha": "2025-02-20", "url": "https://devclass.com/2025/02/20/ai-is-eroding-code-quality-states-new-in-depth-report/" },
    { "cifra": "50% vs 67%", "mide": "Comprensión con IA frente a sin IA (RCT, n=52)", "fuente": "Anthropic", "fecha": "2026-01-29", "url": "https://www.anthropic.com/research/AI-assistance-coding-skills" },
    { "cifra": "—", "mide": "La IA no puede figurar como autora: no puede responder por el trabajo", "fuente": "ICMJE", "fecha": "vigente", "url": "https://www.icmje.org/recommendations/browse/artificial-intelligence/ai-use-by-authors.html" },
    { "cifra": "25% vs 19%", "mide": "Sugerencias aceptadas por escritores indios frente a estadounidenses; la escritura se homogeniza hacia lo occidental", "fuente": "Cornell, CHI 2025", "fecha": "2025-04-28", "url": "https://news.cornell.edu/index%2Ephp/node/330798" }
  ],
  "conceptos": [
    { "id": "vibe-coding", "etiqueta": "vibe coding", "etiquetaEn": "vibe coding", "variantes": ["vibe coding", "vibecoding"] },
    { "id": "agentic-engineering", "etiqueta": "ingeniería agéntica", "etiquetaEn": "agentic engineering", "variantes": ["agentic engineering", "ingenieria agentica", "harness"] },
    { "id": "co-authored-by", "etiqueta": "Co-Authored-By", "etiquetaEn": "Co-Authored-By", "variantes": ["co-authored-by", "coautoria", "coautor"] },
    { "id": "assisted-by", "etiqueta": "Assisted-by", "etiquetaEn": "Assisted-by", "variantes": ["assisted-by"] },
    { "id": "signed-off-by", "etiqueta": "Signed-off-by", "etiquetaEn": "Signed-off-by", "variantes": ["signed-off-by"] },
    { "id": "responsabilidad", "etiqueta": "responsabilidad", "etiquetaEn": "accountability", "variantes": ["responsabilidad", "accountability"] },
    { "id": "medicion", "etiqueta": "medición", "etiquetaEn": "measurement", "variantes": ["metrica", "metricas", "medicion"] },
    { "id": "datos-entrenamiento", "etiqueta": "datos de entrenamiento", "etiquetaEn": "training data", "variantes": ["datos de entrenamiento", "training data"] },
    { "id": "divulgacion", "etiqueta": "divulgación del uso de IA", "etiquetaEn": "AI disclosure", "variantes": ["divulgacion", "disclosure"] },
    { "id": "confianza", "etiqueta": "confianza", "etiquetaEn": "trust", "variantes": ["confianza", "trust"] },
    { "id": "casi-correcto", "etiqueta": "\"casi correcto\"", "etiquetaEn": "\"almost right\"", "variantes": ["casi correcto", "almost right"] },
    { "id": "deuda-tecnica", "etiqueta": "deuda técnica", "etiquetaEn": "technical debt", "variantes": ["deuda tecnica", "technical debt"] },
    { "id": "duplicacion", "etiqueta": "duplicación", "etiquetaEn": "duplication", "variantes": ["duplicacion", "codigo duplicado"] },
    { "id": "desgaste", "etiqueta": "desgaste de habilidades", "etiquetaEn": "deskilling", "variantes": ["desgaste de habilidades", "deskilling", "comprehension debt"] },
    { "id": "juniors", "etiqueta": "juniors", "etiquetaEn": "juniors", "variantes": ["junior", "juniors"] },
    { "id": "productividad", "etiqueta": "productividad", "etiquetaEn": "productivity", "variantes": ["productividad", "productivity"] },
    { "id": "amplificador", "etiqueta": "la IA como amplificador", "etiquetaEn": "AI as amplifier", "variantes": ["amplificador", "amplifier"] },
    { "id": "slop", "etiqueta": "slop", "etiquetaEn": "slop", "variantes": ["slop", "workslop"] },
    { "id": "copyright", "etiqueta": "derechos de autor", "etiquetaEn": "copyright", "variantes": ["copyright", "derechos de autor"] },
    { "id": "autoria", "etiqueta": "autoría", "etiquetaEn": "authorship", "variantes": ["autoria", "authorship"] },
    { "id": "homogeneizacion", "etiqueta": "homogeneización", "etiquetaEn": "homogenization", "variantes": ["homogeneizacion", "homogenizacion", "homogenization"] },
    { "id": "voz-propia", "etiqueta": "voz propia", "etiquetaEn": "own voice", "variantes": ["voz propia", "estilo propio"] },
    { "id": "revision", "etiqueta": "revisión de código", "etiquetaEn": "code review", "variantes": ["revision de codigo", "code review"] }
  ],
  "relaciones": [
    { "de": "vibe-coding", "a": "agentic-engineering", "motivo": "el mismo acto con distinto grado de revisión" },
    { "de": "co-authored-by", "a": "assisted-by", "motivo": "coautoría frente a asistencia" },
    { "de": "signed-off-by", "a": "responsabilidad", "motivo": "solo un humano certifica el trabajo" },
    { "de": "co-authored-by", "a": "medicion", "motivo": "los conteos públicos dependen del trailer: son un piso" },
    { "de": "co-authored-by", "a": "datos-entrenamiento", "motivo": "el trailer permitiría excluir código del entrenamiento" },
    { "de": "divulgacion", "a": "confianza", "motivo": "93% exige atribución para confiar" },
    { "de": "casi-correcto", "a": "deuda-tecnica", "motivo": "salidas casi correctas cuestan horas de revisión" },
    { "de": "deuda-tecnica", "a": "duplicacion", "motivo": "8x más bloques duplicados" },
    { "de": "desgaste", "a": "juniors", "motivo": "menos comprensión al aprender con IA" },
    { "de": "productividad", "a": "medicion", "motivo": "brecha entre lo percibido y lo medido" },
    { "de": "amplificador", "a": "productividad", "motivo": "la IA amplifica lo que el equipo ya es" },
    { "de": "slop", "a": "confianza", "motivo": "la avalancha de texto generado erosiona la confianza" },
    { "de": "autoria", "a": "copyright", "motivo": "sin autor humano no hay derecho de autor" },
    { "de": "autoria", "a": "responsabilidad", "motivo": "ser autor es poder responder por el trabajo" },
    { "de": "homogeneizacion", "a": "voz-propia", "motivo": "las sugerencias empujan hacia estilos occidentales" },
    { "de": "revision", "a": "agentic-engineering", "motivo": "revisar es lo que separa ingeniería de vibe coding" },
    { "de": "revision", "a": "autoria", "motivo": "la revisión como nueva forma de autoría" },
    { "de": "desgaste", "a": "revision", "motivo": "revisar exige entender lo que se delegó" }
  ]
}
```

- [ ] **Step 2: Crear `scripts/ia-autorretrato/declarado.json`** (Sergio ajusta intensidad y uso en Task 11)

```json
[
  { "herramienta": "Claude Code", "fuente": "medido", "uso": { "es": "Agente en la terminal: código, specs, datos y despliegues", "en": "Terminal agent: code, specs, data and deploys" }, "intensidad": 3 },
  { "herramienta": "Claude.ai", "fuente": "declarado", "uso": { "es": "Conversaciones largas, Projects y Artifacts", "en": "Long conversations, Projects and Artifacts" }, "intensidad": 3 },
  { "herramienta": "ChatGPT / OpenAI", "fuente": "declarado", "uso": { "es": "Consultas rápidas y API en proyectos", "en": "Quick questions and the API in projects" }, "intensidad": 2 },
  { "herramienta": "Ollama (modelos locales)", "fuente": "declarado", "uso": { "es": "Agentes locales (Hermes 3 en brayan) y pruebas offline", "en": "Local agents (Hermes 3 in brayan) and offline tests" }, "intensidad": 2 },
  { "herramienta": "Gemini / Antigravity", "fuente": "declarado", "uso": { "es": "Exploración puntual", "en": "Occasional exploration" }, "intensidad": 1 },
  { "herramienta": "Cursor", "fuente": "declarado", "uso": { "es": "Editor con IA, uso esporádico", "en": "AI editor, occasional use" }, "intensidad": 1 }
]
```

- [ ] **Step 3: Test de forma del contexto** `scripts/ia-autorretrato/__tests__/contexto.test.ts`

```ts
import { describe, it, expect } from 'vitest'
import CONTEXTO from '../contexto.json'
import DECLARADO from '../declarado.json'

describe('contexto.json', () => {
  it('cada dato tiene url https, fecha y fuente', () => {
    for (const d of CONTEXTO.datos) {
      expect(d.url).toMatch(/^https:\/\//)
      expect(d.fecha).not.toBe('')
      expect(d.fuente).not.toBe('')
    }
  })
  it('las relaciones apuntan a conceptos existentes', () => {
    const ids = new Set(CONTEXTO.conceptos.map(c => c.id))
    for (const r of CONTEXTO.relaciones) {
      expect(ids.has(r.de)).toBe(true)
      expect(ids.has(r.a)).toBe(true)
    }
  })
})

describe('declarado.json', () => {
  it('solo Claude Code es medido; intensidad 1–3', () => {
    expect(DECLARADO.filter(d => d.fuente === 'medido').map(d => d.herramienta)).toEqual(['Claude Code'])
    for (const d of DECLARADO) expect([1, 2, 3]).toContain(d.intensidad)
  })
})
```

Run: `npx vitest run scripts/ia-autorretrato/__tests__/contexto.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 4: Implementar `scripts/ia-autorretrato/index.ts`**

```ts
/**
 * Pipeline del post "Autorretrato con IA".
 * Lee ~/.claude y GitHub (serandmoncas + smonsalve), clasifica, verifica privacidad
 * y escribe data/ia-autorretrato.json. Lo privado queda en .ia-autorretrato/ (ignorado).
 *
 * Uso: npx tsx scripts/ia-autorretrato/index.ts [--refrescar]
 */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { normalizar } from '@/lib/experiencias-ia/buscar'
import { GLOSARIO } from '@/lib/experiencias-ia/glosario'
import type { AutorretratoIA, Camino, Cuenta, ItemEcosistema } from '@/lib/ia-autorretrato/tipos'
import { calcularEra, commitsPorMes, modelosPorMes, primeraFechaPorRepo } from './agregadosGithub'
import { aplicarRevision, enriquecerCamino, reposNoPublicos, revisionCamino, validarCamino } from './camino'
import CAMINO from './camino.json'
import { actividadDiaria, leerHistorial, leerSesiones, perfilPrompts, seleccionarCitas } from './claudeCode'
import { filtrarCommits, type CommitNormalizado } from './commits'
import { clasificarConceptos, leerCorrecciones, revisionConceptos } from './conceptos'
import CONTEXTO from './contexto.json'
import DECLARADO from './declarado.json'
import { promptsPorDominio } from './dominios'
import { descargarCuenta } from './github'
import { PERMITIDOS } from './identidades'
import { verificarPrivacidad } from './privacidad'
import { grafoCoautoria, grafoDiscurso } from './red'

const RAIZ = process.cwd()
const PRIVADO = path.join(RAIZ, '.ia-autorretrato')
const CLAUDE = path.join(os.homedir(), '.claude')
const CUENTAS: Cuenta[] = ['smonsalve', 'serandmoncas']

const leer = (archivo: string) => fs.readFileSync(archivo, 'utf8')
const siExiste = (archivo: string) => (fs.existsSync(archivo) ? leer(archivo) : null)

function listarJsonl(dir: string): string[] {
  return (fs.readdirSync(dir, { recursive: true }) as string[])
    .filter(f => f.endsWith('.jsonl'))
    .map(f => path.join(dir, f))
}

function main() {
  const refrescar = process.argv.includes('--refrescar')
  fs.mkdirSync(path.join(PRIVADO, 'cache'), { recursive: true })

  console.log('1/6 Claude Code…')
  const prompts = leerHistorial(leer(path.join(CLAUDE, 'history.jsonl')))
  const sesiones = leerSesiones(listarJsonl(path.join(CLAUDE, 'projects')).map(leer))

  console.log('2/6 GitHub…')
  const descargas = CUENTAS.map(c => descargarCuenta(c, path.join(PRIVADO, 'cache'), refrescar))
  const commits = Object.fromEntries(descargas.map(d => [d.cuenta, filtrarCommits(d.cuenta, d.commits)])) as Record<Cuenta, CommitNormalizado[]>
  const todos = [...commits.smonsalve, ...commits.serandmoncas]
  const repos = descargas.flatMap(d => d.repos)
  const reposPublicos = [...new Set(repos.filter(r => !r.privado).map(r => r.nombre))]
  const reposPrivados = [...new Set(repos.filter(r => r.privado).map(r => r.nombre))]

  console.log('3/6 Conceptos…')
  const senales = normalizar([
    ...descargas.flatMap(d => Object.values(d.manifiestos).flat()),
    ...repos.map(r => r.lenguaje ?? ''),
  ].join(' '))
  const csvConceptos = siExiste(path.join(PRIVADO, 'conceptos-revision.csv'))
  const correcciones = csvConceptos ? leerCorrecciones(csvConceptos) : new Map()
  const conceptos = clasificarConceptos(GLOSARIO, prompts.map(p => p.texto), senales, correcciones)

  console.log('4/6 Camino…')
  let camino = CAMINO as unknown as Camino
  const csvCamino = siExiste(path.join(PRIVADO, 'camino-revision.csv'))
  if (csvCamino) camino = aplicarRevision(camino, csvCamino)
  else console.warn('   ⚠ camino sin revisar: se incluyen todos los nodos inferidos (borrador)')
  const noPublicos = reposNoPublicos(camino.nodos, reposPublicos)
  if (noPublicos.length) throw new Error(`camino.json nombra repos no públicos: ${noPublicos.join(', ')}`)
  const nodos = enriquecerCamino(camino.nodos, primeraFechaPorRepo(todos))
  const errores = validarCamino(nodos, camino.aristas)
  if (errores.length) throw new Error(`camino inválido:\n${errores.join('\n')}`)

  console.log('5/6 Armando el JSON…')
  const fechas = prompts.map(p => p.fecha).sort()
  const datos: AutorretratoIA = {
    generado: new Date().toISOString(),
    periodo: { desde: fechas[0] ?? '', hasta: fechas.at(-1) ?? '' },
    actividadDiaria: actividadDiaria(prompts),
    commitsPorMes: commitsPorMes(commits.serandmoncas),
    promptsPorDominio: promptsPorDominio(prompts, reposPublicos),
    herramientas: sesiones.herramientas,
    modelos: sesiones.modelos,
    ecosistema: DECLARADO as unknown as ItemEcosistema[],
    conceptos,
    perfilPrompts: perfilPrompts(prompts),
    eras: CUENTAS.map(c => calcularEra(c, commits[c])),
    modelosPorMes: modelosPorMes(commits.serandmoncas),
    grafoCoautoria: CUENTAS.map(c => grafoCoautoria(c, commits[c])),
    grafoDiscurso: grafoDiscurso(CONTEXTO.conceptos, CONTEXTO.relaciones, prompts.map(p => p.texto)),
    contexto: CONTEXTO.datos,
    camino: { nodos, aristas: camino.aristas },
  }

  console.log('6/6 Privacidad…')
  const json = JSON.stringify(datos, null, 2)
  const personas = [...new Set(todos.filter(c => !c.esBot && !c.esSergio && !c.autorClaude).map(c => c.autor))]
  const problemas = verificarPrivacidad(json, { prompts: prompts.map(p => p.texto), reposPrivados, personas, permitidos: PERMITIDOS })
  if (problemas.length) {
    console.error('✗ No se escribe el JSON. Problemas de privacidad:\n' + problemas.map(p => `  - ${p}`).join('\n'))
    process.exit(1)
  }
  fs.writeFileSync(path.join(RAIZ, 'data/ia-autorretrato.json'), json + '\n')

  // Archivos de revisión (privados). No se sobrescriben si Sergio ya los editó.
  const revConceptos = path.join(PRIVADO, 'conceptos-revision.csv')
  if (!fs.existsSync(revConceptos)) fs.writeFileSync(revConceptos, revisionConceptos(conceptos))
  const revCamino = path.join(PRIVADO, 'camino-revision.csv')
  // Se genera desde el camino completo, para que Sergio vea todos los inferidos.
  if (!fs.existsSync(revCamino)) fs.writeFileSync(revCamino, revisionCamino((CAMINO as unknown as Camino).nodos))
  fs.writeFileSync(path.join(PRIVADO, 'citas-candidatas.json'), JSON.stringify(seleccionarCitas(prompts), null, 2))

  const [vieja, nueva] = datos.eras
  console.log(`✓ data/ia-autorretrato.json
  prompts: ${datos.perfilPrompts.total} · días activos: ${datos.actividadDiaria.length}
  smonsalve: ${vieja.commitsPropios} commits propios (${vieja.desde} → ${vieja.hasta}), mensaje mediano ${vieja.medianaMensaje}
  serandmoncas: ${nueva.commitsPropios} commits propios, mensaje mediano ${nueva.medianaMensaje} (${nueva.medianaMensajeSinTrailer} sin trailer)
  conceptos: ${conceptos.filter(c => c.cuadrante === 'ambos').length} ambos · ${conceptos.filter(c => c.corregido).length} corregidos
  camino: ${nodos.length} nodos · revisión ${csvCamino ? 'aplicada' : 'pendiente'}`)
}

main()
```

- [ ] **Step 5: Primera corrida real**

Run: `npx tsx scripts/ia-autorretrato/index.ts`
Expected: se descargan las dos cuentas (varios minutos la primera vez), termina con `✓ data/ia-autorretrato.json` y el resumen. Las cifras deben rondar las de la exploración: serandmoncas ~1.440 propios y mensaje mediano ~139/88; smonsalve ~420 propios y mensaje mediano de 8–16.

Si sale `✗ … Problemas de privacidad`: por cada `nombre privado: X` revisa en `data/` dónde aparece. Si es una palabra común (falso positivo), agrégala a `PERMITIDOS` en `identidades.ts` con un comentario. Si es real, corrige la fuente (`camino.json`, `contexto.json` o `declarado.json`). Nunca desactives el filtro.

- [ ] **Step 6: Verificar que lo privado no entra en git**

Run: `git status --short`
Expected: aparecen `data/ia-autorretrato.json` y los archivos de `scripts/`; **no** aparece nada de `.ia-autorretrato/`.

- [ ] **Step 7: Correr toda la suite**

Run: `npx vitest run`
Expected: PASS (todo el repo; `ejemplo.test.ts` sigue pasando con el JSON real)

- [ ] **Step 8: Commit**

```bash
git add scripts/ia-autorretrato data/ia-autorretrato.json
git commit -m "feat(autorretrato): orquestador, contexto verificado y primera corrida con datos reales"
```

---

### Task 11: Revisión de Sergio (punto de control humano)

**Files:**
- Edit (Sergio, privados): `.ia-autorretrato/conceptos-revision.csv`, `.ia-autorretrato/camino-revision.csv`
- Read (Sergio, privado): `.ia-autorretrato/citas-candidatas.json`
- Modify (si Sergio lo pide): `scripts/ia-autorretrato/declarado.json`, `scripts/ia-autorretrato/camino.json`, `scripts/ia-autorretrato/dominios.ts`

**Interfaces:**
- Consumes: archivos generados en Task 10
- Produces: `data/ia-autorretrato.json` revisado; una lista de 5–8 citas aprobadas (texto exacto) guardada en `.ia-autorretrato/citas-aprobadas.md`

- [ ] **Step 1: Presentarle a Sergio un resumen para revisar** (en el chat, no en archivos públicos)
  - Tabla de conceptos por cuadrante (cuántos `ambos`, `solo-hablado`, `solo-construido`, `ninguno`) y los 15 casos más dudosos: muchos `hablado` con `construido=false`, o `preguntado>0` con `hablado=0`.
  - Lista de nodos ⚪ inferidos del camino.
  - Las 30 citas candidatas, numeradas.
  - Las intensidades de `declarado.json`.

- [ ] **Step 2: Sergio edita**
  - En `conceptos-revision.csv`, la columna `correccion` (`ambos` | `solo-hablado` | `solo-construido` | `ninguno`, o vacía).
  - En `camino-revision.csv`, la columna `aprobado` (`si` | `no`).
  - Elige las citas por número. Guárdalas tal cual en `.ia-autorretrato/citas-aprobadas.md`.
  - Si corrige el árbol (nodos o aristas nuevos), edita `camino.json` y corre `npx vitest run scripts/ia-autorretrato/__tests__/camino.test.ts`. Debe pasar.

- [ ] **Step 3: Volver a correr con las revisiones**

Run: `npx tsx scripts/ia-autorretrato/index.ts`
Expected: `camino: N nodos · revisión aplicada` y `conceptos: … · K corregidos` con K igual al número de correcciones.

- [ ] **Step 4: Commit**

```bash
git add data/ia-autorretrato.json scripts/ia-autorretrato
git commit -m "feat(autorretrato): datos revisados por Sergio (conceptos y camino)"
```

---

### Task 12: Textos, figura base y gráficos de actividad

> Antes de empezar: carga el skill `dataviz`.

**Files:**
- Modify: `src/messages/es.json`, `src/messages/en.json` (namespace `autorretrato` completo)
- Create: `src/components/blog/ia-autorretrato/Figura.tsx`, `CalendarioActividad.tsx`, `BarrasHerramientas.tsx`, `CoautoriaMensual.tsx`
- Test: `src/components/blog/ia-autorretrato/__tests__/actividad.test.tsx`

**Interfaces:**
- Consumes: `DATOS`, `EJEMPLO`, `AutorretratoIA` (Task 1)
- Produces: `Figura` (default) con props `{ id: string; titulo: string; resumen: string; etiquetaDatos: string; tabla: { columnas: string[]; filas: (string | number)[][] }; children: ReactNode }`; `ubicarEnSemanas(dias)` y `nivel(valor, max)` exportados de `CalendarioActividad`; componentes default `CalendarioActividad`, `BarrasHerramientas`, `CoautoriaMensual`, cada uno con prop opcional `datos?: AutorretratoIA` (por defecto `DATOS`).

- [ ] **Step 1: Agregar el namespace `autorretrato` a `src/messages/es.json`** (al nivel raíz, después de `cursos`)

```json
"autorretrato": {
  "verDatos": "Ver los datos",
  "calendario": {
    "titulo": "Prompts por día en Claude Code y commits por mes",
    "resumen": "{dias} días con actividad; el día más intenso tuvo {max} prompts.",
    "fecha": "Fecha", "prompts": "Prompts", "sesiones": "Sesiones", "commits": "commits"
  },
  "herramientas": {
    "titulo": "Las herramientas que más usa el agente",
    "resumen": "{top} es la herramienta más usada: {usos} usos.",
    "herramienta": "Herramienta", "usos": "Usos", "grupo": "Grupo",
    "grupos": { "ejecucion": "ejecución", "investigacion": "investigación", "navegador": "navegador", "orquestacion": "orquestación", "mcp": "MCP", "edicion": "edición" }
  },
  "coautoria": {
    "titulo": "Commits co-firmados por Claude, por mes",
    "resumen": "En {mes}, {pct}% de los commits llevan la firma de Claude.",
    "mes": "Mes", "total": "Total", "conClaude": "Con Claude", "soloHumano": "Solo yo", "modelo": "Modelo principal"
  },
  "ecosistema": {
    "titulo": "Las herramientas de IA que uso",
    "herramienta": "Herramienta", "uso": "Para qué", "intensidad": "Intensidad", "fuente": "Fuente",
    "medido": "medido", "declarado": "declarado"
  },
  "conceptos": {
    "titulo": "Conceptos: lo que hablo frente a lo que construyo",
    "resumen": "{ambos} conceptos aparecen tanto en mis prompts como en mi código; {ninguno} en ninguno.",
    "termino": "Concepto", "categoria": "Categoría", "hablado": "Hablado", "preguntado": "Preguntado", "construido": "Construido", "cuadrante": "Cuadrante",
    "cuadrantes": { "ambos": "Hablado y construido", "solo-hablado": "Solo hablado", "solo-construido": "Solo construido", "ninguno": "Ninguno" },
    "leyendaPreguntado": "Anillo: lo he preguntado («¿qué es…?»)",
    "si": "sí", "no": "no"
  },
  "prompts": {
    "titulo": "Cómo le hablo a la IA",
    "resumen": "{total} prompts; mediana de {mediana} caracteres; {espanol}% en español.",
    "total": "prompts", "mediana": "caracteres (mediana)", "preguntas": "son preguntas", "espanol": "en español"
  },
  "red": {
    "titulo": "Con quién escribo código",
    "resumen": "Antes, {personas} personas; ahora, {modelos} modelos de Claude.",
    "era": { "smonsalve": "smonsalve · 2013–2025", "serandmoncas": "serandmoncas · 2026" },
    "autor": "Autor", "dominio": "Dominio", "commits": "Commits", "sergio": "Sergio"
  },
  "discurso": {
    "titulo": "El debate sobre IA, autoría y código",
    "resumen": "{resaltados} de {total} conceptos del debate aparecen en mis propios prompts.",
    "concepto": "Concepto", "enMisPrompts": "En mis prompts", "relacion": "Relación"
  },
  "camino": {
    "titulo": "El camino hacia atrás",
    "resumen": "{total} conocimientos detrás de mis {hoy} tecnologías de hoy; el más antiguo con evidencia es de {anio}.",
    "play": "Reproducir", "pausa": "Pausar", "tiempo": "Momento de la animación", "raices": "raíces",
    "fases": { "presente": "Hoy", "rebobinar": "Rebobinando", "raices": "Las raíces", "avanzar": "De vuelta a hoy" },
    "evidencia": { "github": "en GitHub", "declarado": "declarado", "inferido": "inferido" },
    "conocimiento": "Conocimiento", "rama": "Rama", "evidenciaColumna": "Evidencia", "primeraEvidencia": "Primera evidencia"
  },
  "dominios": { "producto-web": "producto web", "hongos-iot": "hongos e IoT", "educacion": "educación", "agentes": "agentes", "experimentos": "experimentos" },
  "ramas": { "fundamentos": "fundamentos", "backend": "backend", "web": "web", "datos-ml": "datos y ML", "iot": "IoT", "infra": "infra", "agentes": "agentes", "educacion": "educación", "escritura": "escritura" }
}
```

- [ ] **Step 2: Agregar el mismo namespace a `src/messages/en.json`**

```json
"autorretrato": {
  "verDatos": "See the data",
  "calendario": {
    "titulo": "Claude Code prompts per day and commits per month",
    "resumen": "{dias} active days; the busiest day had {max} prompts.",
    "fecha": "Date", "prompts": "Prompts", "sesiones": "Sessions", "commits": "commits"
  },
  "herramientas": {
    "titulo": "The agent's most used tools",
    "resumen": "{top} is the most used tool: {usos} uses.",
    "herramienta": "Tool", "usos": "Uses", "grupo": "Group",
    "grupos": { "ejecucion": "execution", "investigacion": "research", "navegador": "browser", "orquestacion": "orchestration", "mcp": "MCP", "edicion": "editing" }
  },
  "coautoria": {
    "titulo": "Commits co-signed by Claude, per month",
    "resumen": "In {mes}, {pct}% of commits carry Claude's signature.",
    "mes": "Month", "total": "Total", "conClaude": "With Claude", "soloHumano": "Just me", "modelo": "Main model"
  },
  "ecosistema": {
    "titulo": "The AI tools I use",
    "herramienta": "Tool", "uso": "What for", "intensidad": "Intensity", "fuente": "Source",
    "medido": "measured", "declarado": "self-reported"
  },
  "conceptos": {
    "titulo": "Concepts: what I talk about vs. what I build",
    "resumen": "{ambos} concepts appear both in my prompts and in my code; {ninguno} in neither.",
    "termino": "Concept", "categoria": "Category", "hablado": "Talked", "preguntado": "Asked", "construido": "Built", "cuadrante": "Quadrant",
    "cuadrantes": { "ambos": "Talked and built", "solo-hablado": "Only talked", "solo-construido": "Only built", "ninguno": "Neither" },
    "leyendaPreguntado": "Ring: I've asked about it (\"what is…?\")",
    "si": "yes", "no": "no"
  },
  "prompts": {
    "titulo": "How I talk to AI",
    "resumen": "{total} prompts; median of {mediana} characters; {espanol}% in Spanish.",
    "total": "prompts", "mediana": "characters (median)", "preguntas": "are questions", "espanol": "in Spanish"
  },
  "red": {
    "titulo": "Who I write code with",
    "resumen": "Before, {personas} people; now, {modelos} Claude models.",
    "era": { "smonsalve": "smonsalve · 2013–2025", "serandmoncas": "serandmoncas · 2026" },
    "autor": "Author", "dominio": "Domain", "commits": "Commits", "sergio": "Sergio"
  },
  "discurso": {
    "titulo": "The debate on AI, authorship and code",
    "resumen": "{resaltados} of {total} concepts in the debate show up in my own prompts.",
    "concepto": "Concept", "enMisPrompts": "In my prompts", "relacion": "Relation"
  },
  "camino": {
    "titulo": "The path backwards",
    "resumen": "{total} pieces of knowledge behind my {hoy} technologies of today; the oldest with evidence is from {anio}.",
    "play": "Play", "pausa": "Pause", "tiempo": "Animation time", "raices": "roots",
    "fases": { "presente": "Today", "rebobinar": "Rewinding", "raices": "The roots", "avanzar": "Back to today" },
    "evidencia": { "github": "on GitHub", "declarado": "self-reported", "inferido": "inferred" },
    "conocimiento": "Knowledge", "rama": "Branch", "evidenciaColumna": "Evidence", "primeraEvidencia": "First evidence"
  },
  "dominios": { "producto-web": "web product", "hongos-iot": "mushrooms & IoT", "educacion": "education", "agentes": "agents", "experimentos": "experiments" },
  "ramas": { "fundamentos": "foundations", "backend": "backend", "web": "web", "datos-ml": "data & ML", "iot": "IoT", "infra": "infra", "agentes": "agents", "educacion": "education", "escritura": "writing" }
}
```

Run: `node -e "for (const l of ['es','en']) { const m=require('./src/messages/'+l+'.json'); if(!m.autorretrato) throw l }" && echo ok`
Expected: `ok`

- [ ] **Step 3: Test que falla** `src/components/blog/ia-autorretrato/__tests__/actividad.test.tsx`

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EJEMPLO } from '@/lib/ia-autorretrato/ejemplo'
import CalendarioActividad, { nivel, ubicarEnSemanas } from '../CalendarioActividad'
import BarrasHerramientas from '../BarrasHerramientas'
import CoautoriaMensual from '../CoautoriaMensual'

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key, useLocale: () => 'es' }))

describe('CalendarioActividad', () => {
  it('rellena los días sin actividad y ubica por semana (lunes = fila 0)', () => {
    const celdas = ubicarEnSemanas(EJEMPLO.actividadDiaria)
    expect(celdas).toHaveLength(10) // 5 al 14 de octubre
    expect(celdas[0]).toMatchObject({ fecha: '2026-10-05', fila: 0, col: 0 }) // lunes
    expect(celdas[1].prompts).toBe(0)
  })
  it('nivel 0–4 sin dividir por cero', () => {
    expect(nivel(0, 0)).toBe(0)
    expect(nivel(10, 10)).toBe(4)
    expect(nivel(1, 10)).toBe(1)
  })
  it('es accesible y trae la tabla de datos', () => {
    render(<CalendarioActividad datos={EJEMPLO} />)
    expect(screen.getByRole('img', { name: 'resumen' })).toBeInTheDocument()
    expect(screen.getByText('2026-10-07')).toBeInTheDocument()
  })
  it('con datos vacíos no dibuja NaN ni Infinity', () => {
    const { container } = render(<CalendarioActividad datos={{ ...EJEMPLO, actividadDiaria: [], commitsPorMes: [] }} />)
    expect(container.innerHTML).not.toMatch(/NaN|Infinity/)
  })
})

describe('BarrasHerramientas', () => {
  it('una barra por herramienta', () => {
    const { container } = render(<BarrasHerramientas datos={EJEMPLO} />)
    expect(container.querySelectorAll('[data-herramienta]')).toHaveLength(2)
    expect(container.innerHTML).not.toMatch(/NaN|Infinity/)
  })
})

describe('CoautoriaMensual', () => {
  it('una columna por mes y el modelo principal', () => {
    const { container } = render(<CoautoriaMensual datos={EJEMPLO} />)
    expect(container.querySelectorAll('[data-mes]')).toHaveLength(2)
    expect(screen.getAllByText('Claude Opus 5.5').length).toBeGreaterThan(0)
  })
  it('un mes con total 0 no rompe', () => {
    const { container } = render(<CoautoriaMensual datos={{ ...EJEMPLO, commitsPorMes: [{ mes: '2026-09', total: 0, coautoriaClaude: 0, porTipo: {} }] }} />)
    expect(container.innerHTML).not.toMatch(/NaN|Infinity/)
  })
})
```

- [ ] **Step 4: Correr y ver que falla**

Run: `npx vitest run src/components/blog/ia-autorretrato`
Expected: FAIL ("Failed to resolve import '../CalendarioActividad'")

- [ ] **Step 5: Implementar `Figura.tsx`**

```tsx
import type { ReactNode } from 'react'

type Tabla = { columnas: string[]; filas: (string | number)[][] }

/** Marco común: título, gráfico accesible, resumen con la cifra clave y tabla de datos. */
export default function Figura({ id, titulo, resumen, etiquetaDatos, tabla, children }: {
  id: string; titulo: string; resumen: string; etiquetaDatos: string; tabla: Tabla; children: ReactNode
}) {
  return (
    <figure id={id} className="not-italic my-10">
      <figcaption className="font-mono text-xs text-accent mb-3">{titulo}</figcaption>
      <div role="img" aria-label={resumen}>{children}</div>
      <p className="text-sm text-text-secondary mt-3">{resumen}</p>
      <details className="mt-2 text-sm">
        <summary className="cursor-pointer font-mono text-xs text-text-secondary">{etiquetaDatos}</summary>
        <div className="overflow-x-auto max-h-80">
          <table className="mt-2 w-full text-left text-xs">
            <thead>
              <tr>{tabla.columnas.map(c => <th key={c} scope="col" className="py-1 pr-3 font-mono font-normal text-text-secondary">{c}</th>)}</tr>
            </thead>
            <tbody>
              {tabla.filas.map((f, i) => (
                <tr key={i} className="border-t border-border">{f.map((v, j) => <td key={j} className="py-1 pr-3">{v}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  )
}
```

- [ ] **Step 6: Implementar `CalendarioActividad.tsx`**

```tsx
import { useTranslations } from 'next-intl'
import { DATOS } from '@/lib/ia-autorretrato/datos'
import type { AutorretratoIA } from '@/lib/ia-autorretrato/tipos'
import Figura from './Figura'

const CELDA = 12
const PASO = 14
const ALTO_BARRAS = 40

type Dia = { fecha: string; prompts: number }
export type Celda = Dia & { col: number; fila: number }

/** Todos los días entre el primero y el último, con columna = semana y fila = día (lunes = 0). */
export function ubicarEnSemanas(dias: Dia[]): Celda[] {
  if (dias.length === 0) return []
  const ordenados = [...dias].sort((a, b) => a.fecha.localeCompare(b.fecha))
  const porFecha = new Map(ordenados.map(d => [d.fecha, d.prompts]))
  const inicio = new Date(`${ordenados[0].fecha}T00:00:00Z`)
  const fin = new Date(`${ordenados.at(-1)!.fecha}T00:00:00Z`)
  const desfase = (inicio.getUTCDay() + 6) % 7
  const celdas: Celda[] = []
  for (let d = new Date(inicio), i = 0; d <= fin; d.setUTCDate(d.getUTCDate() + 1), i++) {
    const fecha = d.toISOString().slice(0, 10)
    celdas.push({ fecha, prompts: porFecha.get(fecha) ?? 0, col: Math.floor((i + desfase) / 7), fila: (d.getUTCDay() + 6) % 7 })
  }
  return celdas
}

/** 0 = sin actividad; 1–4 = cuartos del máximo. */
export function nivel(valor: number, max: number): number {
  if (valor <= 0 || max <= 0) return 0
  return Math.min(4, Math.max(1, Math.ceil((valor / max) * 4)))
}

export default function CalendarioActividad({ datos = DATOS }: { datos?: AutorretratoIA }) {
  const t = useTranslations('autorretrato.calendario')
  const tg = useTranslations('autorretrato')
  const celdas = ubicarEnSemanas(datos.actividadDiaria)
  const max = celdas.reduce((m, c) => Math.max(m, c.prompts), 0)
  const columnas = celdas.reduce((m, c) => Math.max(m, c.col + 1), 1)
  const ancho = columnas * PASO
  const altoCalendario = 7 * PASO

  // Commits por mes: una barra bajo la primera semana de cada mes.
  const colDeMes = new Map<string, number>()
  for (const c of celdas) if (!colDeMes.has(c.fecha.slice(0, 7))) colDeMes.set(c.fecha.slice(0, 7), c.col)
  const meses = datos.commitsPorMes.filter(m => colDeMes.has(m.mes))
  const maxCommits = meses.reduce((m, x) => Math.max(m, x.total), 0)

  return (
    <Figura
      id="calendario-actividad"
      titulo={t('titulo')}
      resumen={t('resumen', { dias: celdas.filter(c => c.prompts > 0).length, max })}
      etiquetaDatos={tg('verDatos')}
      tabla={{ columnas: [t('fecha'), t('prompts'), t('sesiones')], filas: datos.actividadDiaria.map(d => [d.fecha, d.prompts, d.sesiones]) }}
    >
      <svg viewBox={`0 0 ${Math.max(ancho, PASO)} ${altoCalendario + ALTO_BARRAS + 16}`} width="100%" aria-hidden="true">
        {celdas.map(c => (
          <rect key={c.fecha} x={c.col * PASO} y={c.fila * PASO} width={CELDA} height={CELDA} rx={2}
            fill={c.prompts ? 'var(--color-accent)' : 'var(--color-border)'}
            fillOpacity={c.prompts ? 0.2 + 0.2 * nivel(c.prompts, max) : 1}>
            <title>{`${c.fecha}: ${c.prompts}`}</title>
          </rect>
        ))}
        {meses.map(m => {
          const alto = maxCommits ? (m.total / maxCommits) * ALTO_BARRAS : 0
          const x = colDeMes.get(m.mes)! * PASO
          return (
            <g key={m.mes}>
              <rect x={x} y={altoCalendario + 8 + ALTO_BARRAS - alto} width={CELDA} height={alto} fill="var(--color-text-secondary)" />
              <text x={x} y={altoCalendario + ALTO_BARRAS + 16} fontSize={7} fill="var(--color-text-secondary)">{`${m.mes.slice(5)} · ${m.total}`}</text>
            </g>
          )
        })}
      </svg>
    </Figura>
  )
}
```

- [ ] **Step 7: Implementar `BarrasHerramientas.tsx`**

```tsx
import { useTranslations } from 'next-intl'
import { DATOS } from '@/lib/ia-autorretrato/datos'
import type { AutorretratoIA } from '@/lib/ia-autorretrato/tipos'
import Figura from './Figura'

const FILA = 24
const ETIQUETA = 170
const ANCHO = 600

export default function BarrasHerramientas({ datos = DATOS }: { datos?: AutorretratoIA }) {
  const t = useTranslations('autorretrato.herramientas')
  const tg = useTranslations('autorretrato')
  const hs = datos.herramientas.slice(0, 10)
  const max = hs.reduce((m, h) => Math.max(m, h.usos), 0)
  const top = hs[0]
  return (
    <Figura
      id="barras-herramientas"
      titulo={t('titulo')}
      resumen={t('resumen', { top: top?.nombre ?? '—', usos: top?.usos ?? 0 })}
      etiquetaDatos={tg('verDatos')}
      tabla={{ columnas: [t('herramienta'), t('usos'), t('grupo')], filas: datos.herramientas.map(h => [h.nombre, h.usos, t(`grupos.${h.grupo}`)]) }}
    >
      <svg viewBox={`0 0 ${ANCHO} ${Math.max(hs.length, 1) * FILA}`} width="100%" aria-hidden="true">
        {hs.map((h, i) => {
          const largo = max ? ((ANCHO - ETIQUETA - 60) * h.usos) / max : 0
          return (
            <g key={h.nombre} data-herramienta={h.nombre} transform={`translate(0 ${i * FILA})`}>
              <text x={ETIQUETA - 8} y={15} textAnchor="end" fontSize={11} fill="var(--color-text)">{h.nombre}</text>
              <rect x={ETIQUETA} y={4} width={largo} height={14} rx={2} fill="var(--color-accent)" fillOpacity={0.85} />
              <text x={ETIQUETA + largo + 6} y={15} fontSize={10} fill="var(--color-text-secondary)">{`${h.usos} · ${t(`grupos.${h.grupo}`)}`}</text>
            </g>
          )
        })}
      </svg>
    </Figura>
  )
}
```

- [ ] **Step 8: Implementar `CoautoriaMensual.tsx`**

```tsx
import { useTranslations } from 'next-intl'
import { DATOS } from '@/lib/ia-autorretrato/datos'
import type { AutorretratoIA } from '@/lib/ia-autorretrato/tipos'
import Figura from './Figura'

const ANCHO = 600
const ALTO = 220
const BASE = 180

const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 0)

export function modeloPrincipal(datos: AutorretratoIA, mes: string): string {
  return datos.modelosPorMes.filter(m => m.mes === mes).sort((a, b) => b.commits - a.commits)[0]?.modelo ?? '—'
}

export default function CoautoriaMensual({ datos = DATOS }: { datos?: AutorretratoIA }) {
  const t = useTranslations('autorretrato.coautoria')
  const tg = useTranslations('autorretrato')
  const meses = datos.commitsPorMes
  const max = meses.reduce((m, x) => Math.max(m, x.total), 0)
  const paso = ANCHO / Math.max(meses.length, 1)
  const ultimo = meses.at(-1)
  return (
    <Figura
      id="coautoria-mensual"
      titulo={t('titulo')}
      resumen={t('resumen', { mes: ultimo?.mes ?? '—', pct: ultimo ? pct(ultimo.coautoriaClaude, ultimo.total) : 0 })}
      etiquetaDatos={tg('verDatos')}
      tabla={{
        columnas: [t('mes'), t('total'), t('conClaude'), t('modelo')],
        filas: meses.map(m => [m.mes, m.total, `${m.coautoriaClaude} (${pct(m.coautoriaClaude, m.total)}%)`, modeloPrincipal(datos, m.mes)]),
      }}
    >
      <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} width="100%" aria-hidden="true">
        {meses.map((m, i) => {
          const altoTotal = max ? ((BASE - 30) * m.total) / max : 0
          const altoClaude = m.total ? (altoTotal * m.coautoriaClaude) / m.total : 0
          const x = i * paso + paso * 0.2
          const w = paso * 0.6
          return (
            <g key={m.mes} data-mes={m.mes}>
              <rect x={x} y={BASE - altoTotal} width={w} height={altoTotal - altoClaude} fill="var(--color-border)" />
              <rect x={x} y={BASE - altoClaude} width={w} height={altoClaude} fill="var(--color-accent)" />
              <text x={x + w / 2} y={BASE - altoTotal - 6} textAnchor="middle" fontSize={11} fill="var(--color-text)">{`${pct(m.coautoriaClaude, m.total)}%`}</text>
              <text x={x + w / 2} y={BASE + 14} textAnchor="middle" fontSize={10} fill="var(--color-text-secondary)">{m.mes}</text>
              <text x={x + w / 2} y={BASE + 28} textAnchor="middle" fontSize={8} fill="var(--color-text-muted)">{modeloPrincipal(datos, m.mes)}</text>
            </g>
          )
        })}
      </svg>
      <p className="font-mono text-xs text-text-secondary mt-2">
        <span className="inline-block w-2 h-2 mr-1 bg-accent" />{t('conClaude')}
        <span className="inline-block w-2 h-2 ml-4 mr-1 bg-border" />{t('soloHumano')}
      </p>
    </Figura>
  )
}
```

- [ ] **Step 9: Correr el test**

Run: `npx vitest run src/components/blog/ia-autorretrato`
Expected: PASS (8 tests)

- [ ] **Step 10: Commit**

```bash
git add src/messages src/components/blog/ia-autorretrato
git commit -m "feat(autorretrato): textos y gráficos de actividad, herramientas y coautoría"
```

---

### Task 13: Ecosistema, cuadrante de conceptos y perfil de prompts

> Antes de empezar: carga el skill `dataviz` si no está cargado.

**Files:**
- Create: `src/components/blog/ia-autorretrato/MatrizEcosistema.tsx`, `CuadranteConceptos.tsx`, `PerfilPrompts.tsx`
- Test: `src/components/blog/ia-autorretrato/__tests__/perfil.test.tsx`

**Interfaces:**
- Consumes: `Figura` (Task 12), `DATOS`, `EJEMPLO`, `Cuadrante` (Task 1)
- Produces: componentes default `MatrizEcosistema`, `CuadranteConceptos`, `PerfilPrompts` (prop opcional `datos`)

- [ ] **Step 1: Test que falla**

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { EJEMPLO } from '@/lib/ia-autorretrato/ejemplo'
import MatrizEcosistema from '../MatrizEcosistema'
import CuadranteConceptos from '../CuadranteConceptos'
import PerfilPrompts from '../PerfilPrompts'

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key, useLocale: () => 'es' }))

describe('MatrizEcosistema', () => {
  it('marca cada herramienta como medida o declarada y usa el uso del idioma', () => {
    render(<MatrizEcosistema datos={EJEMPLO} />)
    const fila = screen.getByText('Claude Code').closest('tr')!
    expect(within(fila).getByText('medido')).toBeInTheDocument()
    expect(within(fila).getByText('Agente de código')).toBeInTheDocument()
    expect(within(screen.getByText('ChatGPT').closest('tr')!).getByText('declarado')).toBeInTheDocument()
  })
})

describe('CuadranteConceptos', () => {
  it('ubica cada concepto en su cuadrante y marca los preguntados', () => {
    const { container } = render(<CuadranteConceptos datos={EJEMPLO} />)
    expect(container.querySelector('[data-cuadrante="ambos"] [data-concepto="rag"]')).not.toBeNull()
    const mcp = container.querySelector('[data-cuadrante="ninguno"] [data-concepto="mcp"]')!
    expect(mcp.getAttribute('data-preguntado')).toBe('true')
    expect(screen.getByRole('img', { name: 'resumen' })).toBeInTheDocument()
  })
})

describe('PerfilPrompts', () => {
  it('muestra las cuatro cifras', () => {
    render(<PerfilPrompts datos={EJEMPLO} />)
    for (const n of ['19', '120', '30%', '90%']) expect(screen.getByText(n)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Correr y ver que falla**

Run: `npx vitest run src/components/blog/ia-autorretrato/__tests__/perfil.test.tsx`
Expected: FAIL ("Failed to resolve import '../MatrizEcosistema'")

- [ ] **Step 3: Implementar `MatrizEcosistema.tsx`**

```tsx
import { useLocale, useTranslations } from 'next-intl'
import { DATOS } from '@/lib/ia-autorretrato/datos'
import type { AutorretratoIA } from '@/lib/ia-autorretrato/tipos'

export default function MatrizEcosistema({ datos = DATOS }: { datos?: AutorretratoIA }) {
  const t = useTranslations('autorretrato.ecosistema')
  const locale = useLocale() === 'en' ? 'en' : 'es'
  return (
    <figure id="matriz-ecosistema" className="not-italic my-10">
      <figcaption className="font-mono text-xs text-accent mb-3">{t('titulo')}</figcaption>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="font-mono text-xs text-text-secondary">
            <th scope="col" className="py-1 pr-3 font-normal">{t('herramienta')}</th>
            <th scope="col" className="py-1 pr-3 font-normal">{t('uso')}</th>
            <th scope="col" className="py-1 pr-3 font-normal">{t('intensidad')}</th>
            <th scope="col" className="py-1 font-normal">{t('fuente')}</th>
          </tr>
        </thead>
        <tbody>
          {datos.ecosistema.map(e => (
            <tr key={e.herramienta} className="border-t border-border align-top">
              <td className="py-2 pr-3">{e.herramienta}</td>
              <td className="py-2 pr-3 text-text-secondary">{e.uso[locale]}</td>
              <td className="py-2 pr-3" aria-label={`${e.intensidad}/3`}>
                {[1, 2, 3].map(i => (
                  <span key={i} className={`inline-block w-2 h-2 mr-1 rounded-full ${i <= e.intensidad ? 'bg-accent' : 'bg-border'}`} />
                ))}
              </td>
              <td className="py-2">
                <span className={`font-mono text-xs px-1.5 py-0.5 border ${e.fuente === 'medido' ? 'border-accent text-accent' : 'border-dashed border-text-muted text-text-secondary'}`}>
                  {t(e.fuente)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}
```

- [ ] **Step 4: Implementar `CuadranteConceptos.tsx`**

```tsx
import { useTranslations } from 'next-intl'
import { DATOS } from '@/lib/ia-autorretrato/datos'
import type { AutorretratoIA, Cuadrante } from '@/lib/ia-autorretrato/tipos'
import Figura from './Figura'

// Fila de arriba: construido; columna derecha: hablado.
const ORDEN: Cuadrante[] = ['solo-construido', 'ambos', 'ninguno', 'solo-hablado']

export default function CuadranteConceptos({ datos = DATOS }: { datos?: AutorretratoIA }) {
  const t = useTranslations('autorretrato.conceptos')
  const tg = useTranslations('autorretrato')
  const cuenta = (q: Cuadrante) => datos.conceptos.filter(c => c.cuadrante === q).length
  return (
    <Figura
      id="cuadrante-conceptos"
      titulo={t('titulo')}
      resumen={t('resumen', { ambos: cuenta('ambos'), ninguno: cuenta('ninguno') })}
      etiquetaDatos={tg('verDatos')}
      tabla={{
        columnas: [t('termino'), t('categoria'), t('hablado'), t('preguntado'), t('construido'), t('cuadrante')],
        filas: datos.conceptos.map(c => [c.termino, c.categoria, c.hablado, c.preguntado, c.construido ? t('si') : t('no'), t(`cuadrantes.${c.cuadrante}`)]),
      }}
    >
      <div className="grid grid-cols-2 gap-px bg-border border border-border">
        {ORDEN.map(q => (
          <div key={q} data-cuadrante={q} className="bg-background p-3 min-h-28">
            <p className="font-mono text-xs text-text-secondary mb-2">{`${t(`cuadrantes.${q}`)} · ${cuenta(q)}`}</p>
            <div className="flex flex-wrap gap-1.5">
              {datos.conceptos.filter(c => c.cuadrante === q).map(c => (
                <span
                  key={c.slug}
                  data-concepto={c.slug}
                  data-preguntado={String(c.preguntado > 0)}
                  title={c.termino}
                  className={`inline-block w-2.5 h-2.5 rounded-full ${q === 'ninguno' ? 'bg-text-muted' : 'bg-accent'} ${c.preguntado > 0 ? 'ring-2 ring-offset-1 ring-offset-background ring-text-secondary' : ''}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="font-mono text-xs text-text-secondary mt-2">{t('leyendaPreguntado')}</p>
    </Figura>
  )
}
```

- [ ] **Step 5: Implementar `PerfilPrompts.tsx`**

```tsx
import { useTranslations } from 'next-intl'
import { DATOS } from '@/lib/ia-autorretrato/datos'
import type { AutorretratoIA } from '@/lib/ia-autorretrato/tipos'

export default function PerfilPrompts({ datos = DATOS }: { datos?: AutorretratoIA }) {
  const t = useTranslations('autorretrato.prompts')
  const p = datos.perfilPrompts
  const cifras: [string, string][] = [
    [String(p.total), t('total')],
    [String(p.medianaCaracteres), t('mediana')],
    [`${p.pctPreguntas}%`, t('preguntas')],
    [`${p.pctEspanol}%`, t('espanol')],
  ]
  return (
    <figure id="perfil-prompts" className="not-italic my-10" aria-label={t('resumen', { total: p.total, mediana: p.medianaCaracteres, espanol: p.pctEspanol })}>
      <figcaption className="font-mono text-xs text-accent mb-3">{t('titulo')}</figcaption>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cifras.map(([valor, etiqueta]) => (
          <div key={etiqueta} className="border border-border p-3">
            <p className="font-mono text-2xl text-text">{valor}</p>
            <p className="text-xs text-text-secondary mt-1">{etiqueta}</p>
          </div>
        ))}
      </div>
    </figure>
  )
}
```

- [ ] **Step 6: Correr el test**

Run: `npx vitest run src/components/blog/ia-autorretrato`
Expected: PASS (todos)

- [ ] **Step 7: Commit**

```bash
git add src/components/blog/ia-autorretrato
git commit -m "feat(autorretrato): ecosistema, cuadrante de conceptos y perfil de prompts"
```

---

### Task 14: Grafos (coautoría por era y mapa del discurso)

> Antes de empezar: carga el skill `dataviz` si no está cargado.

**Files:**
- Create: `src/components/blog/ia-autorretrato/RedCoautoria.tsx`, `MapaDiscurso.tsx`
- Test: `src/components/blog/ia-autorretrato/__tests__/grafos.test.tsx`

**Interfaces:**
- Consumes: `Figura` (Task 12), `GrafoCoautoria`, `GrafoDiscurso` (Task 1)
- Produces: componentes default `RedCoautoria`, `MapaDiscurso` (prop opcional `datos`)

- [ ] **Step 1: Test que falla**

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EJEMPLO } from '@/lib/ia-autorretrato/ejemplo'
import RedCoautoria from '../RedCoautoria'
import MapaDiscurso from '../MapaDiscurso'

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key, useLocale: () => 'en' }))

describe('RedCoautoria', () => {
  it('dibuja un panel por era con sus nodos y aristas', () => {
    const { container } = render(<RedCoautoria datos={EJEMPLO} />)
    expect(container.querySelectorAll('[data-era]')).toHaveLength(2)
    expect(container.querySelectorAll('[data-era="smonsalve"] [data-nodo]')).toHaveLength(3)
    expect(container.querySelectorAll('[data-era="serandmoncas"] line')).toHaveLength(2)
    expect(screen.getAllByText('Persona 1').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Claude Opus 5.5').length).toBeGreaterThan(0)
    expect(container.innerHTML).not.toMatch(/NaN|Infinity/)
  })
})

describe('MapaDiscurso', () => {
  it('resalta conceptos de mis prompts y usa la etiqueta del idioma', () => {
    const { container } = render(<MapaDiscurso datos={EJEMPLO} />)
    expect(container.querySelector('[data-nodo="vibe-coding"]')!.getAttribute('data-resaltado')).toBe('true')
    expect(screen.getAllByText('agentic engineering').length).toBeGreaterThan(0)
    expect(container.querySelectorAll('line')).toHaveLength(1)
  })
})
```

- [ ] **Step 2: Correr y ver que falla**

Run: `npx vitest run src/components/blog/ia-autorretrato/__tests__/grafos.test.tsx`
Expected: FAIL ("Failed to resolve import '../RedCoautoria'")

- [ ] **Step 3: Implementar `RedCoautoria.tsx`**

```tsx
import { useTranslations } from 'next-intl'
import { DATOS } from '@/lib/ia-autorretrato/datos'
import type { AutorretratoIA, GrafoCoautoria, NodoGrafo } from '@/lib/ia-autorretrato/tipos'
import Figura from './Figura'

const W = 480
const H = 320

function Panel({ grafo, titulo, etiqueta }: { grafo: GrafoCoautoria; titulo: string; etiqueta: (n: NodoGrafo) => string }) {
  const porId = new Map(grafo.nodos.map(n => [n.id, n]))
  const maxNodo = grafo.nodos.reduce((m, n) => Math.max(m, n.peso), 1)
  const maxArista = grafo.aristas.reduce((m, a) => Math.max(m, a.peso), 1)
  const radio = (n: NodoGrafo) => 3 + 9 * Math.sqrt(n.peso / maxNodo)
  return (
    <div data-era={grafo.era} className="w-full sm:w-[48%]">
      <p className="font-mono text-xs text-text-secondary mb-1">{titulo}</p>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" aria-hidden="true">
        {grafo.aristas.map(a => {
          const de = porId.get(a.de)
          const ha = porId.get(a.a)
          if (!de || !ha) return null
          return <line key={`${a.de}-${a.a}`} x1={de.x * W} y1={de.y * H} x2={ha.x * W} y2={ha.y * H}
            stroke="var(--color-text-muted)" strokeOpacity={0.6} strokeWidth={0.5 + (3.5 * a.peso) / maxArista} />
        })}
        {grafo.nodos.map(n => {
          const esDominio = n.tipo === 'dominio'
          return (
            <g key={n.id} data-nodo={n.id}>
              <circle cx={n.x * W} cy={n.y * H} r={radio(n)}
                fill={n.tipo === 'sergio' ? 'var(--color-accent)' : n.tipo === 'modelo' ? 'var(--color-background)' : n.tipo === 'persona' ? 'var(--color-text-secondary)' : 'var(--color-border)'}
                stroke={n.tipo === 'modelo' ? 'var(--color-accent)' : 'none'} strokeWidth={1.5}>
                <title>{`${etiqueta(n)}: ${n.peso}`}</title>
              </circle>
              <text x={n.x * W + (esDominio ? radio(n) + 6 : -radio(n) - 6)} y={n.y * H + 4} textAnchor={esDominio ? 'start' : 'end'}
                fontSize={11} fill="var(--color-text)">{etiqueta(n)}</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export default function RedCoautoria({ datos = DATOS }: { datos?: AutorretratoIA }) {
  const t = useTranslations('autorretrato.red')
  const tg = useTranslations('autorretrato')
  const etiqueta = (n: NodoGrafo) => n.tipo === 'dominio' ? tg(`dominios.${n.etiqueta}`) : n.tipo === 'sergio' ? t('sergio') : n.etiqueta
  const vieja = datos.eras.find(e => e.cuenta === 'smonsalve')
  const nueva = datos.eras.find(e => e.cuenta === 'serandmoncas')
  const personas = vieja?.coautores.find(c => c.tipo === 'persona')?.n ?? 0
  const modelos = nueva?.coautores.find(c => c.tipo === 'modelo')?.n ?? 0
  return (
    <Figura
      id="red-coautoria"
      titulo={t('titulo')}
      resumen={t('resumen', { personas, modelos })}
      etiquetaDatos={tg('verDatos')}
      tabla={{
        columnas: ['era', t('autor'), t('dominio'), t('commits')],
        filas: datos.grafoCoautoria.flatMap(g => {
          const porId = new Map(g.nodos.map(n => [n.id, n]))
          return g.aristas.map(a => [g.era, etiqueta(porId.get(a.de)!), etiqueta(porId.get(a.a)!), a.peso])
        }),
      }}
    >
      <div className="flex flex-wrap gap-4 justify-between">
        {datos.grafoCoautoria.map(g => <Panel key={g.era} grafo={g} titulo={t(`era.${g.era}`)} etiqueta={etiqueta} />)}
      </div>
    </Figura>
  )
}
```

- [ ] **Step 4: Implementar `MapaDiscurso.tsx`**

```tsx
import { useLocale, useTranslations } from 'next-intl'
import { DATOS } from '@/lib/ia-autorretrato/datos'
import type { AutorretratoIA } from '@/lib/ia-autorretrato/tipos'
import Figura from './Figura'

const W = 700
const H = 520

export default function MapaDiscurso({ datos = DATOS }: { datos?: AutorretratoIA }) {
  const t = useTranslations('autorretrato.discurso')
  const tg = useTranslations('autorretrato')
  const en = useLocale() === 'en'
  const g = datos.grafoDiscurso
  const porId = new Map(g.nodos.map(n => [n.id, n]))
  const nombre = (id: string) => { const n = porId.get(id); return n ? (en ? n.etiquetaEn : n.etiqueta) : id }
  const resaltados = g.nodos.filter(n => n.resaltado).length
  return (
    <Figura
      id="mapa-discurso"
      titulo={t('titulo')}
      resumen={t('resumen', { resaltados, total: g.nodos.length })}
      etiquetaDatos={tg('verDatos')}
      tabla={{
        columnas: [t('concepto'), t('relacion'), t('concepto')],
        filas: g.aristas.map(a => [nombre(a.de), a.motivo, nombre(a.a)]),
      }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" aria-hidden="true">
        {g.aristas.map(a => {
          const de = porId.get(a.de)
          const ha = porId.get(a.a)
          if (!de || !ha) return null
          return <line key={`${a.de}-${a.a}`} x1={de.x * W} y1={de.y * H} x2={ha.x * W} y2={ha.y * H} stroke="var(--color-text-muted)" strokeOpacity={0.5}>
            <title>{a.motivo}</title>
          </line>
        })}
        {g.nodos.map(n => {
          const derecha = n.x >= 0.5
          return (
            <g key={n.id} data-nodo={n.id} data-resaltado={String(n.resaltado)}>
              <circle cx={n.x * W} cy={n.y * H} r={6} fill={n.resaltado ? 'var(--color-accent)' : 'var(--color-background)'} stroke={n.resaltado ? 'none' : 'var(--color-text-secondary)'} />
              <text x={n.x * W + (derecha ? 10 : -10)} y={n.y * H + 4} textAnchor={derecha ? 'start' : 'end'} fontSize={12}
                fill={n.resaltado ? 'var(--color-text)' : 'var(--color-text-secondary)'}>{en ? n.etiquetaEn : n.etiqueta}</text>
            </g>
          )
        })}
      </svg>
    </Figura>
  )
}
```

- [ ] **Step 5: Correr el test**

Run: `npx vitest run src/components/blog/ia-autorretrato`
Expected: PASS (todos)

- [ ] **Step 6: Commit**

```bash
git add src/components/blog/ia-autorretrato
git commit -m "feat(autorretrato): red de coautoría por era y mapa del discurso"
```

---

### Task 15: Escena del Motion, animación "Rebobinar" y export para /motion

**Files:**
- Create: `src/lib/ia-autorretrato/caminoEscena.ts`, `src/components/blog/ia-autorretrato/CaminoMotion.tsx`, `scripts/ia-autorretrato/escena-motion.ts`
- Test: `src/lib/ia-autorretrato/__tests__/caminoEscena.test.ts`, `src/components/blog/ia-autorretrato/__tests__/CaminoMotion.test.tsx`

**Interfaces:**
- Consumes: `Camino`, `NodoCamino`, `RAMAS` (Task 1), `DATOS`
- Produces:
  - `type TipoFase = 'presente' | 'rebobinar' | 'raices' | 'avanzar'`, `type Fase = { tipo: TipoFase; inicio: number; fin: number }`
  - `type NodoEscena = NodoCamino & { x: number; y: number; anio: number | null }`
  - `type Escena = { duracion: number; fases: Fase[]; nodos: NodoEscena[]; aristas: AristaCamino[]; anioMin: number; anioMax: number }`
  - `type Cuadro = { fase: TipoFase; anio: number | null; opacidad: Record<string, number>; visibles: string[] }`
  - `crearEscena(camino: Camino, duracion?: number): Escena` (por defecto 50 s)
  - `render(escena: Escena, t: number): Cuadro` (pura)

- [ ] **Step 1: Test que falla** `src/lib/ia-autorretrato/__tests__/caminoEscena.test.ts`

```ts
import { describe, it, expect } from 'vitest'
import { crearEscena, render } from '../caminoEscena'
import type { Camino } from '../tipos'

const camino: Camino = {
  nodos: [
    { id: 'logica', etiqueta: 'L', etiquetaEn: 'L', rama: 'fundamentos', evidencia: 'inferido' },
    { id: 'ruby', etiqueta: 'R', etiquetaEn: 'R', rama: 'backend', evidencia: 'github', primeraEvidencia: '2013-01' },
    { id: 'python', etiqueta: 'P', etiquetaEn: 'P', rama: 'backend', evidencia: 'github', primeraEvidencia: '2014-10' },
    { id: 'fastapi', etiqueta: 'F', etiquetaEn: 'F', rama: 'backend', evidencia: 'github', primeraEvidencia: '2025-11', hoy: true },
    { id: 'mapa', etiqueta: 'M', etiquetaEn: 'M', rama: 'educacion', evidencia: 'declarado', hoy: true },
  ],
  aristas: [{ de: 'logica', a: 'ruby' }, { de: 'ruby', a: 'python' }, { de: 'python', a: 'fastapi' }],
}
const escena = crearEscena(camino, 50)
const fase = (tipo: string) => escena.fases.find(f => f.tipo === tipo)!

describe('crearEscena', () => {
  it('fases contiguas que cubren toda la duración', () => {
    expect(escena.fases.map(f => f.tipo)).toEqual(['presente', 'rebobinar', 'raices', 'avanzar'])
    expect(escena.fases[0].inicio).toBe(0)
    expect(escena.fases.at(-1)!.fin).toBe(50)
    for (let i = 1; i < escena.fases.length; i++) expect(escena.fases[i].inicio).toBe(escena.fases[i - 1].fin)
  })
  it('años: inferidos sin año; nodo de hoy sin fecha toma el año máximo', () => {
    const porId = Object.fromEntries(escena.nodos.map(n => [n.id, n]))
    expect(porId.logica.anio).toBeNull()
    expect(porId.mapa.anio).toBe(2025)
    expect(escena.anioMin).toBe(2013)
  })
  it('layout determinista y dentro de [0,1]', () => {
    expect(crearEscena(camino, 50)).toEqual(escena)
    for (const n of escena.nodos) {
      expect(n.x).toBeGreaterThanOrEqual(0); expect(n.x).toBeLessThanOrEqual(1)
      expect(n.y).toBeGreaterThanOrEqual(0); expect(n.y).toBeLessThanOrEqual(1)
    }
  })
})

describe('render', () => {
  it('es pura', () => {
    expect(render(escena, 17.3)).toEqual(render(escena, 17.3))
  })
  it('presente: solo los nodos de hoy', () => {
    expect(render(escena, 3).visibles.sort()).toEqual(['fastapi', 'mapa'])
  })
  it('rebobinar: el conjunto visible solo crece', () => {
    const { inicio, fin } = fase('rebobinar')
    let anterior = new Set<string>()
    for (let t = inicio; t < fin; t += 0.5) {
      const visibles = new Set(render(escena, t).visibles)
      for (const id of anterior) expect(visibles.has(id)).toBe(true)
      anterior = visibles
    }
    expect(anterior.has('ruby')).toBe(true)
    expect(anterior.has('logica')).toBe(false)
  })
  it('raíces: aparecen los inferidos', () => {
    expect(render(escena, fase('raices').fin - 0.01).visibles).toContain('logica')
  })
  it('avanzar: se resaltan en orden cronológico y al final todo está a opacidad 1', () => {
    const { inicio } = fase('avanzar')
    const temprano = render(escena, inicio + 1)
    expect(temprano.opacidad.ruby).toBe(1)
    expect(temprano.opacidad.fastapi).toBeLessThan(1)
    const final = render(escena, 50)
    for (const n of escena.nodos) expect(final.opacidad[n.id]).toBe(1)
  })
  it('t fuera de rango se acota', () => {
    expect(render(escena, -5)).toEqual(render(escena, 0))
    expect(render(escena, 999)).toEqual(render(escena, 50))
  })
})
```

- [ ] **Step 2: Correr y ver que falla**

Run: `npx vitest run src/lib/ia-autorretrato/__tests__/caminoEscena.test.ts`
Expected: FAIL ("Failed to resolve import '../caminoEscena'")

- [ ] **Step 3: Implementar `src/lib/ia-autorretrato/caminoEscena.ts`**

```ts
import { RAMAS, type AristaCamino, type Camino, type NodoCamino } from './tipos'

/**
 * Mecanismo de Claude Motion: la animación es una función pura del tiempo.
 * `crearEscena` describe la escena una vez; `render(escena, t)` dice qué se ve en el instante t.
 */
export type TipoFase = 'presente' | 'rebobinar' | 'raices' | 'avanzar'
export type Fase = { tipo: TipoFase; inicio: number; fin: number }
export type NodoEscena = NodoCamino & { x: number; y: number; anio: number | null }
export type Escena = { duracion: number; fases: Fase[]; nodos: NodoEscena[]; aristas: AristaCamino[]; anioMin: number; anioMax: number }
export type Cuadro = { fase: TipoFase; anio: number | null; opacidad: Record<string, number>; visibles: string[] }

const PROPORCIONES: [TipoFase, number][] = [['presente', 0.12], ['rebobinar', 0.48], ['raices', 0.12], ['avanzar', 0.28]]
const r3 = (n: number) => Math.round(n * 1000) / 1000
const acotar = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

export function crearEscena(camino: Camino, duracion = 50): Escena {
  const anios = camino.nodos.map(n => (n.primeraEvidencia ? Number(n.primeraEvidencia.slice(0, 4)) : null)).filter((a): a is number => a !== null)
  const anioMin = anios.length ? Math.min(...anios) : 2013
  const anioMax = anios.length ? Math.max(...anios) : 2026

  let inicio = 0
  const fases = PROPORCIONES.map(([tipo, p], i) => {
    const fin = i === PROPORCIONES.length - 1 ? duracion : r3(inicio + p * duracion)
    const fase = { tipo, inicio, fin }
    inicio = fin
    return fase
  })

  const ocupadas = new Map<string, number>()
  const nodos = [...camino.nodos]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(n => {
      const anio = n.evidencia === 'inferido' ? null : n.primeraEvidencia ? Number(n.primeraEvidencia.slice(0, 4)) : n.hoy ? anioMax : null
      const xBase = anio === null ? 0.04 : 0.14 + (0.82 * (anio - anioMin)) / Math.max(anioMax - anioMin, 1)
      const fila = RAMAS.indexOf(n.rama)
      const celda = `${fila}|${anio}`
      const k = ocupadas.get(celda) ?? 0
      ocupadas.set(celda, k + 1)
      const y = (fila + 0.35 + 0.3 * ((k % 3) / 2)) / RAMAS.length
      return { ...n, anio, x: r3(acotar(xBase + 0.012 * Math.floor(k / 3), 0, 1)), y: r3(acotar(y, 0, 1)) }
    })
  return { duracion, fases, nodos, aristas: camino.aristas, anioMin, anioMax }
}

export function render(escena: Escena, tCrudo: number): Cuadro {
  const t = acotar(tCrudo, 0, escena.duracion)
  const fase = escena.fases.find(f => t < f.fin) ?? escena.fases.at(-1)!
  const progreso = fase.fin > fase.inicio ? acotar((t - fase.inicio) / (fase.fin - fase.inicio), 0, 1) : 1
  const { anioMin, anioMax } = escena
  const opacidad: Record<string, number> = {}
  let anio: number | null = null

  for (const n of escena.nodos) {
    let o = 0
    if (fase.tipo === 'presente') {
      o = n.hoy ? progreso : 0
    } else if (fase.tipo === 'rebobinar') {
      anio = anioMax - progreso * (anioMax - anioMin)
      o = n.hoy || (n.anio !== null && n.anio >= Math.floor(anio)) ? 1 : 0
    } else if (fase.tipo === 'raices') {
      anio = anioMin
      o = n.anio === null && !n.hoy ? progreso : 1
    } else {
      anio = anioMin + progreso * (anioMax - anioMin)
      const yaPaso = n.anio === null || n.anio <= anio
      o = progreso >= 1 || yaPaso ? 1 : 0.3
    }
    opacidad[n.id] = r3(o)
  }

  return {
    fase: fase.tipo,
    anio: anio === null ? null : Math.round(anio),
    opacidad,
    visibles: escena.nodos.filter(n => opacidad[n.id] > 0).map(n => n.id),
  }
}
```

- [ ] **Step 4: Correr el test de la escena**

Run: `npx vitest run src/lib/ia-autorretrato/__tests__/caminoEscena.test.ts`
Expected: PASS (9 tests)

- [ ] **Step 5: Test que falla del componente** `src/components/blog/ia-autorretrato/__tests__/CaminoMotion.test.tsx`

```tsx
import { describe, it, expect, vi, afterEach } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { EJEMPLO } from '@/lib/ia-autorretrato/ejemplo'
import CaminoMotion from '../CaminoMotion'

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key, useLocale: () => 'es' }))

const conMovimientoReducido = (reducido: boolean) => {
  window.matchMedia = vi.fn().mockReturnValue({ matches: reducido, addEventListener: vi.fn(), removeEventListener: vi.fn() })
}
afterEach(() => vi.restoreAllMocks())

describe('CaminoMotion', () => {
  it('arranca en t=0 mostrando solo lo de hoy', () => {
    conMovimientoReducido(false)
    const { container } = render(<CaminoMotion datos={EJEMPLO} />)
    expect(container.querySelector('[data-nodo="fastapi"]')!.getAttribute('opacity')).toBe('0')
    expect(container.querySelector('[data-nodo="logica"]')!.getAttribute('opacity')).toBe('0')
  })
  it('arrastrar la línea de tiempo al final muestra todo', () => {
    conMovimientoReducido(false)
    const { container } = render(<CaminoMotion datos={EJEMPLO} />)
    fireEvent.change(screen.getByLabelText('tiempo'), { target: { value: '50' } })
    for (const id of ['logica', 'python', 'fastapi']) expect(container.querySelector(`[data-nodo="${id}"]`)!.getAttribute('opacity')).toBe('1')
  })
  it('con movimiento reducido arranca en el estado final y en pausa', () => {
    conMovimientoReducido(true)
    const { container } = render(<CaminoMotion datos={EJEMPLO} />)
    expect(container.querySelector('[data-nodo="logica"]')!.getAttribute('opacity')).toBe('1')
    expect(screen.getByRole('button', { name: 'play' })).toBeInTheDocument()
  })
  it('tiene descripción accesible y tabla de datos', () => {
    conMovimientoReducido(false)
    render(<CaminoMotion datos={EJEMPLO} />)
    expect(screen.getByRole('img', { name: 'resumen' })).toBeInTheDocument()
    expect(screen.getAllByText('FastAPI').length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 6: Correr y ver que falla**

Run: `npx vitest run src/components/blog/ia-autorretrato/__tests__/CaminoMotion.test.tsx`
Expected: FAIL ("Failed to resolve import '../CaminoMotion'")

- [ ] **Step 7: Implementar `CaminoMotion.tsx`**

```tsx
'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { DATOS } from '@/lib/ia-autorretrato/datos'
import { crearEscena, render } from '@/lib/ia-autorretrato/caminoEscena'
import { RAMAS, type AutorretratoIA } from '@/lib/ia-autorretrato/tipos'
import Figura from './Figura'

const W = 1000
const H = 560

export default function CaminoMotion({ datos = DATOS }: { datos?: AutorretratoIA }) {
  const t = useTranslations('autorretrato.camino')
  const tg = useTranslations('autorretrato')
  const en = useLocale() === 'en'
  const escena = useMemo(() => crearEscena(datos.camino), [datos.camino])
  const [tiempo, setTiempo] = useState(0)
  const [reproduciendo, setReproduciendo] = useState(false)
  const ultimo = useRef<number | null>(null)

  // Movimiento reducido: estado final, sin reproducir.
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) setTiempo(escena.duracion)
    else setReproduciendo(true)
  }, [escena.duracion])

  useEffect(() => {
    if (!reproduciendo || typeof requestAnimationFrame !== 'function') return
    let id = 0
    const paso = (ahora: number) => {
      const dt = ultimo.current === null ? 0 : (ahora - ultimo.current) / 1000
      ultimo.current = ahora
      setTiempo(prev => {
        const siguiente = prev + dt
        if (siguiente >= escena.duracion) { setReproduciendo(false); return escena.duracion }
        return siguiente
      })
      id = requestAnimationFrame(paso)
    }
    id = requestAnimationFrame(paso)
    return () => { cancelAnimationFrame(id); ultimo.current = null }
  }, [reproduciendo, escena.duracion])

  const cuadro = render(escena, tiempo)
  const porId = new Map(escena.nodos.map(n => [n.id, n]))
  const hoy = escena.nodos.filter(n => n.hoy).length
  const nombre = (id: string) => { const n = porId.get(id)!; return en ? n.etiquetaEn : n.etiqueta }

  return (
    <Figura
      id="camino-motion"
      titulo={t('titulo')}
      resumen={t('resumen', { total: escena.nodos.length - hoy, hoy, anio: escena.anioMin })}
      etiquetaDatos={tg('verDatos')}
      tabla={{
        columnas: [t('conocimiento'), t('rama'), t('evidenciaColumna'), t('primeraEvidencia')],
        filas: escena.nodos.map(n => [en ? n.etiquetaEn : n.etiqueta, tg(`ramas.${n.rama}`), t(`evidencia.${n.evidencia}`), n.primeraEvidencia ?? '—']),
      }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" aria-hidden="true">
        {RAMAS.map((r, i) => (
          <text key={r} x={4} y={((i + 0.5) / RAMAS.length) * H} fontSize={11} fill="var(--color-text-muted)">{tg(`ramas.${r}`)}</text>
        ))}
        <text x={W - 8} y={22} textAnchor="end" fontSize={28} fontFamily="var(--font-mono)" fill="var(--color-accent)">
          {cuadro.anio ?? t('raices')}
        </text>
        <text x={W - 8} y={40} textAnchor="end" fontSize={11} fill="var(--color-text-secondary)">{t(`fases.${cuadro.fase}`)}</text>
        {escena.aristas.map(a => {
          const de = porId.get(a.de)
          const ha = porId.get(a.a)
          if (!de || !ha) return null
          const o = Math.min(cuadro.opacidad[a.de] ?? 0, cuadro.opacidad[a.a] ?? 0)
          return <line key={`${a.de}-${a.a}`} x1={de.x * W} y1={de.y * H} x2={ha.x * W} y2={ha.y * H}
            stroke="var(--color-text-muted)" strokeOpacity={0.5 * o} />
        })}
        {escena.nodos.map(n => (
          <g key={n.id} data-nodo={n.id} opacity={cuadro.opacidad[n.id]}>
            <circle cx={n.x * W} cy={n.y * H} r={n.hoy ? 7 : 5}
              fill={n.evidencia === 'github' ? 'var(--color-accent)' : 'var(--color-background)'}
              stroke={n.evidencia === 'inferido' ? 'var(--color-text-muted)' : 'var(--color-accent)'}
              strokeDasharray={n.evidencia === 'inferido' ? '2 2' : undefined} strokeWidth={1.5} />
            <text x={n.x * W + 9} y={n.y * H + 4} fontSize={n.hoy ? 12 : 10}
              fill={n.hoy ? 'var(--color-text)' : 'var(--color-text-secondary)'}>{nombre(n.id)}</text>
          </g>
        ))}
      </svg>
      <div className="flex items-center gap-3 mt-2">
        <button type="button" onClick={() => {
          if (tiempo >= escena.duracion) setTiempo(0)
          setReproduciendo(r => !r)
        }} className="font-mono text-xs border border-border px-2 py-1 text-text-secondary hover:text-accent">
          {reproduciendo ? t('pausa') : t('play')}
        </button>
        <input type="range" min={0} max={escena.duracion} step={0.1} value={tiempo} aria-label={t('tiempo')}
          onChange={e => { setReproduciendo(false); setTiempo(Number(e.target.value)) }} className="flex-1 accent-[var(--color-accent)]" />
      </div>
      <p className="font-mono text-xs text-text-secondary mt-2">
        {(['github', 'declarado', 'inferido'] as const).map(e => (
          <span key={e} className="mr-4">{e === 'github' ? '●' : e === 'declarado' ? '○' : '◌'} {t(`evidencia.${e}`)}</span>
        ))}
      </p>
    </Figura>
  )
}
```

- [ ] **Step 8: Correr los tests**

Run: `npx vitest run src/lib/ia-autorretrato src/components/blog/ia-autorretrato`
Expected: PASS (todos)

- [ ] **Step 9: Implementar `scripts/ia-autorretrato/escena-motion.ts`** (export para claude.ai `/motion`)

```ts
/**
 * Exporta la escena del camino y un prompt listo para pegar en /motion de claude.ai.
 * Salida privada: .ia-autorretrato/escena-motion.json y .ia-autorretrato/prompt-motion.md
 *
 * Uso: npx tsx scripts/ia-autorretrato/escena-motion.ts
 */
import fs from 'node:fs'
import path from 'node:path'
import { DATOS } from '@/lib/ia-autorretrato/datos'
import { crearEscena } from '@/lib/ia-autorretrato/caminoEscena'

const dir = path.join(process.cwd(), '.ia-autorretrato')
fs.mkdirSync(dir, { recursive: true })
const escena = crearEscena(DATOS.camino)
fs.writeFileSync(path.join(dir, 'escena-motion.json'), JSON.stringify(escena, null, 2))

const hoy = escena.nodos.filter(n => n.hoy).map(n => n.etiqueta).join(', ')
const porAnio = new Map<number, string[]>()
for (const n of escena.nodos) if (n.anio !== null && !n.hoy) porAnio.set(n.anio, [...(porAnio.get(n.anio) ?? []), n.etiqueta])
const lineaTiempo = [...porAnio.entries()].sort((a, b) => b[0] - a[0]).map(([a, ns]) => `- ${a}: ${ns.join(', ')}`).join('\n')
const raices = escena.nodos.filter(n => n.anio === null).map(n => n.etiqueta).join(', ')

const prompt = `/motion Crea un explicador animado de ${escena.duracion} segundos llamado "El camino hacia atrás".

Fases:
1. Hoy (0–${escena.fases[0].fin}s): aparecen las tecnologías que uso hoy: ${hoy}.
2. Rebobinar (${escena.fases[1].inicio}–${escena.fases[1].fin}s): un contador de año baja de ${escena.anioMax} a ${escena.anioMin}; en cada año se encienden los conocimientos que aprendí entonces:
${lineaTiempo}
3. Raíces (${escena.fases[2].inicio}–${escena.fases[2].fin}s): aparecen los fundamentos sin fecha (líneas punteadas): ${raices}.
4. De vuelta a hoy (${escena.fases[3].inicio}–${escena.duracion}s): el contador sube de ${escena.anioMin} a ${escena.anioMax} y cada conocimiento se resalta cuando llega su año.

Estilo: fondo oscuro #0f0f0f, acento #00ff88, tipografía monoespaciada para los años. Círculo lleno = evidencia en GitHub; círculo vacío = declarado; punteado = inferido.
Los datos completos (nodos con x, y, año y aristas) están en el JSON adjunto.`
fs.writeFileSync(path.join(dir, 'prompt-motion.md'), prompt)
console.log('✓ .ia-autorretrato/escena-motion.json y prompt-motion.md')
```

Run: `npx tsx scripts/ia-autorretrato/escena-motion.ts`
Expected: `✓ .ia-autorretrato/escena-motion.json y prompt-motion.md`

- [ ] **Step 10: Commit**

```bash
git add src/lib/ia-autorretrato src/components/blog/ia-autorretrato scripts/ia-autorretrato/escena-motion.ts
git commit -m "feat(autorretrato): animación Rebobinar (mecanismo Motion) y export para /motion"
```

---

### Task 16: Registrar los componentes en el MDX

**Files:**
- Modify: `src/components/MDXContent.tsx`
- Test: `src/components/__tests__/MDXContent.test.tsx`

**Interfaces:**
- Consumes: los 10 componentes de Tasks 12–15
- Produces: `export const components` en `MDXContent.tsx` con las claves `Step`, `h1`, `CalendarioActividad`, `BarrasHerramientas`, `CoautoriaMensual`, `MatrizEcosistema`, `CuadranteConceptos`, `PerfilPrompts`, `RedCoautoria`, `MapaDiscurso`, `CaminoMotion`

- [ ] **Step 1: Test que falla** `src/components/__tests__/MDXContent.test.tsx`

```tsx
import { describe, it, expect, vi } from 'vitest'

vi.mock('next-mdx-remote/rsc', () => ({ MDXRemote: () => null }))
vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key, useLocale: () => 'es' }))

import { components } from '../MDXContent'

describe('MDXContent', () => {
  it('registra los componentes del autorretrato', () => {
    for (const nombre of ['CalendarioActividad', 'BarrasHerramientas', 'CoautoriaMensual', 'MatrizEcosistema', 'CuadranteConceptos', 'PerfilPrompts', 'RedCoautoria', 'MapaDiscurso', 'CaminoMotion']) {
      expect(components).toHaveProperty(nombre)
    }
    expect(components).toHaveProperty('Step')
  })
})
```

- [ ] **Step 2: Correr y ver que falla**

Run: `npx vitest run src/components/__tests__/MDXContent.test.tsx`
Expected: FAIL (`components` no se exporta)

- [ ] **Step 3: Modificar `src/components/MDXContent.tsx`**

Agrega los imports bajo los existentes:

```tsx
import BarrasHerramientas from './blog/ia-autorretrato/BarrasHerramientas'
import CalendarioActividad from './blog/ia-autorretrato/CalendarioActividad'
import CaminoMotion from './blog/ia-autorretrato/CaminoMotion'
import CoautoriaMensual from './blog/ia-autorretrato/CoautoriaMensual'
import CuadranteConceptos from './blog/ia-autorretrato/CuadranteConceptos'
import MapaDiscurso from './blog/ia-autorretrato/MapaDiscurso'
import MatrizEcosistema from './blog/ia-autorretrato/MatrizEcosistema'
import PerfilPrompts from './blog/ia-autorretrato/PerfilPrompts'
import RedCoautoria from './blog/ia-autorretrato/RedCoautoria'
```

Y reemplaza el bloque `const components = { Step, h1: () => null, }` por:

```tsx
// h1 is already rendered by the lesson page — suppress duplicates from MDX source
export const components = {
  Step,
  h1: () => null,
  // Autorretrato con IA
  CalendarioActividad,
  BarrasHerramientas,
  CoautoriaMensual,
  MatrizEcosistema,
  CuadranteConceptos,
  PerfilPrompts,
  RedCoautoria,
  MapaDiscurso,
  CaminoMotion,
}
```

(Quita la línea de comentario duplicada que estaba encima del `const` original.)

- [ ] **Step 4: Correr tests y build**

Run: `npx vitest run && npm run build`
Expected: tests PASS; build sin errores

- [ ] **Step 5: Commit**

```bash
git add src/components/MDXContent.tsx src/components/__tests__/MDXContent.test.tsx
git commit -m "feat(autorretrato): registrar los gráficos en el MDX del blog"
```

---

### Task 17: El post (español, luego inglés)

**Files:**
- Create: `content/blog/es/YYYY-MM-DD-autorretrato-ia.mdx`, `content/blog/en/YYYY-MM-DD-autorretrato-ia.mdx` (fecha = día de publicación; mismo nombre en ambos idiomas)
- Create: `scripts/ia-autorretrato/verificar-mdx.ts`

**Interfaces:**
- Consumes: componentes (Task 16), `data/ia-autorretrato.json` revisado (Task 11), `contexto.json`, `.ia-autorretrato/citas-aprobadas.md`

- [ ] **Step 1: Escribir `content/blog/es/YYYY-MM-DD-autorretrato-ia.mdx` con esta estructura exacta**

```mdx
---
title: "Autorretrato con IA: lo que mis datos dicen de cómo aprendo, escribo y programo"
date: "YYYY-MM-DD"
description: "Analicé 18 años de commits, miles de prompts y el debate público sobre IA y autoría para entender qué hago yo, qué hace la IA y qué tuve que aprender para llegar aquí."
tags: ["ia", "datos", "claude", "aprendizaje", "autoria"]
---

{/* Intro: 2 párrafos. Por qué hice esto (las tres funciones de §1 de la spec). Declarar desde el inicio que este post también es coautoría. */}

## El contexto

{/* 3–4 párrafos con 6–8 cifras de data.contexto, cada una con su enlace [fuente](url). Mapa de posturas. Cierre: no hay datos verificables de Latinoamérica. */}

<MapaDiscurso />

## La línea de tiempo

<CalendarioActividad />

## Dónde pongo la IA

{/* Párrafo con promptsPorDominio: dominio con más prompts y repos públicos por nombre. Sin nombrar repos privados. */}

## Cómo trabajo con ella

<BarrasHerramientas />

## Dos eras

{/* eras[0] vs eras[1]: commits propios, años, mediana del mensaje (con y sin trailer), personas vs modelos. Relevo de modelos por mes. Claude como autor principal. Advertencias obligatorias de §3.4 de la spec. */}

<CoautoriaMensual />

<RedCoautoria />

## El ecosistema

<MatrizEcosistema />

## Domino vs. no domino

{/* Cómo se clasificó (léxico, revisado a mano: K de N conceptos corregidos). Tres ejemplos por cuadrante. Qué significa un concepto que solo pregunto. */}

<CuadranteConceptos />

## El camino hacia atrás

{/* Las dos lecturas de §3.7 de la spec: los agentes dependen de docencia y diseño experimental; lo que más delego (docs) ya lo dominaba (LaTeX 2014). Mencionar el dashboard solo si Sergio decidió compartirlo (Task 18). */}

<CaminoMotion />

## Cómo hablo con la IA

<PerfilPrompts />

{/* 5–8 citas aprobadas (.ia-autorretrato/citas-aprobadas.md), cada una como blockquote, sin proyecto ni fecha exacta (solo el mes). */}

## Tensiones

{/* Las cinco preguntas de §3.9 de la spec, una por párrafo corto, cruzando una cifra externa con una propia. */}

## Hazlo tú

{/* Pasos: clonar, `npx tsx scripts/ia-autorretrato/index.ts`, qué lee y qué no publica; cambiar las cuentas en `index.ts`. CTA suave a /es/cursos y /es/experiencias-ia. */}
```

Reglas para escribir el texto que reemplaza cada comentario `{/* … */}`:
- Toda cifra sale de `data/ia-autorretrato.json` o de `contexto.json`. Si no está ahí, no se escribe.
- Primera persona, tono de bitácora (como `2026-05-09-mas-alla-del-codigo.mdx`), párrafos cortos.
- Ningún nombre de repo privado, cliente, empleador ni persona. Los coautores antiguos son "compañeros" o "un socio".
- Las cifras de Google, Microsoft y Anthropic se presentan como autodeclaradas y no comparables.
- Al terminar, borra todos los comentarios `{/* … */}`.

- [ ] **Step 2: Crear `scripts/ia-autorretrato/verificar-mdx.ts`**

```ts
/**
 * Verifica que el MDX del post no filtre repos privados, personas, correos ni rutas.
 * Uso: npx tsx scripts/ia-autorretrato/verificar-mdx.ts content/blog/es/<archivo>.mdx [content/blog/en/<archivo>.mdx]
 */
import fs from 'node:fs'
import path from 'node:path'
import type { DescargaCuenta } from './github'
import { esBot, esSergio, PERMITIDOS } from './identidades'
import { verificarPrivacidad } from './privacidad'

const cache = path.join(process.cwd(), '.ia-autorretrato/cache')
const descargas: DescargaCuenta[] = ['smonsalve', 'serandmoncas'].map(c => JSON.parse(fs.readFileSync(path.join(cache, `github-${c}.json`), 'utf8')))
const reposPrivados = [...new Set(descargas.flatMap(d => d.repos.filter(r => r.privado).map(r => r.nombre)))]
const personas = [...new Set(descargas.flatMap(d => d.commits.map(c => c.autor)).filter(a => !esSergio(a) && !esBot(a) && a.trim() !== 'Claude'))]

let fallo = false
for (const archivo of process.argv.slice(2)) {
  const problemas = verificarPrivacidad(fs.readFileSync(archivo, 'utf8'), { prompts: [], reposPrivados, personas, permitidos: PERMITIDOS })
  if (problemas.length) { fallo = true; console.error(`✗ ${archivo}\n${problemas.map(p => `  - ${p}`).join('\n')}`) }
  else console.log(`✓ ${archivo}`)
}
process.exit(fallo ? 1 : 0)
```

Run: `npx tsx scripts/ia-autorretrato/verificar-mdx.ts content/blog/es/*-autorretrato-ia.mdx`
Expected: `✓ content/blog/es/…-autorretrato-ia.mdx`

- [ ] **Step 3: Revisión de Sergio del texto en español.** Muéstrale el borrador completo y aplica sus cambios. No sigas sin su aprobación.

- [ ] **Step 4: Traducir a `content/blog/en/YYYY-MM-DD-autorretrato-ia.mdx`** (mismo nombre de archivo y mismos componentes; adapta el texto, no lo traduzcas palabra por palabra)

```mdx
---
title: "A self-portrait with AI: what my data says about how I learn, write and code"
date: "YYYY-MM-DD"
description: "I analyzed 18 years of commits, thousands of prompts and the public debate on AI and authorship to understand what I do, what the AI does, and what I had to learn to get here."
tags: ["ai", "data", "claude", "learning", "authorship"]
---
```

Usa las mismas secciones en inglés (The context, The timeline, Where I put AI, How I work with it, Two eras, The ecosystem, What I master vs. what I don't, The path backwards, How I talk to AI, Tensions, Do it yourself). Las citas se traducen y se marca "(translated from Spanish)". El CTA apunta a `/en/cursos` y `/en/experiencias-ia`.

Run: `npx tsx scripts/ia-autorretrato/verificar-mdx.ts content/blog/es/*-autorretrato-ia.mdx content/blog/en/*-autorretrato-ia.mdx`
Expected: dos líneas `✓`

- [ ] **Step 5: Revisión en el navegador**

Run: `npm run dev` y abre `http://localhost:3000/es/blog/YYYY-MM-DD-autorretrato-ia` y `/en/blog/…`
Comprueba: los 9 gráficos y la animación cargan; a 360 px de ancho no hay scroll horizontal; con el skin crema (`data-skin="crema"`) los colores se leen; la animación arranca, se pausa y se arrastra; con "reducir movimiento" activado aparece en el estado final.

- [ ] **Step 6: Commit**

```bash
git add content/blog scripts/ia-autorretrato/verificar-mdx.ts
git commit -m "feat(blog): post Autorretrato con IA (es/en)"
```

---

### Task 18: Claude Dashboard del camino

**Files:**
- Create: `scripts/ia-autorretrato/dashboard.ts`
- Generate (privado): `.ia-autorretrato/dashboard/camino-nodos.json`, `.ia-autorretrato/dashboard/camino-aristas.json`
- External: un Artifact nuevo del tipo Dashboard en claude.ai (privado)

**Interfaces:**
- Consumes: `data/ia-autorretrato.json` (solo campo `camino`), `ancestros` (Task 9)
- Produces: URL del dashboard (se le entrega a Sergio)

- [ ] **Step 1: Crear `scripts/ia-autorretrato/dashboard.ts`**

```ts
/**
 * Datasets del Claude Dashboard del camino. Solo salen del JSON ya publicado.
 * Uso: npx tsx scripts/ia-autorretrato/dashboard.ts
 */
import fs from 'node:fs'
import path from 'node:path'
import { DATOS } from '@/lib/ia-autorretrato/datos'

const dir = path.join(process.cwd(), '.ia-autorretrato/dashboard')
fs.mkdirSync(dir, { recursive: true })
const nodos = DATOS.camino.nodos.map(n => ({
  id: n.id,
  etiqueta: n.etiqueta,
  rama: n.rama,
  evidencia: n.evidencia,
  primeraEvidencia: n.primeraEvidencia ?? '',
  hoy: Boolean(n.hoy),
  fuente: n.repos?.length ? `GitHub: ${n.repos.join(', ')}` : n.declaradoEn ?? 'inferido',
}))
fs.writeFileSync(path.join(dir, 'camino-nodos.json'), JSON.stringify(nodos, null, 2))
fs.writeFileSync(path.join(dir, 'camino-aristas.json'), JSON.stringify(DATOS.camino.aristas, null, 2))
console.log(`✓ ${nodos.length} nodos, ${DATOS.camino.aristas.length} aristas en .ia-autorretrato/dashboard/`)
```

Run: `npx tsx scripts/ia-autorretrato/dashboard.ts`
Expected: `✓ N nodos, M aristas en .ia-autorretrato/dashboard/`

- [ ] **Step 2: Crear el dashboard.** Llama a la herramienta Artifact con `type_url: "https://claude.ai/artifact/GZLZthZ2sQjn7T16skfdeF"`, `title: "El camino hacia atrás"` y `auto_open: "after_first_write"`. Guarda la `url` del resultado y **sigue las instrucciones del tipo que devuelve la creación**: mandan sobre este plan si difieren.

- [ ] **Step 3: Subir los datasets.** Por cada archivo, llama a Artifact con `url` = la del dashboard, `asset: true` y `file_path` igual a `.ia-autorretrato/dashboard/camino-nodos.json` (primero) y luego `camino-aristas.json`, una llamada por archivo. Guarda la `url` (`/_blob/…`) de cada resultado.

- [ ] **Step 4: Escribir el store.** Carga `ArtifactData` con ToolSearch (`select:ArtifactData`) y haz un `batch` con estos documentos. Reemplaza `<URL_NODOS>`, `<URL_ARISTAS>` y `<AHORA>` (ISO).

`dash/meta`:
```json
{ "title": "El camino hacia atrás" }
```

`datasets/camino-nodos`:
```json
{ "title": "Conocimientos del camino", "description": "Cada conocimiento detrás del stack de 2026 de Sergio, con su rama, tipo de evidencia y primera fecha con evidencia. Archivo exportado del post Autorretrato con IA.", "source": { "kind": "file", "url": "<URL_NODOS>", "name": "camino-nodos.json" }, "updated": { "at": "<AHORA>", "by": "Claude" } }
```

`datasets/camino-aristas`:
```json
{ "title": "Dependencias entre conocimientos", "description": "Pares prerrequisito → conocimiento que depende de él. Archivo exportado del post Autorretrato con IA.", "source": { "kind": "file", "url": "<URL_ARISTAS>", "name": "camino-aristas.json" }, "updated": { "at": "<AHORA>", "by": "Claude" } }
```

`files/index.html` → `{ "text": <el HTML de abajo> }`:

```html
<style>
  .cm-head { display: flex; flex-wrap: wrap; gap: 12px; align-items: baseline; justify-content: space-between; }
  .cm-head h2 { font-family: var(--font-anthropic-serif); margin: 0; }
  .cm-kpis { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin: 16px 0; }
  .cm-kpi { border: 1px solid var(--color-border-line); border-radius: 8px; padding: 12px; }
  .cm-kpi .n { font-family: var(--font-anthropic-serif); font-size: 32px; color: var(--color-fg); }
  .cm-kpi .l { color: var(--color-fg-muted); font-size: 13px; }
  .cm-grafo { width: 100%; }
  .cm-tabla { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 12px; }
  .cm-tabla th, .cm-tabla td { text-align: left; padding: 6px 8px; border-bottom: 1px solid var(--color-border-line); }
  .cm-tabla th { color: var(--color-fg-muted); font-weight: 500; }
  .cm-tip { position: absolute; pointer-events: none; background: var(--color-panel); border: 1px solid var(--color-border-line); border-radius: 6px; padding: 4px 8px; font-size: 12px; display: none; }
</style>
<div class="cm" style="position: relative; font-family: var(--font-anthropic-sans);">
  <div class="cm-head">
    <h2 id="titulo">El camino hacia atrás</h2>
    <label>Tecnología de hoy <select id="sel-hoy"></select></label>
  </div>
  <div class="cm-kpis" id="kpis">
    <div class="cm-kpi"><div class="n" data-source="conteo-evidencia" data-field="n" data-where="evidencia=github">—</div><div class="l">con evidencia en GitHub</div></div>
    <div class="cm-kpi"><div class="n" data-source="conteo-evidencia" data-field="n" data-where="evidencia=declarado">—</div><div class="l">declarados</div></div>
    <div class="cm-kpi"><div class="n" data-source="conteo-evidencia" data-field="n" data-where="evidencia=inferido">—</div><div class="l">inferidos (fundamentos)</div></div>
  </div>
  <div id="grafo" class="cm-grafo" data-source="camino-nodos camino-aristas"></div>
  <div class="cm-tip" id="tip"></div>
  <table class="cm-tabla" id="tabla" data-source="camino-nodos" data-row-key="id">
    <thead><tr>
      <th data-field="etiqueta">Conocimiento</th>
      <th data-field="rama">Rama</th>
      <th data-field="evidencia">Evidencia</th>
      <th data-field="primeraEvidencia">Primera evidencia</th>
      <th data-field="fuente">Fuente</th>
    </tr></thead>
    <tbody></tbody>
  </table>
</div>
<script>
  dash.calc('conteo-evidencia', {
    inputs: ['camino-nodos'],
    title: 'Conocimientos por evidencia',
    description: 'Cuenta los conocimientos del camino por tipo de evidencia.',
    fn: (nodos) => ['github', 'declarado', 'inferido'].map(e => ({ evidencia: e, n: nodos.filter(x => x.evidencia === e).length })),
  })

  const RAMAS = ['fundamentos', 'backend', 'web', 'datos-ml', 'iot', 'infra', 'agentes', 'educacion', 'escritura']
  let seleccion = null

  function ancestros(id, aristas) {
    const vistos = new Set(), pila = [id]
    while (pila.length) { const a = pila.pop(); for (const e of aristas) if (e.a === a && !vistos.has(e.de)) { vistos.add(e.de); pila.push(e.de) } }
    return vistos
  }

  function dibujar() {
    const n = dash.data('camino-nodos'), a = dash.data('camino-aristas'), c = dash.data('conteo-evidencia')
    for (const e of ['github', 'declarado', 'inferido']) {
      const el = document.querySelector(`[data-where="evidencia=${e}"]`)
      const fila = c.status === 'ok' ? c.data.find(x => x.evidencia === e) : null
      el.textContent = fila ? String(fila.n) : '—'
    }
    const cont = document.getElementById('grafo')
    const cuerpo = document.querySelector('#tabla tbody')
    if (n.status !== 'ok' || a.status !== 'ok') { cont.textContent = '—'; cuerpo.textContent = ''; return }

    const nodos = n.data.map(x => ({ ...x, hoy: x.hoy === true || x.hoy === 'true' }))
    const aristas = a.data
    const sel = document.getElementById('sel-hoy')
    const hoy = nodos.filter(x => x.hoy).sort((p, q) => p.etiqueta.localeCompare(q.etiqueta))
    if (!seleccion) seleccion = hoy[0]?.id
    if (sel.options.length !== hoy.length) {
      sel.textContent = ''
      for (const h of hoy) { const o = document.createElement('option'); o.value = h.id; o.textContent = h.etiqueta; sel.appendChild(o) }
      sel.onchange = () => { seleccion = sel.value; dibujar() }
    }
    sel.value = seleccion
    const camino = ancestros(seleccion, aristas); camino.add(seleccion)

    const anios = nodos.map(x => Number(String(x.primeraEvidencia).slice(0, 4))).filter(Boolean)
    const min = Math.min(...anios), max = Math.max(...anios)
    const W = Math.max(cont.clientWidth, 320), H = 420
    const x = d => { const y = Number(String(d.primeraEvidencia).slice(0, 4)); return y ? 70 + (W - 160) * (y - min) / Math.max(max - min, 1) : 30 }
    const y = d => 20 + (H - 40) * (RAMAS.indexOf(d.rama) + 0.5) / RAMAS.length
    const pos = new Map(), ocup = new Map()
    for (const d of nodos) { const k = `${d.rama}|${d.primeraEvidencia}`; const i = ocup.get(k) || 0; ocup.set(k, i + 1); pos.set(d.id, [x(d) + 8 * i, y(d) + 10 * (i % 3) - 10]) }

    cont.textContent = ''
    const svg = d3.select(cont).append('svg').attr('width', '100%').attr('viewBox', `0 0 ${W} ${H}`)
    svg.selectAll('text.rama').data(RAMAS).join('text').attr('x', 2).attr('y', r => 20 + (H - 40) * (RAMAS.indexOf(r) + 0.5) / RAMAS.length)
      .attr('font-size', 10).attr('fill', 'var(--color-fg-muted)').text(r => r)
    svg.selectAll('line').data(aristas).join('line')
      .attr('x1', e => pos.get(e.de)?.[0]).attr('y1', e => pos.get(e.de)?.[1]).attr('x2', e => pos.get(e.a)?.[0]).attr('y2', e => pos.get(e.a)?.[1])
      .attr('stroke', e => camino.has(e.de) && camino.has(e.a) ? dash.colors[0] : 'var(--color-border-line)')
      .attr('stroke-width', e => camino.has(e.de) && camino.has(e.a) ? 1.5 : 0.6)
    const tip = document.getElementById('tip')
    svg.selectAll('circle').data(nodos).join('circle')
      .attr('cx', d => pos.get(d.id)[0]).attr('cy', d => pos.get(d.id)[1]).attr('r', d => d.hoy ? 6 : 4)
      .attr('fill', d => camino.has(d.id) && d.evidencia === 'github' ? dash.colors[0] : 'var(--color-bg)')
      .attr('stroke', d => camino.has(d.id) ? dash.colors[0] : 'var(--color-border-line)')
      .attr('stroke-dasharray', d => d.evidencia === 'inferido' ? '2 2' : null)
      .on('mousemove', (ev, d) => { const r = cont.parentElement.getBoundingClientRect(); tip.style.display = 'block'; tip.style.left = Math.min(ev.clientX - r.left + 10, r.width - 200) + 'px'; tip.style.top = (ev.clientY - r.top + 10) + 'px'; tip.textContent = `${d.etiqueta} · ${d.primeraEvidencia || 'sin fecha'}` })
      .on('mouseleave', () => { tip.style.display = 'none' })
      .on('click', (ev, d) => { if (d.hoy) { seleccion = d.id; dibujar() } })

    cuerpo.textContent = ''
    const filas = nodos.filter(d => camino.has(d.id)).sort((p, q) => String(p.primeraEvidencia || '0').localeCompare(String(q.primeraEvidencia || '0')))
    for (const d of filas) {
      const tr = document.createElement('tr'); tr.setAttribute('data-key', d.id)
      for (const v of [d.etiqueta, d.rama, d.evidencia, d.primeraEvidencia || '—', d.fuente]) { const td = document.createElement('td'); td.textContent = v; tr.appendChild(td) }
      cuerpo.appendChild(tr)
    }
  }

  dash.onData(dibujar)
</script>
```

- [ ] **Step 5: Entregar.** Dile a Sergio en una o dos frases qué muestra el dashboard, que nació privado y que los archivos adjuntos los puede leer cualquiera que lo abra (solo contienen datos ya públicos en el post). Pregúntale si quiere compartirlo y enlazarlo desde el post; si dice que sí, agrega el enlace en la sección "El camino hacia atrás" de ambos MDX y vuelve a correr `verificar-mdx.ts`. No renderices ni hagas capturas del dashboard (regla del tipo).

- [ ] **Step 6: Commit**

```bash
git add scripts/ia-autorretrato/dashboard.ts content/blog
git commit -m "feat(autorretrato): export de datasets y enlace al Claude Dashboard del camino"
```

---

### Task 19: Verificación final y PR

**Files:**
- Create: `scripts/ia-autorretrato/verificar-urls.ts`

- [ ] **Step 1: Crear `scripts/ia-autorretrato/verificar-urls.ts`**

```ts
/**
 * Comprueba que las URLs de contexto.json siguen vivas antes de publicar.
 * 403 se reporta como aviso (sitios que bloquean bots); 404/410/5xx fallan.
 * Uso: npx tsx scripts/ia-autorretrato/verificar-urls.ts
 */
import CONTEXTO from './contexto.json'

async function estado(url: string): Promise<number> {
  const cabeza = await fetch(url, { method: 'HEAD', redirect: 'follow' }).catch(() => null)
  if (cabeza && cabeza.status < 400) return cabeza.status
  const cuerpo = await fetch(url, { redirect: 'follow' }).catch(() => null)
  return cuerpo?.status ?? 0
}

async function main() {
  let fallo = false
  for (const d of CONTEXTO.datos) {
    const s = await estado(d.url)
    const marca = s >= 200 && s < 400 ? '✓' : s === 403 ? '⚠' : '✗'
    if (marca === '✗') fallo = true
    console.log(`${marca} ${s} ${d.fuente} — ${d.url}`)
  }
  process.exit(fallo ? 1 : 0)
}

main()
```

Run: `npx tsx scripts/ia-autorretrato/verificar-urls.ts`
Expected: todas `✓` (o `⚠ 403`). Si alguna da `✗`, busca la fuente actualizada, corrige `contexto.json` y el anexo, vuelve a correr `index.ts` y también esta verificación.

- [ ] **Step 2: Verificación completa**

Run:
```bash
npx vitest run && npm run lint && npm run build \
&& test -f .ia-autorretrato/camino-revision.csv \
&& npx tsx scripts/ia-autorretrato/verificar-mdx.ts content/blog/es/*-autorretrato-ia.mdx content/blog/en/*-autorretrato-ia.mdx \
&& git ls-files | grep -c '^\.ia-autorretrato/' ; echo "archivos privados en git (debe ser 0) ↑"
```
Expected: tests, lint y build pasan; las dos líneas `✓` del MDX; `0` archivos privados en git.

- [ ] **Step 3: Commit**

```bash
git add scripts/ia-autorretrato/verificar-urls.ts scripts/ia-autorretrato/contexto.json docs/superpowers/specs/anexos/autorretrato-ia data/ia-autorretrato.json
git commit -m "chore(autorretrato): verificación de URLs del contexto"
```

- [ ] **Step 4: PR (confirma con Sergio antes de hacer push)**

```bash
git remote -v
git push -u origin feat/post-autorretrato-ia
gh pr create --title "Post: Autorretrato con IA" --body "$(cat <<'EOF'
Post bilingüe con el análisis de mi uso de IA: Claude Code, dos cuentas de GitHub (2013–2026), conceptos del glosario, contexto público verificado y el camino de aprendizaje hacia atrás.

- Pipeline: `npx tsx scripts/ia-autorretrato/index.ts` → `data/ia-autorretrato.json` (solo agregados, filtro de privacidad)
- 9 gráficos SVG + animación "Rebobinar" (mecanismo de Claude Motion)
- Claude Dashboard del camino (privado; enlazado solo si se decide compartir)
- Spec: docs/superpowers/specs/2026-10-15-autorretrato-ia-design.md

Capturas: (pegar /es y /en a 360 px y escritorio, skin oscuro y crema)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Expected: URL del PR. El merge a `main` (que despliega a producción) lo decide Sergio.
