# Post "Autorretrato con IA" — Design Spec

**Fecha:** 2026-10-15
**Solicitante:** Sergio Monsalve
**Tipo:** post nuevo del blog (es/en) con análisis de datos propios y visualizaciones interactivas.

## 1. Propósito y audiencia

Un post que analiza, con datos reales, cómo Sergio usa la IA: con qué herramientas, en qué proyectos, cómo le habla y qué conceptos domina frente a los que no. Cumple tres funciones a la vez (decisión explícita: "todos los anteriores"):

1. **Autorretrato honesto** para cualquier lector del blog: tono de bitácora en primera persona.
2. **Vitrina para MAPA**: los datos son prueba de experiencia. Cierra con un CTA suave hacia los cursos y Experiencias IA.
3. **Metodología replicable**: una sección final "Hazlo tú" explica cómo correr el mismo análisis sobre `~/.claude` y un GitHub propio.

**Criterio de éxito:** cada afirmación del post se apoya en una cifra del JSON generado o está marcada explícitamente como *declarada*. Ningún texto privado sale del equipo de Sergio sin su aprobación.

## 2. Fuentes de datos

| Fuente | Qué aporta | Tipo |
|---|---|---|
| `~/.claude/history.jsonl` | ~2.600 prompts con proyecto y fecha: lenguaje, conceptos, proyectos | medido |
| `~/.claude/projects/*/*.jsonl` | ~74 sesiones completas (mar–oct 2026): modelos, herramientas, skills, MCPs, subagentes | medido |
| `~/.claude/stats-cache.json` | actividad diaria desde feb 2026 (mensajes, sesiones, tool calls) | medido |
| GitHub `serandmoncas` vía `gh api` | ~1.440 commits en ~32 repos (feb–oct 2026): trailer `Co-Authored-By` con el **modelo exacto**, autor, prefijo convencional, largo del mensaje, mes, lenguajes, manifiestos de dependencias | medido |
| GitHub `smonsalve` vía `gh api` (cuenta antigua, 2008–2026) | **línea base anterior a la IA**: repos públicos propios (sin forks), solo commits de las identidades de Sergio (ver §4.1); coautores humanos | medido |
| `scripts/ia-autorretrato/contexto.json` (nuevo) | cifras externas del discurso público, cada una con fuente, fecha y URL verificada (origen: anexo `anexos/autorretrato-ia/contexto-discurso.md`) | externo |
| `src/lib/experiencias-ia/glosario.ts` | universo de ~200 conceptos con categoría | referencia |
| `src/components/about/content.ts` (`stackGroups`) | lo que Sergio declara dominar | declarado |
| `scripts/ia-autorretrato/declarado.json` (nuevo) | ChatGPT/OpenAI, Claude.ai, Gemini/Antigravity, Cursor, Ollama: uso típico y valoración propia | declarado |

**Fuera de alcance (decidido):**
- No se exportan historiales de ChatGPT ni de Claude.ai. Esas herramientas van como *declaradas*.
- No se incluye la cuenta de GitHub `sergio-operions`, ni siquiera agregada.
- Cursor y Antigravity tienen rastros locales mínimos (72K/48K) y no se parsean; van como declaradas.

## 3. Contenido del post (secciones)

