// ============================================================
// Experiencias IA — datos del grupo
// Fuente: transcripciones de las sesiones grupales (ver handoffs en
// docs/superpowers/specs/anexos/experiencias-ia/). Regla madre: cero
// contenido inventado; lo que falte se muestra como "pendiente".
//
// Para agregar una sesión: agrega un objeto al final de SESIONES.
// Para una fecha sin transcripción: { fecha, fechaLarga, estado: 'sin-registro' }.
// ============================================================

export type Referencia = { titulo: string; nota: string; url: string }
export type Concepto = { t: string; d: string }

export type Sesion = {
  n: number
  fecha: string
  fechaLarga: string
  titulo: string
  /** Frase-gancho que se ve en la tarjeta. */
  gancho: string
  /** 3–5 hallazgos cortos. */
  hallazgos?: string[]
  asistentes?: string[]
  enlaces: Referencia[]
  encargado?: string
  destacada?: boolean
  nuevos?: string[]
  // Detalle largo (sesiones hasta julio): se muestra colapsado.
  resumen?: string[]
  temas?: string[]
  conceptos?: Concepto[]
  decisiones?: string[]
}

export type SinRegistro = {
  fecha: string
  fechaLarga: string
  estado: 'sin-registro'
  nota?: string
}

export type EntradaSesion = Sesion | SinRegistro

/** Propuestas voluntarias: nadie es "responsable", alguien "propone". */
export type Tema = {
  tema: string
  propone: string
  surgio?: string
  nota?: string
  estado: 'propuesto'
}

/** Solo se muestra con consentimiento: true y el texto que la persona aprobó. */
export type Persona = {
  nombre: string
  desde: string
  texto: string
  consentimiento: boolean
}

/** Proyecto mostrado en sesión; solo se publica con permiso de su autor. */
export type ProyectoTaller = {
  autor: string
  proyecto: string
  descripcion: string
  publicar: boolean
}

export type Principio = { titulo: string; texto: string }
export type Grupo = {
  nombre: string
  lema: string
  cadencia: string
  lugar: string
  desde: string
  descripcion: string
  principioMadre: string
  formato: string[]
  principios: Principio[]
}

export const GRUPO: Grupo = {
  nombre: 'Experiencias IA',
  lema: 'Un caballo desbocado necesita riendas, no menos fuerza.',
  cadencia: 'Miércoles, 7:30 – 8:30 p.m. (GMT-5)',
  lugar: 'Medellín, Colombia — remoto',
  desde: '4 de junio de 2026',
  descripcion:
    'Empezó como un grupo de estudio y terminó siendo un círculo de apoyo técnico. Profesionales de desarrollo, datos, finanzas, biología, logística, educación y dirección tecnológica que se juntan una vez por semana a contar qué probaron, qué se les rompió y qué aprendieron con inteligencia artificial. Sin tareas obligatorias. Sin entregables. Con mucha conversación.',
  principioMadre: 'Aquí ningún compromiso es obligatorio. Venimos a contar experiencias.',
  formato: [
    'Primero, una ronda de intervenciones cortas: unos 3 a 5 minutos por persona.',
    'Después, conversación abierta. Nada de presentaciones largas tipo tutorial.',
  ],
  principios: [
    {
      titulo: 'La IA es colaborador, no reemplazo',
      texto:
        'Multiplicador de capacidades, «ejército de juniors». Requiere supervisión humana constante, juicio crítico y responsabilidad ética de quien la usa.',
    },
    {
      titulo: 'El contexto es el recurso escaso',
      texto:
        'Tokens, ventana de contexto, CLAUDE.md, Proyectos, poda periódica, revelación progresiva. El tema técnico más recurrente de todas las sesiones.',
    },
    {
      titulo: 'Ser dueños del problema',
      texto:
        'Las plataformas absorben funcionalidades a una velocidad imposible de igualar. El valor está en entender el problema, no en competir construyendo herramientas.',
    },
    {
      titulo: 'Sin tareas obligatorias',
      texto:
        'El aprendizaje más caro del grupo: los grupos de estudio con deberes mueren en tres semanas. Los retos existen para tener lenguaje común, no para calificar.',
    },
  ],
}

// Miércoles en que NO habrá sesión (festivos, vacaciones). La próxima
// sesión se calcula sola: el siguiente miércoles que no esté aquí.
export const MIERCOLES_SIN_SESION: Array<{ fecha: string; nota: string }> = []

