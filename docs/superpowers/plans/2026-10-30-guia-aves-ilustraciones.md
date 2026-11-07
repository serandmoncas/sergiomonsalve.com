# Guía de aves — Plan 2: ilustraciones

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Un flujo gratuito y por lotes (una familia a la vez) para producir, revisar y publicar ilustraciones con precisión de guía de campo. Claude prepara un kit (prompts y fotos de referencia), Sergio genera en Google AI Studio con Nano Banana, un script ingiere las imágenes, Claude hace la revisión automática, Sergio aprueba, y la web muestra solo las aprobadas.

**Architecture:**
- Los rasgos de identificación por variante (adulto, macho, hembra, juvenil) se escriben por familia en `content/aves/prompts/<familia>.json`.
- `scripts/aves/kit-familia.ts` arma el kit local (prompts y referencias de GBIF).
- `scripts/aves/ingerir.ts` valida las imágenes, guarda el original fuera del repo con rclone en el Drive `lajobiteka:`, crea versiones WebP en `public/aves/` y registra el estado en `content/aves/ilustraciones.json`.
- Una página de revisión solo para desarrollo (`/admin/aves`) permite a Sergio aprobar o rechazar.
- `getEspecies` une la ilustración aprobada a cada especie, y las tarjetas y fichas la muestran.

**Tech Stack:** Next.js 16 (App Router, Server Actions), next/image, `sharp` (dependencia directa nueva), `npx tsx`, rclone (ya configurado con el remoto `lajobiteka:`), API de GBIF (fotos de referencia), Vitest.

**Spec:** `docs/superpowers/specs/2026-10-29-guia-aves-design.md`. Construye sobre el plan 1 (`docs/superpowers/plans/2026-10-29-guia-aves-catalogo-web.md`), ya en `main`.

## Global Constraints

- Costo cero: la generación es manual en Google AI Studio (gratis). No se usa la app de Gemini, que pone marca de agua visible. Ninguna API de pago.
- Ninguna ilustración se publica sin estado `aprobada`, que pone Sergio. Es la anti-meta principal del spec.
- Formato: ave completa de perfil, mirando a la izquierda, fondo blanco liso, sin texto. El lado largo del original mide al menos 2048 px.
- Trazabilidad: cada ilustración guarda las URLs y licencias de las fotos usadas como referencia (spec, decisión 8).
- Variantes: `adulto` si macho y hembra se ven iguales; si difieren, `macho` y `hembra`; `juvenil` solo si el juvenil es común y muy distinto.
- Nombres de archivo: `<slug>--<variante>.png` (doble guion), p. ej. `azulejo-comun--adulto.png`.
- Los originales no entran al repo. En el repo y en `public/` solo van las WebP de 1024 y 512 px.
- Las rutas de revisión solo existen en desarrollo: en producción responden `notFound()`.
- Tests en `__tests__/` junto al código; textos de interfaz en `src/messages/{es,en}.json`.

## Review Focus

- Un archivo con nombre que no corresponde a ningún slug o variante del catálogo: la ingesta lo rechaza con un mensaje claro y no escribe nada (Task 3, `parsearNombreArchivo`).
- Una imagen demasiado pequeña (< 2048 px) o que no es PNG/JPG/WebP: se rechaza (Task 3).
- Volver a ingerir una variante ya `aprobada`: queda `generada` otra vez y deja de mostrarse hasta aprobarla de nuevo (Task 1, `cambiarEstado`).
- La página de revisión desplegada en producción: no debe existir (Task 5).
- Una especie con `macho` aprobado y `hembra` pendiente: la tarjeta muestra el macho y la ficha muestra solo las variantes aprobadas (Task 6).

---

### Task 1: Modelo y estado de las ilustraciones

**Files:**
- Create: `src/lib/aves/ilustraciones.ts`, `src/lib/aves/__tests__/ilustraciones.test.ts`
- Create: `content/aves/ilustraciones.json` (vacío: `{}`)
- Modify: `src/lib/aves/tipos.ts`, `src/lib/aves/catalogo.ts` (unir ilustraciones aprobadas), `src/lib/aves/__tests__/catalogo.test.ts`, `src/lib/aves/__tests__/fixtures/` (añadir `ilustraciones.json`)

