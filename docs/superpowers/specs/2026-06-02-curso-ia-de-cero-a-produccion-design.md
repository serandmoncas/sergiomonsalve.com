# Diseño del Curso: De Cero a Producción con IA

_Fecha: 2026-06-02_
_Autor: Sergio Monsalve_
_Estado: Aprobado_

---

## Visión general

**Nombre:** De Cero a Producción con IA
**Subtítulo:** Herramientas, stack moderno y página personal desplegada

Un curso práctico que lleva a profesionales con distintos niveles técnicos desde el primer contacto con herramientas de IA hasta tener una página personal desplegada en producción con características de IA nativa. El curso tiene dos outputs concretos al graduarse: dominar el uso de IA como herramienta de trabajo, y tener un sitio personal real en producción que el participante entiende de punta a punta.

---

## Contexto y audiencia

### Origen
Nace de una reunión del grupo "Experiencias IA" (2026-06-02) compuesto por profesionales colombianos con backgrounds diversos que quieren incorporar IA en su trabajo y vida profesional.

### Perfiles de participantes actuales
| Participante | Background | Nivel técnico actual |
|---|---|---|
| Carlos Monsalve | Ex-dev → Director de Tecnología | Reconectándose con lo técnico |
| Diego Robledo | Data Architect / BI | Usa Cursor y CortexAI diariamente |
| Daniel Moreno | Ing. Mecánico → Co-fundador SaBio | Usa Claude Code y Desktop intensamente |
| Juan Pablo Duque | Civil + CS + Finanzas → Aliado IT | Usa ChatGPT, Claude y Gemini regularmente |

### Prerrequisitos
Ninguno técnico. Solo laptop, conexión a internet, y motivación.

---

## Formato y estructura

**Tipo:** Híbrido — sesiones en vivo + material de apoyo entre sesiones
**Cadencia:** 1 sesión semanal de 90 minutos
**Duración total:** 15 sesiones (~4 meses)
**Estructura:** 5 sprints de 3 sesiones cada uno

**Por sesión:**
- 90 min en vivo: demo + práctica guiada + preguntas
- Guía escrita corta + 1 ejercicio concreto para trabajar entre sesiones
- Ruta estándar: 2-4 hrs/semana entre sesiones
- Ruta acelerada: 6+ hrs/semana para quienes quieran profundizar más

**Hilo conductor:** Cada participante construye su propia página personal como proyecto. El sitio evoluciona en cada sprint — empieza rudo en el Sprint 1 y termina siendo production-ready con IA incorporada en el Sprint 5.

---

## Stack tecnológico del curso

| Capa | Herramienta | Por qué |
|---|---|---|
| IA / Asistente | Claude, ChatGPT, Cursor | Ecosistema real, no académico |
| Editor de código | VS Code / Cursor | Estándar de industria con IA integrada |
| Control de versiones | Git + GitHub | Flujo profesional universal |
| Framework web | Next.js (App Router) | Stack moderno, SSR, API Routes integradas |
| Base de datos | Supabase | PostgreSQL + Auth + API en uno |
| Despliegue | Vercel | CI/CD automático desde GitHub |
| Dominio | Namecheap / Porkbun | Económico, fácil configuración DNS |
| AI SDK | Vercel AI SDK | Unifica providers, maneja streaming |

---

## Estructura del curso por sprints

### Sprint 1 — IA + Primer Deploy (Sesiones 1-3)

**Objetivo:** Entender el paisaje de la IA y tener un sitio en producción desde la primera semana.

**Sesión 1 — El mapa de la IA**
- Teoría: LLMs, tokens, contexto, temperatura; landscape de modelos (Claude, GPT-4o, Gemini, Llama); terminología esencial (prompt, alucinación, embedding, RAG, agente); herramientas vs. modelos vs. plataformas
- Práctica: crear cuentas (Claude, ChatGPT, GitHub, Vercel); primera sesión de prompting con bio personal; comparar mismo prompt en Claude vs. GPT-4o
- Entregable entre sesiones: 3 casos de uso de IA en el trabajo actual

**Sesión 2 — Prompting que funciona**
- Teoría: anatomía de un buen prompt (contexto + rol + tarea + formato + restricciones); prompting iterativo; límites reales de los modelos
- Práctica: instalar VS Code + Cursor; construir contenido del sitio (about, proyectos, contacto) con IA; generar bio en 3 tonos distintos
- Entregable entre sesiones: contenido final de la página listo (texto, no código)

**Sesión 3 — Primer deploy**
- Teoría: qué es un repositorio y un deploy; cómo funciona Vercel (push → build → URL en 60 segundos)
- Práctica: fork de template base en GitHub; editar contenido con IA; conectar GitHub → Vercel → deploy
- **Entregable de sprint: URL pública en Vercel funcionando**

---

