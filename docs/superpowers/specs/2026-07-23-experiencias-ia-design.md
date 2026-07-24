# Sección "Experiencias IA" — Design Spec

**Fecha:** 2026-07-23
**Solicitante:** Sergio Monsalve
**Fuente:** `handoff-claude-design-experiencias-ia.md` (brief de diseño ya completo, ver anexo) + `data.js` (contenido real: 8 sesiones, cronograma, backlog, 18 participantes) + `experiencias-ia-sitio.html` (prototipo funcional de referencia)

## 1. Contexto y propósito

"Experiencias IA" es un grupo de estudio semanal (miércoles, 7:30–8:30 p.m., Medellín/remoto) activo desde el 4 de junio de 2026, con 8 sesiones realizadas y 18 integrantes. Esta sección es la **bitácora pública del grupo** dentro del sitio personal de Sergio: registro de sesiones, coordinación de pendientes/cronograma/backlog, y presentación ("quiénes somos") a visitantes nuevos.

Audiencia primaria: los 18 integrantes, consultando principalmente desde móvil vía enlaces compartidos en WhatsApp. Audiencia secundaria: visitantes del sitio personal.

El brief de diseño original (`docs/superpowers/specs/anexos/experiencias-ia/handoff.md`) ya resuelve contenido, arquitectura de información, identidad visual, reglas de tono y criterios de aceptación. Este documento se enfoca en **cómo se integra esa especificación en el sitio Next.js existente** — el brief original no conocía los internos de este repo.

**Regla estricta, heredada del brief:** no inventar contenido. Ningún nombre, fecha, cita, referencia o URL que no esté en `data.js`. Si un dato falta (p. ej. URLs de referencias de la Sesión 7, vacías en la fuente), se muestra como texto plano sin enlace — nunca se fabrica un link.

## 2. Arquitectura de integración

El layout actual `src/app/[locale]/layout.tsx` envuelve **todo** lo que vive bajo `/[locale]/` con `<Nav/>` (oscuro, neón) y `<Footer/>` incondicionalmente. "Experiencias IA" necesita una identidad visual completamente distinta ("cuaderno del ingeniero": papel/tinta/cuero) sin ese chrome.

La solución idiomática en Next.js App Router — sin depender de detectar la ruta en tiempo de ejecución — es un **route group**:

```
src/app/[locale]/
  layout.tsx                    ← se reduce a: <html>/<body>, NextIntlClientProvider,
                                    SiteThemeWrapper, fonts (Inter, JetBrains Mono),
                                    Analytics/SpeedInsights. Ya NO renderiza Nav/Footer.
  (main)/                        ← route group NUEVO — invisible en la URL
    layout.tsx                   ← <Nav/> + <main>{children}</main> + <Footer/>
                                    (contenido que hoy vive en layout.tsx)
    page.tsx                     ← home — movido tal cual (git mv)
    about/, blog/, contact/, cursos/, recipes/, portfolio/,
    admin/, biblioteca/, guestbook/                        ← movidos tal cual (git mv)
  experiencias-ia/               ← NUEVO, hermano de (main), fuera de su chrome
    layout.tsx                   ← ExperienciasNav propia, fonts Bricolage/Newsreader,
                                    CSS scoped "cuaderno del ingeniero"
    page.tsx                     ← Inicio
    sesiones/page.tsx            ← índice
    sesiones/[n]/page.tsx        ← detalle de sesión
    cronograma/page.tsx
    backlog/page.tsx
    quienes-somos/page.tsx
```

Los route groups (`(main)`) no aparecen en la URL: `/es/blog` sigue siendo `/es/blog`. Es un `git mv` mecánico de las carpetas de rutas existentes — su contenido interno no cambia. Es el único cambio que toca el resto del sitio; todo lo demás de esta sección vive aislado en `experiencias-ia/`.

**Locale:** vive bajo `/[locale]/experiencias-ia` (no una ruta independiente fuera de `[locale]`). El contenido es solo en español — no hay traducción para `/en/experiencias-ia`, se sirve el mismo contenido en español ahí también. Mantiene consistencia con el resto del sitio y evita excepciones en `proxy.ts`.

**Punto de entrada:** ítem "Experiencias IA" agregado a `src/components/Nav.tsx` (junto a Blog, Portfolio, Cursos), con claves nuevas en `src/messages/es.json`/`en.json`.

## 3. Modelo de datos

`src/lib/experiencias-ia/data.ts` — traducción tipada de `data.js`, contenido copiado literalmente (no reescrito, no resumido):