**Interfaces:**
- Produces:

```ts
// tipos.ts
export type Variante = 'adulto' | 'macho' | 'hembra' | 'juvenil'
export type EstadoIlustracion = 'generada' | 'marcada' | 'revisada-auto' | 'aprobada' | 'rechazada'
export type Referencia = { url: string; licencia: string; fuente: string }
export type Ilustracion = {
  variante: Variante
  estado: EstadoIlustracion
  archivo: string            // nombre base en public/aves, p. ej. "azulejo-comun--adulto"
  referencias: Referencia[]
  nota: string               // motivo de marcada/rechazada; '' si no hay
  actualizado: string        // AAAA-MM-DD
}
// Especie gana: ilustraciones: Ilustracion[]  (solo las aprobadas, ordenadas macho, hembra, adulto, juvenil)
```

```ts
// ilustraciones.ts
export const ORDEN_VARIANTES: Variante[]            // ['macho','hembra','adulto','juvenil']
export function cambiarEstado(i: Ilustracion, nuevo: EstadoIlustracion, nota: string, hoy: string): Ilustracion
export function registrarGenerada(registro: Record<string, Ilustracion[]>, speciesKey: number, nueva: Omit<Ilustracion, 'estado' | 'nota' | 'actualizado'>, hoy: string): Record<string, Ilustracion[]>
export function aprobadas(lista: Ilustracion[]): Ilustracion[]
export function leerRegistro(raiz?: string): Record<string, Ilustracion[]>
export function guardarRegistro(registro: Record<string, Ilustracion[]>, raiz?: string): void
```

- [ ] **Step 1: Tests que fallan.**
  - `cambiarEstado` de `generada` a `marcada` con nota `'pico muy corto'` devuelve el estado y la nota nuevos, y `actualizado` igual a `hoy`.
  - `cambiarEstado(..., 'aprobada', ...)` sobre una ilustración `rechazada` lanza un error: hay que regenerar, no aprobar una rechazada.
  - `registrarGenerada` sobre una variante que ya estaba `aprobada` la reemplaza con estado `generada` (Review Focus).
  - `registrarGenerada` de una variante nueva conserva las otras variantes de la especie.
  - `aprobadas` filtra y ordena según `ORDEN_VARIANTES`.
  - `getEspecie('tirano-tropical', fixtures).ilustraciones` contiene solo la aprobada del fixture (el fixture trae una `aprobada` y una `generada`).
- [ ] **Step 2: Correr → FAIL.** `npx vitest run src/lib/aves`
- [ ] **Step 3: Implementar.** Transiciones permitidas: desde `generada` → `marcada | revisada-auto | aprobada | rechazada`; desde `marcada | revisada-auto` → `aprobada | rechazada`; desde `aprobada` → `rechazada`. Cualquier otra lanza `Error`. El registro se guarda con 2 espacios y salto de línea final.
- [ ] **Step 4: Correr → PASS.**
- [ ] **Step 5: Commit.** `feat(aves): modelo y estado de las ilustraciones`

### Task 2: Rasgos por variante y kit de generación por familia

**Files:**
- Create: `src/lib/aves/prompts.ts`, `src/lib/aves/__tests__/prompts.test.ts`
- Create: `scripts/aves/kit-familia.ts`
- Create (datos, por sesión): `content/aves/prompts/<familia>.json`
- Modify: `.gitignore` (añadir `content/aves/kits/`)

**Interfaces:**
- Consumes: `Especie`, `Variante`, `Referencia` (Task 1).
- Produces:

```ts
export type RasgosEspecie = Partial<Record<Variante, string>>  // texto de rasgos de campo por variante
export const ESTILO: string
export function validarRasgos(r: unknown): string[]
export function construirPrompt(e: Especie, variante: Variante, rasgos: string): string
export function referenciasDesdeGbif(resultados: { media?: { identifier?: string; license?: string }[]; datasetName?: string }[], max: number): Referencia[]
```