0. **El contexto.** Qué dice el mundo sobre IA, escritura, coautoría y código: 6–8 cifras verificadas (Google 75 %, ~4 % de commits públicos de GitHub con firma de Claude Code, METR, Stack Overflow 2025/2026, GitClear, ICMJE, Thaler/Copyright Office, Cornell sobre homogeneización) y el mapa de posturas (entusiastas, escépticos, ingeniería agéntica, mantenedores defensivos, juniors y desgaste de habilidades, autoría). Se cierra con el vacío de datos sobre Latinoamérica. Componente: `MapaDiscurso`, un grafo de ~20 conceptos del debate con sus relaciones (vibe coding ↔ agentic engineering, Co-Authored-By ↔ Assisted-by, Signed-off-by ↔ responsabilidad, autoría ↔ accountability, homogeneización ↔ voz propia…). Los conceptos que también aparecen en los prompts de Sergio se resaltan.
1. **La línea de tiempo.** Heatmap tipo calendario de la actividad diaria en Claude Code, con los commits por mes superpuestos. Pregunta que responde: ¿las conversaciones se convierten en código publicado?
2. **Dónde pongo la IA.** Prompts por proyecto, agrupados por dominio: producto web, hongos/IoT, educación, agentes, experimentos. Solo los repos públicos aparecen por nombre.
3. **Cómo trabajo con ella.** Mezcla de herramientas del agente (Bash, investigación web, navegador, subagentes, skills, MCPs) y modelos usados. Lectura: "delego ejecución, me quedo con el criterio".
4. **Dos eras.** Comparación entre `smonsalve` (2013–2025) y `serandmoncas` (2026). Cifras de la exploración (se recalculan en el pipeline):
   - Volumen: ~420 commits propios en 12 años (incluye `horus`) frente a ~1.440 en ~8 meses.
   - Escritura: mediana del mensaje de commit de 8–16 caracteres frente a 139 (88 sin el trailer).
   - Coautores: personas (compañeros y socios) frente a 6 modelos de Claude que se relevan (Sonnet 4.6 → Sonnet 5 → Opus 5 → Opus 5.5, más Opus 4.7 y Haiku 4.5 puntuales).
   - Porcentaje mensual co-firmado por Claude (~50 % en may–jul, 60 % en ago, 96 % en oct). Desglose por tipo: `docs` con Claude 228 frente a 57 solo humano, `feat` 228 frente a 163. Los tipos solo humanos son de dominio (`cultivo`, `capacitacion`).
   - Claude como **autor principal** (69 commits en `New-Old-School`), no solo como coautor.
   - Componentes: `CoautoriaMensual` y `RedCoautoria`, un grafo bipartito autores ↔ repos agrupados por dominio, con las dos eras lado a lado y los modelos como nodos propios ordenados por fecha.
   - Advertencias obligatorias: el trailer mide quién *hizo el commit* y es un piso, igual que el ~4 % de SemiAnalysis; la configuración del flujo cambia la cifra (en octubre Claude commitea por defecto); de `smonsalve` solo se ven repos públicos.
5. **El ecosistema.** Matriz de herramientas con la etiqueta visible *medido* o *declarado*.
6. **Domino vs. no domino.** Cuadrante de conceptos con dos ejes:
   - **Hablado:** el término aparece en prompts usado como instrucción. Si solo aparece en preguntas ("qué es", "explícame", "cómo funciona"), se marca como *preguntado*.
   - **Construido:** el término o la tecnología aparece en el código de los repos (lenguajes, dependencias, frameworks) o en `stackGroups` respaldado por código.
   - Resultado por concepto: `ambos` · `solo hablado` · `solo construido` · `ninguno`, más el indicador `preguntado`.
7. **El camino hacia atrás.** Reconstrucción de todo lo que Sergio tuvo que aprender para llegar a las tecnologías que usa hoy, como un grafo de dependencias de conocimiento (DAG) que va del stack de 2026 a sus raíces de 2013 más una capa de fundamentos. Detalle en §4.3. Se presenta en dos formatos:
   - **En el post, `CaminoMotion`:** una animación "Rebobinar" de 45–60 s que reproduce el mecanismo de Claude Motion (escena JSON + `render(escena, t)`, como en los ejemplos de ClaudeDataViz). Arranca con el stack de hoy, retrocede año por año hasta 2013 mientras se encienden las dependencias, y luego avanza hasta hoy. Tiene línea de tiempo arrastrable, play/pausa y respeta `prefers-reduced-motion` (muestra el estado final, con el control disponible).
   - **Fuera del post, Claude Dashboard:** un Artifact real del tipo Dashboard en claude.ai. Eliges una tecnología de hoy y se ilumina su ascendencia, con una tabla de evidencia por nodo, contadores 🟢/🟡/⚪ por rama y "años desde la primera evidencia". Nace privado, y Sergio decide si lo comparte y lo enlaza desde el post.
   - Lecturas que el texto debe recoger: el trabajo actual con agentes depende de docencia y diseño experimental, no solo de programación; y lo que hoy se delega más (`docs`) es una habilidad que ya existía (LaTeX 2014).