```ts
export type EstadoPendiente = 'abierto' | 'cerrado'
export type Pendiente = { quien: string; que: string; estado: EstadoPendiente }
export type Referencia = { titulo: string; nota: string; url: string } // url: "" → sin link
export type Concepto = { t: string; d: string }
export type EstadoSesion = 'cerrada' | 'proxima' | 'planeada'

export type Sesion = {
  n: number
  fecha: string
  fechaLarga: string
  titulo: string
  estado: EstadoSesion
  encargado: string
  destacada?: boolean
  resumenCorto: string
  resumen: string[]
  temas: string[]
  conceptos?: Concepto[]
  decisiones: string[]
  pendientes: Pendiente[]
  referencias: Referencia[]
  nuevos?: string[]
}

export type SesionCronograma = {
  n: number
  fecha: string
  titulo: string
  encargados: string[]
  estado: 'confirmada' | 'propuesta'
  contenido: string[]
}

export type Prioridad = 'alta' | 'media' | 'baja'
export type BacklogItem = { titulo: string; proponente: string; prioridad: Prioridad; nota: string }

export type Participante = {
  nombre: string
  rol: string
  campo: string
  bio: string
  desde: number
  tags: string[]
}

export type Principio = { titulo: string; texto: string }
export type Grupo = {
  nombre: string
  lema: string
  cadencia: string
  lugar: string
  desde: string
  descripcion: string
  principios: Principio[]
}

export const GRUPO: Grupo = { /* copiado de data.js */ }
export const SESIONES: Sesion[] = [ /* las 8 sesiones, copiadas de data.js */ ]
export const CRONOGRAMA: SesionCronograma[] = [ /* sesiones 9–12 */ ]
export const BACKLOG: BacklogItem[] = [ /* los 12 temas */ ]
export const PARTICIPANTES: Participante[] = [ /* los 18 integrantes */ ]

// Derivadas — cumplen el requisito funcional de que nada se mantenga a mano dos veces
export function getSesion(n: number): Sesion | undefined
export function getAdjacentSesiones(n: number): { anterior?: Sesion; siguiente?: Sesion }
export function getUltimasSesiones(count: number): Sesion[]
export function getPendientesAbiertos(): Array<Pendiente & { sesionN: number; sesionTitulo: string }>
export function getMetricas(): {
  totalSesiones: number
  totalIntegrantes: number
  pendientesAbiertos: number
  temasBacklog: number
}
```

Agregar la Sesión 9 en el futuro (cuando pase de `CRONOGRAMA` a `SESIONES`) es mover/agregar un objeto — ningún componente ni estilo cambia.

## 4. Páginas y componentes

**Rutas** (Server Components salvo donde se indica):

| Ruta | Contenido | Notas |
|---|---|---|
| `experiencias-ia/page.tsx` | Hero + lema + diagrama de 3 capas (harness, elemento de firma), métricas (`getMetricas()`), 4 principios, últimas 3 sesiones | |
| `experiencias-ia/sesiones/page.tsx` | Índice de 8 sesiones en orden inverso (8→1) | Filas clickeables → detalle |
| `experiencias-ia/sesiones/[n]/page.tsx` | Resumen, conceptos (si hay), decisiones, pendientes con badge abierto/cerrado, temas, nuevos integrantes, referencias, nav anterior/siguiente | `generateStaticParams` para n 1–8; `generateMetadata` con título de la sesión (mejora el preview al compartir en WhatsApp) |
| `experiencias-ia/cronograma/page.tsx` | Sesiones 9–12 (confirmada/propuesta, encargados) + panel consolidado de pendientes abiertos con su sesión de origen | Panel = `getPendientesAbiertos()`, no lista manual |
| `experiencias-ia/backlog/page.tsx` | 12 temas + filtro por prioridad (todas/alta/media/baja) | Filtro es el único client component interactivo de peso |
| `experiencias-ia/quienes-somos/page.tsx` | 18 fichas de participantes + bloque "Cómo funciona" (4 reglas de operación) | |

**Componentes** en `src/components/experiencias-ia/`: `ExperienciasNav`, `PendienteBadge` (abierto = acento cuero; cerrado = tachado + verde silla, visible pero distinguible), `MetricaTile`, `PrincipioCard`, `CapasHarness` (diagrama de firma prompt/context/harness), `BacklogFilter` (`'use client'`), `ParticipanteCard`, `ReferenciaItem` (renderiza texto plano si `url === ""`, nunca un `<a href="">` vacío o fabricado).

## 5. Sistema visual

Se implementa tal cual la sección 4 del brief original — este spec no reinterpreta paleta ni tipografía:

