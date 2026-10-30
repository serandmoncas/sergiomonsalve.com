# Guía de aves — Plan 1: catálogo y sección web

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publicar en `/es/aves` y `/en/aves` las 500 aves más comunes de Colombia con sus datos básicos (nombres, familia, puestos en Colombia y Latinoamérica, regiones, meses, amenaza y atributos de identificación), con buscador, filtros "¿Qué ave viste?", vista por familia y una ficha por especie con silueta "ilustración en camino".

**Architecture:** Un script (`npx tsx`) consulta la API pública de GBIF, solo registros CC BY 4.0 y CC0, y escribe `content/aves/catalogo.json`. Los atributos de identificación, que no salen de GBIF, se escriben por familia en `content/aves/atributos/<familia>.json` durante sesiones de Claude Code. `src/lib/aves/` lee y une ambos en build. Las páginas son Server Components estáticos; solo el explorador (buscar y filtrar) y "Yo lo vi" son Client Components.

**Tech Stack:** Next.js 16.2.4 (App Router), next-intl, Tailwind v4 (tokens del sitio), Vitest + Testing Library, `npx tsx` para scripts, API REST de GBIF (`https://api.gbif.org/v1`).

**Spec:** `docs/superpowers/specs/2026-10-29-guia-aves-design.md`

**Fuera de este plan:** la generación y revisión de ilustraciones (plan 2) y los textos redactados, los nombres populares por región, el dato curioso y "dónde verla" (plan 3). Este plan deja listos los huecos donde llegan.

## Global Constraints

- Solo datos con licencia comercial: en GBIF, siempre `license=CC_BY_4_0&license=CC0_1_0`. Nada de la API de eBird ni de la UICN.
- Atribución visible en cada página de la guía: "Datos de ocurrencia: GBIF.org (consultado AAAA-MM-DD), registros CC BY 4.0 y CC0, incluye eBird Observation Dataset (Cornell Lab of Ornithology)".
- Costo cero: ninguna API de pago.
- Bilingüe: interfaz en `src/messages/{es,en}.json` bajo el namespace `aves`; los slugs son los mismos en los dos idiomas (en español).
- Rutas: `/[locale]/aves` y `/[locale]/aves/[slug]`, bajo `src/app/[locale]/(main)/`.
- Taxonomía: la de GBIF (`speciesKey`), que sigue la columna vertebral de GBIF; el `speciesKey` es el identificador estable de cada especie.
- Países de Latinoamérica (20): `AR BO BR CL CO CR CU DO EC SV GT HN MX NI PA PY PE PR UY VE`.
- Ave de Colombia = `country=CO`, `taxonKey=212` (Aves).
- Tests en `__tests__/` junto a lo que prueban; mock de next-intl como en `CLAUDE.md`.
- Imports de navegación desde `@/i18n/navigation`.

## Review Focus

- Dos especies cuyo nombre en español normaliza al mismo slug: los slugs deben salir únicos (Task 2, `asignarSlugs`).
- Especie sin nombre en español en GBIF: se muestra el nombre en inglés y, si tampoco hay, el científico; nunca una ficha sin nombre (Task 2, `elegirNombre`).
- Búsqueda sin tildes ni mayúsculas ("tangara", "TOCHE", "momotus") encuentra la especie (Task 5, `buscar`).
- Filtros que no dejan ninguna especie: mensaje claro y botón "Limpiar filtros", no una cuadrícula vacía (Task 6).
- `localStorage` bloqueado (navegación privada, Safari): "Yo lo vi" no rompe la ficha (Task 7, `YoLoVi`).

---

### Task 1: Tipos y carga del catálogo

**Files:**
- Create: `src/lib/aves/tipos.ts`, `src/lib/aves/catalogo.ts`
- Create: `src/lib/aves/__tests__/catalogo.test.ts`, `src/lib/aves/__tests__/fixtures/catalogo.json`, `src/lib/aves/__tests__/fixtures/atributos/tyrannidae.json`
- Modify: `.gitignore` (añadir `.superpowers/`)

**Interfaces:**
- Produces:

