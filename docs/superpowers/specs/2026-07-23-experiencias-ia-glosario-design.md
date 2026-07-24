# Glosario para "Experiencias IA" — Design Spec

**Fecha:** 2026-07-23
**Solicitante:** Sergio Monsalve
**Contexto:** La Sesión 7 del grupo (`src/lib/experiencias-ia/data.ts`, `SESIONES[6].decisiones`) registró la decisión de crear "un glosario vivo de 40 términos clave en cuatro categorías: fundamentos, contexto y memoria, seguridad y control, operación y evaluación". El mismo ítem aparece en `BACKLOG` con prioridad alta. Ninguno de los dos archivos contiene los 40 términos en sí — solo la decisión y las 4 categorías.

## 1. Excepción explícita a la regla de "no inventar contenido"

El resto de la sección "Experiencias IA" exige que todo contenido sea trazable a `data.js`. Para este glosario específico, Sergio autorizó explícitamente una excepción: los términos, definiciones, ejemplos y referencias externas pueden incluir contenido que él no dictó literalmente, determinado por:
1. Qué tanto el grupo ha usado/mencionado el término en sesiones reales (trazable a `temas`, `conceptos`, `decisiones`, `tags` de participantes, o `BACKLOG` en `data.ts`).
2. Su importancia actual en el mundo de la IA, a criterio del asistente, para completar hasta 40.
3. Para referencias externas (artículos, papers, libros, sitios oficiales): investigadas con búsqueda web y verificadas como reales antes de citarlas. **Nunca se fabrica una URL** — si no se encontró algo confiable para un término, ese campo queda vacío (`undefined`), igual que las referencias con `url: ""` de la Sesión 7 original.

**Regla de trazabilidad interna (no es una excepción, es un requisito nuevo):** cada término que sí aparece en el contenido real del grupo lleva una marca de "sesión de origen" (número + link). Los términos agregados por criterio general de importancia no llevan esa marca. Esta distinción debe ser visualmente clara en la página — es lo que hace honesto un contenido que ya no es 100% transcripción.

## 2. Arquitectura: índice + subpágina por término

A diferencia de las demás vistas de la sección (que son páginas únicas), el glosario se estructura como **índice + detalle**, igual que Sesiones:

```
src/app/[locale]/experiencias-ia/glosario/
  page.tsx        ← índice: los 40 términos agrupados por categoría, cada uno linkeando a su detalle
  [slug]/
    page.tsx       ← detalle: término, definición, ejemplo (si existe), referencia externa (si existe), sesión de origen (si existe)
```

Cada término es un link compartible independiente (`/experiencias-ia/glosario/prompt-engineering`), consistente con por qué las sesiones también tienen su propia URL (la audiencia comparte enlaces puntuales por WhatsApp).

## 3. Modelo de datos

Nuevo archivo `src/lib/experiencias-ia/glosario.ts` — **no se modifica `data.ts`**, que se mantiene como transcripción fiel y exclusiva de `data.js`. El glosario es contenido nuevo autorizado, así que vive separado, dejando intacta la garantía de "todo lo que está en `data.ts` viene de `data.js`".

```ts
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
  sesionOrigen?: number // número de SESIONES[n].n si es trazable a una sesión real; ausente si es de criterio general
  ejemplo?: string // solo cuando ayuda a entender un término técnico/abstracto — no todos los términos lo llevan
  referencia?: ReferenciaGlosario // investigada y verificada; ausente si no se encontró algo confiable
}

export const CATEGORIAS: Record<CategoriaGlosario, string> = {
  'fundamentos': 'Fundamentos',
  'contexto-memoria': 'Contexto y memoria',
  'seguridad-control': 'Seguridad y control',
  'operacion-evaluacion': 'Operación y evaluación',
}

export const ORDEN_CATEGORIAS: CategoriaGlosario[] = [
  'fundamentos', 'contexto-memoria', 'seguridad-control', 'operacion-evaluacion',
]

export const GLOSARIO: TerminoGlosario[] = [ /* los 40 términos, ver sección 4 */ ]

export function getTerminosPorCategoria(categoria: CategoriaGlosario): TerminoGlosario[] {
  return GLOSARIO.filter(t => t.categoria === categoria)
}

export function getTermino(slug: string): TerminoGlosario | undefined {
  return GLOSARIO.find(t => t.slug === slug)
}
```