`ESTILO` (texto fijo, en inglés, que es como mejor responde el modelo):
`"Scientific field-guide illustration in gouache, single bird, full body, strict side profile facing left, perched on a plain thin bare twig (or standing on flat ground if terrestrial or aquatic), pure white background, no text, no frame, no shadow, even neutral lighting, accurate proportions and plumage colors, bird centered and filling about 70% of the width, 4:3 landscape."`

- [ ] **Step 1: Tests que fallan.**
  - `construirPrompt` incluye `ESTILO`, el nombre científico, `tamanoCm` (como `"about 21 cm"`), la palabra de la variante (`"adult male"`, `"adult female"`, `"adult"`, `"juvenile"`) y el texto de rasgos.
  - `validarRasgos({ adulto: 'x' })` → `[]`.
  - `validarRasgos({ macho: 'x' })` sin `hembra` → error: macho exige hembra.
  - `validarRasgos({ adulto: 'x', macho: 'y' })` → error: `adulto` excluye `macho`/`hembra`.
  - `validarRasgos({})` → error.
  - `referenciasDesdeGbif` toma como máximo `max` fotos, omite las que no traen `identifier` y no repite URLs.
- [ ] **Step 2: Correr → FAIL.**
- [ ] **Step 3: Implementar `prompts.ts`.**
- [ ] **Step 4: Correr → PASS.**
- [ ] **Step 5: Escribir `scripts/aves/kit-familia.ts <Familia>`.** Uso en el encabezado. Para cada especie de la familia, en orden de puesto, lee `content/aves/prompts/<familia>.json`; si falta la especie, termina con un error que la nombra. Pide 5 fotos a GBIF: `occurrence/search?speciesKey=<key>&country=CO&mediaType=StillImage&limit=20`; si no hay en Colombia, sin `country`. Escribe en `content/aves/kits/<familia>/`:
  - `kit.md`: por especie y variante, el nombre, el nombre de archivo esperado (`<slug>--<variante>.png`), el prompt en un bloque de código y las referencias como enlaces;
  - `referencias.json`: `Record<"<slug>--<variante>", Referencia[]>`, que lee Task 3.
- [ ] **Step 6: Escribir los rasgos de la familia piloto** (`Thraupidae`, en sesión de Claude Code). Por variante, 1 a 3 frases con las marcas de campo que distinguen la especie de sus parecidas: color de corona, pico, ala, cola y patrón del vientre. Correr `npx tsx scripts/aves/kit-familia.ts Thraupidae` → termina con "N prompts".
- [ ] **Step 7: Commit.** `feat(aves): rasgos por variante y kit de generación` (incluye `prompts/thraupidae.json`, no el kit).

### Task 3: Ingesta de imágenes generadas

**Files:**
- Create: `src/lib/aves/ingesta.ts`, `src/lib/aves/__tests__/ingesta.test.ts`
- Create: `scripts/aves/ingerir.ts`
- Modify: `package.json` (`sharp` en `devDependencies`, misma versión que ya resuelve el lockfile: `^0.34.5`)

**Interfaces:**
- Consumes: `registrarGenerada`, `leerRegistro`, `guardarRegistro` (Task 1); `getEspecies` (plan 1); `content/aves/kits/<familia>/referencias.json` (Task 2).
- Produces:

```ts
export function parsearNombreArchivo(nombre: string, slugs: Set<string>): { slug: string; variante: Variante } | { error: string }
export function validarDimensiones(ancho: number, alto: number): string | null   // null = válida
```

- [ ] **Step 1: Tests que fallan.**
  - `parsearNombreArchivo('azulejo-comun--macho.png', slugs)` → `{ slug: 'azulejo-comun', variante: 'macho' }`.
  - Acepta `.jpg`, `.jpeg` y `.webp`, sin importar mayúsculas en la extensión.
  - Slug desconocido → `{ error }` que menciona el slug.
  - Variante desconocida (`--adulta`) → `{ error }`.
  - Sin `--` → `{ error }`.
  - Extensión `.gif` → `{ error }`.
  - `validarDimensiones(2048, 1536)` → `null`; `validarDimensiones(1024, 768)` → mensaje que menciona 2048.
