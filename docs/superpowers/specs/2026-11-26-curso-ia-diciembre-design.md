# Página del curso gratuito de IA de diciembre — diseño

**Fecha:** 26 nov 2026 · **Estado:** borrador para aprobación de Sergio
**Contexto:** `~/Code/formacion-mapa/curso-ia/diciembre/02-guion.md` (programa de las 4 clases) y `03-invitacion.md`.

## 1. Intención

Sergio va a invitar por redes (Reels, TikTok, Shorts, estados de WhatsApp) a **gente nueva** a su curso gratuito de IA de diciembre. Necesita una **página propia en sergiomonsalve.com** con el programa, el video de invitación y la inscripción. Así el enlace de cada publicación lleva a un solo lugar, la página suma al portafolio y los inscritos pueden entrar a la lista del newsletter.

El curso es también la vitrina del curso pagado de enero y el entrenamiento en vivo de Aula Abierta.

## 2. Datos fijos del curso (decididos por Sergio)

- 4 clases en vivo por videollamada, de **7:00 a 8:30 p. m. (hora de Colombia)**: **miércoles 9, jueves 10, lunes 14 y martes 15 de diciembre de 2026**. La hora es la del guion y se puede cambiar.
- **Gratis.** Usa Claude en su plan gratuito, con Gemini de respaldo.
- **Cupo máximo: 20 personas.**
- Programa: las 4 clases de `02-guion.md` (tabla del resumen) y su promesa: *"en 4 sesiones pasas de no saber por dónde empezar a tener tu propia página publicada con IA, sin pagar nada"*.

## 3. Enfoques considerados

- **A. Video + imagen del programa + formulario de Google.** Es lo más rápido, pero no deja página propia, lista de inscritos ni newsletter.
- **B. Página propia en sergiomonsalve.com** ← *elegido por Sergio*. Reutiliza el patrón de `/mapa` (Zod + honeypot + Supabase + Resend).
- **C. Video largo en YouTube.** Se descartó: es demasiado largo para invitar en redes.

## 4. Qué se construye

### 4.1 Página `/es/curso-ia` *(ruta: decisión de Claude)*
Se eligió `curso-ia` y no el nombre del curso porque el nombre todavía no está decidido. `/cursos` ya existe y es la plataforma de cursos grabados con matrícula, así que no se mezcla con ella. `/en/curso-ia` redirige a `/es/curso-ia`, porque el curso es solo en español.

Secciones, en orden:
1. **Encabezado:** nombre del curso (provisional: *"Empieza con IA sin pagar nada"*), promesa, chips "Gratis · En vivo · Sin instalar nada" y **"Quedan N de 20 cupos"**.
2. **Video de invitación**, embebido de YouTube. El ID se configura en `cohorte.ts`. Si no hay ID, la sección no se muestra y la página funciona igual.
3. **Programa:** las 4 clases, cada una con su fecha, tema y "con qué sales".
4. **Para quién es:** personas que nunca usaron IA o la usan poco. Se necesita un computador (con celular solo se puede, pero cuesta más) y crear una cuenta gratuita antes de empezar.
5. **Quién lo dicta:** Sergio, en 3–4 líneas `[TU HISTORIA]`, con foto.
6. **Inscripción** (formulario, ver 4.2).
7. **Preguntas frecuentes** (4–5): ¿de verdad es gratis?, ¿qué necesito?, ¿y si no puedo ir a una clase?, ¿por dónde es la videollamada?, ¿qué pasa después?

Diseño: el del sitio (tokens de `globals.css`). Tiene que verse bien **primero en celular**, porque casi todo el tráfico llega desde redes.

### 4.2 Formulario de inscripción
Campos (salen de las 5 preguntas del guion):

| Campo | Tipo | Obligatorio |
|---|---|---|
| Nombre | texto, 80 | sí |
| Correo | email | sí |
| WhatsApp | teléfono; Colombia (+57) por defecto, acepta otros países | sí |
| ¿Desde dónde te conectas? | computador / solo celular | sí |
| ¿Has usado alguna IA? | nunca / alguna vez / la uso seguido | sí |
| ¿Qué te gustaría poder hacer con la IA? | texto, 500 | sí |
| ¿Tienes un negocio, proyecto o hobby para mostrar en una página? | texto, 300 | no |
| Acepto el tratamiento de mis datos (enlace a /privacidad) | casilla | sí |
| Quiero recibir el newsletter | casilla | no |