`sesionOrigen` es un `number` plano (no una referencia directa a `Sesion`) para no crear una dependencia circular más allá de lo necesario — la página de detalle resuelve `getSesion(sesionOrigen)` de `data.ts` solo cuando la necesita, para el título de la sesión en el link.

## 4. Los 40 términos (contenido completo, fuente de verdad)

La implementación transcribe estas 40 entradas literalmente — no se resume ni reformula la definición, el ejemplo ni la referencia. 26 llevan `sesionOrigen`; 13 llevan `referencia` (investigada y verificada con búsqueda web el 2026-07-23); 19 llevan `ejemplo`.

### Fundamentos

1. `prompt-engineering` — **Prompt engineering**: Un turno. `sesionOrigen: 7`. Ejemplo: "Cambiar 'resume esto' por 'resume esto en 3 viñetas, tono neutro, máximo 50 palabras' es prompt engineering: mejorar la instrucción de un solo turno." Referencia: Simon Willison — "Context engineering" (contrasta explícitamente prompt vs. context engineering), https://simonwillison.net/2025/Jun/27/context-engineering/, tipo `articulo`.
2. `context-engineering` — **Context engineering**: Una sesión. `sesionOrigen: 7`. Ejemplo: "Decidir qué documentos, historial de conversación y resultados de herramientas caben en la ventana de contexto de un agente antes de que responda — no es una instrucción, es diseñar todo el entorno informativo de la tarea." Referencia: Simon Willison — "Context engineering", https://simonwillison.net/2025/Jun/27/context-engineering/, tipo `articulo`.
3. `harness-engineering` — **Harness engineering**: Trabajo continuo: horas y cientos de decisiones, con herramientas, validación y restricciones arquitectónicas. `sesionOrigen: 7`. Ejemplo: "Un agente borra un archivo por error una vez; en vez de solo corregirlo, se agrega una regla permanente al harness (por ejemplo, un hook que bloquea `rm -rf` sin confirmación) para que ese error se vuelva estructuralmente imposible." Referencia: Mitchell Hashimoto — "My AI Adoption Journey" (sección "Engineering the harness", Paso 5), https://mitchellh.com/writing/my-ai-adoption-journey, tipo `articulo`.
4. `patron-de-hashimoto` — **Patrón de Hashimoto**: Cada error del agente se convierte en un arreglo permanente del entorno; el sistema se realimenta y mejora a sí mismo. `sesionOrigen: 7`. Sin ejemplo adicional (el ejemplo de harness engineering ya lo ilustra). Sin referencia propia (la misma que harness engineering).
5. `cinco-primitivas` — **Cinco primitivas**: Sistema de archivos, ejecución de código, sandbox controlado, memoria persistente y gestión de contexto. `sesionOrigen: 7`.
6. `rag` — **RAG (Retrieval-Augmented Generation)**: Técnica que recupera información de una fuente externa antes de generar la respuesta, en vez de depender solo del conocimiento entrenado en el modelo. *(sin sesión de origen)*. Ejemplo: "Antes de responder una pregunta sobre una póliza de seguros, el sistema busca primero el documento real de esa póliza y se lo pasa al modelo como contexto, en vez de confiar en lo que el modelo 'recuerda' de su entrenamiento." Referencia: Lewis et al. — "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks" (2020), https://arxiv.org/abs/2005.11401, tipo `paper`.
7. `mcp` — **MCP (Model Context Protocol)**: Protocolo abierto para conectar modelos con herramientas y fuentes de datos externas de forma estandarizada. *(sin sesión de origen)*. Ejemplo: "Un servidor MCP de Supabase le permite a un agente consultar tablas reales de una base de datos sin que el desarrollador tenga que escribir código de integración a mano." Referencia: Anthropic — "Introducing the Model Context Protocol", https://www.anthropic.com/news/model-context-protocol, tipo `articulo`.
8. `skills` — **Skills**: Unidades modulares de comportamiento o conocimiento que se le enseñan a un agente para una tarea específica. `sesionOrigen: 2`. Ejemplo: "Una skill de 'generar factura' le enseña al agente el formato exacto, los campos obligatorios y el tono de las facturas de una empresa específica, para no repetir esas instrucciones cada vez."
9. `skill-creator` — **Skill creator**: Skill de Anthropic para construir otras skills; camino para profesionalizar el uso de IA en vez de improvisar cada vez. `sesionOrigen: 4`. Referencia: Anthropic — "Extend Claude with skills" (documentación oficial), https://code.claude.com/docs/en/skills, tipo `sitio`.
10. `agentes` — **Agentes**: Sistemas que usan un modelo para decidir y ejecutar acciones de forma autónoma, no solo responder texto. `sesionOrigen: 8`.

