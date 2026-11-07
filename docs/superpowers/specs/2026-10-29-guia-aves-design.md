# Guía de aves de Colombia — diseño

Fecha: 2026-10-29 · Autor: Sergio Monsalve (con Claude)

## Intención y por qué

Una guía ilustrada de las **500 aves más comunes de Colombia**, publicada como sección de sergiomonsalve.com. La web es la primera vitrina de un producto más grande: una app para celular y merch (guía impresa, láminas, stickers, libros, cursos). Por eso los datos y las ilustraciones se producen desde el principio pensando en reutilizarlos fuera de la web.

Lo que la hace especial:

- Ilustraciones propias, generadas con Nano Banana (modelo de imágenes de Gemini), **con precisión de guía de campo**: alguien debe poder identificar el ave por el dibujo. Al ser generadas, se pueden vender sin problemas de derechos de fotos ajenas.
- Cada especie muestra dos posiciones: su puesto entre las más comunes de Colombia y su puesto entre las más comunes de Latinoamérica.
- Contenido local y en voz propia: nombres populares por región, datos curiosos y dónde verla cerca de Medellín y Guarne.

## Metas

- Publicar las 500 fichas completas desde la primera versión: datos, textos, puestos, mapa y conservación.
- Ilustraciones que llegan de forma gradual, por lotes y una familia a la vez, hasta cubrir las 500 especies con sus variantes.
- Todo con herramientas gratuitas: cupo gratuito de Gemini, clave gratuita de eBird, y Vercel y Supabase como hoy.

## No metas (por ahora)

- La app para celular, la tienda y la merch. Se diseñan para el futuro, pero no se construyen en este proyecto.
- Cuentas de usuario. "Yo lo vi" se guarda solo en el navegador.
- Alojar audios de cantos.

## Anti-metas (sería un fracaso aunque funcione)

- Publicar una ilustración con un error que lleve a identificar mal una especie. Ninguna ilustración se publica sin la revisión de Sergio.
- Usar fotos, audios o textos de terceros con licencia no comercial dentro de algo que se vaya a vender.
- Gastar dinero en APIs.

## Decisiones de Sergio

1. **Alcance:** las 500 aves más comunes de Colombia, todas en la primera versión.
2. **Ilustraciones:** generadas con Nano Banana, precisas como guía de campo, gratis y graduales.
3. **Ranking:** cada ficha muestra su puesto en Colombia y en Latinoamérica.
4. **Página:** una sola página que combina tres formas de recorrer la guía:
   - galería de fichas con buscador;
   - filtros "¿Qué ave viste?" por tamaño, color dominante y dónde (ciudad, bosque, agua, páramo), que funcionan como identificador;
   - un botón para agrupar por familia, al estilo de las láminas del libro.
5. **Ficha de cada especie:** incluye todos estos bloques:
   - ilustración grande, con macho, hembra o juvenil cuando difieren;
   - nombre común en español, nombres populares por región, nombre científico, nombre en inglés y familia;
   - tamaño en cm, con una silueta comparada contra una especie de referencia (mirla, paloma);
   - cómo reconocerla;
   - especies con las que se confunde y la diferencia clave;
   - hábitat, rango de altitud y mapa simple con las regiones de Colombia resaltadas;
   - residente o migratoria, con los meses de presencia;
   - estado UICN y si es endémica de Colombia;
   - dato curioso en la voz de Sergio;
   - dónde verla cerca de Medellín y Guarne;
   - enlace al canto (externo, sin alojar audio);
   - "Yo lo vi", guardado en el navegador;
   - botones de compra (sticker, lámina, guía), ocultos hasta que exista la merch.
6. **Publicación gradual, paso a paso:** las 500 fichas salen con sus datos básicos (nombres, familia, tamaño, puestos, hábitat, mapa). Los textos redactados (cómo reconocerla, con qué se confunde, dato curioso, dónde verla) aparecen en cada ficha cuando Sergio los aprueba. Mientras una especie no tiene su ilustración aprobada, su ficha muestra una silueta con "ilustración en camino". El lanzamiento no espera la revisión completa.
7. **La web es de uso comercial:** puede llevar botones de compra y es parte del producto. Por eso todo lo que se muestre en la web debe tener una licencia que permita uso comercial, igual que la merch.
8. **Fotos de referencia:** se pueden usar fotos de terceros, con cualquier licencia, como referencia de entrada para generar las ilustraciones. Sergio asume ese riesgo. Por trazabilidad, cada ilustración guarda la lista de fotos que se usaron como referencia.