export const SESIONES: EntradaSesion[] = [
  {
    n: 1,
    fecha: '2026-06-04',
    fechaLarga: '4 de junio de 2026',
    titulo: 'Utilidad, dependencia y ética',
    encargado: 'Sergio Monsalve',
    gancho:
      'Sesión fundacional. Experiencias personales, expectativas del grupo y el primer debate ético sobre alucinaciones.',
    resumen: [
      'Sesión fundacional centrada en experiencias personales y reflexión ética. Se presentó la actividad, los participantes y las expectativas del grupo de estudio.',
      'Cristina Aristizábal contó cómo creó un sitio web funcional para un baby shower usando Claude, sin saber programar. El caso abrió la conversación sobre qué significa realmente «saber hacer» algo con IA.',
      'Jorge Johnson planteó desde el inicio que este no sería un grupo académico como los de astronomía o sesgos cognitivos: aquí las expectativas de cada participante son radicalmente distintas, y esa diversidad es el punto.',
    ],
    temas: ['Ética y alucinaciones', 'Expectativas del grupo', 'Primeros experimentos'],
    decisiones: [
      'El grupo se acota inicialmente a cuatro sesiones para evaluar si continúa.',
      'No se impondrán tareas académicas rígidas.',
    ],
    enlaces: [],
  },
  {
    n: 2,
    fecha: '2026-06-09',
    fechaLarga: '9 de junio de 2026',
    titulo: 'Logística, saturación y automatización de flujos',
    encargado: 'Sergio Monsalve',
    gancho:
      'Se fija la cadencia semanal. Aparecen la saturación cognitiva y las skills conectadas a fuentes de datos.',
    resumen: [
      'Se acordó establecer reuniones semanales para fomentar la colaboración técnica, con un grupo de perfiles diversos interesados en desarrollo de software y optimización mediante IA.',
      'Los integrantes discutieron la saturación por la rápida evolución tecnológica y la necesidad de pensamiento crítico. Se validó la utilidad de automatizar procesos repetitivos mediante habilidades conectadas a fuentes de datos.',
      'El uso de sistemas para centralizar contextos y memoria facilita la toma de decisiones. Se destacó la importancia de las herramientas de síntesis para aprender sobre gestión efectiva de contexto.',
    ],
    temas: ['Skills', 'Gestión de contexto', 'Infoxicación', 'Obsidian'],
    decisiones: ['Cadencia definitiva: miércoles de 7:30 a 8:30 p.m.'],
    enlaces: [],
  },
  {
    n: 3,
    fecha: '2026-06-10',
    fechaLarga: '10 de junio de 2026',
    titulo: 'Arquitectura, MemPalas y el rol del programador',
    encargado: 'Jorge Johnson',
    gancho:
      'Calidad de software bajo IA, memoria institucional con palacios de memoria y la primera discusión seria de metodología.',
    resumen: [
      'Los participantes discutieron la dependencia de la IA para generar código, enfatizando la necesidad crítica de supervisión humana constante para garantizar arquitectura y mantenibilidad. La conclusión: la IA funciona como asistente que requiere lineamientos estrictos para evitar fallas estructurales.',
      'Juan David Pineda Cárdenas introdujo MemPalas, solución de memoria institucional basada en técnicas nemotécnicas de palacios de memoria y arquitecturas de bases de datos no estructuradas, ya implementada en su oficina.',
      'Jorge Johnson afirmó que las IA actuales no están diseñadas para diseñar software, sino para ejecutar tareas, lo que produce código de mala calidad o repetitivo si no se supervisan constantemente.',
      'Sergio insistió en dividir los proyectos en un backlog de tickets para mantener control sobre los avances.',
    ],
    temas: ['Arquitectura', 'Refactorización', 'Pruebas automatizadas', 'MemPalas', 'Backlog de tickets'],
    decisiones: [
      'Mantener un repositorio compartido para documentar aprendizajes y validar recursos técnicos.',
      'Enfoque flexible: cada integrante comparte sus investigaciones de manera colaborativa.',
    ],
    enlaces: [],
  },
  {
    n: 4,
    fecha: '2026-06-24',
    fechaLarga: '24 de junio de 2026',
    titulo: 'Consolidación de la comunidad de práctica',
    encargado: 'Jorge Johnson',
    gancho:
      'El grupo pasa de definir logística a operar como comunidad de práctica con presentaciones cortas y repositorio compartido.',
    resumen: [
      'El grupo consolidó su dinámica: tareas de investigación individual, presentaciones cortas, repositorio compartido de recursos y un rol de moderación estable.',
      'Continuaron los hilos sobre gestión de contexto y skills como unidad de trabajo modular, incluyendo el uso de un «skill para crear skills» como camino para profesionalizar el uso de IA.',
    ],
    temas: ['Comunidad de práctica', 'Skill creator', 'Repositorio compartido'],
    decisiones: [],
    enlaces: [],
  },
  {
    n: 5,
    fecha: '2026-06-30',
    fechaLarga: '30 de junio – 2 de julio de 2026',
    titulo: 'Jarvis, contexto compartido y el futuro de los dashboards',
    encargado: 'Sergio Monsalve',
    gancho:
      'Asistentes personales tipo Jarvis, sus límites por falta de memoria persistente, y un debate sobre storytelling de datos.',
    resumen: [
      'Diego insistió en la necesidad de contexto compartido en equipos. Se discutió el proyecto «Jarvis» personal —calendario, correo, WhatsApp, Obsidian— y sus límites por falta de memoria persistente.',
      'Andrés presentó su uso de LLMs para generación y calificación de leads según perfil de cliente ideal (ICP).',
      'El cierre fue un debate filosófico sobre creatividad de la IA, el futuro de los dashboards frente al storytelling de datos y la vigencia de la interpretación humana.',
    ],
    temas: ['Jarvis', 'Memoria persistente', 'ICP y leads', 'Dashboards vs. storytelling'],
    decisiones: [],
    enlaces: [],
  },
  {
    n: 6,
    fecha: '2026-07-08',
    fechaLarga: '8 de julio de 2026',
    titulo: 'Identidad del grupo y seguridad en código generado',
    encargado: 'Sergio Monsalve',
    gancho:
      'Entra sangre nueva. Se consolida la identidad como comunidad horizontal y se abre el frente de seguridad.',
    resumen: [
      'El grupo consolidó su propósito como comunidad técnica centrada en compartir experiencias sobre IA, priorizando el intercambio horizontal frente a estructuras académicas rígidas.',
      'La discusión subrayó la importancia de la supervisión humana y las pruebas estrictas al implementar IA. Se descartó confiar ciegamente en código generado sin auditoría técnica.',
      'Se decidió reenfocar la enseñanza hacia el uso de IA en lugar de la sintaxis tradicional: el desarrollo evolucionará desde la codificación manual hacia la generación directa de ejecutables.',
      'Juan David Torres recordó por qué funcionan estos grupos: uno no puede estar en siete frentes al mismo tiempo, y llegar a un espacio donde alguien te dice «¿viste tal cosa?» es lo que sostiene el aprendizaje.',
      'Se incorporó Juan Francisco Cardona McCormick.',
    ],
    temas: ['Identidad del grupo', 'Seguridad en código generado', 'Educación e IA', 'Metodología Némesis'],
    decisiones: ['El grupo de WhatsApp se usa para proponer temas y organizar la siguiente sesión.'],
    enlaces: [],
  },
  {
    n: 7,
    fecha: '2026-07-15',
    fechaLarga: '15 de julio de 2026',
    titulo: 'Harness Engineering',
    encargado: 'Sergio Monsalve',
    destacada: true,
    gancho:
      'El caballo, el arnés y el jinete. Las tres capas de ingeniería con LLMs y el patrón de Hashimoto.',
    resumen: [
      'Todo agente de IA funciona hasta que no. Bajo condiciones controladas escriben código, navegan y operan software de forma autónoma. En producción fallan de forma impredecible: no hay memoria entre sesiones, no se sabe cuándo se detienen ni cómo validan su propio trabajo.',
      'El harness engineering es la disciplina de diseñar los sistemas, restricciones y ciclos de retroalimentación que envuelven a un agente para hacerlo confiable en producción. El harness no es el agente: es la infraestructura que gobierna cómo opera, qué herramientas puede invocar, dónde obtiene información, cómo valida decisiones y cómo se detiene.',
      'La metáfora: el modelo es el caballo, el arnés son las riendas y la silla, y el jinete da la dirección. Un buen arnés no previene los errores — hace al agente más capaz dándole contexto, herramientas y las restricciones correctas en el momento correcto. Cada error se convierte en una regla nueva del arnés.',
      'Origen: en febrero de 2026 Mitchell Hashimoto —cocreador de Terraform, fundador de HashiCorp— publica sobre engineering the harness. Semanas después Anthropic y OpenAI publican artículos propios. Martin Fowler lo define como las herramientas y prácticas para mantener a los agentes bajo control.',
      'Convergencia clave: la guía empírica de desarrollo de Jorge Johnson y el marco formal de harness engineering llegan a lo mismo por caminos distintos. Jorge desde el proceso, el harness desde la infraestructura. Specs como fuente de verdad ↔ context delivery. Puerta de plan antes de tocar código ↔ approval gates. Criterios de aceptación binarios ↔ ciclos de verificación. Reglas del proyecto en documentos ↔ configuración del harness.',
      'La tesis más profunda: la fuerza de voluntad no basta. La voluntad no frena el sesgo de automatización; lo que funciona es la fricción productiva, puertas de diseño que obligan a un acto deliberado.',
      'Los mejores arneses se diseñan sabiendo que serán innecesarios a medida que los modelos mejoren.',
    ],
    temas: [
      'Harness Engineering',
      'Patrón de Hashimoto',
      'Tres capas: prompt / context / harness',
      'Fricción productiva',
      'Loop Engineering',
      'Huellas de modelos',
      'OpenRouter',
    ],
    conceptos: [
      { t: 'Prompt engineering', d: 'Un turno.' },
      { t: 'Context engineering', d: 'Una sesión.' },
      {
        t: 'Harness engineering',
        d: 'Trabajo continuo: horas y cientos de decisiones, con herramientas, validación y restricciones arquitectónicas.',
      },
      {
        t: 'Patrón de Hashimoto',
        d: 'Cada error del agente se convierte en un arreglo permanente del entorno. El sistema se realimenta y mejora a sí mismo.',
      },
      {
        t: 'Cinco primitivas',
        d: 'Sistema de archivos, ejecución de código, sandbox controlado, memoria persistente y gestión de contexto.',
      },
    ],
    decisiones: [
      'Se adopta el glosario vivo de 40 términos clave en cuatro categorías: fundamentos, contexto y memoria, seguridad y control, operación y evaluación.',
      'Se comparte un repositorio de aprendizaje con cinco módulos y dos proyectos prácticos.',
      'Jorge Johnson asume formalmente el rol de moderador.',
    ],
    enlaces: [
      { titulo: 'Mitchell Hashimoto — Engineering the Harness', nota: 'Publicación original, febrero de 2026', url: '' },
      { titulo: 'Martin Fowler — definición de harness', nota: 'Herramientas y prácticas para mantener agentes bajo control', url: '' },
      { titulo: 'Repositorio de aprendizaje del grupo', nota: 'Cinco módulos, dos proyectos', url: '' },
      { titulo: 'OpenRouter', nota: 'Gestión centralizada de múltiples llaves de API', url: '' },
    ],
    nuevos: ['Rafael David Rincón Bermúdez', 'Alejandra Santamaría', 'José Luis Montoya Pareja'],
  },
  {
    n: 8,
    fecha: '2026-07-22',
    fechaLarga: '22 de julio de 2026',
    titulo: 'Agentes en local, infraestructura y democratización',
    encargado: 'Juan David Torres · Sergio Monsalve',
    gancho:
      'Demostración de agentes en entornos aislados, costos de infraestructura local y la IA como mentor de metaaprendizaje.',
    resumen: [
      'Se discutió la implementación de asistentes bajo el concepto de ingeniero de avance. Se acordó desplegar demostraciones iniciales en entornos locales aislados para garantizar la seguridad de los datos.',
      'Los participantes analizaron la necesidad de gestionar infraestructura local para reducir costos operativos a largo plazo, y enfatizaron la importancia de democratizar el acceso al conocimiento frente a barreras financieras.',
      'La combinación de habilidades técnicas con visión ejecutiva fortalece los proyectos colaborativos. El uso de IA como mentor permite potenciar el metaaprendizaje y la adaptación profesional.',
    ],
    temas: ['Agentes locales', 'Infraestructura propia', 'Modelos locales', 'Metaaprendizaje', 'Raspberry Pi'],
    decisiones: ['Las demostraciones de agentes se hacen primero en entornos locales aislados.'],
    enlaces: [],
  },
  // ---------- Actualización 29 jul – 14 oct 2026 ----------
  { fecha: '2026-07-29', fechaLarga: '29 de julio de 2026', estado: 'sin-registro' },
  {
    n: 9,
    fecha: '2026-08-05',
    fechaLarga: '5 de agosto de 2026',
    titulo: '19 modelos, 11 lenguajes',
    gancho:
      'Jorge mostró su benchmark: 19 modelos abiertos, 55 problemas, 11 lenguajes, 11.440 ejecuciones; los chinos y el modelo abierto de OpenAI lideran.',
    hallazgos: [
      'Hizo tres apps de sistema en una tarde.',
      'Diego mostró presentaciones en HTML generadas como sistema de diseño.',
      'Se propuso una sesión de radiofrecuencia.',
    ],
    asistentes: ['Sergio', 'Jorge', 'Diego', 'Juan Pablo', 'José Luis', 'Juan David Pineda'],
    enlaces: [],
  },
  { fecha: '2026-08-12', fechaLarga: '12 de agosto de 2026', estado: 'sin-registro', nota: 'Sin quórum: conversación entre Sergio y Jorge' },
  {
    n: 10,
    fecha: '2026-08-19',
    fechaLarga: '19 de agosto de 2026',
    titulo: 'Hacer frente a estudiar',
    gancho: '¿Vale la pena certificarse? Para el mercado sí; para aprender, construir.',
    hallazgos: [
      'Jorge: limpiar la sesión al 25–30 % de contexto y hacer commit cada pocos minutos.',
      'Diego resolvió un bug de Cowork en Windows.',
      'Temas propuestos: marcas de agua en texto IA y «arqueología de código».',
    ],
    asistentes: ['Sergio', 'Jorge', 'Diego', 'Juan Pablo', 'Torres', 'Daniel', 'Juan David Pineda'],
    enlaces: [],
  },
  {
    n: 11,
    fecha: '2026-08-26',
    fechaLarga: '26 de agosto de 2026',
    titulo: 'Routers, cápsulas y 22 proyectos',
    gancho: 'Torres aprobó la certificación Architect Foundations y demostró OpenRouter y OmniRouter.',
    hallazgos: [
      'Sergio mostró sus cápsulas de cultivo automatizadas (ESP32, MQTT, Home Assistant, app móvil).',
      'Jorge presentó su catálogo de 22 proyectos en punk, incluida una CPU de 16 bits simulada.',
      'Diego diseña cohetes con OpenRocket.',
    ],
    asistentes: [
      'Sergio',
      'Jorge',
      'Diego',
      'Juan Pablo',
      'Torres',
      'Juan David Pineda',
      'Santiago Osorio',
      'Juan Francisco Cardona',
    ],
    enlaces: [],
    nuevos: ['Santiago Osorio'],
  },
  {
    n: 12,
    fecha: '2026-09-02',
    fechaLarga: '2 de septiembre de 2026',
    titulo: 'Software desechable',
    gancho: 'Diego construyó un simulador web de lanzamiento de cohetes en ~48 h con Claude Code en terminal.',
    hallazgos: [
      'Cowork frente a Claude Code para trabajo de conocimiento.',
      'Jorge predijo software «desechable» hecho al instante; Torres respondió con la paradoja de Jevons.',
      'Idea: que todos resuelvan el mismo miniproyecto y comparen sus harness.',
    ],
    asistentes: ['Sergio', 'Jorge', 'Diego', 'Juan Pablo', 'Torres'],
    enlaces: [],
  },
  {
    n: 13,
    fecha: '2026-09-09',
    fechaLarga: '9 de septiembre de 2026',
    titulo: '¿Papers o experiencias?',
    gancho: 'Se descartó leer papers en grupo; para eso, NotebookLM.',
    hallazgos: [
      'Diego probó OpenRouter con enrutamiento automático y le resultó caro e inestable.',
      'Torres propuso un experimento: mismo harness, distinto modelo.',
      'Jorge mostró su estación de radio por software.',
    ],
    asistentes: ['Sergio', 'Jorge', 'Diego', 'Juan Pablo', 'Torres', 'Daniel', 'Juan David Pineda'],
    enlaces: [],
  },
  {
    n: 14,
    fecha: '2026-09-16',
    fechaLarga: '16 de septiembre de 2026',
    titulo: 'Hooks, skills y la silla de cada uno',
    gancho: 'Las capas editables del harness: CLAUDE.md, settings, MCP, hooks, agentes.',
    hallazgos: [
      'Los hooks son deterministas; los skills no.',
      'Diego trabaja con Superpowers de punta a punta.',
      'Advertencia: los modelos leen los handoffs a medias («ley del mínimo token»).',
      'Torres compartió una iniciativa para donar tokens a problemas matemáticos.',
    ],
    asistentes: ['Sergio', 'Jorge', 'Diego', 'Juan Pablo', 'Torres', 'Juan David Pineda'],
    enlaces: [],
  },
  {
    n: 15,
    fecha: '2026-09-23',
    fechaLarga: '23 de septiembre de 2026',
    titulo: 'La primera app define el patrón',
    gancho:
      'Jorge: la primera aplicación que hagas le enseña al modelo tu estilo; si sale mal, mejor borrarla.',
    hallazgos: [
      'Hay que saber pedir diseño y arquitectura.',
      'Debate sobre si el harness dejará de ser necesario y sobre una posible burbuja de inversión en IA.',
    ],
    asistentes: ['Sergio', 'Jorge', 'Diego', 'Juan Pablo'],
    enlaces: [],
  },
  { fecha: '2026-09-30', fechaLarga: '30 de septiembre de 2026', estado: 'sin-registro' },
  {
    n: 16,
    fecha: '2026-10-07',
    fechaLarga: '7 de octubre de 2026',
    titulo: 'Retrospectiva: ¿nos sigue sirviendo?',
    gancho: 'Consenso: el grupo sirve y debe seguir siendo práctico, no teórico.',
    hallazgos: [
      'Compartir experiencias es la defensa contra el FOMO.',
      'Juan Pablo mostró su primera app móvil hecha con Claude Code siguiendo buenas prácticas.',
      'Diego hizo que sus sesiones de Claude Code se comunicaran entre sí.',
      'Jorge mostró Glotis (modulador de voz) y Ronquera (consola de podcast).',
      'Daniel usa el harness Gentle AI.',
    ],
    asistentes: ['Sergio', 'Jorge', 'Diego', 'Juan Pablo', 'Torres', 'Daniel', 'Santiago'],
    enlaces: [],
  },
  {
    n: 17,
    fecha: '2026-10-14',
    fechaLarga: '14 de octubre de 2026',
    titulo: 'Nuevo formato y caras nuevas',
    gancho: 'Primera sesión con ronda de presentaciones cortas.',
    hallazgos: [
      'Alejandra mostró una app gamificada de matemáticas para la vida.',
      'Torres explicó la certificación de arquitecto de Anthropic (5 dominios, 6 escenarios).',
      'Juan Pablo mostró su app de guitarra y una carátula de reloj Garmin.',
      'José Luis usa IA para calificar proyectos y planea un libro para aula invertida.',
      'Diego lanzó su podcast «Cielo contado».',
      'Sergio propuso un proyecto colaborativo abierto (New Old School).',
    ],
    asistentes: [
      'Sergio',
      'Jorge',
      'Diego',
      'Juan Pablo',
      'Torres',
      'José Luis',
      'Santiago',
      'Alejandra Santamaría',
      'Carlos Mario Espíndola',
      'Javier C. Álvarez',
      'Sebastián Calle',
    ],
    enlaces: [],
    nuevos: ['Carlos Mario Espíndola', 'Javier C. Álvarez', 'Sebastián Calle'],
  },
  {
    n: 18,
    fecha: '2026-10-21',
    fechaLarga: '21 de octubre de 2026',
    titulo: 'Agentes que trabajan de noche',
    gancho: 'Diego y Jorge dejan a los agentes trabajando solos toda la noche; Juan Pablo preguntó cómo.',
    hallazgos: [
      'Diego pidió publicar su primer plugin en el marketplace de Anthropic.',
      'Bellaco, el motor de ajedrez evolutivo de Jorge, lleva dos meses de CPU continua y ya venció a 21 motores del mercado.',
      'Diego convirtió un error repetido de Claude en una regla dura: «ocho veces he fallado porque no lo aplico».',
      'Javier mostró modelos de lenguaje de proteínas para detectar patógenos en alimentos (proyecto con la UE y 14 instituciones).',
      'Juan Pablo usa el control remoto de Claude Code para seguir desarrollando su app de Garmin mientras está en reuniones.',
    ],
    asistentes: [
      'Sergio',
      'Jorge',
      'Diego',
      'Juan Pablo',
      'Torres',
      'Santiago',
      'Alejandra Santamaría',
      'Carlos Mario Espíndola',
      'Javier C. Álvarez',
    ],
    enlaces: [],
  },
  {
    n: 19,
    fecha: '2026-10-28',
    fechaLarga: '28 de octubre de 2026',
    titulo: '¿Hacia dónde va el grupo?',
    gancho: 'Juan Pablo: el valor del grupo está en compartir experiencias prácticas y resolver dudas sobre la marcha.',
    hallazgos: [
      'Sergio prueba Reverse Engineer Anything para hacer su propia versión de Obsidian sobre su bóveda de unas 2.700 notas.',
      'Jorge: muchas capas de software se volverán desechables en vez de pagar licencias corporativas.',
      'Juan Pablo necesita 14 testers que toquen guitarra para publicar su app en Play Store.',
      'Javier: con la IA, las revistas científicas exigen más rigor y datos mejor curados.',
      'Alejandra propuso agendar ponencias y transmitir por YouTube; Jorge señaló que lo que mostramos son demos frente al software empresarial.',
    ],
    asistentes: ['Sergio', 'Jorge', 'Juan Pablo', 'Torres', 'Alejandra Santamaría', 'Javier C. Álvarez'],
    enlaces: [],
  },
]

