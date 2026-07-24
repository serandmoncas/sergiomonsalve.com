# Glosario para "Experiencias IA" — Design Spec

**Fecha:** 2026-07-23
**Solicitante:** Sergio Monsalve
**Contexto:** La Sesión 7 del grupo (`src/lib/experiencias-ia/data.ts`, `SESIONES[6].decisiones`) registró la decisión de crear "un glosario vivo de 40 términos clave en cuatro categorías: fundamentos, contexto y memoria, seguridad y control, operación y evaluación". El mismo ítem aparece en `BACKLOG` con prioridad alta. Ninguno de los dos archivos contiene los 40 términos en sí — solo la decisión y las 4 categorías.

## 1. Excepción explícita a la regla de "no inventar contenido"

El resto de la sección "Experiencias IA" (spec del 2026-07-23) exige que todo contenido sea trazable a `data.js`. Para este glosario específico, Sergio autorizó explícitamente una excepción: los términos y sus definiciones pueden incluir contenido que él no dictó literalmente, determinado por:
1. Qué tanto el grupo ha usado/mencionado el término en sesiones reales (trazable a `temas`, `conceptos`, `decisiones`, `tags` de participantes, o `BACKLOG` en `data.ts`).
2. Su importancia actual en el mundo de la IA, a criterio del asistente, para completar hasta 40.

**Regla de trazabilidad (no es una excepción, es un requisito nuevo):** cada término que sí aparece en el contenido real del grupo debe llevar una marca de "sesión de origen" (número + link). Los términos agregados por criterio general de importancia no llevan esa marca. Esta distinción debe ser visualmente clara en la página — es lo que hace honesto un contenido que ya no es 100% transcripción.

## 2. Los 40 términos (aprobados por Sergio el 2026-07-23)

Esta es la fuente de verdad completa — la implementación transcribe estos 40 términos literalmente, sin resumir ni reformular. `sesionOrigen` es el número de sesión cuando el término es trazable a `SESIONES`/`BACKLOG` en `data.ts`; se omite cuando es terminología general agregada por criterio de importancia actual.

### Fundamentos

1. **Prompt engineering** — Un turno. `sesionOrigen: 7`
2. **Context engineering** — Una sesión. `sesionOrigen: 7`
3. **Harness engineering** — Trabajo continuo: horas y cientos de decisiones, con herramientas, validación y restricciones arquitectónicas. `sesionOrigen: 7`
4. **Patrón de Hashimoto** — Cada error del agente se convierte en un arreglo permanente del entorno; el sistema se realimenta y mejora a sí mismo. `sesionOrigen: 7`
5. **Cinco primitivas** — Sistema de archivos, ejecución de código, sandbox controlado, memoria persistente y gestión de contexto. `sesionOrigen: 7`
6. **RAG (Retrieval-Augmented Generation)** — Técnica que recupera información de una fuente externa antes de generar la respuesta, en vez de depender solo del conocimiento entrenado en el modelo. *(sin sesión de origen)*
7. **MCP (Model Context Protocol)** — Protocolo abierto para conectar modelos con herramientas y fuentes de datos externas de forma estandarizada. *(sin sesión de origen)*
8. **Skills** — Unidades modulares de comportamiento o conocimiento que se le enseñan a un agente para una tarea específica. `sesionOrigen: 2`
9. **Skill creator** — Skill de Anthropic para construir otras skills; camino para profesionalizar el uso de IA en vez de improvisar cada vez. `sesionOrigen: 4`
10. **Agentes** — Sistemas que usan un modelo para decidir y ejecutar acciones de forma autónoma, no solo responder texto. `sesionOrigen: 8`

### Contexto y memoria

11. **Gestión de contexto** — Administrar qué información cabe y permanece relevante dentro de la ventana de contexto de un modelo. `sesionOrigen: 2`
12. **Memoria persistente** — Información que un agente conserva entre sesiones, más allá de una sola conversación. `sesionOrigen: 5`
13. **Revelación progresiva** — Entregarle contexto al modelo por capas, según lo va necesitando, en vez de todo de una vez. *(sin sesión de origen — mencionada en tags de participante, no en el cuerpo de una sesión)*
14. **Poda de contexto** — Eliminar deliberadamente información acumulada que ya no aporta, para no saturar la ventana de contexto. *(sin sesión de origen)*
15. **Obsidian** — Herramienta de notas enlazadas usada por varios del grupo como base de un "segundo cerebro". `sesionOrigen: 2`
16. **Segundo cerebro** — Sistema personal (típicamente en Obsidian) para centralizar contexto, ideas y notas de forma conectada. *(sin sesión de origen — mencionada en tags de participante)*
17. **Jarvis (asistente personal)** — Proyecto tipo asistente personal que integra calendario, correo, WhatsApp y notas; limitado hoy por falta de memoria persistente real. `sesionOrigen: 5`
18. **MemPalas** — Herramienta de memoria institucional basada en la técnica de palacios de memoria, aplicada a bases de datos no estructuradas. `sesionOrigen: 3`
19. **Infoxicación** — Saturación por exceso de información, concepto de Alfons Cornellá que el grupo adoptó para nombrar la fatiga de estar al día con IA. `sesionOrigen: 2`
20. **Encapsulamiento** — Aislar una funcionalidad para que se pueda usar sin conocer su implementación interna — principio de diseño que el grupo aplica también al contexto que se le da a un modelo. *(sin sesión de origen — mencionado en bio de participante, no en cuerpo de sesión)*