- [ ] **Step 2: Correr → FAIL.**
- [ ] **Step 3: Implementar `ingesta.ts`.**
- [ ] **Step 4: Correr → PASS.**
- [ ] **Step 5: Escribir `scripts/aves/ingerir.ts <carpeta>`.** Por cada archivo, en este orden; cualquier fallo lo reporta, lo salta y sigue con el resto:
  1. `parsearNombreArchivo`.
  2. Leer el tamaño con `sharp().metadata()` y pasar `validarDimensiones`.
  3. Escribir con sharp, recortando el blanco sobrante (`trim`), `public/aves/<archivo>-1024.webp` y `public/aves/<archivo>-512.webp`, ambos con calidad 82 y ajustados al ancho.
  4. Copiar el original con `rclone copyto <archivo> "lajobiteka:Guia de aves/originales/<archivo>.<ext>"`. Si rclone falla, reportarlo y no registrar la imagen.
  5. `registrarGenerada` con las referencias tomadas de `referencias.json` del kit de su familia (`[]` si no está).

  Al final, guardar el registro e imprimir `N ingeridas, M rechazadas` y el motivo de cada rechazo.
- [ ] **Step 6: Commit.** `feat(aves): ingesta de ilustraciones generadas`

### Task 4: Revisión automática (en sesión de Claude Code)

**Files:**
- Create: `scripts/aves/estado.ts`
- Create: `docs/aves/revision-ilustraciones.md`

**Interfaces:**
- Consumes: `cambiarEstado`, `leerRegistro`, `guardarRegistro` (Task 1).

- [ ] **Step 1: Escribir `scripts/aves/estado.ts`.** Comandos:
  - `listar <estado>`: imprime `slug--variante` y la ruta de la WebP de 1024.
  - `poner <slug--variante> <estado> [nota]`: usa `cambiarEstado` y guarda.

  Un error de transición se imprime y termina con código 1.
- [ ] **Step 2: Probar el script a mano** con una entrada de prueba en un registro temporal (variable `AVES_RAIZ` que reemplaza la raíz): `poner x--adulto aprobada` sobre una `rechazada` → código 1 con el mensaje de transición.
- [ ] **Step 3: Escribir `docs/aves/revision-ilustraciones.md`**, el procedimiento que sigue Claude por lote:
  1. `estado.ts listar generada`.
  2. Por cada imagen, abrir la WebP de 1024 junto a los rasgos de `prompts/<familia>.json` y comprobar cada rasgo, la proporción, el número de patas y dedos, el pico y que no haya texto ni artefactos.
  3. `poner ... revisada-auto` si todo coincide, o `poner ... marcada "<rasgo que falla>"`.
  4. Reportar a Sergio el resumen del lote.

  Claude nunca pone `aprobada`.
- [ ] **Step 4: Commit.** `feat(aves): herramienta y procedimiento de revisión automática`

### Task 5: Página de revisión para Sergio (solo desarrollo)

**Files:**
- Create: `src/app/[locale]/(main)/admin/aves/page.tsx`, `src/app/[locale]/(main)/admin/aves/acciones.ts` (Server Actions)
- Create: `src/app/[locale]/(main)/admin/aves/__tests__/acciones.test.ts`

**Interfaces:**
- Consumes: `leerRegistro`, `guardarRegistro`, `cambiarEstado` (Task 1); `getEspecies` (plan 1).
- Produces: `aprobar(clave: string): Promise<void>` y `rechazar(clave: string, nota: string): Promise<void>` (`'use server'`), con `clave = "<slug>--<variante>"`.

- [ ] **Step 1: Tests que fallan** (con `AVES_RAIZ` apuntando a un directorio temporal y `NODE_ENV` simulado).
  - `aprobar` pasa una `revisada-auto` a `aprobada` en el JSON.
  - `rechazar` guarda la nota.
  - Con `NODE_ENV = 'production'`, ambas lanzan un error y no escriben.
