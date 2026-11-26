# Página del curso de IA de diciembre — plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Página pública `/es/curso-ia` con programa, video e inscripción con 20 cupos, lista de espera y correos.

**Architecture:** Mismo patrón que `/mapa`. Hay una config de la cohorte en código y una tabla de inscripciones con una función SQL atómica que asigna el cupo. La ruta API valida con Zod y honeypot, llama a la función y envía los correos por Resend. La página es un server component que lee el contador, y el formulario es un client component.

**Tech Stack:** Next.js 16.2.4 App Router, next-intl, Supabase (service role), Resend, Zod, Tailwind v4, Vitest + RTL.

**Spec:** `docs/superpowers/specs/2026-11-26-curso-ia-diciembre-design.md`

## Global Constraints

- Rama `feat/curso-ia-diciembre` y PR a `main`. **El merge lo aprueba Sergio** (push a main = producción).
- Cohorte `ia-diciembre-2026`, cupo **20**. Clases: **mié 9, jue 10, lun 14 y mar 15 dic 2026, de 7:00 a 8:30 p. m. (America/Bogota, UTC−5)**.
- Cierre de inscripciones: `2026-12-10T00:00:00Z` (= 9 dic a las 19:00 en Colombia).
- WhatsApp público: `+57 323 910 5762`, `https://wa.me/573239105762`, definido solo en `cohorte.ts`.
- Re-envío de correo al mismo correo y cohorte: como máximo uno cada **10 min**.
- Ruta `/es/curso-ia`; `/en/curso-ia` redirige a `/es/curso-ia`. Textos en `src/messages/es.json` (`cursoIa.*`); en `en.json`, solo las llaves de metadata.
- Migración `supabase/migrations/009_course_registrations.sql` **se aplica a mano**. Sin la tabla, la página funciona sin contador y la API responde `503 { error: 'unavailable' }`.
- Newsletter solo con la casilla marcada; `source='curso-ia'` solo para correos nuevos.
- Ninguna prueba de inscripción en previews (comparten la base de datos de producción).

## Review Focus

1. **Dos inscripciones simultáneas por el cupo 20:** solo una queda `confirmed`. Lo garantiza `pg_advisory_xact_lock` en la función SQL → Tarea 1 incluye una prueba manual en SQL.
2. **El mismo correo con mayúsculas o espacios** (`" Ana@Mail.com "`) cuenta como un solo inscrito → prueba en Tarea 2.
3. **WhatsApp en formatos reales** (`323 910 5762`, `3239105762`, `+57 323-910-5762`, `+1 415 555 0100`) se normaliza a E.164; `12345` se rechaza → prueba en Tarea 2.
4. **Tabla no creada en producción:** la página carga sin contador y la API devuelve 503 con el texto que invita a escribir por WhatsApp → pruebas en Tareas 3 y 5.
5. **Borde del cierre:** a las 18:59 de Colombia del 9 dic todavía se confirma; desde las 19:00 todo va a `waitlist` → prueba en Tarea 1 (`isClosed`).

---

### Task 1: Cohorte, migración y acceso a datos

**Files:**
- Create: `src/lib/curso-ia/cohorte.ts`, `src/lib/curso-ia/registrations.ts`, `supabase/migrations/009_course_registrations.sql`
- Test: `src/lib/curso-ia/__tests__/cohorte.test.ts`, `src/lib/curso-ia/__tests__/registrations.test.ts`

