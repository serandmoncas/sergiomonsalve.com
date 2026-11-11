---
name: nueva-sesion
description: Use when Sergio pastes or points to a transcript of a weekly Experiencias IA group session and wants it added to the site, or asks to update sesiones, temas, integrantes, taller or glosario of Experiencias IA from a meeting.
---

# Nueva sesión de Experiencias IA

## Principio

Regla madre del grupo: **cero contenido inventado**. Todo lo que entra a `src/lib/experiencias-ia/data.ts` sale de lo que se dijo en la sesión grupal. Lo dudoso no se adivina: va a la lista de dudas.

## Paso 0 — Partir de `main` actualizado

Otras sesiones de Claude usan el mismo directorio y cambian de rama. Trabaja siempre en un worktree nuevo:

```bash
git fetch origin
git worktree add ../sergiomonsalve.com-sesion-N -b feat/experiencias-ia-sesion-N origin/main
cd ../sergiomonsalve.com-sesion-N && npm ci
```

Lee `data.ts` **desde el worktree**, no desde el directorio principal (puede estar viejo).

## Paso 1 — Fecha

Las horas de la transcripción vienen en UTC. Resta 5 horas (Bogotá, sin horario de verano): esa es la `fecha`. Un archivo con fecha UTC de jueves ~00:30 corresponde al miércoles anterior. Si la fecha local **no es miércoles**, no la corrijas: anótala en las dudas.

## Paso 2 — Proponer (sin escribir todavía)

Muéstrale a Sergio una propuesta con esta forma exacta, y espera su aprobación:

1. **Sesión** — objeto para el final de `SESIONES`:
   - `n`: último `n` + 1. Si la fecha es miércoles y entre la última sesión y esta hay otro miércoles sin transcripción, propón también `{ fecha, fechaLarga, estado: 'sin-registro' }`. Si la fecha no es miércoles, no propongas `sin-registro` hasta que Sergio aclare la fecha.
   - `titulo`: corto. Si es redacción tuya, dilo.
   - `gancho`: una frase, la idea más llamativa.
   - `hallazgos`: 3 a 5, una frase cada uno, cada uno trazable a una línea de la transcripción.
   - `asistentes`: quienes hablaron, con el nombre corto que ya se usa en sesiones anteriores ("Torres", "Juan Pablo"). Las personas nuevas, con nombre completo.
   - `nuevos`: quienes se presentaron por primera vez.
   - `enlaces: []` salvo que se compartiera un enlace en la sesión.
2. **Temas** — solo propuestas de tema para el grupo. `propone` es quien formuló la idea en sus palabras; si alguien la atribuye a otro ("la idea de Torres"), anota ambos en las dudas.
3. **Personas** — cada persona nueva entra con `texto: ''` y `consentimiento: false`. El borrador de su texto, tomado solo de lo que dijo de sí misma, va únicamente en la propuesta a Sergio: el repo es público y los borradores no se guardan en él.
4. **Glosario** — solo conceptos que no existan ya (busca por slug y por nombre), con `sesionOrigen: n`.
5. **Dudas** — todo lo que no pudiste resolver con la transcripción.

## Qué queda fuera, siempre

| Situación en la transcripción | Qué hacer |
|---|---|
| Alguien menciona una llamada o conversación privada | No usar nada de ese contenido |
| Un autor dice que no quiere publicar o compartir algo | Fuera de hallazgos y de `TALLER`, ni siquiera con `publicar: false` |
| "X debería hacer…" / "de pronto traigo…" | No es compromiso ni tema. Nada de tareas con nombre propio |
| Nombre de herramienta dudoso ("Jeff o JEP") | Describirla sin nombre y anotarla en dudas |
| Dos nombres que podrían ser la misma persona | No duplicar: preguntar |
| `consentimiento: true` o `publicar: true` | Solo con un sí explícito de esa persona, que Sergio confirme |
| Proyecto mostrado en sesión sin permiso del autor | Fuera de `TALLER`: proponlo a Sergio para que pida permiso; entra solo con `publicar: true` |

## Paso 3 — Al aprobar

1. Edita solo `data.ts` (y `glosario.ts` si hay términos). Los tests no tienen cantidades fijas: si un test pide un número, es un bug del test, avísale a Sergio.
2. Corre `npm run test:run`, `npm run lint` y `npm run build`.
3. Commit `feat(experiencias-ia): sesión N (D mmm)`, push y PR contra `main`.
4. **No hagas merge**: un merge a `main` publica en producción. Sergio decide.
5. Al terminar, borra el worktree.