Como en `/mapa`: honeypot, bloqueo de enlaces en los textos y validación con Zod en el cliente y en el servidor.

### 4.3 Cupo y lista de espera *(lógica: decisión de Claude)*
- Una inscripción queda **`confirmed`** si hay cupo (menos de 20 confirmadas) y **`waitlist`** si no.
- La asignación es **atómica** en una función SQL (`claim_course_seat`), con un bloqueo por cohorte, para que dos inscripciones simultáneas no se lleven el cupo 20 a la vez.
- **El mismo correo en la misma cohorte** no crea una fila nueva: se devuelve el estado que ya tiene y no se reenvía el correo más de una vez cada 10 minutos (igual que en `/mapa`).
- **Cupo lleno:** la página dice *"Cupos llenos — inscríbete en la lista de espera"* y el mismo formulario anota a la persona en `waitlist`. Si alguien se retira, Sergio pasa a confirmado al siguiente a mano, desde Supabase.
- **Cierre:** desde el **9 dic a las 7:00 p. m. (Colombia)**, toda inscripción nueva va a `waitlist` con el texto *"Este grupo ya empezó. Te avisamos del próximo"*. Sirve como lista para el curso pagado de enero.
- El contador "Quedan N" se calcula en el servidor y se refresca cada 60 s (ISR o `revalidate`). Que muestre un número algo desactualizado no es grave, porque el cupo real lo asigna la función SQL.

### 4.4 Datos
Tabla nueva `course_registrations` (migración `009_course_registrations.sql`, **se aplica a mano** en Supabase como la 008):
`id, cohort (text, 'ia-diciembre-2026'), name, email (minúsculas), whatsapp, device, ai_experience, goal, project, status ('confirmed'|'waitlist'|'cancelled'), privacy_consented_at, newsletter (bool), created_at, last_email_sent_at`, con `unique(cohort, email)`. RLS activado y **sin políticas públicas**: solo la usa el service role, como `subscribers`.

### 4.5 Correos (Resend, desde `noreply@sergiomonsalve.com`)
1. **Confirmado:** "Tienes cupo". Incluye las 4 fechas y horas, que el enlace de la videollamada llega por WhatsApp y correo 2 días antes, y el paso a paso para crear la cuenta gratuita en claude.ai antes de la clase 1, pidiendo responder "listo" por WhatsApp.
2. **Lista de espera:** "Estás en la lista de espera, te avisamos si se libera un cupo" (o el texto de grupo ya empezado, ver 4.3).
3. **Aviso a Sergio** (a `CONTACT_EMAIL`) en cada inscripción: nombre, estado, número de confirmados y respuestas 4 y 5.

**Newsletter** *(decisión de Claude)*: solo si la persona marcó la casilla. En ese caso se inserta en `subscribers` con `source='curso-ia'`; si el correo ya existía, por ejemplo de `/mapa`, se conserva su `source` y solo se registra el consentimiento. Quien no marca la casilla no entra a `subscribers`.

**Si falla el correo** *(decisión de Claude)*: el cupo **no se devuelve**, para que nadie más tome el cupo 20. La página muestra el estado de todos modos ("Tienes cupo. Si en unos minutos no te llega el correo, escríbeme por WhatsApp", con un botón a `https://wa.me/573239105762`). `last_email_sent_at` queda en null, y eso permite encontrar los fallos con una consulta. El aviso a Sergio se envía aparte, y si también falla queda en el log. El reintento por el mismo correo vuelve a intentar el envío respetando la espera de 10 minutos.

**Recordatorios y enlace de la videollamada** *(decisión de Claude)*: **los manda Sergio a mano** por WhatsApp y correo. El sitio no programa envíos. Se entrega una consulta SQL lista para usar (en `docs/` o en el PR) que lista los confirmados con nombre, correo y WhatsApp, y los fallos de correo.

