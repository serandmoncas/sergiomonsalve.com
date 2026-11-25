# Manual de Usuario en sergiomonsalve.com — diseño

- **Fecha:** 2026-11-25
- **Estado:** aprobado por Sergio en la conversación ("si, apruebo")
- **Decisión de fondo:** ADR-004 en el repo privado `serandmoncas/manual-de-usuario`

## Intención

Sergio escribe el *Manual de Usuario*, un libro no lineal para entender la vida y
sus momentos. Es contenido personal que vive en un repo **privado**. Sergio
quiere leerlo cómodamente en `sergiomonsalve.com/manual-de-usuario`: navegar por
mapa, recorrido y grafo, comentar, compartir con personas que él invite y saltar
a editar. Por ahora el manual es para él y sus invitados, no para el público.

## Objetivos

1. Leer cada nota en una página propia que muestre sus tres capas (ADR-003):
   "Lo que nos pasa a todos", "Cómo lo han vivido y pensado otros" y "Desde
   aquí — <voz>". Esta última se pliega y hay un interruptor global "ocultar
   Sergio".
2. Navegar de cuatro formas:
   - **Mapa:** el índice numerado (`indice.yml`), con las entradas sin nota
     visibles pero apagadas.
   - **Recorrido:** lectura continua (`recorridos/*.md`) con anterior y
     siguiente.
   - **Enlaces de vuelta** en cada nota.
   - **Grafo** de notas y enlaces, donde un clic abre la nota.
3. Acceso solo para Sergio (admin) y para los correos que él invite, con inicio
   de sesión por enlace al correo.
4. Comentarios por nota entre invitados, sin moderación previa. El admin puede
   borrarlos.
5. "Copiar enlace" en cada nota. "Editar" (solo admin) abre el archivo en
   GitHub.
6. Lo que Sergio sube al repo del manual se ve en el sitio en 5 minutos o menos,
   sin redeploy.

## No-objetivos

- Búsqueda de texto, narración en audio, versión en inglés y editor dentro del
  sitio.
- Capas públicas (opción 3). El diseño no debe impedirlas: la visibilidad se
  decide por capa en un solo lugar.

## Antiobjetivos (fracaso aunque funcione)

- **Que el contenido de las notas llegue al repo público** del sitio, sea en
  `content/`, en fixtures de tests con texto real o en snapshots. Los tests usan
  notas inventadas.
- Que una persona no invitada, o un buscador, lea una nota. Las notas no van en
  el sitemap, llevan `noindex` y nunca se generan como estáticas públicas.
- Que un lector invitado gane acceso a `/admin` o a `/api/admin/*` (ver
  Restricciones).
- Que el token de GitHub llegue al navegador.

## Restricciones y hallazgos

- **Stack del sitio:** Next.js 16.2.4 (App Router, `src/proxy.ts` en vez de
  middleware), next-intl (`/es`, `/en`), Supabase (auth y BD), Tailwind v4 con
  los tokens de `globals.css`, Vitest y Testing Library. El deploy a producción
  ocurre al hacer push a `main`.
- **El repo del sitio es público.** Las notas se leen en el servidor desde la API
  de GitHub con `MANUAL_GITHUB_TOKEN`: un token fine-grained, de solo lectura y
  limitado a `serandmoncas/manual-de-usuario`. Se usa `fetch` con
  `next: { revalidate: 300, tags: ['manual'] }`.
- **Hallazgo de seguridad previo:** `/admin/*` (proxy) y `/api/admin/*` solo
  verifican que *haya* sesión, no que sea el admin. Los estudiantes de cursos ya
  pueden iniciar sesión, y los lectores del manual también podrán. **Requisito
  previo:** un helper `requireAdmin()` basado en `ADMIN_EMAILS` (variable de
  entorno, lista separada por comas), aplicado en el proxy para `/admin` y en
  cada ruta `/api/admin/*`.
- **Contenido del repo del manual** (rama `main`):
  - `notas/*.md`: frontmatter YAML con `titulo`, `estado`, `confianza`,
    `ia_capas`, `voces`, `fuentes`, `verificado`, `relacionados` (wikilinks) y
    `terminos`. Se ignoran los archivos que empiezan con `_`.
  - Cuerpo: `# Título`, un párrafo de entrada, `## Lo que nos pasa a todos`,
    `## Cómo lo han vivido y pensado otros`, el callout
    `> [!desde-aqui]- <Voz>` (varias líneas con `> `), `## Para llevarte` y
    `## Relacionado`.
  - Wikilinks `[[slug]]` o `[[Título]]`. Se resuelven por nombre de archivo y,
    si no, por `titulo`. Si no resuelven, se muestran como texto apagado (nota
    por escribir).
  - Marcas `[VERIFICAR: …]` en el texto. Se muestran como una etiqueta visible
    "por verificar", no se ocultan.
  - `indice.yml`: `secciones[] { id, titulo, entradas[] { n, titulo, puerta?,
    confianza, nota?, recorrido? } }`.
  - `recorridos/<slug>.md`: título en `# Recorrido — <nombre>` y la lista
    numerada bajo `## Notas, en orden`. Se ignora `TEMPLATE.md`.