```ts
// tipos.ts
export type Region = 'andina' | 'caribe' | 'pacifica' | 'orinoquia' | 'amazonia' | 'insular'
export type ClaseTamano = 'colibri' | 'mirla' | 'paloma' | 'gallinazo'
export type Color = 'azul' | 'rojo' | 'amarillo' | 'verde' | 'negro' | 'cafe' | 'blanco' | 'gris'
export type Habitat = 'ciudad' | 'bosque' | 'agua' | 'paramo' | 'campo'
export type Residencia = 'residente' | 'migratoria-boreal' | 'migratoria-austral'
export type Amenaza = 'CR' | 'EN' | 'VU' | null

export type EspecieBase = {          // una entrada de catalogo.json
  speciesKey: number
  slug: string
  cientifico: string
  nombreEs: string
  nombreEn: string
  familia: string                    // nombre científico, p. ej. "Tyrannidae"
  orden: string
  puestoColombia: number             // 1..500
  registrosColombia: number
  puestoLatam: number | null         // null = fuera del top 4000
  regiones: Region[]                 // ordenadas de más a menos registros
  meses: number[]                    // 12 conteos, enero primero
  amenaza: Amenaza
}

export type Atributos = {            // por speciesKey, en atributos/<familia>.json
  tamanoCm: number
  claseTamano: ClaseTamano
  colores: Color[]                   // 1 a 3
  habitats: Habitat[]                // 1 a 3
  altitudM: [number, number]
  residencia: Residencia
  endemica: boolean
}

export type Especie = EspecieBase & { atributos: Atributos | null }
```

```ts
// catalogo.ts
export function getEspecies(raiz?: string): Especie[]           // orden por puestoColombia
export function getEspecie(slug: string, raiz?: string): Especie | null
export function getSlugs(raiz?: string): string[]
```

`raiz` por defecto es `path.join(process.cwd(), 'content/aves')`; los tests pasan la carpeta de fixtures.

- [ ] **Step 1: Escribir los tests que fallan.** El fixture tiene 3 especies (sirirí con atributos en `tyrannidae.json`; azulejo y gallinazo sin atributos).
  - `getEspecies` devuelve 3, ordenadas por `puestoColombia`.
  - `getEspecie('tirano-tropical').atributos.tamanoCm` es `21`.
  - `getEspecie('gallinazo-negro').atributos` es `null`.
  - `getEspecie('no-existe')` es `null`.
  - `getSlugs()` tiene longitud 3.
- [ ] **Step 2: Correr y ver que fallan.** `npx vitest run src/lib/aves` → FAIL (módulo no existe).
- [ ] **Step 3: Implementar `tipos.ts` y `catalogo.ts`.** Lee `catalogo.json` y todos los `atributos/*.json` (cada uno es `Record<string, Atributos>` indexado por `speciesKey`) y los une por `speciesKey`. Si no existe `atributos/`, todas quedan con `atributos: null`.
- [ ] **Step 4: Correr y ver que pasan.** `npx vitest run src/lib/aves` → PASS.
- [ ] **Step 5: Commit.** `feat(aves): tipos y carga del catálogo` (incluye `.gitignore`).

### Task 2: Script del catálogo desde GBIF

**Files:**
- Create: `src/lib/aves/gbif.ts`, `src/lib/aves/__tests__/gbif.test.ts`
- Create: `scripts/aves/construir-catalogo.ts`
- Create (generado): `content/aves/catalogo.json`

**Interfaces:**
- Consumes: `EspecieBase`, `Region` (Task 1).
- Produces (funciones puras en `gbif.ts`):

```ts
export const PAISES_LATAM: string[]                         // los 20 de Global Constraints
export const REGION_POR_DEPARTAMENTO: Record<string, Region> // los 32 departamentos + Bogotá D.C.
export function rankingDesdeFacetas(conteos: { name: string; count: number }[]): Map<number, number> // speciesKey → puesto (1-based)
export function elegirNombre(nombres: { language: string; vernacularName: string; source?: string }[], idioma: 'spa' | 'eng'): string | null
export function slugify(texto: string): string
export function asignarSlugs(items: { speciesKey: number; base: string }[]): Map<number, string>
export function regionesDesdeDepartamentos(conteos: { name: string; count: number }[]): Region[]
export function mesesDesdeFacetas(conteos: { name: string; count: number }[]): number[]
```

