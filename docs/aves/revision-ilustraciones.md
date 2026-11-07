# Revisión automática de ilustraciones

Procedimiento que sigue Claude, en una sesión de Claude Code, con cada lote de ilustraciones recién ingeridas. Es el primer filtro. Solo marca o deja pasar: **nunca pone `aprobada`**, que es decisión de Sergio en `/es/admin/aves`.

## Pasos

1. Listar lo pendiente:

   ```bash
   npx tsx scripts/aves/estado.ts listar generada
   ```

2. Por cada ilustración, abrir la WebP de 1024 px que indica la lista y, al lado, los rasgos esperados de esa especie y variante en `content/aves/prompts/<familia>.json`. Comprobar:
   - **Cada rasgo de campo del texto**, uno por uno: colores y su ubicación (corona, nuca, espalda, ala, cola, garganta, pecho, vientre), parches y barras, color y forma del pico, color de patas y ojo.
   - **Proporciones:** largo de cola y pico respecto al cuerpo, coherentes con `tamanoCm` y con la familia.
   - **Anatomía:** dos patas, cuatro dedos con la disposición correcta para la familia (p. ej. zigodáctila en carpinteros y loros), un solo pico, alas bien plegadas.
   - **Formato:** perfil mirando a la izquierda, fondo blanco, sin texto, marco, sombra ni otras aves.
   - **Confusión:** que no se parezca más a una especie similar que a la pedida.

3. Registrar el resultado:

   ```bash
   # todo coincide
   npx tsx scripts/aves/estado.ts poner <slug--variante> revisada-auto
   # algo falla: nombrar el rasgo concreto
   npx tsx scripts/aves/estado.ts poner <slug--variante> marcada "hombro blanco: debe ser violeta-azul"
   ```

4. Reportar a Sergio un resumen del lote: cuántas pasaron, cuáles quedaron marcadas y por qué. Luego Sergio revisa todas en `/es/admin/aves`, empezando por las marcadas.

## Criterio

Ante la duda, marcar. Una ilustración marcada que estaba bien le cuesta a Sergio un clic; una mala que pasa puede llevar a identificar mal un ave.