**Interfaces:**
- Produces:
  - `COHORTE: { slug: 'ia-diciembre-2026'; capacity: 20; closesAt: Date; sessions: { date: string /* 'YYYY-MM-DD' */; weekday: string; topicKey: 's1'|'s2'|'s3'|'s4' }[]; startTime: '19:00'; endTime: '20:30'; youtubeId: string | null; whatsapp: { display: '+57 323 910 5762'; url: 'https://wa.me/573239105762' } }`
  - `isClosed(now: Date): boolean`
  - `type RegistrationStatus = 'confirmed' | 'waitlist'`
  - `claimCourseSeat(input: SeatInput): Promise<{ status: RegistrationStatus; isNew: boolean; shouldEmail: boolean }>`, con `SeatInput = { email; name; whatsapp; device: 'computer'|'phone'; aiExperience: 'never'|'sometimes'|'often'; goal; project; newsletter: boolean; closed: boolean }`
  - `markEmailSent(email: string): Promise<void>`
  - `countConfirmed(): Promise<number | null>` (null si la tabla no existe o Supabase falla)
  - `confirmFromWaitlist(email: string): Promise<{ name: string } | null>`
  - `class RegistrationsUnavailable extends Error` (lanzado si el error de Supabase es `42P01` o `PGRST205`, tabla inexistente)

- [ ] **Step 1: Pruebas que fallan en `cohorte.test.ts`**
  - `isClosed(new Date('2026-12-09T23:59:00Z'))` → `false` (18:59 en Colombia)
  - `isClosed(new Date('2026-12-10T00:00:00Z'))` → `true`
  - `COHORTE.sessions.map(s => s.date)` → `['2026-12-09','2026-12-10','2026-12-14','2026-12-15']`
  - `COHORTE.capacity` → `20`
- [ ] **Step 2: Pruebas que fallan en `registrations.test.ts`** (mock de `createAdminClient`, con `vi.hoisted`)
  - `claimCourseSeat` llama `rpc('claim_course_seat', { p_cohort: 'ia-diciembre-2026', p_capacity: 20, p_closed: false, p_email: 'ana@mail.com', ... })` y mapea `{ status:'confirmed', is_new:true, should_email:true }` → `{ status:'confirmed', isNew:true, shouldEmail:true }`
  - Un error de rpc `{ code: '42P01' }` → lanza `RegistrationsUnavailable`; cualquier otro error → `Error` con su mensaje
  - `countConfirmed` con error → `null`; con `{ count: 7 }` → `7` (consulta `select('id', { count: 'exact', head: true }).eq('cohort', …).eq('status','confirmed')`)
  - `confirmFromWaitlist('x@y.co')` actualiza solo filas con `status='waitlist'`, devuelve `{ name }` o `null` si no había fila
- [ ] **Step 3: Correr y ver que fallen.** Run: `npx vitest run src/lib/curso-ia` · Expected: FAIL (módulos inexistentes)
- [ ] **Step 4: Escribir la migración 009.** Tabla `course_registrations` según la sección 4.4 de la spec, más la columna `last_email_attempt_at timestamptz`; `unique(cohort, email)`; restricción de minúsculas en el correo; checks de `status`, `device` y `ai_experience`; RLS activado sin políticas. Función `claim_course_seat(p_cohort text, p_email text, p_name text, p_whatsapp text, p_device text, p_ai_experience text, p_goal text, p_project text, p_newsletter boolean, p_capacity int, p_closed boolean) returns table(status text, is_new boolean, should_email boolean)`, `security definer`, `set search_path = public`, con `revoke execute … from public, anon, authenticated`:

```sql
perform pg_advisory_xact_lock(hashtext('course_registrations:' || p_cohort));
-- existente: no cambia status; should_email si last_email_attempt_at es null o < now() - 10 min (y lo marca)
-- nuevo: status = 'waitlist' si p_closed o count(confirmed) >= p_capacity, si no 'confirmed';
--        insert con privacy_consented_at = now(), last_email_attempt_at = now(); should_email = true
```

  Al final, en un comentario, la consulta para listar confirmados y la de correos fallidos (`last_email_sent_at is null`).
- [ ] **Step 5: Implementar `cohorte.ts` y `registrations.ts`** con las firmas de arriba. `markEmailSent` hace update de `last_email_sent_at = now()` por cohorte y correo.
- [ ] **Step 6: Correr y ver que pasen.** Run: `npx vitest run src/lib/curso-ia` · Expected: PASS
- [ ] **Step 7: Commit** `feat(curso-ia): cohorte, migración 009 y acceso a inscripciones`

### Task 2: Esquema del formulario