## Restricciones

- Va dentro del repo `sergiomonsalve.com`: Next.js 16 con App Router, rutas bajo `src/app/[locale]/(main)/`, textos de interfaz en `src/messages/{es,en}.json` y estilos con los tokens de Tailwind del sitio (ver `CLAUDE.md`).
- El sitio es bilingüe (es/en): la guía también.
- Los textos de cada ficha los redacta Claude a partir de datos verificados, y Sergio los revisa igual que las ilustraciones. Los datos curiosos y los lugares cerca de Guarne son donde más pesa la voz y el conocimiento de Sergio.
- Fuentes de datos con licencia que permita el uso, citadas en la web.

## Decisiones que tomé yo (Claude), revisables

- **Ruta:** `/es/aves` para la guía y `/es/aves/[slug]` para cada ficha; el slug es el nombre común en español, normalizado. Cada ficha es una página indexable.
- **Cómo se mide "más comunes":** como la web es comercial, el primer paso del proyecto es verificar las licencias. Por lo que se sabe, la API de eBird y los datos de la UICN no permiten uso comercial sin permiso.
    - **Plan A:** contar registros en GBIF para Colombia y para Latinoamérica, filtrando solo datasets CC0 y CC BY. Hay que verificar con qué licencia está publicado en GBIF el dataset de observaciones de eBird (EOD); si es CC BY, el ranking puede salir de ahí con atribución.
    - **Plan B:** pedir a Cornell/eBird permiso de uso comercial.
    - **Conservación:** en lugar de la UICN, la lista oficial de especies amenazadas de Colombia (Minambiente), que es información pública. Se verifica su vigencia y sus condiciones de uso.
    - Si ninguna vía funciona, se le avisa a Sergio antes de construir.
- **Taxonomía:** la de eBird/Clements, para que los datos casen sin traducciones.
- **Formato de las ilustraciones:** todas con la misma pose de perfil, fondo limpio o transparente y una escala consistente, para poder componer luego las láminas por familia del libro. Resolución pensada para imprimir (mínimo 2048 px en el lado largo) y versiones optimizadas para la web.
- **Revisión de ilustraciones:** dos pasos. Primero, una revisión automática con un modelo de visión que compara la ilustración contra los rasgos de identificación de la ficha y marca las dudosas. Después, Sergio aprueba o rechaza cada una.
- **Lotes:** una familia a la vez, empezando por las especies más comunes, al ritmo que permita el cupo gratuito diario.
- **Generación de imágenes:** antes de construir nada se verifica si el cupo gratuito de la API de Gemini incluye generación de imágenes. Si lo incluye, se hace un generador por lotes. Si no, el flujo es semimanual: se genera en AI Studio (no en la app de Gemini, que pone marca de agua visible), y un script recibe las imágenes, las revisa automáticamente y las pone en la cola de revisión.
- **Textos de las fichas:** se redactan en sesiones de Claude Code, una familia por sesión, dentro de la suscripción. No hay script contra una API de pago.
- **Inglés:** la interfaz y las fichas completas se traducen al inglés con Claude. Sergio revisa solo la versión en español; la inglesa se deriva de ella. Los slugs son los mismos en los dos idiomas (en español), como el resto del sitio.
- **"Dónde verla cerca de Medellín y Guarne":** el bloque solo aparece en las especies que se ven en Antioquia. En las demás no se muestra.

## Lo que se deja al constructor

- Dónde viven los datos (archivos JSON o MDX en el repo, o tablas en Supabase) y dónde se guardan las imágenes (`public/`, Supabase Storage u otro), respetando la regla de costo cero.
- Cómo se registra el estado de cada ilustración (pendiente, generada, marcada, aprobada, rechazada) y la herramienta con la que Sergio revisa.
- Los prompts de generación de Nano Banana y la forma de pasarles referencias.
- El diseño visual detallado de la galería, los filtros y la ficha, dentro del sistema de diseño del sitio.
- Las fuentes de datos para los nombres populares, el hábitat, la altitud, la UICN y las regiones, siempre que la licencia lo permita.