- [ ] **Step 1: Escribir los tests que fallan.**
  - `rankingDesdeFacetas([{name:'5',count:9},{name:'7',count:3}])` → `5↦1`, `7↦2`.
  - `elegirNombre`: prefiere la fuente `Colaboraciones Americanas Sobre Aves`. Con `[{spa,'Sirirí común',CoL},{spa,'Tirano tropical','Colaboraciones Americanas Sobre Aves'}]` → `'Tirano tropical'`. Sin esa fuente, el nombre más repetido. Sin nombres en el idioma → `null`.
  - `slugify('Tángara Azuleja')` → `'tangara-azuleja'`; `slugify("Carpintero de Lewis's")` → `'carpintero-de-lewiss'`.
  - `asignarSlugs` con dos `base: 'tirano tropical'` → `'tirano-tropical'` y `'tirano-tropical-<speciesKey>'`, nunca iguales.
  - `regionesDesdeDepartamentos([{name:'Antioquia',count:50},{name:'Meta',count:20},{name:'Narnia',count:5}])` → `['andina','orinoquia']` (ignora nombres desconocidos, sin duplicados).
  - `mesesDesdeFacetas([{name:'5',count:3}])` → arreglo de 12 con `3` en el índice 4 y `0` en el resto.
- [ ] **Step 2: Correr y ver que fallan.** `npx vitest run src/lib/aves/__tests__/gbif.test.ts` → FAIL.
- [ ] **Step 3: Implementar `gbif.ts`.** `REGION_POR_DEPARTAMENTO` asigna a cada departamento su región principal; Antioquia es `andina`. `slugify` quita tildes con `normalize('NFD')`.
- [ ] **Step 4: Correr y ver que pasan.** → PASS.
- [ ] **Step 5: Escribir `scripts/aves/construir-catalogo.ts`.** Encabezado de uso con el estilo de `scripts/import-goodreads.ts`. Hace, en orden:
  1. Faceta `speciesKey` de Colombia (`country=CO&taxonKey=212&license=CC_BY_4_0&license=CC0_1_0&limit=0&facet=speciesKey&speciesKey.facetLimit=500`) → las 500 y su puesto.
  2. La misma faceta con los 20 `country` y `speciesKey.facetLimit=4000` → `puestoLatam` (`null` si no está).
  3. Por especie: `/species/{key}` (nombre canónico, familia, orden), `/species/{key}/vernacularNames?limit=300` y la faceta `stateProvince` + `month` en Colombia. Con 5 peticiones en paralelo como máximo y reintento ante HTTP 429.
  4. Nombre de respaldo: si `nombreEs` es `null`, usar `nombreEn`; si también es `null`, el científico.
  5. `amenaza: null` (lo llena Task 3).
  6. Escribe `content/aves/catalogo.json` (arreglo ordenado por puesto, con `consultado: 'AAAA-MM-DD'` en un objeto envolvente `{ consultado, especies }`). Ajustar `getEspecies` de Task 1 para leer `especies` y exponer `getFechaConsulta(raiz?): string`.
- [ ] **Step 6: Correr el script.** `npx tsx scripts/aves/construir-catalogo.ts` → termina con "500 especies escritas"; `jq '.especies | length' content/aves/catalogo.json` → `500`; `jq '.especies[0].cientifico'` → una especie común (p. ej. `"Tyrannus melancholicus"` o `"Thraupis episcopus"`).
- [ ] **Step 7: Correr todos los tests.** `npx vitest run src/lib/aves` → PASS.
- [ ] **Step 8: Commit.** `feat(aves): catálogo de 500 especies desde GBIF (CC BY/CC0)`.

### Task 3: Estado de amenaza (Resolución 0126 de 2024)

**Files:**
- Create: `content/aves/fuentes/res-0126-2024-aves.csv` (columnas: `cientifico,categoria`)
- Create: `src/lib/aves/amenaza.ts`, `src/lib/aves/__tests__/amenaza.test.ts`
- Modify: `scripts/aves/construir-catalogo.ts`

**Interfaces:**
- Produces: `parsearAmenazas(csv: string): Map<string, 'CR' | 'EN' | 'VU'>`, con clave `cientifico` en minúsculas.