- [ ] **Step 2: Correr → FAIL.**
- [ ] **Step 3: Implementar las acciones y la página.** La página llama a `notFound()` si `process.env.NODE_ENV !== 'development'`. Lista primero las `marcada`, con su nota en rojo, y luego las `revisada-auto` y las `generada`. En cada tarjeta muestra la WebP de 1024, el nombre, la variante, los rasgos esperados, enlaces a las referencias y dos botones: "Aprobar", y "Rechazar" con un campo de nota. Tras cada acción, `revalidatePath`.
- [ ] **Step 4: Correr → PASS.**
- [ ] **Step 5: Verificar en el navegador:** `npm run dev`, abrir `/es/admin/aves` con una imagen de prueba ingerida; aprobar y ver el cambio en `content/aves/ilustraciones.json`.
- [ ] **Step 6: Commit.** `feat(aves): página de revisión de ilustraciones (solo desarrollo)`

### Task 6: Mostrar las ilustraciones aprobadas

**Files:**
- Create: `src/components/aves/IlustracionAve.tsx`, `src/components/aves/__tests__/IlustracionAve.test.tsx`
- Modify: `src/components/aves/TarjetaAve.tsx`, `src/app/[locale]/(main)/aves/[slug]/page.tsx`, `src/messages/{es,en}.json` (`aves.variante.*`)

**Interfaces:**
- Consumes: `Especie.ilustraciones` (Task 1), `SiluetaPendiente` (plan 1).
- Produces: `<IlustracionAve especie={Especie} tamano={512 | 1024} variante?={Variante} />`. Usa `next/image` con `src="/aves/<archivo>-<tamano>.webp"`, `alt="<nombre> — <variante>"` y `sizes` adecuado. Sin ilustración aprobada (o sin esa variante), muestra `SiluetaPendiente`.

- [ ] **Step 1: Tests que fallan.**
  - Sin ilustraciones → aparece el texto `ilustracionEnCamino`.
  - Con `macho` aprobado → una imagen con `src` que contiene `--macho-512.webp`.
  - Con `variante='hembra'` y solo `macho` aprobado → silueta.
- [ ] **Step 2: Correr → FAIL.**
- [ ] **Step 3: Implementar.** La tarjeta usa `tamano=512` y la primera aprobada. La ficha usa `1024` y, si hay más de una aprobada, botones de variante ("Macho", "Hembra", …). Para eso la ficha necesita un pequeño client component `SelectorVariante`, que recibe las ilustraciones ya resueltas.
- [ ] **Step 4: Correr → PASS.** Suite completa `npm run test:run` → PASS.
- [ ] **Step 5: Commit.** `feat(aves): mostrar ilustraciones aprobadas`

### Task 7: Piloto de punta a punta (con Sergio)

- [ ] **Step 1: Kit piloto.** `npx tsx scripts/aves/kit-familia.ts Thraupidae`. Entregar a Sergio el `kit.md` de las 3 especies más comunes de la familia.
- [ ] **Step 2: Sergio genera en AI Studio.** Modelo de imagen Gemini (Nano Banana), pegando el prompt y adjuntando 2 o 3 fotos de referencia. Guarda cada imagen con el nombre indicado en `~/Downloads/aves-lote/`.
- [ ] **Step 3: Ingerir.** `npx tsx scripts/aves/ingerir.ts ~/Downloads/aves-lote` → `N ingeridas, 0 rechazadas`.
- [ ] **Step 4: Revisión automática.** Claude sigue `docs/aves/revision-ilustraciones.md`.
- [ ] **Step 5: Sergio aprueba** en `/es/admin/aves`. Si el estilo no le convence, se ajusta `ESTILO` en `prompts.ts` y se repite el piloto antes de seguir con más familias.
- [ ] **Step 6: Verificar.** `/es/aves` y la ficha de una especie aprobada muestran la ilustración a 390 y 1280 px; `npm run build` → OK.
- [ ] **Step 7: Commit.** `feat(aves): primeras ilustraciones aprobadas (piloto Thraupidae)` (con las WebP y `ilustraciones.json`).