### Seguridad y control

21. **Fricción productiva** — Puertas de diseño que obligan a un acto deliberado antes de avanzar; lo que realmente frena el sesgo de automatización, no la fuerza de voluntad. `sesionOrigen: 7`
22. **Metodología Némesis** — Enfoque de interacción crítica y adversarial con los modelos, para no aceptar sus respuestas sin cuestionarlas. `sesionOrigen: 6`
23. **Seguridad en código generado** — Disciplina de no confiar ciegamente en código producido por IA sin auditoría técnica antes de producción. `sesionOrigen: 6`
24. **Huellas de modelos** — Patrones o estilos de escritura identificables que delatan qué modelo generó un texto. *(sin sesión de origen — tema del backlog, no discutido a fondo en una sesión todavía)*
25. **Escepticismo productivo** — Postura crítica frente a la automatización total que, en vez de rechazarla, exige supervisión rigurosa. *(sin sesión de origen — tag de participante)*
26. **Auditoría de código IA** — Revisión técnica deliberada de código generado antes de llevarlo a producción, en vez de asumir que "compila" significa "está bien". `sesionOrigen: 6`
27. **Supervisión humana** — Principio recurrente del grupo: la IA multiplica capacidades pero no reemplaza el juicio ni la responsabilidad ética de quien la usa. *(sin sesión de origen — principio transversal, no de una sola sesión)*
28. **AGI (inteligencia artificial general)** — Hipotética IA con capacidad cognitiva general equivalente o superior a la humana; tema de debate sobre sus argumentos prácticos, no solo especulativos. *(sin sesión de origen)*
29. **Ética y alucinaciones** — Debate fundacional del grupo sobre los riesgos de confiar en respuestas incorrectas generadas con total seguridad, especialmente en derecho y medicina. `sesionOrigen: 1`
30. **GSD (Getting Stuff Done, marco)** — Marco de trabajo orientado a ejecución práctica más que a teoría, promovido como forma de estructurar el uso de IA en tareas reales. *(sin sesión de origen — tag de participante)*

### Operación y evaluación

31. **Loop Engineering** — Complemento del harness engineering enfocado en los ciclos de retroalimentación del desarrollo con agentes. `sesionOrigen: 7`
32. **Vibe Engineering** — Crítica a la ilusión de velocidad al programar con IA y a la deuda técnica que se acumula cuando no hay disciplina detrás. *(sin sesión de origen — tema del backlog/libro en curso, no discutido a fondo en sesión)*
33. **Backlog de tickets** — Dividir un proyecto en tareas discretas y rastreables para mantener control sobre el avance, en vez de avanzar sin estructura. `sesionOrigen: 3`
34. **Pruebas automatizadas (Testing)** — Suite de tests que valida que el código generado por IA realmente funciona, no solo que "se ve bien". *(sin sesión de origen — tag de participante)*
35. **OpenRouter** — Servicio para gestionar de forma centralizada múltiples llaves de API de distintos proveedores de modelos. `sesionOrigen: 7`
36. **Modelos locales** — Modelos ejecutados en hardware propio en vez de la nube, por costo, privacidad o independencia de proveedor. `sesionOrigen: 8`
37. **Metaaprendizaje** — Usar la IA como mentor para aprender a aprender más rápido, no solo para resolver una tarea puntual. `sesionOrigen: 8`
38. **ICP (perfil de cliente ideal)** — Definición del cliente ideal usada para calificar leads generados o evaluados con LLMs. `sesionOrigen: 5`
39. **Comunidad de práctica** — Modelo de operación del grupo: presentaciones cortas, repositorio compartido, sin tareas obligatorias ni estructura académica rígida. `sesionOrigen: 4`
40. **Agilismo en la era de la IA** — Pregunta abierta del grupo sobre si el ritmo de la IA implica un retorno a fases de análisis más tipo cascada. *(sin sesión de origen — tema del backlog, propuesto por un participante puntual, no discutido en sesión)*

## 3. Modelo de datos