export const TEMAS: Tema[] = [
  // ---------- Propuestos entre agosto y octubre ----------
  {
    tema: 'Lo no técnico: cómo le hablamos a la máquina (enojarse, dar las gracias, tono)',
    propone: 'Jorge Johnson',
    surgio: '2026-10-28',
    estado: 'propuesto',
  },
  { tema: 'Reto: app de identificación de hongos', propone: 'Sergio Monsalve', surgio: '2026-10-28', estado: 'propuesto' },
  {
    tema: 'Serie piloto limitada con miniponencias e invitados',
    propone: 'Sergio Monsalve',
    surgio: '2026-10-28',
    estado: 'propuesto',
  },
  {
    tema: 'Agenda de ponencias y transmisión por YouTube',
    propone: 'Alejandra Santamaría',
    surgio: '2026-10-28',
    estado: 'propuesto',
  },
  {
    tema: 'Sesiones de retroalimentación sobre los proyectos de cada uno',
    propone: 'Sergio Monsalve',
    surgio: '2026-10-28',
    estado: 'propuesto',
  },
  {
    tema: 'Hackatón con patrocinadores, charlas cortas y retos a partir de specs',
    propone: 'Sergio Monsalve',
    surgio: '2026-10-21',
    estado: 'propuesto',
  },
  {
    tema: 'Evento abierto donde cada uno muestre lo que ha hecho con IA',
    propone: 'Sergio Monsalve',
    surgio: '2026-10-21',
    estado: 'propuesto',
  },
  {
    tema: 'Modelos de lenguaje para proteínas y detección de patógenos',
    propone: 'Javier C. Álvarez',
    surgio: '2026-10-14',
    estado: 'propuesto',
  },
  {
    tema: 'Pasar el contexto de una sesión de Claude a otra máquina vía repositorio',
    propone: 'José Luis Montoya',
    surgio: '2026-10-14',
    estado: 'propuesto',
  },
  {
    tema: 'Cómo contribuir a New Old School donando horas de IA',
    propone: 'Sergio Monsalve',
    surgio: '2026-10-14',
    estado: 'propuesto',
  },
  {
    tema: 'Orquestadores de agentes (Orca, Herder): ¿hacen falta?',
    propone: 'Sergio Monsalve',
    surgio: '2026-10-07',
    estado: 'propuesto',
  },
  { tema: 'Encuentro presencial en Guarne', propone: 'Sergio Monsalve', surgio: '2026-09-10', estado: 'propuesto' },
  {
    tema: 'Mismo harness, distinto modelo: Claude frente a un modelo chino',
    propone: 'Juan David Torres',
    surgio: '2026-09-09',
    estado: 'propuesto',
  },
  {
    tema: 'Sesión de trabajo: un mismo miniproyecto, cada uno con su harness',
    propone: 'Sergio Monsalve',
    surgio: '2026-09-02',
    estado: 'propuesto',
  },
  {
    tema: 'Computación cuántica con un invitado (preparar preguntas antes)',
    propone: 'Sergio Monsalve / Jorge Johnson',
    surgio: '2026-09-02',
    estado: 'propuesto',
  },
  {
    tema: 'Arqueología de código: entender bases heredadas con IA',
    propone: 'Juan David Torres',
    surgio: '2026-08-19',
    estado: 'propuesto',
  },
  {
    tema: 'Marcas de agua y esteganografía en texto generado por IA',
    propone: 'Juan Pablo Duque',
    surgio: '2026-08-19',
    estado: 'propuesto',
  },
  // ---------- Backlog anterior (junio – julio) ----------
  {
    tema: 'Curso de preparación para la certificación oficial de Anthropic',
    propone: 'Sergio Monsalve · Juan David Torres',
    surgio: '2026-07-22',
    nota: 'Estructurar programa de formación.',
    estado: 'propuesto',
  },
  {
    tema: 'Glosario vivo de 40 términos',
    propone: 'El grupo',
    surgio: '2026-07-15',
    nota: 'Fundamentos, contexto y memoria, seguridad y control, operación y evaluación.',
    estado: 'propuesto',
  },
  {
    tema: 'Loop Engineering',
    propone: 'Juan David Torres',
    nota: 'Complemento del harness engineering para desarrollo con agentes.',
    estado: 'propuesto',
  },
  {
    tema: 'Agentes en Raspberry Pi',
    propone: 'Sergio Monsalve',
    nota: 'Viabilidad técnica de ejecución en hardware modesto.',
    estado: 'propuesto',
  },
  {
    tema: 'Modelos locales disponibles',
    propone: 'El grupo',
    nota: 'Inventario de modelos ejecutables sin nube.',
    estado: 'propuesto',
  },
  {
    tema: 'MemPalas — memoria institucional',
    propone: 'Juan David Pineda Cárdenas',
    surgio: '2026-06-10',
    nota: 'Palacios de memoria aplicados a memoria organizacional.',
    estado: 'propuesto',
  },
  {
    tema: 'Metodología Némesis',
    propone: 'Juan Francisco Cardona McCormick',
    nota: 'Interacción crítica y adversarial con modelos.',
    estado: 'propuesto',
  },
  {
    tema: 'Huellas y sesgos de modelos',
    propone: 'Juan David Torres',
    nota: 'Estilos de escritura identificables por modelo.',
    estado: 'propuesto',
  },
  {
    tema: 'El futuro de los dashboards',
    propone: 'Andrés Pérez',
    surgio: '2026-06-30',
    nota: 'Storytelling de datos frente al tablero tradicional.',
    estado: 'propuesto',
  },
  {
    tema: 'Vibe Engineering',
    propone: 'Juan David Torres',
    nota: 'Crítica a la ilusión de velocidad y la deuda técnica acumulada. Libro en curso.',
    estado: 'propuesto',
  },
  {
    tema: 'Automatización de talleres de electrónica con sensores',
    propone: 'José Luis Montoya Pareja',
    nota: 'Video de la experiencia en España.',
    estado: 'propuesto',
  },
  {
    tema: 'Agilismo en la era de la IA',
    propone: 'Carlos Eduardo Monsalve',
    nota: '¿Hay un retorno a fases de análisis tipo cascada?',
    estado: 'propuesto',
  },
]