8. **Cómo hablo con la IA.** Largo de los prompts, idioma, porcentaje de preguntas frente a órdenes y 5–8 citas aprobadas una por una.
9. **Tensiones.** Cinco preguntas abiertas que cruzan el contexto con los datos propios: ¿coautor o asistente (`Co-Authored-By` frente a `Assisted-by`)?; el trailer como piso de la medición; la paradoja de METR aplicada a Sergio (¿se siente más rápido? ¿hay una medida objetiva?); la revisión como nueva forma de autoría (Willison: *"But I'm not reviewing that code"*); y la voz propia de un autor colombiano frente a la homogeneización (Cornell). Este mismo post se declara coautoría.
10. **Hazlo tú + CTA.** Cómo correr el script y enlaces a MAPA y Experiencias IA.

El texto lo escribe Claude a partir de los datos, y Sergio lo revisa.

## 4. Arquitectura

```
scripts/ia-autorretrato/
  index.ts                 ← orquesta; `npx tsx scripts/ia-autorretrato/index.ts`
  fuentes/claudeCode.ts    ← history.jsonl, projects/*.jsonl, stats-cache.json
  fuentes/github.ts        ← `gh api` para N cuentas (serandmoncas, smonsalve): commits, trailers, lenguajes, manifiestos
  identidades.ts           ← qué autores son Sergio y qué repos se excluyen (§4.1)
  fuentes/declarado.ts     ← glosario.ts, stackGroups, declarado.json, contexto.json
  red.ts                   ← construye los grafos (coautoría por era y conceptos del discurso)
  contexto.json            ← cifras externas con URL verificada
  camino.json              ← DAG de conocimiento (editable)
  escena-motion.ts         ← export de la escena + prompt para /motion
  conceptos.ts             ← clasificador hablado/construido/preguntado
  dominios.ts              ← repo/proyecto → dominio (mapa explícito, editable)
  privacidad.ts            ← lista negra en ejecución + verificación del JSON final
  declarado.json
  __tests__/               ← vitest con fixtures pequeñas
data/ia-autorretrato.json  ← ÚNICA salida publicada (solo agregados)
.ia-autorretrato/          ← en .gitignore: citas-candidatas.json, conceptos-revision.csv
src/components/blog/ia-autorretrato/
  CalendarioActividad.tsx
  BarrasHerramientas.tsx
  CoautoriaMensual.tsx
  MatrizEcosistema.tsx
  CuadranteConceptos.tsx
  PerfilPrompts.tsx
  RedCoautoria.tsx         ← grafo bipartito, dos eras
  MapaDiscurso.tsx         ← grafo de conceptos del debate
  CaminoMotion.tsx         ← rebobinado del DAG (mecanismo Motion)
  caminoEscena.ts          ← escena + render(escena, t) puro
content/blog/{es,en}/YYYY-MM-DD-autorretrato-ia.mdx   ← fecha = día de publicación
```

**Decisión:** el pipeline es TypeScript (`npx tsx`), igual que los scripts existentes (`import-goodreads.ts`). Importa `glosario.ts` directamente y se prueba con el vitest del repo. No se agregan dependencias: `declarado.json` evita un parser YAML.

### 4.1 Identidades y exclusiones (cuenta `smonsalve`)

- **Son Sergio:** cualquier autor cuyo nombre empiece por `Sergio` (incluye `Sergio Monsalve at x230`) y `horus` (confirmado por Sergio el 2026-10-15).
- **Coautores humanos:** el resto de autores de los repos incluidos (p. ej. el socio de `lacasona` y los compañeros de EAFIT en `Zpp`/`tesis`). En el grafo aparecen como nodos "persona" **sin nombre** (Persona 1, 2…), por la regla de no nombrar terceros.
- **Repos excluidos:** `lacasona-errbit` y `leclub` (traen historial upstream ajeno: Errbit, Heroku) y todos los forks.
- Respuestas de la API para repos vacíos (objetos sin commit) se descartan.
- La salida del API se lee como flujo de JSON (`raw_decode`/equivalente): `gh --paginate --jq` puede concatenar objetos en una línea.

### 4.2 Grafos

- `RedCoautoria`: nodos = Sergio, personas anónimas, modelos (nombre normalizado sin sufijos como "(1M context)") y dominios de repos. Aristas ponderadas por número de commits. Dos paneles (2013–2025 | 2026) con el mismo layout. El layout se calcula **offline** en `red.ts` (posiciones fijas guardadas en el JSON), así el componente es un SVG estático, sin simulación de fuerzas en el navegador.
- `CaminoMotion`: usa el layout del DAG de §4.3 (x = año de la primera evidencia, y = rama). Ver §4.3.
- `MapaDiscurso`: ~20 nodos de concepto y aristas tomadas del anexo, con el layout también precalculado. Resaltado = el concepto aparece en ≥1 prompt de Sergio (según el clasificador de §4).

