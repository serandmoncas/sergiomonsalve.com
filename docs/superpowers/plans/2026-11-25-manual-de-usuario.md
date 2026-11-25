# Manual de Usuario en el sitio — plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que Sergio y las personas que él invite lean, naveguen (mapa,
recorrido, enlaces de vuelta, grafo) y comenten el Manual de Usuario en
`/es/manual-de-usuario`. Las notas se leen del repo privado y nunca pasan por
el repo público del sitio.

**Architecture:** La capa de contenido es pura (`src/lib/manual/parse|indice|recorridos|graph.ts`)
y la alimenta una sola fuente de red (`source.ts`, la API de GitHub con token
de servidor y caché de 300 s con la etiqueta `manual`). El acceso es en dos
pasos: el proxy exige sesión y el layout del manual exige que el correo sea de
un lector (`manual_readers` o `ADMIN_EMAILS`). Los comentarios y la
administración pasan por rutas API con `createAdminClient()` después de
verificar el rol.

**Tech Stack:** Next.js 16.2.4 App Router (`src/proxy.ts`), next-intl,
Supabase (auth con OTP y Postgres), `gray-matter`, `js-yaml`, `react-markdown`
con `remark-gfm`, `d3-force` (nueva dependencia), Resend, Tailwind v4, Vitest
y Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-25-manual-de-usuario-design.md`
(incluye "Decisiones tras la revisión del constructor"). Decisión de fondo:
ADR-004 en `serandmoncas/manual-de-usuario`.

## Global Constraints

- **Ningún texto real del manual entra a este repo.** Ni fixtures, ni
  snapshots, ni `content/`. Los tests usan notas inventadas como
  `notas/nota-de-prueba.md` con texto "Lorem…".
- Repo del manual: `serandmoncas/manual-de-usuario`, rama `main`. Rutas:
  `notas/*.md` (se ignoran las que empiezan con `_`), `recorridos/*.md` (se
  ignora `TEMPLATE.md`), `indice.yml` y `sobre.md`.
- Variables de entorno:
  - `MANUAL_GITHUB_TOKEN`: solo en Production.
  - `ADMIN_EMAILS`: separados por comas, comparados en minúsculas.
  - `ADMIN_NAME`: por defecto `Sergio`.
  - `CONTACT_EMAIL` y `RESEND_API_KEY`: ya existen.
- Caché: `fetch(..., { next: { revalidate: 300, tags: ['manual'] } })`.
- Rutas base: `/[locale]/manual-de-usuario`, que solo existe en `es`. Desde `en`
  se redirige a `es` conservando el resto de la ruta.
- Las páginas del manual llevan `robots: { index: false, follow: false }`, no
  aparecen en `sitemap.ts` y son dinámicas: no usan `generateStaticParams`.
- El render de Markdown usa `react-markdown` + `remark-gfm`, **nunca**
  `next-mdx-remote` (el contenido no se ejecuta). No se usa `rehype-raw`.
- Los comentarios tienen `body` de 1 a 4000 caracteres. A los otros lectores se
  les muestra `author_name` y **nunca** `author_email`.
- Copia de la interfaz en `src/messages/es.json` bajo la clave `manual`. En
  `en.json` va la misma clave con el texto en español, porque `en` redirige.
- La URL de la nota es `/es/manual-de-usuario/n/<slug>` y su slug es el nombre
  del archivo sin `.md`. En contexto de recorrido se agrega `?r=<recorrido>`.

## Review Focus

1. **Un lector invitado intenta `/es/admin` o `/api/admin/comments`** y debe
   recibir una redirección o un 403. Se prueba en las tareas 1 y 10.
2. **Un wikilink con alias o anclaje (`[[slug|texto]]`, `[[Título#sección]]`)
   o con tildes y mayúsculas distintas al título** debe resolver igual. Se prueba
   en la tarea 3.
3. **GitHub responde 401, 404 o 5xx, o falta el token** (como en Preview). La
   página dice "No disponible…" o "No pude traer el manual ahora" y nunca
   muestra un manual a medias como si estuviera completo. Se prueba en la tarea
   5.
4. **`next` malicioso en `/auth/callback`** (`//evil.com`, `https://evil.com`,
   `/\evil.com`) debe redirigir al valor por defecto. Se prueba en la tarea 6.
5. **Un correo de invitación con mayúsculas o espacios** (`" Ana@Mail.com "`)
   debe hacer match con la sesión `ana@mail.com`. Se prueba en las tareas 2 y
   10.

---

## Mapa de archivos

```
supabase/migrations/008_manual.sql                 tablas manual_readers, manual_comments
src/lib/auth/admin.ts                              isAdminEmail, requireAdmin
src/lib/auth/safe-next.ts                          safeNext
src/lib/manual/types.ts                            tipos compartidos
src/lib/manual/parse.ts                            nota .md → Nota (puro)
src/lib/manual/indice.ts                           indice.yml → Indice (puro)
src/lib/manual/recorridos.ts                       recorrido .md → Recorrido (puro)
src/lib/manual/graph.ts                            Nota[] → Grafo, backlinks, huérfanas (puro)
src/lib/manual/source.ts                           GitHub → archivos crudos (red)
src/lib/manual/manual.ts                           getManual(): ensambla todo
src/lib/manual/access.ts                           getReader(): lector actual o null
src/lib/manual/comment-schema.ts                   zod del comentario
src/app/[locale]/(main)/manual-de-usuario/...      páginas
src/components/manual/...                          componentes de UI
src/app/api/manual/comments/route.ts               GET/POST comentarios (lector)
src/app/api/admin/manual/...                       lectores, comentarios, refrescar (admin)
src/app/[locale]/(main)/admin/manual/page.tsx      panel admin
```

---

### Task 1: Endurecer el acceso de administrador

**Files:**
- Create: `src/lib/auth/admin.ts`, `src/lib/auth/__tests__/admin.test.ts`
- Modify: `src/proxy.ts`, cada `route.ts` bajo `src/app/api/admin/**`
  (`comments`, `comments/[id]`, `biblioteca`, `book-notes`, `book-search`,
  `guestbook` y `manual-books`), `src/__tests__/` o los tests existentes de
  esas rutas si los hay

**Interfaces:**
- Produces: `isAdminEmail(email: string | null | undefined): boolean` y
  `requireAdmin(): Promise<{ user: User } | NextResponse>`. Esta última
  devuelve 401 si no hay sesión y 403 si hay sesión pero el correo no es admin.

- [ ] **Step 1: Write the failing tests**

```ts
describe('isAdminEmail', () => {
  beforeEach(() => { process.env.ADMIN_EMAILS = 'Sergio@Example.com, otro@x.co' })
  it('acepta sin importar mayúsculas ni espacios', () => {
    expect(isAdminEmail(' sergio@example.com ')).toBe(true)
    expect(isAdminEmail('otro@x.co')).toBe(true)
  })
  it('rechaza otros, vacíos y cuando falta la variable', () => {
    expect(isAdminEmail('lector@x.co')).toBe(false)
    expect(isAdminEmail(null)).toBe(false)
    delete process.env.ADMIN_EMAILS
    expect(isAdminEmail('sergio@example.com')).toBe(false)
  })
})
describe('requireAdmin', () => {
  it('401 sin sesión, 403 con sesión no admin, user con admin', async () => { /* mock createClient().auth.getUser */ })
})
```

Más un test por ruta admin: `GET /api/admin/comments` con un usuario no admin
→ 403.

- [ ] **Step 2: Run** `npx vitest run src/lib/auth src/app/api/admin`. Expected: FAIL (módulo inexistente o 200 en lugar de 403).
- [ ] **Step 3: Implement** `admin.ts`. Reemplaza el chequeo `if (!user)` de cada ruta `api/admin/**` por `const auth = await requireAdmin(); if (auth instanceof NextResponse) return auth`. En `proxy.ts`, para `/admin/*` (excepto login), si hay usuario pero `!isAdminEmail(user.email)`, redirige a `/${locale}`.
- [ ] **Step 4: Run** `npx vitest run`. Expected: PASS, incluida la suite existente.
- [ ] **Step 5: Commit** `fix: las rutas admin exigen correo de administrador (ADMIN_EMAILS)`

### Task 2: Datos y acceso de lectores

**Files:**
- Create: `supabase/migrations/008_manual.sql`, `src/lib/manual/access.ts`, `src/lib/manual/__tests__/access.test.ts`

**Interfaces:**
- Consumes: `isAdminEmail` (tarea 1).
- Produces:
  - `normalizeEmail(e: string): string`, que aplica trim y minúsculas.
  - `type Reader = { userId: string; email: string; name: string; isAdmin: boolean }`.
  - `getReader(): Promise<Reader | null>`. Devuelve null si no hay sesión o si
    el correo no está en `manual_readers` ni es admin. El nombre del admin sale
    de `ADMIN_NAME ?? 'Sergio'`.

SQL (exacto):

```sql
CREATE TABLE manual_readers (
  email      TEXT PRIMARY KEY CHECK (email = lower(btrim(email))),
  name       TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  note       TEXT,
  invited_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE manual_comments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_slug    TEXT NOT NULL,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name  TEXT NOT NULL,
  author_email TEXT NOT NULL,
  body         TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 4000),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX manual_comments_note_slug_idx ON manual_comments(note_slug, created_at);
ALTER TABLE manual_readers  ENABLE ROW LEVEL SECURITY;
ALTER TABLE manual_comments ENABLE ROW LEVEL SECURITY;
```

- [ ] **Step 1: Failing tests:**
  - `normalizeEmail(' Ana@Mail.COM ') === 'ana@mail.com'`.
  - `getReader()` devuelve null sin sesión.
  - Devuelve null para una sesión cuyo correo no aparece (mock de `from('manual_readers').select().eq().maybeSingle()` → null).
  - Devuelve `{name:'Ana', isAdmin:false}` cuando la fila existe; la consulta se hace con el correo normalizado.
  - Devuelve `{name:'Sergio', isAdmin:true}` para un correo admin sin fila.
- [ ] **Step 2: Run** `npx vitest run src/lib/manual/__tests__/access.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement** `access.ts`: la sesión se obtiene con `createClient()` y la fila con `createAdminClient()`.
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Commit** `feat(manual): tablas y acceso de lectores`. La migración **no se aplica**: aplicarla en producción es un paso de Sergio.

### Task 3: Parser de notas

**Files:**
- Create: `src/lib/manual/types.ts`, `src/lib/manual/parse.ts`, `src/lib/manual/__tests__/parse.test.ts`

**Interfaces:**
- Produces (en `types.ts`):

```ts
type Capa = 'todos' | 'otros' | 'desdeAqui'
type DesdeAqui = { voz: string; md: string }
type Nota = {
  slug: string; titulo: string; estado: 'semilla'|'brote'|'perenne'; confianza: string
  iaCapas: Partial<Record<'todos'|'otros'|'desde_aqui', string>>; voces: string[]
  fuentes: string[]; verificado: string | null; terminos: string[]
  entrada: string                     // md entre el H1 y la primera sección
  capas: { todos?: string; otros?: string; desdeAqui?: DesdeAqui[] }
  llevar?: string                     // md de "## Para llevarte"
  enlacesRaw: string[]                // destinos crudos de wikilinks en cuerpo + relacionados
}
type ParseResult = { ok: true; nota: Nota } | { ok: false; slug: string; error: string }
```

- Produces (en `parse.ts`):
  - `parseNota(slug: string, raw: string): ParseResult`.
  - `wikiTarget(raw: string): string`: quita `|alias` y `#ancla`, y aplica trim.
  - `normKey(s: string): string`: minúsculas, sin tildes (NFD y quitar marcas) y espacios o guiones colapsados a `-`.

Reglas:
- Las secciones se reconocen por H2 exacto: `Lo que nos pasa a todos` → todos;
  `Cómo lo han vivido y pensado otros` (y el alias viejo `Cómo lo han vivido
  otros`) → otros; `Para llevarte` → llevar. `Relacionado` se descarta del
  cuerpo, pero sus wikilinks cuentan.
- Bloque `> [!desde-aqui]-? <Voz>` y sus líneas siguientes con `>` → un
  `DesdeAqui` (sin los `> `). Puede haber varios, y en cualquier sección.
- El `titulo` sale del frontmatter y, si falta, del H1.
- Error si el frontmatter es inválido o si falta el título.

- [ ] **Step 1: Failing tests** con un fixture inventado (`Lorem…`). Cubren:
  - Las tres capas y `llevar`.
  - Dos callouts `desde-aqui` con voces distintas.
  - El alias viejo del H2.
  - `[[a|texto]]` y `[[B#x]]` en `enlacesRaw` como `['a','B']`, junto con los de
    `relacionados` sin `[[ ]]`.
  - Frontmatter roto → `{ ok:false }`.
  - `normKey('Cómo  Lo-Hacemos') === 'como-lo-hacemos'`.
- [ ] **Step 2: Run** `npx vitest run src/lib/manual/__tests__/parse.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement** con `gray-matter` para el frontmatter y un escaneo por líneas para las secciones y los callouts.
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Commit** `feat(manual): parser de notas con tres capas`

### Task 4: Índice, recorridos y grafo

**Files:**
- Create: `src/lib/manual/indice.ts`, `recorridos.ts`, `graph.ts` y sus tests en `src/lib/manual/__tests__/`

**Interfaces:**
- Consumes: `Nota`, `normKey` y `wikiTarget` (tarea 3).
- Produces:

```ts
type Entrada = { n: number; titulo: string; puerta?: string; confianza: string; nota?: string; recorrido?: string }
type Indice = { secciones: { id: string; titulo: string; entradas: Entrada[] }[] }
parseIndice(yaml: string): Indice                         // lanza Error si la forma es inválida
type Recorrido = { slug: string; nombre: string; paraQuien?: string; resultado?: string; pasos: string[] } // pasos = destinos crudos
parseRecorrido(slug: string, raw: string): Recorrido
type Resolver = (raw: string) => { tipo: 'nota' | 'recorrido'; slug: string } | null
makeResolver(notas: Nota[], recorridos: Recorrido[]): Resolver   // nota por slug → nota por normKey(titulo) → recorrido por slug → por normKey(nombre)
type Grafo = { nodes: { id: string; titulo: string; existe: boolean }[]; links: { source: string; target: string }[] }
buildGrafo(notas: Nota[], resolve: Resolver): { grafo: Grafo; backlinks: Record<string, string[]>; huerfanas: string[] }
pasoVecinos(rec: Recorrido, slug: string, resolve: Resolver): { indice: number; total: number; anterior?: string; siguiente?: string } | null
```

Reglas (de la spec):
- Los enlaces a recorridos no son aristas ni backlinks.
- Un destino sin resolver crea un nodo `existe:false` con `id = 'x:' + normKey(raw)`.
- Una nota es huérfana si no tiene aristas de entrada ni de salida hacia notas.
- `pasoVecinos` salta los pasos sin nota.

- [ ] **Step 1: Failing tests:**
  - `parseIndice` sobre un YAML mínimo de 2 secciones.
  - Un YAML sin `secciones` lanza error.
  - `parseRecorrido` extrae nombre, para quién y resultado, y los 3 pasos de `## Notas, en orden`.
  - El resolver encuentra por título con tildes distintas.
  - El grafo de 3 notas inventadas (a→b, a→[[Inexistente]], c aislada) da 3 nodos encendidos más 1 apagado, `backlinks.b = ['a']` y `huerfanas = ['c']`.
  - `pasoVecinos` con pasos `[a, falta, b]` desde `a` da `siguiente:'b'` y `total:3`.
- [ ] **Step 2: Run** `npx vitest run src/lib/manual/__tests__`. Expected: FAIL.
- [ ] **Step 3: Implement** los tres módulos. `js-yaml` ya está en `node_modules` como dependencia de gray-matter; agrégalo explícito a `package.json`.
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Commit** `feat(manual): índice, recorridos y grafo`

### Task 5: Fuente GitHub y ensamblado

**Files:**
- Create: `src/lib/manual/source.ts`, `src/lib/manual/manual.ts` y sus tests

**Interfaces:**
- Consumes: tareas 3 y 4.
- Produces:

```ts
type ManualError = { tipo: 'no-configurado' } | { tipo: 'fallo'; detalle: string }
fetchRepoFiles(): Promise<{ notas: Record<string,string>; recorridos: Record<string,string>; indice: string | null; sobre: string | null }>
  // lanza ManualSourceError(tipo) — 'no-configurado' si falta MANUAL_GITHUB_TOKEN
type Manual = { notas: Map<string, Nota>; rotas: { slug: string; error: string }[]; indice: Indice | null;
                recorridos: Map<string, Recorrido>; resolve: Resolver; grafo: Grafo;
                backlinks: Record<string,string[]>; huerfanas: string[]; sobre: string | null }
getManual(): Promise<{ ok: true; manual: Manual } | { ok: false; error: ManualError }>
```

- `source.ts`:
  - Una llamada a `GET https://api.github.com/repos/serandmoncas/manual-de-usuario/git/trees/main?recursive=1`
    y luego el contenido de cada archivo relevante por
    `https://api.github.com/repos/.../contents/<path>?ref=main` con
    `Accept: application/vnd.github.raw+json`, en paralelo.
  - Todas las llamadas usan `Authorization: Bearer <token>`,
    `X-GitHub-Api-Version: 2022-11-28` y la caché de Global Constraints.
  - `source.ts` empieza con `import 'server-only'`.
- `getManual`: cualquier respuesta no 2xx en el árbol o en `indice.yml`
  devuelve `{ ok:false, error:{ tipo:'fallo' } }`. Una nota individual que falla
  al parsear va a `rotas` y no tumba el manual. La función se envuelve en
  `cache()` de React para no repetir el trabajo en un mismo render.

- [ ] **Step 1: Failing tests** con `fetch` mockeado:
  - Sin token → `no-configurado` y **no** se llama a `fetch`.
  - Árbol 401 → `fallo`.
  - Árbol OK con `notas/_plantilla.md`, `notas/a.md` y `recorridos/TEMPLATE.md` → solo se trae `a` (se ignoran el `_` y TEMPLATE).
  - Una nota con frontmatter roto → aparece en `rotas` y el resto se ensambla.
  - El header `Authorization` va en cada llamada.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.** Agrega `server-only` a las dependencias si no está.
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Commit** `feat(manual): fuente GitHub con caché y ensamblado`

### Task 6: Entrada, guardas y callback

**Files:**
- Create: `src/lib/auth/safe-next.ts` y su test,
  `src/app/[locale]/(main)/manual-de-usuario/layout.tsx` (barra del manual y
  guarda de lector), `.../manual-de-usuario/entrar/page.tsx`
- Modify: `src/app/auth/callback/route.ts`, `src/proxy.ts`,
  `src/app/sitemap.ts` (verifica que no incluya el manual), `src/messages/es.json`
  y `en.json` (clave `manual`)

**Interfaces:**
- Consumes: `getReader` (tarea 2) y `getManual` (tarea 5), este último solo
  para distinguir el caso `no-configurado`.
- Produces:
  - `safeNext(next: string | null, fallback: string): string`: acepta solo
    rutas que empiezan con `/`, rechaza `//`, `/\` y esquemas.
  - Constante `MANUAL_BASE = '/manual-de-usuario'` en `src/lib/manual/paths.ts`,
    con `notaHref(slug, r?)`, `recorridoHref(slug)`, `mapaHref` y `grafoHref`.

Comportamiento:
- **Proxy:**
  - `/(en)/manual-de-usuario(.*)` → 307 a `/es/manual-de-usuario$1`.
  - `/es/manual-de-usuario/(mapa|r|n|grafo)…` sin sesión → `/es/manual-de-usuario/entrar?next=<ruta>`.
  - La portada y `entrar` son libres.
- **Layout:** las rutas protegidas sin lector muestran `t('manual.sinAcceso')`
  sin tocar `getManual`. Si `getManual` devuelve `no-configurado`, muestra
  `t('manual.noDisponible')`, y si devuelve `fallo`, `t('manual.fallo')`.
  `metadata.robots = { index:false, follow:false }`.
- **Entrar:** usa `signInWithOtp({ email, options: { shouldCreateUser:false, emailRedirectTo: origin + '/auth/callback?next=' + encodeURIComponent(safeNext(next, '/es/manual-de-usuario/mapa')) } })`
  y siempre responde "Si tienes acceso, te llegó un enlace", para no revelar
  quién está invitado.
- **Callback:** `next = safeNext(searchParams.get('next'), '/es/admin/comments')`.

- [ ] **Step 1: Failing tests:**
  - `safeNext` con `'/es/manual-de-usuario/mapa'` lo deja igual; con `'//evil.com'`, `'https://evil.com'`, `'/\\evil.com'` y `null` devuelve el fallback.
  - Test de proxy: `/en/manual-de-usuario/n/x` → 307 a `/es/manual-de-usuario/n/x`; `/es/manual-de-usuario/mapa` sin sesión → redirige a entrar con `next`.
  - Test del callback con `next=//evil.com` → redirige a `/es/admin/comments`.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** `npx vitest run`. Expected: PASS.
- [ ] **Step 5: Commit** `feat(manual): entrada por enlace al correo y guardas de lector`

### Task 7: Portada, mapa, nota y recorrido

**Files:**
- Create, en `src/app/[locale]/(main)/manual-de-usuario/`: `page.tsx`
  (portada), `mapa/page.tsx`, `n/[slug]/page.tsx`, `r/[recorrido]/page.tsx`.
- Create, en `src/components/manual/`: `ManualMarkdown.tsx`, `CapaDesdeAqui.tsx`,
  `OcultarSergio.tsx` (cliente), `NotaMeta.tsx`, `BarraRecorrido.tsx`,
  `CopiarEnlace.tsx` (cliente) y tests en `src/components/manual/__tests__/`.

**Interfaces:**
- Consumes: `getManual`, `getReader`, `paths.ts`, `pasoVecinos`, `Resolver`.
- Produces: `ManualMarkdown({ md, resolve }: { md: string; resolve: Resolver })`.
  Renderiza `[[x|alias]]` como `<Link>` si resuelve y como
  `<span data-por-escribir>` si no. `[VERIFICAR…]` se muestra como
  `<mark data-verificar>por verificar</mark>` con el detalle en `title`.

Comportamiento:
- **Portada:** renderiza `sobre` con `ManualMarkdown`; si es null, usa
  `t('manual.sobreFallback')`. Incluye el botón "Entrar" y "Pedir acceso" →
  `/contact`. Con un lector activo redirige a `mapa`.
- **Mapa:** muestra las secciones y entradas `n · titulo`. En los momentos se
  ve primero la `puerta` y después el título en pequeño. Las entradas con nota
  enlazan a la nota, las que tienen `recorrido` enlazan al recorrido, y las demás
  aparecen apagadas.
- **Nota:**
  - Muestra el H1, la entrada, las capas con su rótulo visible, la meta
    (estado, confianza, lo que hizo la IA en cada capa y las fuentes en
    `<details>`), `llevar`, los backlinks y la barra de recorrido si hay
    `?r=`.
  - Agrega `CopiarEnlace` (copia `location.href` sin parámetros de seguimiento)
    y "Editar en GitHub" (solo si `reader.isAdmin`) →
    `https://github.com/serandmoncas/manual-de-usuario/edit/main/notas/<slug>.md`.
  - Un slug inexistente da `notFound()`.
- **Desde aquí:** `<details data-desde-aqui>` cerrado con `<summary>Desde aquí —
  {voz}</summary>`.
- **OcultarSergio:** guarda en `localStorage['manual.ocultarDesdeAqui']`
  (try/catch) y pone `data-ocultar-desde-aqui` en `<html>`. Un CSS en
  `globals.css` oculta `[data-desde-aqui]` bajo ese atributo.
- **Recorrido:** muestra nombre, para quién, resultado y los pasos numerados.
  Los pasos con nota enlazan a `notaHref(slug, recorrido)` y los que no
  aparecen apagados como "por escribir".

- [ ] **Step 1: Failing tests** de componentes:
  - `ManualMarkdown` renderiza un link para un destino resuelto, un span `data-por-escribir` para uno no resuelto y un `mark` para `[VERIFICAR: x]`.
  - Un `<script>` en el md se muestra como texto, no como elemento.
  - `CapaDesdeAqui` está cerrado por defecto y muestra la voz.
  - `OcultarSergio` alterna el atributo y sobrevive a un `localStorage` que lanza error.
  - `BarraRecorrido` muestra "Paso 2 de 3" con enlaces correctos.
- [ ] **Step 2: Run** `npx vitest run src/components/manual`. Expected: FAIL.
- [ ] **Step 3: Implement** con los tokens del sitio, la columna `max-w-[68ch]` y `font-mono` en los rótulos.
- [ ] **Step 4: Run** `npx vitest run && npm run build`. Expected: PASS y build OK. Sin token, el build no debe fallar porque las páginas son dinámicas.
- [ ] **Step 5: Commit** `feat(manual): portada, mapa, notas y recorridos`

### Task 8: Comentarios

**Files:**
- Create: `src/lib/manual/comment-schema.ts`, `src/app/api/manual/comments/route.ts` y su test, `src/components/manual/Comentarios.tsx` (cliente) y su test
- Modify: `src/lib/resend.ts`, al que se agrega `sendManualCommentNotification`

**Interfaces:**
- Consumes: `getReader`.
- Produces:
  - `GET /api/manual/comments?slug=<slug>` → `{ comments: { id, author_name, body, created_at, mine: boolean }[] }`.
    Ordena por `created_at` ascendente y **no incluye `author_email`**.
  - `POST /api/manual/comments { note_slug, body }` → `{ comment }`. Usa
    `author_name` y `author_email` del lector, nunca los del cuerpo de la
    petición.
  - `sendManualCommentNotification({ note_slug, author_name, body })`: correo de
    texto plano a `CONTACT_EMAIL` con el asunto
    `Comentario en el manual: <note_slug>`.

- [ ] **Step 1: Failing tests:**
  - GET y POST sin lector → 401.
  - POST con `body` vacío o de 4001 caracteres → 400.
  - POST válido inserta con el nombre del lector aunque el cuerpo traiga `author_name:'Otro'`.
  - La notificación se llama si `!isAdmin` y no se llama si es admin.
  - Si la notificación falla, la respuesta sigue siendo 200.
  - GET no devuelve `author_email`.
  - Componente: envía, limpia el campo y muestra el nuevo comentario.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement** y monta `<Comentarios slug>` al final de la página de la nota.
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Commit** `feat(manual): comentarios entre lectores`

### Task 9: Grafo

**Files:**
- Create: `src/app/[locale]/(main)/manual-de-usuario/grafo/page.tsx`, `src/components/manual/Grafo.tsx` (cliente) y su test
- Modify: `package.json`, con `d3-force` y `@types/d3-force`

**Interfaces:**
- Consumes: `Grafo` (tarea 4), pasado como prop serializable, y `notaHref`.
- Produces: `Grafo({ grafo, actual?, compacto? }: { grafo: Grafo; actual?: string; compacto?: boolean })`.

Comportamiento:
- Simulación `forceSimulation` con `forceLink`, `forceManyBody` y `forceCenter`,
  dibujada en SVG.
- Los nodos `existe` usan el color `accent` y abren la nota al hacer clic o
  tocar. Los nodos `existe:false` van en gris y no abren nada.
- El nodo `actual` va más grande. Se puede arrastrar con *pointer events*, lo
  que funciona en móvil.
- En la página de la nota se monta `compacto` con el vecindario de un salto.
- Respeta `prefers-reduced-motion`: corre la simulación sin animar y dibuja el
  estado final.

- [ ] **Step 1: Failing test:** renderiza un `<a>` o `role=link` por nodo existente con su `href`, ningún enlace para los nodos inexistentes y `aria-label` con el título.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** `npx vitest run && npm run build`. Expected: PASS.
- [ ] **Step 5: Commit** `feat(manual): vista de grafo`

### Task 10: Panel de administración del manual

**Files:**
- Create: `src/app/[locale]/(main)/admin/manual/page.tsx`
- Create, en `src/app/api/admin/manual/`: `readers/route.ts` (GET, POST, DELETE), `comments/[id]/route.ts` (DELETE), `refresh/route.ts` (POST) y sus tests
- Modify: la navegación del admin (`admin/layout.tsx` o `page.tsx`), para agregar el enlace "Manual"

**Interfaces:**
- Consumes: `requireAdmin`, `normalizeEmail` y `getManual` (para listar `rotas` y `huerfanas`).
- Produces:
  - `POST /api/admin/manual/readers { email, name, note? }`: hace upsert con
    el correo normalizado y luego
    `auth.admin.inviteUserByEmail(email, { redirectTo: origin + '/auth/callback?next=/es/manual-de-usuario/mapa' })`.
    Si el usuario ya existe (error de Supabase "already registered"), no
    reenvía y responde `{ invited:false, existed:true }`. En ese caso el lector
    entra por `/entrar`.
  - `DELETE /api/admin/manual/readers?email=`.
  - `DELETE /api/admin/manual/comments/[id]`.
  - `POST /api/admin/manual/refresh` → `revalidateTag('manual')`.

Página: tabla de lectores (nombre, correo, invitado el, quitar),
formulario de invitar, últimos 50 comentarios con su nota y opción de borrar,
botón "Refrescar contenido" y la lista de notas rotas y huérfanas.

- [ ] **Step 1: Failing tests:**
  - Las cuatro rutas responden 403 a un no admin.
  - POST readers con `' Ana@Mail.com '` guarda `ana@mail.com`.
  - POST sin `name` → 400.
  - Con "already registered" responde `existed:true` sin error.
  - Refresh llama a `revalidateTag('manual')`.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** `npx vitest run`. Expected: PASS.
- [ ] **Step 5: Commit** `feat(manual): panel admin de lectores y comentarios`

### Task 11: Enlace en el sitio, documentación y verificación final

**Files:**
- Modify: `src/components/Nav.tsx` (agrega `{ href: '/manual-de-usuario', label: t('manual') }` al grupo donde están `biblioteca` y `aves`), `src/messages/es.json` y `en.json`, `CLAUDE.md` (sección Manual: env vars, rutas y la regla "ningún texto del manual en este repo")
- Create (en el repo **privado** `manual-de-usuario`, no en este): `sobre.md`, un borrador marcado `ia: redactora` para que Sergio lo revise. Dice qué es el manual, que se lee por invitación, cómo está hecho (tres capas, voz de Sergio en "desde aquí") y qué hizo la IA.

- [ ] **Step 1:** Test del Nav: aparece el enlace "manual" con `href` `/manual-de-usuario`.
- [ ] **Step 2: Run** `npx vitest run`. Expected: FAIL hasta agregarlo y PASS después.
- [ ] **Step 3: Verificación manual en local** con `.env.local` que tenga `MANUAL_GITHUB_TOKEN` y `ADMIN_EMAILS`:
  - `npm run dev`; iniciar sesión como admin y recorrer mapa → nota → recorrido → grafo.
  - Alternar "ocultar Sergio" y dejar un comentario.
  - Sin sesión, `/es/manual-de-usuario/mapa` redirige a entrar.
  - Quitar el token en `.env.local`: la página dice "No disponible…".
  - Resultado: "verificado manualmente".
- [ ] **Step 4: Run** `npm run lint && npx vitest run && npm run build`. Expected: todo en verde.
- [ ] **Step 5: Commit** `feat(manual): enlace en el sitio y documentación`. El push de `sobre.md` al repo del manual y el merge a `main` del sitio esperan la aprobación de Sergio.