### Contexto y memoria

11. `gestion-de-contexto` — **Gestión de contexto**: Administrar qué información cabe y permanece relevante dentro de la ventana de contexto de un modelo. `sesionOrigen: 2`. Ejemplo: "Decidir si un historial completo de chat cabe en la ventana de contexto o si hay que resumirlo antes de la siguiente pregunta."
12. `memoria-persistente` — **Memoria persistente**: Información que un agente conserva entre sesiones, más allá de una sola conversación. `sesionOrigen: 5`.
13. `revelacion-progresiva` — **Revelación progresiva**: Entregarle contexto al modelo por capas, según lo va necesitando, en vez de todo de una vez. *(sin sesión de origen — mencionada en tags de participante, no en el cuerpo de una sesión)*. Ejemplo: "En vez de darle a un agente el manual completo de 200 páginas de una vez, se le entrega solo la sección que necesita para el paso actual, y la siguiente cuando la pida."
14. `poda-de-contexto` — **Poda de contexto**: Eliminar deliberadamente información acumulada que ya no aporta, para no saturar la ventana de contexto. *(sin sesión de origen)*. Ejemplo: "Borrar deliberadamente los primeros 20 mensajes de una conversación larga cuando ya no aportan, para dejarle espacio a información nueva y relevante."
15. `obsidian` — **Obsidian**: Herramienta de notas enlazadas usada por varios del grupo como base de un "segundo cerebro". `sesionOrigen: 2`.
16. `segundo-cerebro` — **Segundo cerebro**: Sistema personal (típicamente en Obsidian) para centralizar contexto, ideas y notas de forma conectada. *(sin sesión de origen — mencionada en tags de participante)*. Ejemplo: "Guardar en Obsidian las notas de cada cliente, enlazadas entre sí, para poder preguntar 'qué sé de este cliente' en vez de buscar en la memoria o en correos sueltos." Referencia: Tiago Forte — "Building a Second Brain", https://www.buildingasecondbrain.com/book, tipo `libro`.
17. `jarvis` — **Jarvis (asistente personal)**: Proyecto tipo asistente personal que integra calendario, correo, WhatsApp y notas; limitado hoy por falta de memoria persistente real. `sesionOrigen: 5`.
18. `mempalas` — **MemPalas**: Herramienta de memoria institucional basada en la técnica de palacios de memoria, aplicada a bases de datos no estructuradas. `sesionOrigen: 3`. Ejemplo: "Asociar cada proceso interno de una oficina con un lugar imaginario de un edificio conocido, para recordar el orden de los pasos sin necesidad de un manual escrito." Referencia: Joshua Foer — "Moonwalking with Einstein" (origen de la técnica de palacios de memoria en la que se basa MemPalas), https://www.goodreads.com/book/show/6346975-moonwalking-with-einstein, tipo `libro`.
19. `infoxicacion` — **Infoxicación**: Saturación por exceso de información, concepto de Alfons Cornellá que el grupo adoptó para nombrar la fatiga de estar al día con IA. `sesionOrigen: 2`. *(sin referencia — no se encontró un artículo primario de Cornellá estable/verificable para citar; solo fuentes secundarias)*
20. `encapsulamiento` — **Encapsulamiento**: Aislar una funcionalidad para que se pueda usar sin conocer su implementación interna — principio de diseño que el grupo aplica también al contexto que se le da a un modelo. *(sin sesión de origen — mencionado en bio de participante, no en cuerpo de sesión)*. Ejemplo: "Un componente de interfaz que solo expone un botón con un texto, sin que quien lo usa tenga que saber cómo se implementa el estilo o el evento de clic por dentro."