/** Temas que salieron del backlog, con la razón. */
export const TEMAS_FUERA: Array<{ tema: string; nota: string }> = [
  { tema: 'Radiofrecuencia', nota: 'Salió del backlog: ahora tiene su propio grupo los viernes.' },
]

// Los perfiles generados a partir de transcripciones se retiraron.
// Cada integrante aparece solo con consentimiento: true y el texto que
// él o ella misma apruebe. Los `texto` de abajo son borradores por aprobar.
export const PERSONAS: Persona[] = [
  { nombre: 'Sergio Monsalve', desde: '2026-06-04', texto: '', consentimiento: false },
  { nombre: 'Jorge Johnson', desde: '2026-06-04', texto: '', consentimiento: false },
  { nombre: 'Juan David Torres', desde: '2026-06-04', texto: '', consentimiento: false },
  { nombre: 'Diego Fernando Robledo', desde: '2026-06-04', texto: '', consentimiento: false },
  { nombre: 'Daniel Moreno Agudelo', desde: '2026-06-04', texto: '', consentimiento: false },
  { nombre: 'Juan Pablo Duque Ochoa', desde: '2026-06-04', texto: '', consentimiento: false },
  { nombre: 'Cristina Aristizábal Johnson', desde: '2026-06-04', texto: '', consentimiento: false },
  { nombre: 'Carlos Eduardo Monsalve', desde: '2026-06-04', texto: '', consentimiento: false },
  { nombre: 'Juan David Pineda Cárdenas', desde: '2026-06-04', texto: '', consentimiento: false },
  { nombre: 'Martín Gonzalo Aguilar', desde: '2026-06-04', texto: '', consentimiento: false },
  { nombre: 'Pablo Álvarez', desde: '2026-06-09', texto: '', consentimiento: false },
  { nombre: 'Nicolás Montoya', desde: '2026-06-09', texto: '', consentimiento: false },
  { nombre: 'Jorge González', desde: '2026-06-09', texto: '', consentimiento: false },
  { nombre: 'Andrés Pérez', desde: '2026-06-10', texto: '', consentimiento: false },
  { nombre: 'Juan Francisco Cardona McCormick', desde: '2026-07-08', texto: '', consentimiento: false },
  { nombre: 'Rafael David Rincón Bermúdez', desde: '2026-07-15', texto: '', consentimiento: false },
  {
    nombre: 'Alejandra Santamaría',
    desde: '2026-07-15',
    texto:
      'Ingeniera biológica, docente, construye una plataforma de matemáticas por competencias.',
    consentimiento: false,
  },
  { nombre: 'José Luis Montoya Pareja', desde: '2026-07-15', texto: '', consentimiento: false },
  {
    nombre: 'Santiago Osorio',
    desde: '2026-08-26',
    texto:
      'Ingeniero de sistemas de EAFIT. Infraestructura, nube y soporte en su propia empresa, junto con Juan Pablo Duque.',
    consentimiento: false,
  },
  {
    nombre: 'Carlos Mario Espíndola Roa',
    desde: '2026-10-14',
    texto:
      'Ingeniero ambiental y administrador de empresas. Prepara un proyecto de educación digital y un taller para padres sobre tecnología e IA. Hace doblaje de voz.',
    consentimiento: false,
  },
  {
    nombre: 'Javier C. Álvarez',
    desde: '2026-10-14',
    texto:
      'Biólogo, profesor e investigador en bioinformática en EAFIT desde hace 13 años. Trabaja con modelos de lenguaje para proteínas.',
    consentimiento: false,
  },
  { nombre: 'Sebastián Calle', desde: '2026-10-14', texto: '', consentimiento: false },
]

