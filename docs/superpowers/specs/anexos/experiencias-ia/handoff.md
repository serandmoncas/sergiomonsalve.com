# Handoff de diseño — Sección "Experiencias IA" para sitio personal

**Fecha:** 23 de julio de 2026
**Solicitante:** Sergio Monsalve
**Destino:** Claude Design
**Tipo de entregable:** Sección web multivistas para integrar en sitio personal existente

---

## 1. Contexto y propósito

"Experiencias IA" es un grupo de estudio semanal (miércoles, 7:30–8:30 p.m., Medellín/remoto) activo desde el 4 de junio de 2026, con 8 sesiones realizadas y 18 integrantes de perfiles diversos: desarrollo de software, datos, finanzas, diseño, biología, logística, educación, aviación y dirección tecnológica.

Esta sección funciona como **bitácora pública del grupo** dentro del sitio personal de Sergio. Sus tres trabajos son:

1. **Registro:** documentar cada sesión con resumen, decisiones, pendientes y referencias.
2. **Coordinación:** dar seguimiento a pendientes abiertos, cronograma de próximas sesiones con encargados, y backlog de temas propuestos.
3. **Presentación:** explicar quiénes somos y cómo funciona el grupo a visitantes nuevos y potenciales integrantes.

**Audiencia primaria:** los propios integrantes del grupo (consulta semanal, mayormente desde móvil vía enlace en WhatsApp). **Audiencia secundaria:** visitantes del sitio personal y candidatos a unirse.

---

## 2. Fuentes de contenido (obligatorias)

- **Archivo `data.js` adjunto** — contiene TODO el contenido: 8 sesiones completas, 4 sesiones del cronograma, 12 ítems de backlog, 18 fichas de participantes, principios del grupo y metadatos. Es la única fuente de verdad.
- Documento maestro "Experiencias IA — Resumen General del Grupo de Estudio" (respaldo de referencia).

**Regla estricta: no inventar contenido.** No crear participantes, sesiones, citas, fechas, referencias ni URLs que no estén en las fuentes. Si un dato falta (p. ej. URLs de referencias de la Sesión 7, marcadas vacías en `data.js`), dejar el espacio visible como "pendiente" o usar texto sin enlace — nunca fabricar el enlace.

---

## 3. Arquitectura de información

Cinco vistas con navegación persistente:

| Vista | Contenido | Fuente en data.js |
|---|---|---|
| **Inicio** | Hero con tesis del grupo, métricas (sesiones, integrantes, pendientes abiertos, temas en backlog), los 4 principios, últimas 3 sesiones | `GRUPO`, `SESIONES` |
| **Sesiones** | Índice de 8 sesiones en orden inverso → detalle por sesión | `SESIONES` |
| **Detalle de sesión** | Resumen extendido, conceptos (si hay), decisiones, pendientes con estado, temas, nuevos integrantes, referencias, navegación anterior/siguiente | `SESIONES[n]` |
| **Cronograma** | Sesiones 9–12 con fecha, encargados y estado (confirmada/propuesta) + panel consolidado de TODOS los pendientes abiertos con su sesión de origen | `CRONOGRAMA`, `SESIONES[].pendientes` |
| **Backlog** | 12 temas filtrables por prioridad (alta/media/baja), cada uno con proponente y nota | `BACKLOG` |
| **Quiénes somos** | 18 fichas de participantes + bloque "Cómo funciona" (4 reglas de operación) | `PARTICIPANTES` |

Jerarquía de contenido dentro de cada sesión: resumen → conceptos → decisiones → pendientes. Los pendientes distinguen visualmente estado abierto vs. cerrado (cerrado = tachado o atenuado, nunca oculto).

---

## 4. Dirección visual

**Concepto: "cuaderno del ingeniero".** La metáfora central del grupo desde la Sesión 7 es caballo / arnés / jinete (el modelo es el caballo, el arnés son las riendas, el jinete da dirección). La estética debe evocar una bitácora técnica encuadernada: papel cuadriculado, tinta, cuero de montura.

### Paleta

| Rol | Valor | Uso |
|---|---|---|
| Tinta | `#141b1f` | Texto principal, bordes estructurales |
| Tinta secundaria | `#3d4a52` | Texto de apoyo, metadatos |
| Papel | `#e9e5db` | Fondo general |
| Papel sombreado | `#dfd9cc` | Tarjetas destacadas, paneles laterales |
| Cuero | `#8a4b2a` | Acento principal: enlaces, eyebrows, énfasis |
| Latón | `#b08d3f` | Estados "propuesta", prioridad media |
| Verde silla | `#3f6b4e` | Pendientes cerrados, estado "confirmada" |