- [ ] **Step 1: Conseguir la fuente.** Descargar el anexo de aves de la Resolución 0126 de 2024 (Minambiente), publicado en SiB Colombia o ANLA. Pasar a CSV solo las aves con su categoría y guardar en la ruta de arriba. En la primera línea, un comentario `# fuente: <URL> consultado AAAA-MM-DD`. Si no se encuentra una versión descargable, parar y avisar a Sergio.
- [ ] **Step 2: Test que falla.** `parsearAmenazas("# fuente\ncientifico,categoria\nAra militaris,VU\n")` → `get('ara militaris') === 'VU'`. Líneas con categoría distinta de CR/EN/VU se ignoran.
- [ ] **Step 3: Correr → FAIL.**
- [ ] **Step 4: Implementar `amenaza.ts`.** En el script, asignar `amenaza` por nombre científico.
- [ ] **Step 5: Correr → PASS.** Volver a correr el script; `jq '[.especies[] | select(.amenaza != null)] | length'` → un número pequeño (las 500 más comunes casi no están amenazadas; 0 es plausible y no es error).
- [ ] **Step 6: Commit.** `feat(aves): estado de amenaza según Res. 0126/2024`.

### Task 4: Atributos de identificación por familia

**Files:**
- Create: `src/lib/aves/atributos.ts`, `src/lib/aves/__tests__/atributos.test.ts`
- Create: `scripts/aves/validar-atributos.ts`
- Create (datos): `content/aves/atributos/<familia-en-minusculas>.json`, uno por familia del catálogo

**Interfaces:**
- Consumes: `Atributos` (Task 1), `getEspecies` (Task 1).
- Produces: `validarAtributos(a: unknown): string[]`, que devuelve la lista de errores (vacía si es válido).

- [ ] **Step 1: Test que falla.**
  - Un objeto válido → `[]`.
  - `colores: []` → error que menciona `colores`.
  - `colores` con 4 elementos → error.
  - `altitudM: [2000, 100]` → error (mínimo > máximo).
  - `claseTamano: 'aguila'` → error.
  - `tamanoCm: 0` → error.
- [ ] **Step 2: Correr → FAIL.**
- [ ] **Step 3: Implementar `validarAtributos`.** Usar `zod`, que ya está en las dependencias.
- [ ] **Step 4: Correr → PASS.**
- [ ] **Step 5: Escribir `scripts/aves/validar-atributos.ts`.** Valida cada archivo y lista las especies del catálogo sin atributos. Termina con `N/500 con atributos, M errores` y código de salida 1 si hay errores (no si faltan especies).
- [ ] **Step 6: Llenar los atributos, una familia por vez, en sesión de Claude Code.** Usar el conocimiento ornitológico del modelo para `tamanoCm`, `colores` dominantes, `habitats`, `altitudM`, `residencia` y `endemica`. `claseTamano` sale de `tamanoCm`: `colibri` < 13, `mirla` < 26, `paloma` < 40, `gallinazo` ≥ 40. Correr el validador después de cada familia. Estos datos se muestran desde el día uno (datos básicos); Sergio puede corregirlos después en el JSON.
- [ ] **Step 7: Verificar.** `npx tsx scripts/aves/validar-atributos.ts` → `500/500 con atributos, 0 errores`.
- [ ] **Step 8: Commit.** Una vez por cada tanda de familias: `feat(aves): atributos de <familias>`.

### Task 5: Búsqueda, filtros y agrupación (lógica pura)

**Files:**
- Create: `src/lib/aves/filtros.ts`, `src/lib/aves/__tests__/filtros.test.ts`

**Interfaces:**
- Consumes: `Especie`, `ClaseTamano`, `Color`, `Habitat` (Task 1).
- Produces:

```ts
export type Filtros = { texto: string; tamano: ClaseTamano | null; colores: Color[]; habitat: Habitat | null }
export const FILTROS_VACIOS: Filtros
export function buscar(especies: Especie[], texto: string): Especie[]
export function filtrarEspecies(especies: Especie[], f: Filtros): Especie[]
export function agruparPorFamilia(especies: Especie[]): { familia: string; especies: Especie[] }[]
```