// Vista "Taller": cada ficha se publica solo con permiso de su autor. Sin enlaces de descarga.
export const TALLER: ProyectoTaller[] = [
  {
    autor: 'Jorge Johnson',
    proyecto: 'punk y Metal Toy',
    descripcion: 'Lenguajes de programación propios hechos con IA; punk genera C y compila con GCC/Clang.',
    publicar: false,
  },
  {
    autor: 'Jorge Johnson',
    proyecto: 'Air Glob',
    descripcion:
      'Globo terráqueo con capas: satélites, aviones, cables submarinos, sismos, placas tectónicas, gases, naufragios.',
    publicar: false,
  },
  {
    autor: 'Jorge Johnson',
    proyecto: 'Catalejo',
    descripcion: 'Software de astronomía y navegación espacial con cálculo de n cuerpos.',
    publicar: false,
  },
  {
    autor: 'Jorge Johnson',
    proyecto: 'Chispa',
    descripcion:
      'Simulador de electrónica en protoboard; incluye una CPU de 16 bits que corre programas en un ensamblador propio.',
    publicar: false,
  },
  {
    autor: 'Jorge Johnson',
    proyecto: 'Bellaco, Caldo, Topo 3D, Glotis, Ronquera, Sopencos, Brasa',
    descripcion:
      'Ajedrez evolutivo; simulación de vida planetaria; vuelo 3D sobre el terreno; modulador de voz; consola de podcast; juego de palabras multijugador por Bluetooth; grabador de ESP32.',
    publicar: false,
  },
  {
    autor: 'Diego Robledo',
    proyecto: 'Simulador de cohetes y «Cielo contado»',
    descripcion:
      'Lanzamiento simulado de varios cohetes con atmósfera; podcast de astronomía narrado con voz sintética (Eleven Labs).',
    publicar: false,
  },
  {
    autor: 'Sergio Monsalve',
    proyecto: 'Cápsulas de cultivo, New Old School, Curioso',
    descripcion:
      'Cápsulas de hongos automatizadas con app móvil; colegio virtual open source; espacio de intervenciones cortas con Jorge.',
    publicar: false,
  },
  {
    autor: 'Juan Pablo Duque',
    proyecto: 'App de guitarra y carátula Garmin',
    descripcion: 'Diapasón interactivo con escalas, modos y acordes (React Native/Expo); carátula de reloj en Monkey C.',
    publicar: false,
  },
  {
    autor: 'Alejandra Santamaría',
    proyecto: 'Matemáticas para la vida',
    descripcion: 'App gamificada con diagnóstico por competencias para grados 10 y 11.',
    publicar: false,
  },
  {
    autor: 'Juan David Torres',
    proyecto: 'Experimentos de enrutamiento',
    descripcion: 'OpenRouter, OmniRouter local y LLM Router para bajar costos de modelos.',
    publicar: false,
  },
]