### Sprint 2 — Developer Stack + Git (Sesiones 4-6)

**Objetivo:** Dominar el flujo de trabajo profesional con Git y empezar a leer código con criterio usando IA como copiloto.

**Sesión 4 — Git: el historial que salva vidas**
- Teoría: por qué existe Git; repositorio, commit, branch, merge, pull request; GitHub como red social del código; cómo Vercel escucha a GitHub
- Práctica: instalar Git; clonar repositorio; ciclo completo (editar → add → commit → push → ver deploy automático)
- Entregable entre sesiones: cambio real en el sitio usando flujo Git completo desde laptop

**Sesión 5 — Leer código con IA como copiloto**
- Teoría: qué es Next.js y por qué se usa; estructura de carpetas; componentes como bloques Lego; diferencia entre HTML, CSS y JavaScript
- Práctica: pasar archivos a Claude para que los explique; cambiar colores, títulos, enlaces con IA; localizar cada parte del sitio en el código
- Ruta acelerada: Cursor para editar código con autocompletado de IA en tiempo real
- Entregable entre sesiones: 5 cosas que quieren cambiar y en qué archivo están

**Sesión 6 — Diseño con IA: que se vea tuyo**
- Teoría: Tailwind CSS utility-first; diseño responsivo mobile-first; cómo pedir cambios de diseño a IA con precisión
- Práctica: describir identidad visual a Claude y recibir propuestas en Tailwind; aplicar cambios iterativamente; agregar secciones nuevas
- **Entregable de sprint: sitio visualmente personalizado que refleja la identidad del dueño**

---

### Sprint 3 — Supabase + Base de Datos (Sesiones 7-9)

**Objetivo:** El sitio deja de ser estático. Aprenden a guardar y leer datos reales usando IA para escribir SQL y código de backend.

**Sesión 7 — Bases de datos: el cerebro del sitio**
- Teoría: bases de datos como hojas de cálculo con superpoderes; SQL básico (SELECT, INSERT, UPDATE, DELETE); qué es Supabase; variables de entorno y seguridad
- Práctica: crear proyecto en Supabase; crear primera tabla; usar Claude para escribir queries SQL; ejecutar en editor de Supabase
- Entregable entre sesiones: esquema de datos diseñado para su sitio

**Sesión 8 — Conectar base de datos al sitio**
- Teoría: API Routes en Next.js como puente entre navegador y BD; variables de entorno en Next.js y Vercel; flujo completo (formulario → API Route → Supabase → respuesta); Row Level Security básico
- Práctica: instalar @supabase/supabase-js; configurar variables de entorno; crear API Route `/api/contacto`; probar con Thunder Client
- Ruta acelerada: SELECT desde Server Component de Next.js para mostrar datos en página
- Entregable entre sesiones: API Route funcionando localmente

**Sesión 9 — Contenido dinámico: el sitio cobra vida**
- Teoría: Server Components vs. Client Components; ciclo request/response de formularios; validación de datos del usuario
- Práctica: formulario de contacto completo (HTML + validación + envío + feedback); conectar al API Route; página de admin básica que lee mensajes desde Supabase
- **Entregable de sprint: formulario de contacto en producción que guarda datos reales en Supabase**

---

### Sprint 4 — Vercel + Producción Real (Sesiones 10-12)

**Objetivo:** El sitio pasa de "funciona en mi laptop" a ser una aplicación profesional con dominio propio, autenticación y flujo de trabajo de equipo real.

**Sesión 10 — CI/CD: el deploy que se cuida solo**
- Teoría: qué es CI/CD; ambientes development → preview → production; variables de entorno por ambiente; logs y monitoreo en Vercel
- Práctica: crear rama, hacer PR en GitHub, observar Preview URL automática de Vercel; configurar variables de Supabase en Vercel Dashboard; mergear y ver deploy a producción
- Entregable entre sesiones: cambio usando flujo PR → Preview → revisión → merge → producción

**Sesión 11 — Dominio propio + Autenticación**
- Teoría: DNS sin misterio (A record, CNAME, la guía telefónica de internet); dónde comprar dominio y cuánto cuesta; autenticación (sesiones, tokens, cookies); Supabase Auth con magic link
- Práctica: conectar dominio personalizado a Vercel; configurar DNS; implementar Supabase Auth; proteger ruta `/admin`; configurar redirect URLs para producción
- Entregable entre sesiones: dominio propio funcionando con HTTPS

**Sesión 12 — SEO, performance y lanzamiento oficial**
- Teoría: SEO básico (metadata, Open Graph, sitemap); Core Web Vitals (LCP, CLS, FID) en lenguaje humano; `<Image>` de Next.js; checklist de lanzamiento
- Práctica: metadata SEO con IA para cada página; OG image con ImageResponse; Lighthouse en Chrome DevTools; sitemap.xml y robots.txt automáticos; momento de lanzamiento grupal
- **Entregable de sprint: sitio en producción con dominio propio, HTTPS, auth, SEO básico — listo para compartir profesionalmente**