### 4.3 El camino hacia atrás (DAG de conocimiento)

**Alcance (decidido):** todo lo que tiene evidencia desde 2013, más una capa de fundamentos inferidos (lógica, álgebra lineal, estadística, redes, electrónica). Son ~50–70 nodos.

**Fuente editable:** `scripts/ia-autorretrato/camino.json`, escrito a mano a partir del borrador aprobado y corregido por Sergio. El pipeline lo **enriquece**: para cada nodo con `repos` asociados, calcula la fecha de la primera evidencia desde los commits de `smonsalve` y `serandmoncas`, así la fecha no se escribe a mano.

```ts
type NodoCamino = {
  id: string
  etiqueta: string
  rama: 'agentes' | 'datos-ml' | 'web' | 'backend' | 'iot' | 'infra' | 'educacion' | 'escritura' | 'fundamentos'
  evidencia: 'github' | 'declarado' | 'inferido'   // 🟢 / 🟡 / ⚪
  repos?: string[]          // solo repos públicos; un repo privado se reemplaza por su dominio
  declaradoEn?: string      // p. ej. "about: stackGroups" o "about: experiencia Leonisa 2018–2020"
  primeraEvidencia?: string // YYYY-MM, calculada por el pipeline (o declarada)
  hoy?: boolean             // tecnología del stack de 2026 (nodo raíz del rebobinado)
}
type AristaCamino = { de: string; a: string }   // "a" depende de "de" (de = prerrequisito)
```

**Reglas:**
- El grafo es acíclico: un test lo verifica y también que todo nodo `hoy` alcance al menos un fundamento.
- Un nodo `inferido` no lleva fecha; en el Motion aparece al final del rebobinado como "raíz", sin año.
- Los nodos `inferido` solo entran si Sergio los aprueba (`.ia-autorretrato/camino-revision.csv`, mismo flujo que los conceptos).
- No hay nombres de empleadores ni de clientes en los nodos. La experiencia laboral solo sirve para fechar (`declaradoEn`).

**Borrador presentado el 2026-10-15** (sujeto a la corrección de Sergio): agentes/harness ← tool-calling ← APIs de LLM ← prompting; MCP ← JSON-RPC/HTTP APIs; evals ← diseño experimental (oTree 2017) ← estadística; RAG ← embeddings ← álgebra lineal, ML (DS4A 2019); Next.js/TS ← React ← JavaScript (2013) ← HTML/CSS (2013), tipado estático (Java 2013, Go 2016); Supabase/Postgres ← SQL/modelo relacional (Rails 2013); FastAPI ← Flask (2020) ← Django (2015) ← Python (2014) ← programación (Ruby/Java/C++ 2013); ESP32/MQTT ← C++ (2013) ← sensores (2017–2018) ← electrónica; React Native ← React + móvil (Android 2013); deploy ← Heroku ← git ← Linux/shell; datos ← scraping (2018), Tableau (2018), Dash (2021); MAPA ← metaaprendizaje ← maestría en educación ← docencia (2016–2017) ← producción de contenidos (2014); specs/docs con Claude ← escritura técnica en LaTeX (2014–2015).

**`CaminoMotion` (mecanismo de Claude Motion):**
- `escena = { duracion, fases: [{tipo: 'presente' | 'rebobinar' | 'raices' | 'avanzar', inicio, fin}], nodos, aristas }`, derivada de `camino.json`.
- `render(escena, t)` es una función pura: dado `t`, calcula qué nodos y aristas son visibles y su opacidad. Con eso el componente dibuja el SVG. La función es testeable sin navegador.
- El componente es `'use client'` y usa `requestAnimationFrame` y un `<input type="range">` para `t`. No hay librería de animación.
- **Export (fuera del sitio):** `npx tsx scripts/ia-autorretrato/escena-motion.ts` escribe la escena y un prompt listo para pegar en `/motion` de claude.ai, para que Sergio genere la versión oficial y la exporte a MP4 si quiere.