### Seguridad y control

21. `friccion-productiva` — **Fricción productiva**: Puertas de diseño que obligan a un acto deliberado antes de avanzar; lo que realmente frena el sesgo de automatización, no la fuerza de voluntad. `sesionOrigen: 7`. Ejemplo: "Exigir que un plan de implementación sea aprobado explícitamente antes de que el agente toque código — ese paso extra es la fricción que evita que el sesgo de automatización apruebe algo mal sin revisar."
22. `metodologia-nemesis` — **Metodología Némesis**: Enfoque de interacción crítica y adversarial con los modelos, para no aceptar sus respuestas sin cuestionarlas. `sesionOrigen: 6`. Ejemplo: "En vez de aceptar la primera respuesta de un modelo, pedirle explícitamente que argumente el caso contrario, para exponer los puntos débiles del razonamiento original."
23. `seguridad-en-codigo-generado` — **Seguridad en código generado**: Disciplina de no confiar ciegamente en código producido por IA sin auditoría técnica antes de producción. `sesionOrigen: 6`.
24. `huellas-de-modelos` — **Huellas de modelos**: Patrones o estilos de escritura identificables que delatan qué modelo generó un texto. *(sin sesión de origen — tema del backlog, no discutido a fondo en una sesión todavía)*
25. `escepticismo-productivo` — **Escepticismo productivo**: Postura crítica frente a la automatización total que, en vez de rechazarla, exige supervisión rigurosa. *(sin sesión de origen — tag de participante)*
26. `auditoria-de-codigo-ia` — **Auditoría de código IA**: Revisión técnica deliberada de código generado antes de llevarlo a producción, en vez de asumir que "compila" significa "está bien". `sesionOrigen: 6`.
27. `supervision-humana` — **Supervisión humana**: Principio recurrente del grupo: la IA multiplica capacidades pero no reemplaza el juicio ni la responsabilidad ética de quien la usa. *(sin sesión de origen — principio transversal, no de una sola sesión)*
28. `agi` — **AGI (inteligencia artificial general)**: Hipotética IA con capacidad cognitiva general equivalente o superior a la humana; tema de debate sobre sus argumentos prácticos, no solo especulativos. *(sin sesión de origen)*. Referencia: "Artificial general intelligence", https://en.wikipedia.org/wiki/Artificial_general_intelligence, tipo `sitio`.
29. `etica-y-alucinaciones` — **Ética y alucinaciones**: Debate fundacional del grupo sobre los riesgos de confiar en respuestas incorrectas generadas con total seguridad, especialmente en derecho y medicina. `sesionOrigen: 1`.
30. `gsd` — **GSD (Getting Stuff Done, marco)**: Marco de trabajo orientado a ejecución práctica más que a teoría, promovido como forma de estructurar el uso de IA en tareas reales. *(sin sesión de origen — tag de participante; no se encontró una referencia externa estable y verificable para el marco específico que menciona el grupo)*

### Operación y evaluación