### Tipografía

- **Display:** Bricolage Grotesque (títulos, números de sesión, nombres) — pesos 600 y 800, tracking negativo.
- **Cuerpo:** Newsreader (prosa de resúmenes y biografías) — la itálica se reserva para el lema y campos profesionales.
- **Utilitaria:** JetBrains Mono (eyebrows, fechas, etiquetas, metadatos) — mayúsculas con tracking amplio, tamaños 10–12px.

### Elemento de firma

El diagrama de **las tres capas de ingeniería** (prompt → context → harness) en el hero: tres columnas con borde de tinta, la tercera (harness) resaltada con degradado sutil de cuero. Es el único elemento con tratamiento especial; todo lo demás se mantiene sobrio.

### Motivos y texturas

- Fondo con retícula de papel cuadriculado (líneas de ~34px, opacidad muy baja).
- Bordes de 1.5px en tinta sólida para contenedores estructurales; líneas punteadas para separadores menores.
- Números de sesión grandes (01, 02…) en display 800 como marcadores del índice — aquí la numeración SÍ codifica secuencia real.
- Sin sombras difusas, sin esquinas redondeadas, sin degradados salvo el de la capa harness.

---

## 5. Reglas de contenido y tono

- Todo en **español**. Términos técnicos en inglés se conservan tal como los usa el grupo (harness engineering, skills, human in the loop).
- Tono: directo, con la calidez informal del grupo ("18 personas, ningún deber asignado"). Sin lenguaje de marketing.
- El lema del hero: *"Un caballo desbocado necesita riendas, no menos fuerza."*
- Citas y frases textuales solo si existen en las fuentes.

---

## 6. Requisitos funcionales

1. Navegación persistente entre las cinco vistas, con estado activo visible.
2. Filtro de backlog por prioridad (todas / alta / media / baja).
3. Navegación anterior/siguiente entre detalles de sesión.
4. El panel de pendientes abiertos del Cronograma se deriva automáticamente de los pendientes de todas las sesiones — no es una lista duplicada mantenida a mano.
5. Las métricas del inicio (sesiones, pendientes abiertos, etc.) se calculan del contenido, no se escriben fijas.

---

## 7. Restricciones técnicas

- **Móvil primero:** la audiencia llega desde WhatsApp. Todo legible y navegable a 360px de ancho. Las cuadrículas de 3 columnas colapsan a 2 y luego a 1.
- Contenido separado de presentación: la estructura de datos de `data.js` se respeta tal cual, de modo que agregar la Sesión 9 sea añadir un objeto sin tocar diseño.
- Respetar `prefers-reduced-motion`. Foco de teclado visible en acento cuero.
- Sin dependencias de backend; sitio estático integrable en el sitio personal existente.

---

## 8. Criterios de aceptación (binarios)

- [ ] Las cinco vistas existen y son navegables entre sí.
- [ ] Las 8 sesiones aparecen en el índice y cada una abre su detalle completo.
- [ ] Cada detalle de sesión muestra: resumen, decisiones (si hay), pendientes con estado visual abierto/cerrado, temas y referencias (si hay).
- [ ] La Sesión 7 incluye los 5 conceptos (tres capas, patrón de Hashimoto, cinco primitivas) y los 3 nuevos integrantes.
- [ ] El cronograma muestra las sesiones 9–12 con encargados y distingue "confirmada" de "propuesta".
- [ ] El panel de pendientes abiertos lista únicamente pendientes con estado "abierto" e indica la sesión de origen de cada uno.
- [ ] El backlog muestra los 12 temas y el filtro por prioridad funciona.
- [ ] Quiénes somos muestra las 18 fichas con nombre, rol, campo, biografía, etiquetas y sesión de ingreso.
- [ ] Ningún nombre, fecha, cita, referencia o URL fue inventado — todo es rastreable a `data.js`.
- [ ] El sitio es usable a 360px de ancho sin scroll horizontal.
- [ ] La paleta y tipografías corresponden a las especificadas en la sección 4.
- [ ] Los pendientes cerrados son visibles pero visualmente distinguibles de los abiertos.

---

## 9. Fuera de alcance

- Autenticación o edición desde el navegador.
- Buscador interno.
- Versiones en otros idiomas.
- Integración con calendario o WhatsApp (solo enlaces estáticos si se proveen).

---

## 10. Anexo

- `data.js` — contenido completo estructurado (adjuntar junto con este brief).
- Referencia visual opcional: `experiencias-ia-sitio.html`, prototipo funcional ya construido que implementa esta especificación. Claude Design puede partir de él o rediseñar respetando las secciones 3–8.