**Dashboard (Artifact del tipo Dashboard):**
- Se crea con el tipo `Dashboard` de claude.ai. Los datasets son **archivos JSON adjuntos**: `camino-nodos`, `camino-aristas` y `camino-evidencia`, generados desde `data/ia-autorretrato.json`, el mismo filtro de privacidad y nada que no sea público.
- Página: selector de tecnología de hoy → ascendencia iluminada (d3, que provee el tipo), tabla de evidencia (nodo, rama, 🟢/🟡/⚪, primera evidencia, fuente) y contadores por rama.
- Restricción del tipo: cualquiera que pueda abrir el dashboard puede leer los archivos adjuntos, y por eso solo llevan datos ya públicos.
- Se crea **después** de que el JSON pase la revisión de Sergio. Nace privado, y compartirlo o enlazarlo es decisión de Sergio.

### Flujo de datos

1. `index.ts` corre las tres fuentes, aplica `dominios` y `conceptos`, y produce un objeto tipado `AutorretratoIA`.
2. `privacidad.ts` serializa el objeto y **falla** si encuentra algo de esta lista: cualquier prompt de más de 40 caracteres literal del historial, nombres de repos privados (obtenidos de `gh repo list --json isPrivate`), correos o rutas absolutas `/Users/`.
3. Si pasa la verificación, escribe `data/ia-autorretrato.json` e imprime un resumen. Las citas candidatas y la tabla de conceptos para revisión van a `.ia-autorretrato/`.
4. Los componentes importan el JSON de forma estática (`import datos from '@/../data/ia-autorretrato.json'`) y el MDX los usa sin props de datos: `<CoautoriaMensual />`.

### Forma del JSON (resumen)

```ts
type AutorretratoIA = {
  generado: string                       // ISO date
  periodo: { desde: string; hasta: string }
  actividadDiaria: { fecha: string; mensajes: number; sesiones: number; herramientas: number }[]
  commitsPorMes: { mes: string; total: number; coautoriaClaude: number; porTipo: Record<string, number> }[]
  promptsPorDominio: { dominio: string; prompts: number; reposPublicos: string[] }[]
  herramientas: { nombre: string; usos: number; grupo: 'ejecucion' | 'investigacion' | 'navegador' | 'orquestacion' | 'mcp' | 'edicion' }[]
  modelos: { modelo: string; respuestas: number }[]
  ecosistema: { herramienta: string; fuente: 'medido' | 'declarado'; uso: string; intensidad: 1 | 2 | 3 }[]
  conceptos: { slug: string; termino: string; categoria: string; hablado: number; preguntado: number; construido: boolean; cuadrante: 'ambos' | 'solo-hablado' | 'solo-construido' | 'ninguno' }[]
  perfilPrompts: { total: number; medianaCaracteres: number; pctPreguntas: number; pctEspanol: number }
  eras: { cuenta: 'smonsalve' | 'serandmoncas'; desde: string; hasta: string; commitsPropios: number; reposActivos: number; medianaMensaje: number; medianaMensajeSinTrailer: number; coautores: { tipo: 'persona' | 'modelo'; n: number }[] }[]
  modelosPorMes: { mes: string; modelo: string; commits: number }[]
  grafoCoautoria: { era: string; nodos: { id: string; tipo: 'sergio' | 'persona' | 'modelo' | 'dominio'; etiqueta: string; x: number; y: number }[]; aristas: { de: string; a: string; peso: number }[] }[]
  grafoDiscurso: { nodos: { id: string; etiqueta: string; resaltado: boolean; x: number; y: number }[]; aristas: { de: string; a: string; motivo: string }[] }
  contexto: { cifra: string; mide: string; fuente: string; fecha: string; url: string }[]
}
```

### Clasificador de conceptos

- Normalización: minúsculas, sin tildes (se reutiliza la lógica de `src/lib/experiencias-ia/buscar.ts` si es exportable) y coincidencia por palabra completa.
- Sinónimos: un mapa pequeño y explícito en `conceptos.ts` (p. ej. `llm` ↔ `modelo de lenguaje`, `mcp` ↔ `model context protocol`).
- Un prompt cuenta como *pregunta sobre el concepto* si el término aparece en la misma oración que un patrón interrogativo/explicativo (`qué es`, `que significa`, `explícame`, `cómo funciona`, `what is`, `?` al cierre).
- *Construido*: coincidencia del término con lenguajes de GitHub, nombres de dependencias o un mapa término→señal en código (p. ej. `rag` → `pgvector|embeddings`, `agente` → `tool_use|function calling`).
- **Revisión humana obligatoria:** se genera `conceptos-revision.csv`. Sergio corrige y el CSV corregido se aplica como `overrides` en la siguiente corrida. El post menciona que hubo revisión manual y en qué proporción.