31. `loop-engineering` — **Loop Engineering**: Complemento del harness engineering enfocado en los ciclos de retroalimentación del desarrollo con agentes. `sesionOrigen: 7`. Ejemplo: "Un agente de codificación que revisa su propio diff, corre los tests, y si fallan vuelve a intentar antes de reportar terminado — el ciclo completo, no solo la respuesta inicial, es lo que se diseña." Referencia: IBM — "What Is Loop Engineering?", https://www.ibm.com/think/topics/loop-engineering, tipo `articulo`.
32. `vibe-engineering` — **Vibe Engineering**: Crítica a la ilusión de velocidad al programar con IA y a la deuda técnica que se acumula cuando no hay disciplina detrás. *(sin sesión de origen — tema del backlog/libro en curso, no discutido a fondo en sesión)*. Ejemplo: "Aceptar todos los cambios que sugiere un agente sin revisar el diff porque 'se ve bien' es vibe coding; la crítica del grupo es que eso acumula deuda técnica invisible hasta que algo se rompe en producción." Referencia: Simon Willison — "Not all AI-assisted programming is vibe coding" (contexto de origen del término que el grupo critica), https://simonwillison.net/2025/Mar/19/vibe-coding/, tipo `articulo`.
33. `backlog-de-tickets` — **Backlog de tickets**: Dividir un proyecto en tareas discretas y rastreables para mantener control sobre el avance, en vez de avanzar sin estructura. `sesionOrigen: 3`.
34. `pruebas-automatizadas` — **Pruebas automatizadas (Testing)**: Suite de tests que valida que el código generado por IA realmente funciona, no solo que "se ve bien". *(sin sesión de origen — tag de participante)*. Ejemplo: "9.350 pruebas automatizadas (como las de Jorge Johnson en su proyecto Catalejo) permiten confirmar que un cambio generado por IA no rompió nada, sin tener que revisar manualmente cada línea." Referencia: Kent Beck — "Test-Driven Development: By Example", https://www.goodreads.com/book/show/6408726, tipo `libro`.
35. `openrouter` — **OpenRouter**: Servicio para gestionar de forma centralizada múltiples llaves de API de distintos proveedores de modelos. `sesionOrigen: 7`. Ejemplo: "En vez de tener una cuenta y una llave de API distinta para cada proveedor de modelos, OpenRouter centraliza el acceso bajo una sola llave y una sola factura." Referencia: OpenRouter — sitio oficial, https://openrouter.ai/about, tipo `sitio`.
36. `modelos-locales` — **Modelos locales**: Modelos ejecutados en hardware propio en vez de la nube, por costo, privacidad o independencia de proveedor. `sesionOrigen: 8`.
37. `metaaprendizaje` — **Metaaprendizaje**: Usar la IA como mentor para aprender a aprender más rápido, no solo para resolver una tarea puntual. `sesionOrigen: 8`.
38. `icp` — **ICP (perfil de cliente ideal)**: Definición del cliente ideal usada para calificar leads generados o evaluados con LLMs. `sesionOrigen: 5`. Ejemplo: "Definir que el cliente ideal de un taller mecánico es 'dueño de flota de más de 5 vehículos en Medellín' para que un LLM califique leads entrantes contra ese perfil, en vez de tratarlos todos igual."
39. `comunidad-de-practica` — **Comunidad de práctica**: Modelo de operación del grupo: presentaciones cortas, repositorio compartido, sin tareas obligatorias ni estructura académica rígida. `sesionOrigen: 4`.
40. `agilismo-en-la-era-de-la-ia` — **Agilismo en la era de la IA**: Pregunta abierta del grupo sobre si el ritmo de la IA implica un retorno a fases de análisis más tipo cascada. *(sin sesión de origen — tema del backlog, propuesto por un participante puntual, no discutido en sesión)*

## 5. Página índice

**Ruta:** `src/app/[locale]/experiencias-ia/glosario/page.tsx` (Server Component, sin estado).

Un `<h2>` por categoría en el orden fijo de `ORDEN_CATEGORIAS`, con los términos de esa categoría listados (título + primera línea de la definición) linkeando a su detalle — mismo patrón visual que `SesionRow`, pero componente propio ya que no navega a una sesión.