**Pasar de lista de espera a confirmado** *(decisión de Claude)*: con un script `scripts/curso-ia-confirmar.ts <correo>` (`npm run curso-ia:confirmar -- <correo>`) que cambia el estado a `confirmed` y envía el correo "Tienes cupo". Para cancelar a alguien se cambia el estado a `cancelled` en Supabase, sin correo.

### 4.5b WhatsApp de contacto (decidido por Sergio)
**+57 323 910 5762** (`wa.me/573239105762`), **público** en la página. Aparece en el botón "Escríbeme por WhatsApp" (en preguntas frecuentes y en los mensajes de error o de correo fallido) y en el correo de confirmación. Se define una sola vez en `cohorte.ts`, para cambiarlo en un solo lugar.

### 4.6 Privacidad
Agregar a `/privacidad` una sección sobre la inscripción a cursos en vivo: qué se guarda (nombre, correo, WhatsApp y respuestas), para qué (organizar el curso, avisos y, si lo acepta, el newsletter), cuánto tiempo (*decisión de Claude:* hasta 12 meses después del curso, o antes si la persona lo pide) y cómo pedir que se borre (respondiendo el correo o escribiendo por /contact).

### 4.7 Enlaces
- Agregar en `/formacion` una tarjeta o banner hacia `/curso-ia` mientras la cohorte esté abierta.
- Imagen para compartir (Open Graph) con el nombre, las fechas y "Gratis", para que el enlace se vea bien en WhatsApp.

## 5. Fuera de este trabajo (va aparte)

- **El guion del video de invitación** (45–60 s, vertical). Lo escribe Claude en `formacion-mapa/curso-ia/diciembre/04-video-invitacion.md`; lo graba y edita Sergio.
- Textos para cada red social.
- Panel de administración de inscritos: por ahora basta con Supabase.
- Límite de peticiones por IP: sigue pendiente en todo el sitio, igual que en `/api/mapa/plan`.
- Pagos y la página del curso de enero.

## 6. Objetivos, no-objetivos y anti-objetivos

- **Objetivo:** la página está publicada y probada a más tardar el **lunes 30 nov**, con al menos una inscripción real de prueba de punta a punta (formulario → fila en Supabase → correo recibido).
- **Prueba de punta a punta** *(decisión de Claude)*: se hace en producción con un correo de Sergio, y **después se borra esa fila** para que no ocupe uno de los 20 cupos. Las previews comparten la base de datos de producción, así que ahí no se prueban inscripciones.
- **No-objetivos:** inglés, cuentas de usuario, pagos e integración con `/cursos`.
- **Anti-objetivos:**
  - Que la página retrase la invitación: si el 30 nov no está, se invita con el formulario de Google (enfoque A) y la página llega después.
  - Que se inscriban más de 20 confirmados.
  - Que se guarden datos sin consentimiento.
  - Que un inscrito no reciba su correo sin que nadie se entere.

## 7. Restricciones

- Next.js 16 + next-intl (los textos van en `es.json` y `en.json`; el inglés puede ser un texto mínimo porque redirige), Tailwind v4 y Vitest. Pruebas junto a los archivos, en `__tests__/`.
- Push a `main` = deploy a producción: se trabaja en una rama y un PR, y **el merge lo aprueba Sergio**.
- La migración se aplica a mano: el código tiene que fallar con un mensaje claro si la tabla no existe, sin romper la página. En ese caso el formulario muestra un error que pide escribir por WhatsApp.
- Los textos con voz de Sergio (`[TU HISTORIA]`, "Quién lo dicta") los escribe o aprueba él. *(Decisión de Claude)*: si al 30 nov no han llegado, "Quién lo dicta" se publica con una bio corta y factual, armada con datos que ya están en el sitio (profesor en EAFIT, MSc en Educación en Ingeniería, ingeniero de IA), y con la foto del /about. Sergio la revisa en el PR, porque él aprueba el merge.

## 8. Lo que queda a criterio de quien implemente

- La estructura interna de componentes y libs (siguiendo `src/lib/mapa` y `src/components/mapa`).
- El formato exacto del teléfono (normalizar a E.164).
- El diseño visual de las secciones dentro del sistema del sitio.
- El texto final de las preguntas frecuentes (borrador de Claude, revisado por Sergio).