- **Paleta**: tinta `#141b1f`, tinta secundaria `#3d4a52`, papel `#e9e5db`, papel sombreado `#dfd9cc`, cuero `#8a4b2a` (acento), latón `#b08d3f` (propuesta/prioridad media), verde silla `#3f6b4e` (cerrado/confirmada).
- **Tipografía**: Bricolage Grotesque (display, pesos 600/800), Newsreader (cuerpo/prosa), JetBrains Mono (eyebrows/metadatos — ya cargada globalmente en el sitio, se reutiliza la misma instancia vía `next/font`).
- **Fondo**: retícula de papel cuadriculado (líneas ~34px, opacidad muy baja), sin sombras difusas ni esquinas redondeadas, sin degradados salvo el de la tercera capa del diagrama harness.
- Variables CSS y clases quedan **scoped** bajo una clase raíz (`.experiencias-ia`) en un archivo CSS propio importado solo en `experiencias-ia/layout.tsx` — no tocan los tokens `@theme` globales de `globals.css`. Mismo patrón que `.mdx-prose`.
- `prefers-reduced-motion` y foco de teclado visible (outline cuero) se respetan igual que en el resto del sitio.
- Mobile-first real: usable a 360px sin scroll horizontal; grids de 3 columnas colapsan a 2 y luego a 1.

## 6. Testing

- `src/lib/experiencias-ia/__tests__/data.test.ts` — `getPendientesAbiertos`, `getMetricas`, `getAdjacentSesiones`, `getUltimasSesiones`, cubriendo casos límite (Sesión 1 sin pendientes, Sesión 7 con `conceptos`/`nuevos`, Sesión 8 como última).
- `PendienteBadge.test.tsx` y `BacklogFilter.test.tsx` — únicos componentes con lógica condicional no trivial.

## 7. Fuera de alcance

Idéntico al brief original: autenticación o edición desde el navegador, buscador interno, versiones en otros idiomas, integración con calendario/WhatsApp (solo enlaces estáticos si se proveen). Tampoco se genera `opengraph-image.tsx` por sesión en esta iteración — no está en los criterios de aceptación; queda como posible follow-up.

## 8. Criterios de aceptación

Se heredan sin cambios los del brief original (sección 8), más los específicos de esta integración:

- [x] Las 6 rutas (`/experiencias-ia`, `/sesiones`, `/sesiones/[n]`, `/cronograma`, `/backlog`, `/quienes-somos`) existen bajo `/[locale]/` y no muestran el Nav/Footer oscuro del sitio principal.
- [x] El resto del sitio (`/[locale]/(main)/...`) sigue funcionando exactamente igual tras el `git mv` a `(main)/` — mismas URLs, mismo comportamiento.
- [x] Las 8 sesiones aparecen en el índice y cada una abre su detalle completo; navegación anterior/siguiente funciona en los extremos (Sesión 1 sin "anterior", Sesión 8 sin "siguiente").
- [x] La Sesión 7 incluye los 5 conceptos, las 4 referencias (sin URL, como texto plano) y los 3 nuevos integrantes.
- [x] El cronograma muestra las sesiones 9–12 y el panel de pendientes abiertos coincide exactamente con los pendientes `estado: "abierto"` de `data.ts`, indicando su sesión de origen.
- [x] El backlog muestra los 12 temas y el filtro por prioridad funciona.
- [x] Quiénes somos muestra las 18 fichas.
- [x] Ningún nombre, fecha, cita, referencia o URL fue inventado.
- [x] Usable a 360px sin scroll horizontal. Corregido: el enlace de sesión de origen en el panel "Pendientes abiertos" usaba `.ses-f` (con `white-space: nowrap`, pensado para la fecha corta de `SesionRow`), causando desborde a 360px. Se agregó una clase propia `.pendiente-origen` (misma tipografía, sin `nowrap`) y se aplicó solo a ese enlace — `.ses-f` no se tocó. Re-verificado en vivo con Playwright a 360×800 en las 6 vistas: `scrollWidth === clientWidth === 360` en todas.
- [x] Paleta y tipografías corresponden a la sección 5 de este documento.
- [x] Pendientes cerrados visibles pero visualmente distinguibles de los abiertos.
- [x] "Experiencias IA" aparece como ítem en el Nav principal del sitio.

## Anexo

Copiados al repo en `docs/superpowers/specs/anexos/experiencias-ia/`:

- `handoff.md` — brief de diseño original.
- `data.js` — contenido fuente (8 sesiones, cronograma, backlog, 18 participantes) — única fuente de verdad para `src/lib/experiencias-ia/data.ts`.
- `prototipo.html` — referencia visual, prototipo funcional ya construido.
