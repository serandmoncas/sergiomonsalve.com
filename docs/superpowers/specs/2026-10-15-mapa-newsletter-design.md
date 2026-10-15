# Imán "Mapa de habilidad" + newsletter — diseño

**Fecha:** 2026-10-15 · **Estado:** aprobado en conversación, pendiente revisión de este documento

## Objetivo

Convertir el imán del Método MAPA en una página propia del sitio (`/mapa`) que cualquiera puede usar sin registrarse, y que al final ofrece recibir el plan por correo y, con consentimiento explícito, suscribirse a la newsletter. Además, permitir el tipo de contacto "Formación / taller".

**Criterios de éxito**
- Un visitante usa la plantilla completa sin dar datos.
- Al dejar su correo recibe su plan en menos de un minuto.
- Solo quien marca la casilla queda suscrito; todo correo trae enlace de baja que funciona.
- El formulario de contacto acepta "Formación / taller" y llega preseleccionado desde `/formacion`.
- Todo en español e inglés, como el resto del sitio.

## Decisiones tomadas

| Decisión | Elección | Motivo |
|---|---|---|
| Dónde viven los suscriptores | Supabase (fuente de verdad) + Resend Audience (copia para Broadcasts) | Todo en el stack existente, datos propios, sin costo inicial |
| Acceso al imán | Abierto; correo opcional al final | Más uso, SEO y correos de gente que ya probó la herramienta |
| Consentimiento | Casilla sin marcar para la newsletter; el plan se envía siempre | Ley 1581 (Colombia) y RGPD exigen consentimiento previo, expreso y específico |

## Componentes

### 1. Datos

`supabase/migrations/006_subscribers.sql`

```sql
create table subscribers (
  id                 uuid primary key default gen_random_uuid(),
  email              text not null unique,          -- guardado en minúsculas
  name               text,
  locale             text not null default 'es' check (locale in ('es', 'en')),
  source             text not null default 'mapa',
  newsletter         boolean not null default false,
  consented_at       timestamptz,
  status             text not null default 'active' check (status in ('active', 'unsubscribed')),
  unsubscribe_token  uuid not null unique default gen_random_uuid(),
  created_at         timestamptz not null default now(),
  unsubscribed_at    timestamptz
);
alter table subscribers enable row level security;
-- Sin políticas públicas: solo el service role (rutas API) lee y escribe.
```

`supabase/migrations/007_contact_training.sql`: reemplaza el check de `contact_submissions.project_type` para admitir `'training'`.

### 2. Página `/[locale]/mapa`

- `src/app/[locale]/(main)/mapa/page.tsx`: metadatos (namespace `meta`: `mapaTitle`, `mapaDescription`) y render de `MapaTool`.
- `src/components/mapa/MapaTool.tsx` (client): meta, cuatro estaciones M/A/P/A con cronómetro de 5 min, lista de piezas con ★, prompts copiables, ejemplo cargable, plan copiable. Borrador en `localStorage` (try/catch). Estilos con los tokens del sitio.
- `src/lib/mapa/plan.ts`: funciones puras `buildPlan(data, t)`, `buildMapPrompt(data, t)` y `buildTutorPrompt(data, t)`; reciben las etiquetas traducidas para funcionar en ambos idiomas.
- `src/components/mapa/PlanEmailForm.tsx` (client): correo, nombre opcional, casilla de newsletter sin marcar, honeypot, enlace a `/privacidad`. Estados idle/loading/success/error.
- Copia en `src/messages/{es,en}.json` bajo `mapa`.

### 3. API `POST /api/mapa/plan`

- Esquema Zod en `src/lib/mapa/schema.ts`: `email` (email, ≤254), `name` (opcional, ≤80), `locale` (`es`|`en`), `plan` (1–6000 caracteres), `newsletter` (boolean), `website` (honeypot, debe ir vacío).
- Honeypot lleno → responde 200 sin hacer nada.
- Upsert por `email` en minúsculas:
  - Nuevo: inserta con `newsletter` y `consented_at = now()` si aceptó.
  - Existente: actualiza `name`/`locale`; si aceptó, `newsletter = true`, `status = 'active'`, `consented_at = now()`, `unsubscribed_at = null`. Si no aceptó, no cambia su suscripción.
- Envía el plan con Resend (`sendPlanEmail` en `src/lib/resend.ts`): texto plano + HTML simple, asunto traducido, enlace `https://www.sergiomonsalve.com/{locale}/newsletter/baja?token=…`.
- Si aceptó la newsletter y existe `RESEND_AUDIENCE_ID`: crea o actualiza el contacto en la Audience (best-effort; errores se registran y no fallan la respuesta).
- Error de base de datos → 500. Error al enviar el plan → 502 con mensaje para reintentar.

### 4. Baja `/[locale]/newsletter/baja`

- Página de servidor que lee `token`, marca `status = 'unsubscribed'`, `newsletter = false`, `unsubscribed_at = now()` y quita el contacto de la Audience (best-effort).
- Muestra confirmación; token inválido o ausente muestra un mensaje claro con enlace a contacto.
- Idempotente: repetir la baja muestra la misma confirmación.

### 5. Cambios menores

- `ContactForm`: tipo `training` ("Formación / taller" / "Training / workshop"); preselección desde `?tipo=training`. `contactSchema` y su test incluyen el nuevo tipo.
- `/formacion`: el CTA principal enlaza a `/contact?tipo=training`; nueva tarjeta/enlace a `/mapa` ("Prueba el Método MAPA gratis").
- Inicio (`about/content.ts`): enlace a `/mapa` en la sección `/now` o CTA.
- `/[locale]/privacidad`: política de tratamiento de datos básica (responsable, finalidad, derechos de acceso, rectificación y supresión, canal de contacto). Marcada para revisión legal.
- `sitemap.ts`: agrega `/mapa` y `/privacidad`.
- Guion `formacion-mapa/03-guion-video-pilar.md` (fuera del repo): corregir la frase "al descargarla quedas inscrito en mi newsletter".

## Pruebas

- `src/lib/mapa/__tests__/plan.test.ts`: plan con datos completos, con campos vacíos (marcadores), sin piezas clave, en ambos idiomas.
- `src/lib/mapa/__tests__/schema.test.ts`: válidos e inválidos, honeypot.
- `src/app/api/mapa/plan/__tests__/route.test.ts`: con Supabase y Resend simulados: nuevo con y sin newsletter, existente que se resuscribe, honeypot, error de DB, error de envío.
- `src/components/__tests__/ContactForm.test.tsx` y `contact-schema.test.ts`: cuatro tipos y preselección.
- Verificación final: `npm run test:run`, `npm run build`, revisión visual de `/es/mapa`.

## Puesta en producción (requiere acción o permiso de Sergio)

1. Aplicar migraciones 006 y 007 en Supabase producción.
2. Crear la Audience en Resend y guardar `RESEND_AUDIENCE_ID` en Vercel (production y preview).
3. Merge a `main` → despliegue automático. Prueba real con un correo propio.

## Fuera de alcance

Editor de newsletter (se usa Broadcasts de Resend), panel de suscriptores en el admin, sincronización de bajas hechas desde Resend hacia Supabase (webhook), doble opt-in, rate limiting más allá del honeypot.