- [ ] **Step 1: Tests que fallan.** Con fixtures de 4 especies:
  - `buscar(e, 'TANGARA')` encuentra "Tángara azuleja".
  - `buscar(e, 'momotus')` encuentra por nombre científico.
  - `buscar(e, 'kingbird')` encuentra por nombre en inglés.
  - `buscar(e, '  ')` devuelve todas.
  - Filtro `colores: ['azul','amarillo']` devuelve las que tienen **alguno** de los dos.
  - `tamano: 'mirla'` + `habitat: 'ciudad'` → intersección.
  - Una especie con `atributos: null` queda fuera cuando hay algún filtro de atributos activo, y dentro cuando solo hay texto.
  - `agruparPorFamilia`: grupos ordenados por el mejor `puestoColombia` de cada familia; dentro, por puesto.
- [ ] **Step 2: Correr → FAIL.**
- [ ] **Step 3: Implementar.** Normalizar con `normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase()` sobre `nombreEs`, `nombreEn` y `cientifico`.
- [ ] **Step 4: Correr → PASS.**
- [ ] **Step 5: Commit.** `feat(aves): búsqueda, filtros y agrupación`.

### Task 6: Página de la guía `/aves`

**Files:**
- Create: `src/app/[locale]/(main)/aves/page.tsx`
- Create: `src/components/aves/AvesExplorador.tsx` (client), `src/components/aves/TarjetaAve.tsx`, `src/components/aves/SiluetaPendiente.tsx`, `src/components/aves/AtribucionDatos.tsx`
- Create: `src/components/aves/__tests__/AvesExplorador.test.tsx`
- Modify: `src/messages/es.json`, `src/messages/en.json` (namespace `aves`), `meta.avesTitle`, `meta.avesDescription`

**Interfaces:**
- Consumes: `getEspecies`, `getFechaConsulta` (Tasks 1–2); `Filtros`, `FILTROS_VACIOS`, `filtrarEspecies`, `agruparPorFamilia` (Task 5).
- Produces:
  - `<AvesExplorador especies={Especie[]} />`: dentro usa `useTranslations('aves')`.
  - `<TarjetaAve especie={Especie} />`: enlaza a `/aves/[slug]` con `Link` de `@/i18n/navigation`.
  - `<SiluetaPendiente nombre={string} />`: SVG genérico de ave más el texto `aves.ilustracionEnCamino`.
  - `<AtribucionDatos fecha={string} />`: el texto de atribución de Global Constraints.

- [ ] **Step 1: Test que falla** (con fixtures de 4 especies):
  - Muestra 4 tarjetas.
  - Escribir "tangara" deja 1.
  - Clic en el filtro de tamaño `mirla` reduce la lista.
  - Con filtros sin resultados aparece `sinResultados` y un botón `limpiarFiltros` que devuelve las 4.
  - Clic en `agruparPorFamilia` muestra los encabezados de familia.
- [ ] **Step 2: Correr → FAIL.**
- [ ] **Step 3: Implementar.** Cada tarjeta muestra la silueta (todavía no hay ilustraciones), el nombre, el científico en cursiva y `#puestoColombia`. Arriba va un buscador, y debajo los filtros "¿Qué ave viste?": Tamaño (4 botones con la etiqueta de la especie de referencia), Color (8 muestras) y Dónde (5 botones). A la derecha, el conmutador "Galería | Agrupar por familia". Usar los tokens del sitio (`bg-surface`, `border-border`, `text-accent`, `font-mono`), como en `src/components/about/AboutPageContent.tsx`. Metadatos con el mismo patrón que `carpinteria/page.tsx` (canonical y `languages`).
- [ ] **Step 4: Correr → PASS.**
- [ ] **Step 5: Verificar en el navegador.** `npm run dev`, abrir `/es/aves` y `/en/aves` a 390 px y a 1280 px. Debe haber 500 tarjetas y los filtros deben funcionar.
- [ ] **Step 6: Commit.** `feat(aves): página de la guía con buscador y filtros`.

### Task 7: Ficha de especie `/aves/[slug]`

**Files:**
- Create: `src/app/[locale]/(main)/aves/[slug]/page.tsx`
- Create: `src/components/aves/ComparadorTamano.tsx`, `src/components/aves/MapaRegiones.tsx`, `src/components/aves/MesesPresencia.tsx`, `src/components/aves/YoLoVi.tsx` (client)
- Create: `src/components/aves/__tests__/ficha.test.tsx`
- Modify: `src/messages/{es,en}.json` (claves nuevas de `aves`)

