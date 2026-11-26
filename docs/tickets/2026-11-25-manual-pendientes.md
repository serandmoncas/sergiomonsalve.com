# Manual de Usuario — pendientes menores (2026-11-25)

Menores diferidos en la construcción (rama feat/manual-de-usuario). Ninguno bloquea el merge según la revisión final.

- minor (deferred): access.ts ignora `error` de la consulta a manual_readers (falla cerrado pero silencioso; agregar console.error). Tests: ADMIN_NAME override y usuario sin email.
- minor (deferred): wikilinks dentro de bloques de código cuentan como enlaces; H2 desconocido descarta contenido en silencio; faltan tests de regresión CRLF/callout final/sin voz/dedupe.
- minor (deferred): parseIndice estricto con tipos YAML no string (titulo numérico) y mensajes sin campo; tests de error no verifican mensaje; pasoVecinos con nota duplicada usa la primera.
- minor (deferred): 404 de una nota individual (carrera árbol/contents) tumba todo el manual a `fallo`; `truncated` del árbol ignorado; frontmatter roto en sobre.md tumba el manual; sin test de nombre con tildes.
- minor (deferred T6): matcher excluye rutas con punto (slug con '.' salta el proxy; la página igual verifica); safeNext sin tests de variantes codificadas; entrar no redirige si ya hay sesión.
- minor (deferred T7): error de fallo se registra dos veces; parpadeo de "desde aquí" antes de aplicar preferencia; clave manual.mapa.porEscribir sin uso; tests faltantes (portada ok+sobre null, ?r= desconocido).
- minor (deferred T7): regex de código no reconoce fences indentadas ni código inline multilínea (cosmético).
- minor (deferred T8): regex de slug rechazaría nombres con mayúsculas/_/. (hoy los archivos reales son minúsculas con guiones — verificado); envío de correo awaited suma latencia; sin reintento al fallar la carga; tests de JSON malformado/slug inválido en GET.
- minor (deferred T9): fuente de etiquetas ~6.6px en móvil y sin manejo de colisiones; setState en cada tick.
- minor (deferred T9): touch-action en <g> SVG puede no respetarse en todos los navegadores — probar en dispositivo real.
- minor (deferred T9): enlace revelado con focus:absolute sin offsets/z-index.
- minor (deferred T10): redirectTo del invite usa el origin de la petición (admin-gated; Supabase filtra por allow-list) — considerar URL fija del sitio.
- minor (deferred T11): CLAUDE.md cita "No disponible…" en vez del texto real; en.json tiene textos en español.

- T8: si se agrega visibilidad por nota o capas públicas (opción 3), validar el slug de los comentarios contra getManualForReader().
- Final: el callback con error=enlace pierde el `next` original; ManualAdmin limpia el formulario aunque la invitación falle.