// ---------- Helpers ----------

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]
// Bogotá está en UTC-5 todo el año (sin horario de verano).
const DESFASE_BOGOTA_MS = 5 * 60 * 60 * 1000
const MIERCOLES = 3
const FIN_DE_SESION_MIN = 20 * 60 + 30 // 8:30 p.m.

/**
 * El próximo miércoles con sesión, en hora de Bogotá. Si hoy es miércoles y
 * la sesión no ha terminado, es hoy. Se salta los de MIERCOLES_SIN_SESION.
 */
export function getProximaSesion(ahora: Date = new Date()): { fecha: string; texto: string } {
  const local = new Date(ahora.getTime() - DESFASE_BOGOTA_MS)
  let dias = (MIERCOLES - local.getUTCDay() + 7) % 7
  if (dias === 0 && local.getUTCHours() * 60 + local.getUTCMinutes() >= FIN_DE_SESION_MIN) dias = 7

  const fecha = new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() + dias))
  const sinSesion = new Set(MIERCOLES_SIN_SESION.map(m => m.fecha))
  while (sinSesion.has(fecha.toISOString().slice(0, 10))) fecha.setUTCDate(fecha.getUTCDate() + 7)

  return {
    fecha: fecha.toISOString().slice(0, 10),
    texto: `Miércoles ${fecha.getUTCDate()} de ${MESES[fecha.getUTCMonth()]} de ${fecha.getUTCFullYear()}`,
  }
}