---

### Sprint 5 — IA Nativa en el Sitio (Sesiones 13-15)

**Objetivo:** La IA deja de ser solo la herramienta de construcción y pasa a vivir adentro del sitio. Los participantes aprenden a integrar modelos, construir interfaces conversacionales y entender los patrones de la industria.

**Sesión 13 — APIs de IA: hablar con los modelos desde código**
- Teoría: qué es una API key y por qué nunca va en el frontend; ecosistema de providers (Anthropic, OpenAI, Google); Vercel AI SDK; streaming de respuestas; tokens y estimación de costos
- Práctica: obtener API key de Anthropic; agregar a Vercel como variable de entorno; crear API Route que llama a Claude con streaming; cambiar de provider con un solo cambio de línea
- Entregable entre sesiones: API Route con respuesta de Claude en streaming funcionando

**Sesión 14 — Chatbot personal: la IA que te conoce**
- Teoría: system prompt para personalidad y contexto; historial de conversación (por qué los modelos no recuerdan por defecto); `useChat` de Vercel AI SDK
- Práctica: construir interfaz de chat completa; escribir system prompt personal (quién eres, proyectos, trabajo); agregar chatbot al sitio; iterar system prompt en vivo
- Ruta acelerada: agregar tool use para que el chatbot consulte Supabase en tiempo real
- **Entregable de sprint: chatbot personal en producción que representa al dueño del sitio**

**Sesión 15 — Embeddings, RAG y qué sigue**
- Teoría: qué es un embedding (significado como coordenadas, sin álgebra lineal); búsqueda semántica vs. por palabras clave; RAG (buscar → incluir en contexto → responder); pgvector en Supabase; mapa de lo que existe más allá del curso (agentes, MCP, fine-tuning, modelos locales)
- Práctica: generar embeddings del contenido del sitio; guardar en Supabase con pgvector; implementar búsqueda semántica; comparar keywords vs. semántica en vivo
- Graduación: cada participante presenta su sitio al grupo (URL, features, aprendizajes); retrospectiva colectiva; recursos para continuar según perfil
- **Entregable de sprint: sitio con búsqueda semántica + chatbot + todos los sprints anteriores integrados**

---

## Resumen de entregables por sprint

| Sprint | Tema | Sesiones | Entregable concreto |
|---|---|---|---|
| 1 | IA + Primer Deploy | 1-3 | Sitio en Vercel con URL pública |
| 2 | Developer Stack + Git | 4-6 | Sitio personalizado con flujo Git profesional |
| 3 | Supabase + Base de datos | 7-9 | Formulario de contacto con datos reales en Supabase |
| 4 | Vercel + Producción | 10-12 | Dominio propio + auth + SEO |
| 5 | IA Nativa | 13-15 | Chatbot personal + búsqueda semántica |

---

## Progresión de la relación con el código

| Fase | Rol del participante | Rol de la IA |
|---|---|---|
| Sprints 1-2 | Dirige, la IA genera todo | Escritora, explicadora |
| Sprint 3 | Lee código con ayuda, modifica partes pequeñas | Copiloto activo |
| Sprint 4 | Puede diagnosticar errores, entiende el flujo | Asistente especializado |
| Sprint 5 | Toma decisiones de arquitectura, evalúa outputs | Colaboradora técnica |

---

## Material de apoyo por sesión (estructura estándar)

Cada sesión genera:
1. **Guía escrita** (500-800 palabras): resumen de teoría + comandos exactos + capturas de pantalla clave
2. **Ejercicio concreto**: una tarea clara con criterio de éxito definido
3. **Ruta acelerada**: extensión opcional para participantes que quieran ir más allá
4. **Recursos**: 2-3 links seleccionados (documentación oficial, no tutoriales genéricos)

---

## Consideraciones de diseño

- **Diversidad de niveles:** El material base funciona para el nivel más bajo del grupo. La ruta acelerada nunca bloquea la sesión — es opcional y autoguiada.
- **Proyectos reales desde el día 1:** Nunca se trabaja con ejemplos inventados. Cada ejercicio usa el proyecto personal real del participante.
- **IA como explicadora, no solo constructora:** En cada sesión se usa IA para explicar el código que IA generó — esto construye comprensión real, no dependencia ciega.
- **Entregables visibles:** Cada sprint termina con algo que se puede mostrar — una URL, un formulario funcionando, un chatbot. Esto mantiene la motivación y crea accountability social en el grupo.
- **Stack production-grade desde el principio:** No se enseñan simplificaciones que después hay que "desaprender". GitHub, Supabase y Vercel son herramientas de industria real.