**Interfaces:**
- Consumes: `getEspecie`, `getSlugs`, `getFechaConsulta` (Tasks 1–2); `SiluetaPendiente`, `AtribucionDatos` (Task 6).
- Produces:
  - `<ComparadorTamano tamanoCm={number} />`: dos siluetas a escala, la especie contra la referencia. Si `tamanoCm` < 26, la referencia es una mirla de 25 cm; si no, una paloma de 33 cm.
  - `<MapaRegiones regiones={Region[]} />`: SVG esquemático de las 6 regiones naturales, con las presentes resaltadas en `accent` y una leyenda textual.
  - `<MesesPresencia meses={number[]} />`: 12 barras pequeñas con iniciales de mes.
  - `<YoLoVi speciesKey={number} />`: botón que alterna y guarda en `localStorage['aves:vistas']` un arreglo de `speciesKey`.

- [ ] **Step 1: Tests que fallan.**
  - `MesesPresencia` con `[0,…,10 en mayo,…]` marca mayo como el mes más alto (`aria-label` incluye "mayo").
  - `MapaRegiones(['andina'])` → la región andina tiene `data-presente="true"` y las otras `false`.
  - `YoLoVi`: clic → `localStorage` contiene la key, y otro clic la quita. Con `localStorage.setItem` que lanza un error, el clic no rompe y el botón cambia de estado igual (solo en memoria).
  - `ComparadorTamano(42)` usa la paloma como referencia.
- [ ] **Step 2: Correr → FAIL.**
- [ ] **Step 3: Implementar la página.** `generateStaticParams` con `getSlugs()` y `notFound()` si no existe. El encabezado lleva la silueta, `nombreEs`, el científico, `nombreEn`, la familia y dos insignias: `#N en Colombia` y `#N en Latinoamérica` (o "fuera del top" si es `null`). Debajo, en este orden:
  1. Bloque de atributos: tamaño con `ComparadorTamano`, altitud y residencia. Si `endemica`, una insignia "Endémica de Colombia".
  2. `MapaRegiones`.
  3. `MesesPresencia`.
  4. Amenaza, si la hay.
  5. Enlace al canto: `https://xeno-canto.org/explore?query=<cientifico con +>`, en una pestaña nueva.
  6. `YoLoVi`.
  7. `AtribucionDatos`.

  Si `atributos` es `null`, el bloque 1 no se muestra. Los bloques del plan 3 (cómo reconocerla, con qué se confunde, dato curioso, nombres populares, dónde verla) **no** se renderizan en este plan. Metadatos: el título es `nombreEs — Guía de aves`, con canonical y `languages`.
- [ ] **Step 4: Correr → PASS.**
- [ ] **Step 5: Verificar en el navegador.** Abrir 3 fichas: la #1, una con `atributos` y una de familia rara, en es y en en, a 390 px.
- [ ] **Step 6: Commit.** `feat(aves): ficha de especie`.

### Task 8: Integración con el sitio

**Files:**
- Modify: `src/components/Nav.tsx` (en el grupo "Aprender", después de `biblioteca`, en escritorio y celular), `src/messages/{es,en}.json` (`nav.aves`: "Aves" / "Birds")
- Modify: `src/app/sitemap.ts` (`'/aves'` en `staticRoutes` y una entrada por slug)
- Create: `src/app/__tests__/sitemap-aves.test.ts`

- [ ] **Step 1: Test que falla.** El sitemap contiene `/es/aves` y `/es/aves/<slug de la #1>`. Leer primero cómo arma `sitemap.ts` las URLs con idioma y seguir ese patrón.
- [ ] **Step 2: Correr → FAIL.**
- [ ] **Step 3: Implementar Nav y sitemap.** Verificar en el navegador a 1280 px que el menú de escritorio sigue cabiendo en una fila. Si no cabe, poner "Aves" solo en el menú del celular y avisar a Sergio.
- [ ] **Step 4: Verificación completa.** `npm run test:run` → todo PASS. `npx eslint src/lib/aves src/components/aves "src/app/[locale]/(main)/aves" scripts/aves` → sin errores. `npm run build` → compila y genera unas 1.000 páginas de fichas (500 × 2 idiomas).
- [ ] **Step 5: Commit.** `feat(aves): enlace en el menú y sitemap`.