Nuevo archivo `src/lib/experiencias-ia/glosario.ts` — **no se modifica `data.ts`**, que se mantiene como transcripción fiel y exclusiva de `data.js`. El glosario es contenido nuevo autorizado, así que vive separado, dejando intacta la garantía de "todo lo que está en data.ts viene de data.js".

```ts
import type { Sesion } from './data'

export type CategoriaGlosario = 'fundamentos' | 'contexto-memoria' | 'seguridad-control' | 'operacion-evaluacion'

export type TerminoGlosario = {
  termino: string
  definicion: string
  categoria: CategoriaGlosario
  sesionOrigen?: number // número de SESIONES[n].n si el término es trazable a una sesión real; ausente si es de criterio general
}

export const CATEGORIAS: Record<CategoriaGlosario, string> = {
  'fundamentos': 'Fundamentos',
  'contexto-memoria': 'Contexto y memoria',
  'seguridad-control': 'Seguridad y control',
  'operacion-evaluacion': 'Operación y evaluación',
}

export const GLOSARIO: TerminoGlosario[] = [ /* los 40 términos, ver sección 2 */ ]

export function getTerminosPorCategoria(categoria: CategoriaGlosario): TerminoGlosario[] {
  return GLOSARIO.filter(t => t.categoria === categoria)
}
```

`sesionOrigen` es un `number` plano (no una referencia directa a `Sesion`) para no crear una dependencia circular entre `glosario.ts` y `data.ts` más allá de lo necesario — la página resuelve el link con `getSesion(sesionOrigen)` de `data.ts` cuando la necesite (título de la sesión para el texto del link).

## 4. Página y componente

**Ruta:** `src/app/[locale]/experiencias-ia/glosario/page.tsx` (Server Component, sin estado).

Estructura: un `<h2>` por categoría (en el orden fijo: fundamentos → contexto y memoria → seguridad y control → operación y evaluación), con los términos de esa categoría en una grid de tarjetas (`grid g2`, mismo patrón que Backlog/Quiénes somos).

**Componente nuevo:** `src/components/experiencias-ia/TerminoItem.tsx`

```tsx
import type { TerminoGlosario } from '@/lib/experiencias-ia/glosario'
import { getSesion } from '@/lib/experiencias-ia/data'
import { Link } from '@/i18n/navigation'

export default function TerminoItem({ termino }: { termino: TerminoGlosario }) {
  const sesion = termino.sesionOrigen ? getSesion(termino.sesionOrigen) : undefined

  return (
    <div className="card">
      <h3>{termino.termino}</h3>
      <p>{termino.definicion}</p>
      {sesion && (
        <Link href={`/experiencias-ia/sesiones/${sesion.n}`} className="pendiente-origen">
          Sesión {sesion.n}: {sesion.titulo}
        </Link>
      )}
    </div>
  )
}
```

Reutiliza `.card` y `.pendiente-origen` (ya existe desde el fix del 360px de ayer — mismo estilo mono sin `nowrap`, perfecto para este link también).

## 5. Nav

`src/components/experiencias-ia/ExperienciasNav.tsx` — se agrega `{ href: '/experiencias-ia/glosario', label: 'Glosario' }` al arreglo `VISTAS`, como 6to ítem, después de "Quiénes somos".

## 6. Testing

- `src/lib/experiencias-ia/__tests__/glosario.test.ts` — `getTerminosPorCategoria` devuelve exactamente 10 términos por categoría (40 en total, 4×10); cada `sesionOrigen` presente corresponde a un `n` real en `SESIONES` (evita un link roto a una sesión inexistente).

## 7. Criterios de aceptación

- [ ] La página `/experiencias-ia/glosario` existe, es alcanzable desde el nav de 6 vistas, y no rompe ninguna vista existente.
- [ ] Muestra exactamente 40 términos, 10 por cada una de las 4 categorías, en el orden fijo fundamentos → contexto y memoria → seguridad y control → operación y evaluación.
- [ ] Cada uno de los 26 términos marcados con `sesionOrigen` (contar exactamente en la implementación final, ver sección 2) muestra un link funcional a esa sesión específica (verificar al menos 3, incluyendo uno de la Sesión 7).
- [ ] Los 12 términos sin sesión de origen NO muestran ningún link ni número de sesión fabricado.
- [ ] Usable a 360px sin scroll horizontal (mismo estándar que el resto de la sección).
- [ ] `npm run test:run`, `npm run lint`, `npx tsc --noEmit` y `npm run build` limpios (sin nuevas regresiones; se ignora el error preexistente de `ProjectCard.test.tsx`).

## Fuera de alcance

- Buscador o filtro dentro del glosario (a diferencia del Backlog, que sí tiene filtro por prioridad) — con 40 términos fijos en 4 categorías, no se justifica todavía.
- Traducción al inglés (la sección completa es solo en español, ya establecido en el spec original).