**Files:**
- Create: `src/lib/curso-ia/schema.ts`
- Test: `src/lib/curso-ia/__tests__/schema.test.ts`

**Interfaces:**
- Consumes: `LINK_MESSAGE`, `isHoneypotFilled` de `src/lib/mapa/schema.ts` (reutilizar y no duplicar; si el regex `LINK` no se exporta, exportarlo desde ahí)
- Produces: `registrationSchema` (Zod) y `type RegistrationRequest = { name; email; whatsapp /* E.164 */; device; aiExperience; goal; project /* '' si vacío */; privacy: true; newsletter: boolean }`; `normalizeWhatsapp(raw: string): string | null`

- [ ] **Step 1: Pruebas que fallan**
  - `normalizeWhatsapp('323 910 5762')`, `('3239105762')` y `('+57 323-910-5762')` → `'+573239105762'`; `('+1 415 555 0100')` → `'+14155550100'`; `('12345')` → `null`
  - email `' Ana@Mail.com '` → `'ana@mail.com'`
  - `privacy: false` → error; `goal` con `https://x.co` → issue con `LINK_MESSAGE`; `goal` de 501 caracteres → error; `project` ausente → `''`
- [ ] **Step 2: Correr.** `npx vitest run src/lib/curso-ia/__tests__/schema.test.ts` · Expected: FAIL
- [ ] **Step 3: Implementar.** Límites: name 80, goal 500, project 300. `normalizeWhatsapp`: quitar todo lo que no sea dígito ni `+`; 10 dígitos que empiezan por 3 → `+57…`; con `+` → entre 8 y 15 dígitos; cualquier otro caso → null. En el esquema, `whatsapp` es `.transform` + refine con el mensaje `invalid_whatsapp`.
- [ ] **Step 4: Correr.** Expected: PASS
- [ ] **Step 5: Commit** `feat(curso-ia): esquema de inscripción`

### Task 3: Correos

**Files:**
- Create: `src/lib/curso-ia/email-copy.ts`
- Modify: `src/lib/resend.ts` (agregar 3 funciones), `src/lib/mapa/subscribers.ts` (agregar `recordCourseNewsletter`)
- Test: `src/lib/curso-ia/__tests__/email-copy.test.ts`, `src/lib/mapa/__tests__/subscribers.test.ts`

**Interfaces:**
- Produces:
  - `confirmedEmail(name: string): { subject: string; text: string; html: string }`
  - `waitlistEmail(name: string, closed: boolean): { subject; text; html }`
  - `ownerNotice(r: RegistrationRequest, status: RegistrationStatus, confirmedCount: number | null): { subject; text }`
  - En `resend.ts`: `sendCourseEmail(to: string, msg: { subject; text; html }): Promise<void>` y `sendCourseOwnerNotice(msg: { subject; text }): Promise<void>` (usa `requireOwnerEmail`)
  - En `subscribers.ts`: `recordCourseNewsletter(email: string, name: string): Promise<void>`, que inserta con `source='curso-ia'` o, si ya existe el correo, solo marca `newsletter=true, consented_at, status='active'`

- [ ] **Step 1: Pruebas que fallan**
  - `confirmedEmail('Ana').text` contiene `'miércoles 9'`, `'jueves 10'`, `'lunes 14'`, `'martes 15'`, `'7:00'`, `'claude.ai'`, `'wa.me/573239105762'` y la frase de que el enlace de la videollamada llega 2 días antes
  - `waitlistEmail('Ana', true).text` contiene `'Te avisamos del próximo'`; `(…, false)` contiene `'lista de espera'`
  - `ownerNotice(…, 'confirmed', 7).subject` contiene `'7/20'`
  - `recordCourseNewsletter`: correo nuevo → `insert` con `source:'curso-ia', newsletter:true`; conflicto (`23505`) → `update` sin tocar `source`