export function esSinRegistro(entrada: EntradaSesion): entrada is SinRegistro {
  return 'estado' in entrada && entrada.estado === 'sin-registro'
}

/** Solo las sesiones documentadas (con número y página propia). */
export function getSesionesDocumentadas(): Sesion[] {
  return SESIONES.filter((entrada): entrada is Sesion => !esSinRegistro(entrada))
}

/** Todas las entradas de la bitácora, la más reciente primero. */
export function getBitacora(): EntradaSesion[] {
  return [...SESIONES].sort((a, b) => b.fecha.localeCompare(a.fecha))
}

export function getSesion(n: number): Sesion | undefined {
  return getSesionesDocumentadas().find(sesion => sesion.n === n)
}

export function getAdjacentSesiones(n: number): { anterior?: Sesion; siguiente?: Sesion } {
  return { anterior: getSesion(n - 1), siguiente: getSesion(n + 1) }
}

export function getUltimasSesiones(count: number): Sesion[] {
  return getSesionesDocumentadas()
    .sort((a, b) => b.n - a.n)
    .slice(0, count)
}

export function getPersonasVisibles(): Persona[] {
  return PERSONAS.filter(persona => persona.consentimiento && persona.texto.trim() !== '')
}

export function getProyectosPublicados(): ProyectoTaller[] {
  return TALLER.filter(proyecto => proyecto.publicar)
}

/** Temas ordenados por fecha en que surgieron (más reciente primero; sin fecha al final). */
export function getTemasOrdenados(): Tema[] {
  return [...TEMAS].sort((a, b) => (b.surgio ?? '').localeCompare(a.surgio ?? ''))
}

export function getMetricas() {
  return {
    totalSesiones: getSesionesDocumentadas().length,
    totalIntegrantes: PERSONAS.length,
    temasPropuestos: TEMAS.length,
  }
}