**Componente nuevo:** `src/components/experiencias-ia/TerminoRow.tsx`

```tsx
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

Reutiliza `.ses-row`/`.ses-t`/`.ses-d` tal cual (mismo grid de 3 columnas que `SesionRow`; las columnas de número y fecha van vacías porque el glosario no tiene ni numeración secuencial ni fecha).

## 6. Página de detalle

**Ruta:** `src/app/[locale]/experiencias-ia/glosario/[slug]/page.tsx`

```tsx
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
        <Link href={`/experiencias-ia/sesiones/${sesion.n}`} className="pendiente-origen">
          Sesión {sesion.n}: {sesion.titulo}
        </Link>
      )}

      <div className="ses-nav">
        <Link href="/experiencias-ia/glosario">← Glosario</Link>
      </div>
    </div>
  )
}
```

`generateStaticParams` genera las 40 rutas en build time — igual que las sesiones. `notFound()` para cualquier slug que no exista en `GLOSARIO`.

## 7. Nav

`src/components/experiencias-ia/ExperienciasNav.tsx` — se agrega `{ href: '/experiencias-ia/glosario', label: 'Glosario' }` al arreglo `VISTAS`, como 6to ítem, después de "Quiénes somos". El chequeo de vista activa usa `pathname.includes(vista.href)`, igual que las demás vistas no-raíz — cubre tanto el índice como cualquier `/glosario/[slug]`.

## 8. Testing

- `src/lib/experiencias-ia/__tests__/glosario.test.ts`:
  - `GLOSARIO` tiene exactamente 40 entradas.
  - `getTerminosPorCategoria` devuelve exactamente 10 términos por cada una de las 4 categorías.
  - Todos los `slug` son únicos (sin colisiones).
  - Cada `sesionOrigen` presente corresponde a un `n` real y existente en `SESIONES` (evita un link roto a una sesión inexistente).
  - `getTermino('prompt-engineering')` devuelve la entrada correcta; `getTermino('no-existe')` devuelve `undefined`.

## 9. Criterios de aceptación

- [ ] El índice `/experiencias-ia/glosario` existe, es alcanzable desde el nav de 6 vistas, y lista los 40 términos agrupados en las 4 categorías en el orden fijo.
- [ ] Cada uno de los 40 términos abre su propia subpágina en `/experiencias-ia/glosario/[slug]` con definición completa.
- [ ] Un slug inexistente (`/experiencias-ia/glosario/no-existe`) devuelve 404.
- [ ] Los términos con `ejemplo` lo muestran; los que no lo tienen no muestran una sección de ejemplo vacía.
- [ ] Los términos con `referencia` muestran un link real y funcional (verificar al menos 3: harness-engineering, rag, mcp); ningún término sin referencia muestra un link fabricado.
- [ ] Los términos con `sesionOrigen` muestran un link funcional a esa sesión (verificar al menos uno de la Sesión 7); los que no lo tienen no muestran ningún número de sesión.
- [ ] El resto de la sección (Inicio, Sesiones, Cronograma, Backlog, Quiénes somos) sigue funcionando exactamente igual — el glosario no introduce regresiones.
- [ ] Usable a 360px sin scroll horizontal (mismo estándar que el resto de la sección), incluyendo el índice y al menos 2 páginas de detalle.
- [ ] `npm run test:run`, `npm run lint`, `npx tsc --noEmit` y `npm run build` limpios (sin nuevas regresiones; se ignora el error preexistente de `ProjectCard.test.tsx`).

## Fuera de alcance

- Buscador o filtro dentro del glosario (a diferencia del Backlog, que sí tiene filtro por prioridad) — con 40 términos fijos en 4 categorías navegables, no se justifica todavía.
- Traducción al inglés (la sección completa es solo en español, ya establecido en el spec original).
- Múltiples referencias por término — cada entrada lleva a lo sumo una `referencia`, no un arreglo. Si en el futuro un término necesita varias, es una extensión simple del tipo.