- [ ] **Step 2: Correr.** `npx vitest run src/lib/curso-ia src/lib/mapa/__tests__/subscribers.test.ts` · Expected: FAIL
- [ ] **Step 3: Implementar.** El texto de los correos es copy fijado por la spec (sección 4.5). La guía de cuenta tiene 4 pasos: entrar a claude.ai, crear la cuenta con el correo, aceptar y abrir un chat, y responder "listo" por WhatsApp. El HTML es simple, como `planEmailCopy`.
- [ ] **Step 4: Correr.** Expected: PASS
- [ ] **Step 5: Commit** `feat(curso-ia): correos de confirmación, lista de espera y aviso`

### Task 4: Ruta API de inscripción

**Files:**
- Create: `src/app/api/curso-ia/inscripcion/route.ts`
- Test: `src/app/api/curso-ia/inscripcion/__tests__/route.test.ts`

**Interfaces:**
- Consumes: Tareas 1–3
- Produces: `POST /api/curso-ia/inscripcion`, con respuestas:
  - `200 { status: 'confirmed'|'waitlist', closed: boolean, emailFailed: boolean }`
  - `200 { success: true }` (honeypot)
  - `400 { error: 'links_not_allowed', field }` · `400 { error: 'invalid', field }`
  - `503 { error: 'unavailable' }` · `500 { error: 'save_failed' }`

- [ ] **Step 1: Pruebas que fallan** (mocks de `registrations`, `resend` y `subscribers`; `vi.useFakeTimers` para la fecha)
  1. Válida y con cupo → 200 `confirmed`, se llama a `sendCourseEmail` con `confirmedEmail` y después a `markEmailSent`, y se envía el aviso al dueño
  2. Claim `waitlist` → envía `waitlistEmail(name, false)`
  3. Fecha `2026-12-10T00:00:01Z` → `claimCourseSeat` recibe `closed: true`
  4. `shouldEmail:false` (duplicado) → 200 con su status y **no** envía correo al inscrito
  5. `sendCourseEmail` lanza → 200 `{ emailFailed: true }`, sin llamar a `markEmailSent`; el cupo no se libera (no hay ninguna llamada de liberación)
  6. El aviso al dueño lanza → igual 200 y `console.error`
  7. `newsletter:true` → `recordCourseNewsletter` + `subscribeNewsletterContact`; si fallan, sigue en 200
  8. `RegistrationsUnavailable` → 503 `unavailable`; otro error → 500 `save_failed`
  9. Honeypot lleno → 200 `{ success: true }` sin llamar a nada; un enlace en `goal` → 400 `links_not_allowed`; JSON inválido → 400
- [ ] **Step 2: Correr.** `npx vitest run src/app/api/curso-ia` · Expected: FAIL
- [ ] **Step 3: Implementar `POST(request: Request)`** siguiendo la forma de `src/app/api/mapa/plan/route.ts`. Para el aviso al dueño, `countConfirmed()` va después del claim.
- [ ] **Step 4: Correr.** Expected: PASS
- [ ] **Step 5: Commit** `feat(curso-ia): ruta de inscripción`

### Task 5: Página, formulario y redirección

**Files:**
- Create: `src/app/[locale]/(main)/curso-ia/page.tsx`, `src/app/[locale]/(main)/curso-ia/opengraph-image.tsx`, `src/components/curso-ia/InscripcionForm.tsx`, `src/components/curso-ia/CuposBadge.tsx`
- Modify: `src/messages/es.json` y `src/messages/en.json` (`cursoIa`, `meta.cursoIaTitle`, `meta.cursoIaDescription`), `src/proxy.ts` (`/en/curso-ia` → `/es/curso-ia`, igual que `enManual`)
- Test: `src/components/curso-ia/__tests__/InscripcionForm.test.tsx`, `src/components/curso-ia/__tests__/CuposBadge.test.tsx`, `src/__tests__/proxy.test.ts` (o el archivo de pruebas del proxy que ya exista)

**Interfaces:**
- Consumes: `COHORTE`, `isClosed`, `countConfirmed`; `POST /api/curso-ia/inscripcion`
- Produces: `CuposBadge({ confirmed: number | null; capacity: number; closed: boolean })` e `InscripcionForm({ closed: boolean; full: boolean })`