- **Las URLs son estables:** `/[locale]/manual-de-usuario/n/<slug-de-archivo>`.
  Solo existe en `es`. En `/en/manual-de-usuario…` se redirige a `/es/…`.

## Diseño

### Rutas

| Ruta | Acceso | Qué muestra |
|---|---|---|
| `/es/manual-de-usuario` | pública | Portada "Sobre este manual": qué es, qué hizo la IA, cómo pedir acceso y el botón Entrar. Si hay sesión de lector, redirige al mapa. |
| `/es/manual-de-usuario/entrar` | pública | Formulario de correo → enlace mágico (`signInWithOtp`, `shouldCreateUser: false`) con `next` hacia el manual. |
| `/es/manual-de-usuario/mapa` | lector | El índice por secciones. |
| `/es/manual-de-usuario/r/<recorrido>` | lector | Las notas del recorrido seguidas, con anterior y siguiente. |
| `/es/manual-de-usuario/n/<slug>` | lector | La nota, con capas, enlaces de vuelta, comentarios, copiar enlace y editar. |
| `/es/manual-de-usuario/grafo` | lector | El grafo global. |
| `/es/admin/manual` | admin | Lectores (invitar o quitar), últimos comentarios (borrar) y botón "refrescar contenido" (`revalidateTag('manual')`). |

Raíz corta: `/manual-de-usuario` → `/es/manual-de-usuario`, que next-intl ya
resuelve por el idioma por defecto. Hay que verificarlo.

### Acceso

- **Lector** = usuario con sesión cuyo correo está en `manual_readers` o en
  `ADMIN_EMAILS`.
- **Proxy:** las rutas del manual, salvo la portada y `entrar`, exigen sesión. Si
  no la hay, redirigen a `entrar`.
- **Layout del manual:** verifica en el servidor que el correo sea de un lector.
  Si no lo es, muestra "No tienes acceso; pídeselo a Sergio" sin filtrar
  contenido.
- **Callback:** el enlace mágico vuelve por `/auth/callback?next=/es/manual-de-usuario/mapa`.
  `next` se valida: debe empezar por `/` y no por `//`; si no, se usa el valor por defecto.
- **Invitar** (admin): inserta en `manual_readers` y llama a
  `auth.admin.inviteUserByEmail` (o `generateLink`) con `redirectTo` hacia el
  manual. Quitar a un lector borra la fila; la cuenta de auth se conserva.

### Datos (migración `008_manual.sql`)

```
manual_readers(email text primary key (lowercase), invited_at timestamptz default now(), note text)
manual_comments(id uuid pk, note_slug text not null, user_id uuid fk auth.users,
                author_email text not null, body text not null check (length 1..4000),
                created_at timestamptz default now())
```

RLS activado en ambas tablas, sin políticas públicas: todo pasa por las rutas
API con `createAdminClient()` después de verificar al lector o al admin, igual
que el resto del sitio.

### Contenido (`src/lib/manual/`)

- `source.ts`: lista y trae los archivos del repo (árbol `notas/`, `recorridos/`
  e `indice.yml`) con el token. Es la única capa que toca la red.
- `parse.ts` (puro): frontmatter, extracción de capas, callouts `desde-aqui`,
  wikilinks y marcas `[VERIFICAR]`. Devuelve
  `Nota { slug, titulo, estado, confianza, iaCapas, voces, fuentes, entrada, capas: { todos?, otros?, desdeAqui?: { voz, md } }, llevar?, enlaces: slug[] }`.
- `graph.ts` (puro): construye `{ nodes, links }` a partir de las notas y los
  enlaces de vuelta, y marca las notas huérfanas.
- `indice.ts` y `recorridos.ts` (puros): parsean y cruzan con las notas
  existentes.
- **Render:** el pipeline Markdown del sitio (`react-markdown` + `remark-gfm`) con
  un renderizador de wikilinks. No se usa `next-mdx-remote`, porque el contenido
  no es de confianza para ejecutar.

### Interfaz

- Usa el sistema de diseño del sitio (fondo oscuro, `accent`, `font-mono` en los
  rótulos) y una columna de lectura cómoda (~68ch). Las tres capas llevan su
  rótulo visible. "Desde aquí" va como `<details>` cerrado, con borde y la voz
  firmada.
- **"Ocultar Sergio":** un interruptor en la barra del manual que se guarda en
  `localStorage` (con try/catch). Oculta todas las capas "desde aquí".
- **Metadatos de la nota:** `estado` (semilla, brote o perenne), `confianza`, lo
  que hizo la IA en cada capa y las fuentes plegadas.