## 5. Visualización

- Componentes SVG hechos a mano, sin librería de gráficos. Son Server Components salvo los que necesitan tooltip o filtro (`'use client'` mínimo).
- Colores solo con tokens del sitio (`--color-accent`, `--color-text-secondary`, `--color-border`…), que ya cambian entre tema oscuro y claro. Se usa una sola serie de acento más grises, y se respeta la guía del skill `dataviz` para formas y etiquetas.
- Se registran en `MDXContent.tsx` dentro del mapa `components`.
- Responsive sin scroll horizontal a 360 px. El calendario se compacta por semanas en móvil.
- Accesibilidad: cada gráfico tiene `role="img"`, un `aria-label` con la cifra clave y un `<details>` con la tabla de datos.
- Bilingüe: las etiquetas de los componentes vienen de `src/messages/{es,en}.json` y los datos son los mismos.

## 6. Privacidad (decidida)

- Se publican solo agregados más 5–8 citas cortas de prompts, cada una aprobada por Sergio y pegada a mano en el MDX. El JSON publicado no contiene texto de prompts.
- Los repos privados cuentan en los totales, pero solo aparecen como dominio.
- Los nombres de terceros (personas del grupo, clientes) no aparecen.
- Antes del commit se corre `grep` del JSON contra la lista negra; además es un test.

## 7. Pruebas

- **vitest (pipeline):** parsers con fixtures de 5–10 líneas de cada fuente, clasificador (concepto usado / preguntado / ausente / sinónimo / tildes), `privacidad.ts` (debe rechazar un JSON con un prompt literal y con un repo privado).
- **vitest (identidades y red):** `horus` y las variantes de `Sergio` cuentan como Sergio; `lacasona-errbit`, `leclub` y los forks se excluyen; los objetos sin commit se descartan; los nombres de modelos se normalizan; ningún nodo "persona" lleva nombre real; el layout es determinista (misma entrada, mismas posiciones).
- **vitest (camino):** el DAG es acíclico; todo nodo `hoy` alcanza un fundamento; la primera evidencia se calcula desde los commits; ningún nodo nombra un repo privado ni un empleador; `render(escena, t)` es pura y monótona (en `rebobinar` el conjunto de nodos visibles solo crece, porque se van descubriendo prerrequisitos más antiguos; en `avanzar` los nodos se resaltan en orden cronológico); en `t = duracion` todo es visible.
- **vitest (contexto):** cada entrada de `contexto.json` tiene `url` https, `fecha` y `fuente` no vacías.
- **vitest (componentes):** cada componente renderiza con un JSON de ejemplo y expone su `aria-label`.
- **Manual:** `npm run dev` y revisión en el navegador de `/es/blog/<slug>` y `/en/blog/<slug>` a 360 px y en escritorio, tema claro y oscuro.
- `npm run lint`, `npm test` y `npm run build` pasan.

## 8. Flujo de trabajo y entrega

1. Pipeline y JSON → Sergio revisa `conceptos-revision.csv` y las citas candidatas.
2. Componentes con el JSON real.
3. Borrador del post en español → revisión de Sergio → versión en inglés.
4. Rama `feat/post-autorretrato-ia`, PR con capturas. El merge lo decide Sergio.

## 9. Riesgos y limitaciones (se declaran en el post)

- `projects/*.jsonl` solo cubre ~74 sesiones. Las métricas de herramientas son una muestra (mar–oct), no todo el historial.
- La coautoría en commits depende del flujo de trabajo: en octubre Claude commitea por defecto.
- El clasificador de conceptos es léxico. No mide comprensión, mide uso, y por eso existe la revisión manual.
- Las herramientas declaradas reflejan la percepción de Sergio, no una medición.
- `smonsalve` solo muestra repos públicos: el trabajo de esos años en empresas no aparece, así que la línea base subestima el volumen anterior a la IA.
- Las cifras externas (Google, Microsoft, Anthropic) son autodeclaradas por directivos y no son comparables entre sí. El post las presenta así.
- Las URLs de `contexto.json` se verificaron el 2026-10-15. Antes de publicar se vuelven a comprobar (sin 404).