- [ ] **Step 1: Pruebas que fallan**
  - `CuposBadge` con `confirmed=7` → texto con la llave `cuposLeft` y 13; con `20` → `cuposFull`; con `null` → no muestra nada; con `closed` → `closed`
  - `InscripcionForm`: enviar con datos válidos hace POST al endpoint con el cuerpo esperado. Respuesta `confirmed` → mensaje `successConfirmed`; `waitlist` → `successWaitlist`; `emailFailed` → muestra además el enlace `wa.me/573239105762`; 503 → `errorUnavailable` con el enlace de WhatsApp; sin la casilla de privacidad el botón no envía. `full=true` → el botón dice `ctaWaitlist`
  - proxy: `/en/curso-ia` → 307/308 a `/es/curso-ia`
- [ ] **Step 2: Correr.** `npx vitest run src/components/curso-ia src/__tests__` · Expected: FAIL
- [ ] **Step 3: Implementar.** La página tiene las secciones 4.1 de la spec en orden. `export const revalidate = 60`. El video solo aparece si `COHORTE.youtubeId` existe (iframe `youtube-nocookie.com`). En "Quién lo dicta" va la bio factual de la spec (sección 7) y la foto del /about. Las preguntas frecuentes tienen 5 entradas (borrador de Claude). `generateMetadata` sigue el patrón de `/mapa` con canonical `/es/curso-ia`. La imagen OG dice el nombre, "9, 10, 14 y 15 dic · 7:00 p. m." y "Gratis". Primero se diseña para celular.
- [ ] **Step 4: Correr.** Expected: PASS
- [ ] **Step 5: Verificación manual.** `npm run dev`, abrir `http://localhost:3000/es/curso-ia` a 390 px y a 1280 px. Sin tabla en local, tiene que cargar sin contador, y al enviar tiene que mostrar el error con WhatsApp. Sacar captura de ambos anchos.
- [ ] **Step 6: Commit** `feat(curso-ia): página pública e inscripción`

### Task 6: Privacidad, enlace desde /formacion, script y documentación

**Files:**
- Modify: `src/app/[locale]/(main)/privacidad/page.tsx` (o sus mensajes), `src/app/[locale]/(main)/formacion/page.tsx`, `CLAUDE.md`, `package.json` (script `curso-ia:confirmar`)
- Create: `scripts/curso-ia-confirmar.ts`

**Interfaces:**
- Consumes: `confirmFromWaitlist`, `confirmedEmail`, `sendCourseEmail`, `markEmailSent`

- [ ] **Step 1: Prueba que falla.** La prueba de la página de privacidad (crearla si no existe) busca el texto de la nueva sección: "inscripción a cursos en vivo", "WhatsApp", "12 meses".
- [ ] **Step 2: Correr.** Expected: FAIL
- [ ] **Step 3: Implementar.**
  - **/privacidad:** la sección de la spec 4.6.
  - **/formacion:** banner hacia `/curso-ia`, visible solo si `!isClosed(new Date())`.
  - **Script:** `npx tsx scripts/curso-ia-confirmar.ts <correo>`, que lee `.env.local` como `seed-curso-ia.ts`, confirma, envía el correo, marca el envío e imprime el resultado. Sale con código 1 si el correo no estaba en `waitlist`.
  - **CLAUDE.md:** tabla `course_registrations`, migración 009 aplicada a mano, ruta `POST /api/curso-ia/inscripcion`, script y consultas SQL.
- [ ] **Step 4: Verificación final.** `npm run test:run && npm run lint && npm run build` · Expected: todo verde, y el build lista `/[locale]/curso-ia`.
- [ ] **Step 5: Commit, push de la rama y PR.** El PR incluye: pasos para Sergio (aplicar la 009 en Supabase SQL editor, cargar `youtubeId` cuando tenga el video), las consultas SQL y la prueba en producción después del merge (inscribirse con su correo, comprobar la fila y el correo, y borrar la fila).