- **Grafo:** componente cliente con fuerza dirigida (`d3-force` sobre canvas o
  SVG; el constructor elige). Los nodos de notas están encendidos y la nota
  actual resaltada. Debe funcionar en móvil (arrastrar y tocar para abrir).
- **Enlace en el sitio:** en el Nav o el Footer, "Manual de usuario" hacia la
  portada. El constructor decide la ubicación según el patrón actual del Nav.

### Errores

- Si GitHub falla o el token es inválido, se muestra "No pude traer el manual
  ahora" y se registra en el log del servidor. No se muestran datos parciales
  como si estuvieran completos.
- Un slug inexistente da 404 dentro del layout del manual.
- Si un archivo tiene frontmatter roto, esa nota se omite, se registra en el log
  y el admin la ve listada en `/admin/manual`.

## Enfoques considerados

1. **Dentro del sitio Next.js, con lectura en servidor desde el repo privado y
   acceso por invitación** (elegido). Reusa la autenticación y los patrones del
   sitio, mantiene las notas fuera del repo público y deja abierta la opción de
   capas públicas.
2. **Quartz en un proyecto aparte detrás de un rewrite.** Era más rápido para ver
   el grafo, pero no permite restringir el acceso y solo tiene comentarios si el
   repo es público. Se descartó porque el contenido es personal.
3. **Copiar las notas al repo del sitio en cada build.** Se descartó porque el
   repo es público.

## Lo que queda al constructor

La librería exacta del grafo, la ubicación del enlace en el Nav, los
componentes visuales internos y el formato del correo de invitación (sin
plantillas nuevas de Resend si no hace falta).

## Pasos que requieren a Sergio (no los hace el agente)

1. Crear el token fine-grained de GitHub y guardarlo en Vercel (Production y
   Preview) como `MANUAL_GITHUB_TOKEN`, junto con `ADMIN_EMAILS`.
2. Aprobar la aplicación de `008_manual.sql` en la BD de producción.
3. Agregar la URL de redirección del manual en Supabase → Auth → URL
   Configuration, si hace falta.
4. Aprobar el merge a `main`, que publica el sitio.

## Decisiones tras la revisión del constructor (2026-11-25, decisiones de Claude)

1. **Autor de un comentario:** `manual_readers` agrega `name text not null`, que
   Sergio escribe al invitar, y `manual_comments` guarda `author_name`. Los
   lectores solo ven el nombre. **El correo nunca se muestra a otros lectores.**
   Para el admin se toma el nombre de `ADMIN_NAME` (por defecto "Sergio").
2. **Recorrido:** se lee una nota por paso.
   - `/r/<recorrido>` es la página del recorrido: título, para quién, resultado
     y los pasos numerados. Los pasos sin nota aparecen apagados como "por
     escribir".
   - Para entrar a una nota desde el recorrido se usa
     `/n/<slug>?r=<recorrido>`. La nota muestra una barra de contexto ("Paso 2
     de 8 · Lo que todos vivimos") con anterior y siguiente, que **saltan los
     pasos sin nota**. Los comentarios siguen siendo por nota.
3. **Destinos de wikilinks:** se resuelven primero contra notas (por archivo y
   luego por `titulo`) y después contra recorridos (por slug y luego por
   nombre).
   - Los enlaces a recorridos se ven como enlaces y no cuentan como backlinks.
   - `terminos` se muestran como etiquetas de texto, sin enlace, hasta que exista
     el glosario.
   - Un wikilink que no resuelve se muestra como texto apagado.
4. **Grafo:** nodos encendidos para las notas existentes y nodos apagados ("por
   escribir") para los destinos de wikilinks que no resuelven. Los recorridos,
   los términos y las entradas de `indice.yml` sin nota quedan fuera. Una nota
   es **huérfana** si nadie la enlaza y ella no enlaza a nadie, sin contar
   `relacionados` hacia recorridos.
5. **Portada pública:** el texto vive en el repo privado como `sobre.md`, sin
   frontmatter obligatorio, y lo redacta Claude con la marca `ia: redactora`
   para que Sergio lo revise. Es contenido público a propósito y se trae con el
   token y caché. Si no existe, se usa un texto mínimo en `es.json`. "Pedir
   acceso" enlaza al formulario de contacto existente (`/contact`) con el asunto
   prellenado si el formulario lo permite.
6. **Aviso de comentarios:** cada comentario nuevo de un lector que no sea admin
   envía un correo de texto plano a `CONTACT_EMAIL` usando la configuración de
   Resend que ya existe. Si el envío falla, se registra en el log y el
   comentario se guarda igual.
7. **Previews:** `MANUAL_GITHUB_TOKEN` se configura **solo en Production**. En
   Preview el manual muestra "No disponible en esta vista previa", así las
   previews no leen notas reales ni escriben en la BD de producción. Para probar,
   se usa local con `.env.local`.
