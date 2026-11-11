# Experiencias IA — estado al 15 de octubre de 2026

Cierre de la sesión de trabajo del 15 oct. Resume qué se hizo a partir del handoff "Página Experiencias IA (actualización 29 jul – 14 oct 2026)", qué quedó pendiente y cómo seguir.

## Qué quedó publicado

Todo está en producción en `https://www.sergiomonsalve.com/es/experiencias-ia`.

| PR | Qué hizo |
|---|---|
| #4 | Sesiones 9–17 y "sin registro" (29 jul, 12 ago, 30 sep). Quiénes somos pasa a opt-in. Cronograma + Backlog → **Próximos temas** con "propone". Principio y formato nuevo en Inicio. Vista **Taller**. `noindex`. Fuera del menú principal. |
| #5 | Glosario de 58 a **200 términos** (50 por categoría; 31 de los nuevos con `sesionOrigen`). |
| #6 | **Buscador** del glosario: sin tildes, en nombre y definición, selector y/o. |
| #7 | La **próxima sesión** se calcula sola (próximo miércoles, hora de Bogotá; `MIERCOLES_SIN_SESION` para saltar fechas). `package-lock.json` sincronizado. |
| #8 | Skill **`/nueva-sesion`** (`.claude/skills/nueva-sesion/SKILL.md`). Tests sin cantidades fijas. |

### Criterios de aceptación del handoff

- [x] Ningún perfil visible sin `consentimiento: true` (hoy no se muestra ninguno).
- [x] Ninguna tarea atribuida; solo temas con "propone".
- [x] Inicio muestra el principio y el formato de intervenciones cortas.
- [x] Las 9 sesiones nuevas aparecen, la más reciente primero; 12 ago y 30 sep como "sin registro".
- [x] Agregar una sesión requiere tocar solo `data.ts`.
- [x] Lo faltante dice "pendiente".
- [x] Sin scroll horizontal a 360 px.
- [x] `noindex`.
- [x] Paleta y tipografías del cuaderno del ingeniero.

## Cómo agregar la sesión de cada semana

En Claude Code, dentro del repo: `/nueva-sesion` y la transcripción. El skill propone la sesión, los temas, las personas nuevas, los términos del glosario y las dudas, y espera aprobación antes de escribir. Termina en un PR; el merge lo decide Sergio.

Si un miércoles no hay sesión, se agrega en `MIERCOLES_SIN_SESION` en `src/lib/experiencias-ia/data.ts`.

## Pendientes

### Depende de otras personas
- [ ] **Consentimientos:** pedir a cada integrante que apruebe o escriba su texto para Quiénes somos, y a cada autor su permiso para la ficha del Taller. Los mensajes están redactados (fuera del repo, por privacidad). Al recibir un sí: `consentimiento: true` + `texto`, o `publicar: true`.
- [x] Apellido de Javier confirmado: **Javier Correa Álvarez** (21 oct).
- [ ] Confirmar si hubo sesión el 29 jul y el 30 sep.
- [ ] Verificar los nombres dudosos de la transcripción: el clasificador "Jeff"/"JEP" y los orquestadores Orca y Herder.

### Puede hacerlo Claude
- [ ] **Privacidad del repo (aplazado por Sergio).** El repo es público y conserva datos que la página ya no muestra: perfiles generados a partir de transcripciones en los anexos y el plan de julio, y borradores y fichas sin permiso en `data.ts`. Opciones: (A) quitarlos del código, (B) reescribir el historial, (C) volver el repo privado. Recomendación: A + C.
- [ ] Referencias externas verificadas para los términos más importantes del glosario (la spec exige verificar cada URL antes de citarla).

### Próxima sesión del grupo
- [ ] Enviar la invitación al grupo para el **miércoles 21 de octubre, 7:30 p.m.**, con los temas propuestos entre agosto y octubre. El borrador está en el evento de calendario de Sergio.
