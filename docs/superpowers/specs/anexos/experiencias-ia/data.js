// ============================================================
// Experiencias IA — Base de datos del sitio
// Editar aquí para actualizar el contenido. Nada más.
// ============================================================

const GRUPO = {
  nombre: "Experiencias IA",
  lema: "Un caballo desbocado necesita riendas, no menos fuerza.",
  cadencia: "Miércoles, 7:30 – 8:30 p.m. (GMT-5)",
  lugar: "Medellín, Colombia — remoto",
  desde: "4 de junio de 2026",
  descripcion:
    "Empezó como un grupo de estudio y terminó siendo un círculo de apoyo técnico. Profesionales de desarrollo, datos, finanzas, biología, logística, educación y dirección tecnológica que se juntan una vez por semana a contar qué probaron, qué se les rompió y qué aprendieron con inteligencia artificial. Sin tareas obligatorias. Sin entregables. Con mucha conversación.",
  principios: [
    {
      titulo: "La IA es colaborador, no reemplazo",
      texto:
        "Multiplicador de capacidades, «ejército de juniors». Requiere supervisión humana constante, juicio crítico y responsabilidad ética de quien la usa.",
    },
    {
      titulo: "El contexto es el recurso escaso",
      texto:
        "Tokens, ventana de contexto, CLAUDE.md, Proyectos, poda periódica, revelación progresiva. El tema técnico más recurrente de todas las sesiones.",
    },
    {
      titulo: "Ser dueños del problema",
      texto:
        "Las plataformas absorben funcionalidades a una velocidad imposible de igualar. El valor está en entender el problema, no en competir construyendo herramientas.",
    },
    {
      titulo: "Sin tareas obligatorias",
      texto:
        "El aprendizaje más caro del grupo: los grupos de estudio con deberes mueren en tres semanas. Los retos existen para tener lenguaje común, no para calificar.",
    },
  ],
};

// ------------------------------------------------------------
// SESIONES
// estado: "cerrada" | "proxima" | "planeada"
// ------------------------------------------------------------
const SESIONES = [
  {
    n: 1,
    fecha: "2026-06-04",
    fechaLarga: "4 de junio de 2026",
    titulo: "Utilidad, dependencia y ética",
    estado: "cerrada",
    encargado: "Sergio Monsalve",
    resumenCorto:
      "Sesión fundacional. Experiencias personales, expectativas del grupo y el primer debate ético sobre alucinaciones.",
    resumen: [
      "Sesión fundacional centrada en experiencias personales y reflexión ética. Se presentó la actividad, los participantes y las expectativas del grupo de estudio.",
      "Cristina Aristizábal contó cómo creó un sitio web funcional para un baby shower usando Claude, sin saber programar. El caso abrió la conversación sobre qué significa realmente «saber hacer» algo con IA.",
      "Jorge Johnson planteó desde el inicio que este no sería un grupo académico como los de astronomía o sesgos cognitivos: aquí las expectativas de cada participante son radicalmente distintas, y esa diversidad es el punto.",
    ],
    temas: ["Ética y alucinaciones", "Expectativas del grupo", "Primeros experimentos"],
    decisiones: [
      "El grupo se acota inicialmente a cuatro sesiones para evaluar si continúa.",
      "No se impondrán tareas académicas rígidas.",
    ],
    pendientes: [],
    referencias: [],
  },
  {
    n: 2,
    fecha: "2026-06-09",
    fechaLarga: "9 de junio de 2026",
    titulo: "Logística, saturación y automatización de flujos",
    estado: "cerrada",
    encargado: "Sergio Monsalve",
    resumenCorto:
      "Se fija la cadencia semanal. Aparecen la saturación cognitiva y las skills conectadas a fuentes de datos.",
    resumen: [
      "Se acordó establecer reuniones semanales para fomentar la colaboración técnica, con un grupo de perfiles diversos interesados en desarrollo de software y optimización mediante IA.",
      "Los integrantes discutieron la saturación por la rápida evolución tecnológica y la necesidad de pensamiento crítico. Se validó la utilidad de automatizar procesos repetitivos mediante habilidades conectadas a fuentes de datos.",
      "El uso de sistemas para centralizar contextos y memoria facilita la toma de decisiones. Se destacó la importancia de las herramientas de síntesis para aprender sobre gestión efectiva de contexto.",
    ],
    temas: ["Skills", "Gestión de contexto", "Infoxicación", "Obsidian"],
    decisiones: [
      "Cadencia definitiva: miércoles de 7:30 a 8:30 p.m.",
    ],
    pendientes: [
      { quien: "Daniel Moreno Agudelo", que: "Presentar Skills y el proyecto de base de datos", estado: "cerrado" },
      { quien: "Sergio, Diego, Jorge", que: "Crear página personal aplicando lo discutido", estado: "abierto" },
      { quien: "Sergio Monsalve", que: "Investigar las skills mencionadas por Daniel", estado: "cerrado" },
      { quien: "Sergio Monsalve", que: "Experimentar con Obsidian y compartir un ejercicio", estado: "abierto" },
    ],
    referencias: [],
  },
  {
    n: 3,
    fecha: "2026-06-10",
    fechaLarga: "10 de junio de 2026",
    titulo: "Arquitectura, MemPalas y el rol del programador",
    estado: "cerrada",
    encargado: "Jorge Johnson",
    resumenCorto:
      "Calidad de software bajo IA, memoria institucional con palacios de memoria y la primera discusión seria de metodología.",
    resumen: [
      "Los participantes discutieron la dependencia de la IA para generar código, enfatizando la necesidad crítica de supervisión humana constante para garantizar arquitectura y mantenibilidad. La conclusión: la IA funciona como asistente que requiere lineamientos estrictos para evitar fallas estructurales.",
      "Juan David Pineda Cárdenas introdujo MemPalas, solución de memoria institucional basada en técnicas nemotécnicas de palacios de memoria y arquitecturas de bases de datos no estructuradas, ya implementada en su oficina.",
      "Jorge Johnson afirmó que las IA actuales no están diseñadas para diseñar software, sino para ejecutar tareas, lo que produce código de mala calidad o repetitivo si no se supervisan constantemente.",
      "Sergio insistió en dividir los proyectos en un backlog de tickets para mantener control sobre los avances.",
    ],
    temas: ["Arquitectura", "Refactorización", "Pruebas automatizadas", "MemPalas", "Backlog de tickets"],
    decisiones: [
      "Mantener un repositorio compartido para documentar aprendizajes y validar recursos técnicos.",
      "Enfoque flexible: cada integrante comparte sus investigaciones de manera colaborativa.",
    ],
    pendientes: [
      { quien: "Jorge Johnson", que: "Distribuir el documento sobre desarrollo asistido con IA", estado: "cerrado" },
      { quien: "El grupo", que: "Evaluar MemPalas para discutirla en futuras sesiones", estado: "abierto" },
      { quien: "Sergio y Jorge", que: "Definir temas principales y formato de sesiones futuras", estado: "cerrado" },
      { quien: "El grupo", que: "Preparar exposición breve (3–5 min) sobre un tema investigado", estado: "cerrado" },
    ],
    referencias: [],
  },
  {
    n: 4,
    fecha: "2026-06-24",
    fechaLarga: "24 de junio de 2026",
    titulo: "Consolidación de la comunidad de práctica",
    estado: "cerrada",
    encargado: "Jorge Johnson",
    resumenCorto:
      "El grupo pasa de definir logística a operar como comunidad de práctica con presentaciones cortas y repositorio compartido.",
    resumen: [
      "El grupo consolidó su dinámica: tareas de investigación individual, presentaciones cortas, repositorio compartido de recursos y un rol de moderación estable.",
      "Continuaron los hilos sobre gestión de contexto y skills como unidad de trabajo modular, incluyendo el uso de un «skill para crear skills» como camino para profesionalizar el uso de IA.",
    ],
    temas: ["Comunidad de práctica", "Skill creator", "Repositorio compartido"],
    decisiones: [],
    pendientes: [],
    referencias: [],
  },
  {
    n: 5,
    fecha: "2026-06-30",
    fechaLarga: "30 de junio – 2 de julio de 2026",
    titulo: "Jarvis, contexto compartido y el futuro de los dashboards",
    estado: "cerrada",
    encargado: "Sergio Monsalve",
    resumenCorto:
      "Asistentes personales tipo Jarvis, sus límites por falta de memoria persistente, y un debate sobre storytelling de datos.",
    resumen: [
      "Diego insistió en la necesidad de contexto compartido en equipos. Se discutió el proyecto «Jarvis» personal —calendario, correo, WhatsApp, Obsidian— y sus límites por falta de memoria persistente.",
      "Andrés presentó su uso de LLMs para generación y calificación de leads según perfil de cliente ideal (ICP).",
      "El cierre fue un debate filosófico sobre creatividad de la IA, el futuro de los dashboards frente al storytelling de datos y la vigencia de la interpretación humana.",
    ],
    temas: ["Jarvis", "Memoria persistente", "ICP y leads", "Dashboards vs. storytelling"],
    decisiones: [],
    pendientes: [],
    referencias: [],
  },
  {
    n: 6,
    fecha: "2026-07-08",
    fechaLarga: "8 de julio de 2026",
    titulo: "Identidad del grupo y seguridad en código generado",
    estado: "cerrada",
    encargado: "Sergio Monsalve",
    resumenCorto:
      "Entra sangre nueva. Se consolida la identidad como comunidad horizontal y se abre el frente de seguridad.",
    resumen: [
      "El grupo consolidó su propósito como comunidad técnica centrada en compartir experiencias sobre IA, priorizando el intercambio horizontal frente a estructuras académicas rígidas.",
      "La discusión subrayó la importancia de la supervisión humana y las pruebas estrictas al implementar IA. Se descartó confiar ciegamente en código generado sin auditoría técnica.",
      "Se decidió reenfocar la enseñanza hacia el uso de IA en lugar de la sintaxis tradicional: el desarrollo evolucionará desde la codificación manual hacia la generación directa de ejecutables.",
      "Juan David Torres recordó por qué funcionan estos grupos: uno no puede estar en siete frentes al mismo tiempo, y llegar a un espacio donde alguien te dice «¿viste tal cosa?» es lo que sostiene el aprendizaje.",
      "Se incorporó Juan Francisco Cardona McCormick.",
    ],
    temas: ["Identidad del grupo", "Seguridad en código generado", "Educación e IA", "Metodología Némesis"],
    decisiones: [
      "El grupo de WhatsApp se usa para proponer temas y organizar la siguiente sesión.",
    ],
    pendientes: [
      { quien: "El grupo", que: "Participar en WhatsApp proponiendo temas y tópicos", estado: "abierto" },
      { quien: "Andrés Pérez", que: "Presentar temas pendientes y compartir experiencias", estado: "abierto" },
      { quien: "Diego Fernando Robledo", que: "Presentar temas pendientes y compartir experiencias", estado: "abierto" },
      { quien: "Juan David Torres", que: "Compartir casos reales de vulnerabilidades en código generado por IA", estado: "abierto" },
      { quien: "Jorge Johnson", que: "Incluir el debate sobre uso académico de IA en las diapositivas", estado: "abierto" },
      { quien: "Juan Francisco Cardona McCormick", que: "Investigar la metodología Némesis para interacción crítica con modelos", estado: "abierto" },
      { quien: "Jorge Johnson y Juan Francisco Cardona", que: "Reunión de café sobre IA general y argumentos prácticos", estado: "abierto" },
    ],
    referencias: [],
  },
  {
    n: 7,
    fecha: "2026-07-15",
    fechaLarga: "15 de julio de 2026",
    titulo: "Harness Engineering",
    estado: "cerrada",
    encargado: "Sergio Monsalve",
    destacada: true,
    resumenCorto:
      "El caballo, el arnés y el jinete. Las tres capas de ingeniería con LLMs y el patrón de Hashimoto.",
    resumen: [
      "Todo agente de IA funciona hasta que no. Bajo condiciones controladas escriben código, navegan y operan software de forma autónoma. En producción fallan de forma impredecible: no hay memoria entre sesiones, no se sabe cuándo se detienen ni cómo validan su propio trabajo.",
      "El harness engineering es la disciplina de diseñar los sistemas, restricciones y ciclos de retroalimentación que envuelven a un agente para hacerlo confiable en producción. El harness no es el agente: es la infraestructura que gobierna cómo opera, qué herramientas puede invocar, dónde obtiene información, cómo valida decisiones y cómo se detiene.",
      "La metáfora: el modelo es el caballo, el arnés son las riendas y la silla, y el jinete da la dirección. Un buen arnés no previene los errores — hace al agente más capaz dándole contexto, herramientas y las restricciones correctas en el momento correcto. Cada error se convierte en una regla nueva del arnés.",
      "Origen: en febrero de 2026 Mitchell Hashimoto —cocreador de Terraform, fundador de HashiCorp— publica sobre engineering the harness. Semanas después Anthropic y OpenAI publican artículos propios. Martin Fowler lo define como las herramientas y prácticas para mantener a los agentes bajo control.",
      "Convergencia clave: la guía empírica de desarrollo de Jorge Johnson y el marco formal de harness engineering llegan a lo mismo por caminos distintos. Jorge desde el proceso, el harness desde la infraestructura. Specs como fuente de verdad ↔ context delivery. Puerta de plan antes de tocar código ↔ approval gates. Criterios de aceptación binarios ↔ ciclos de verificación. Reglas del proyecto en documentos ↔ configuración del harness.",
      "La tesis más profunda: la fuerza de voluntad no basta. La voluntad no frena el sesgo de automatización; lo que funciona es la fricción productiva, puertas de diseño que obligan a un acto deliberado.",
      "Los mejores arneses se diseñan sabiendo que serán innecesarios a medida que los modelos mejoren.",
    ],
    temas: [
      "Harness Engineering",
      "Patrón de Hashimoto",
      "Tres capas: prompt / context / harness",
      "Fricción productiva",
      "Loop Engineering",
      "Huellas de modelos",
      "OpenRouter",
    ],
    conceptos: [
      { t: "Prompt engineering", d: "Un turno." },
      { t: "Context engineering", d: "Una sesión." },
      { t: "Harness engineering", d: "Trabajo continuo: horas y cientos de decisiones, con herramientas, validación y restricciones arquitectónicas." },
      { t: "Patrón de Hashimoto", d: "Cada error del agente se convierte en un arreglo permanente del entorno. El sistema se realimenta y mejora a sí mismo." },
      { t: "Cinco primitivas", d: "Sistema de archivos, ejecución de código, sandbox controlado, memoria persistente y gestión de contexto." },
    ],
    decisiones: [
      "Se adopta el glosario vivo de 40 términos clave en cuatro categorías: fundamentos, contexto y memoria, seguridad y control, operación y evaluación.",
      "Se comparte un repositorio de aprendizaje con cinco módulos y dos proyectos prácticos.",
      "Jorge Johnson asume formalmente el rol de moderador.",
    ],
    pendientes: [
      { quien: "El grupo", que: "Construir colaborativamente el glosario de 40 términos", estado: "abierto" },
      { quien: "Diego Fernando Robledo", que: "Narrar la integración fallida entre Obsidian y Claude", estado: "abierto" },
      { quien: "José Luis Montoya Pareja", que: "Compartir el video de automatización de talleres de electrónica con sensores (España)", estado: "abierto" },
      { quien: "Juan David Torres", que: "Profundizar en Loop Engineering como complemento del harness", estado: "abierto" },
    ],
    referencias: [
      { titulo: "Mitchell Hashimoto — Engineering the Harness", nota: "Publicación original, febrero de 2026", url: "" },
      { titulo: "Martin Fowler — definición de harness", nota: "Herramientas y prácticas para mantener agentes bajo control", url: "" },
      { titulo: "Repositorio de aprendizaje del grupo", nota: "Cinco módulos, dos proyectos", url: "" },
      { titulo: "OpenRouter", nota: "Gestión centralizada de múltiples llaves de API", url: "" },
    ],
    nuevos: ["Rafael David Rincón Bermúdez", "Alejandra Santamaría", "José Luis Montoya Pareja"],
  },
  {
    n: 8,
    fecha: "2026-07-22",
    fechaLarga: "22 de julio de 2026",
    titulo: "Agentes en local, infraestructura y democratización",
    estado: "cerrada",
    encargado: "Juan David Torres · Sergio Monsalve",
    resumenCorto:
      "Demostración de agentes en entornos aislados, costos de infraestructura local y la IA como mentor de metaaprendizaje.",
    resumen: [
      "Se discutió la implementación de asistentes bajo el concepto de ingeniero de avance. Se acordó desplegar demostraciones iniciales en entornos locales aislados para garantizar la seguridad de los datos.",
      "Los participantes analizaron la necesidad de gestionar infraestructura local para reducir costos operativos a largo plazo, y enfatizaron la importancia de democratizar el acceso al conocimiento frente a barreras financieras.",
      "La combinación de habilidades técnicas con visión ejecutiva fortalece los proyectos colaborativos. El uso de IA como mentor permite potenciar el metaaprendizaje y la adaptación profesional.",
    ],
    temas: ["Agentes locales", "Infraestructura propia", "Modelos locales", "Metaaprendizaje", "Raspberry Pi"],
    decisiones: [
      "Las demostraciones de agentes se hacen primero en entornos locales aislados.",
    ],
    pendientes: [
      { quien: "Juan David Torres", que: "Explicar conceptos teóricos básicos de agentes, componentes y funcionamiento", estado: "abierto" },
      { quien: "Sergio Monsalve", que: "Preparar demostración de un agente funcional", estado: "abierto" },
      { quien: "Sergio Monsalve", que: "Investigar viabilidad de ejecutar agentes en Raspberry Pi", estado: "abierto" },
      { quien: "Sergio y Juan David Torres", que: "Estructurar curso de preparación para la certificación oficial de Anthropic", estado: "abierto" },
      { quien: "El grupo", que: "Identificar modelos locales disponibles para tareas", estado: "abierto" },
    ],
    referencias: [],
  },
];

// ------------------------------------------------------------
// CRONOGRAMA — sesiones futuras
// ------------------------------------------------------------
const CRONOGRAMA = [
  {
    n: 9,
    fecha: "29 de julio de 2026",
    titulo: "Agentes: teoría y demostración práctica",
    encargados: ["Juan David Torres", "Sergio Monsalve"],
    estado: "confirmada",
    contenido: [
      "Conceptos teóricos: qué es un agente, sus componentes y cómo funciona.",
      "Demostración en vivo de un agente funcional en entorno local aislado.",
    ],
  },
  {
    n: 10,
    fecha: "5 de agosto de 2026",
    titulo: "Seguridad en código generado por IA",
    encargados: ["Juan David Torres"],
    estado: "propuesta",
    contenido: [
      "Casos reales de vulnerabilidades en código generado por modelos.",
      "Prácticas de auditoría antes de llevar código asistido a producción.",
    ],
  },
  {
    n: 11,
    fecha: "12 de agosto de 2026",
    titulo: "Obsidian, segundo cerebro y memoria persistente",
    encargados: ["Diego Fernando Robledo", "Pablo Álvarez"],
    estado: "propuesta",
    contenido: [
      "La integración fallida Obsidian ↔ Claude, contada en detalle.",
      "Centralización de contextos de cliente en un segundo cerebro.",
    ],
  },
  {
    n: 12,
    fecha: "19 de agosto de 2026",
    titulo: "IA en la academia y en la formación",
    encargados: ["Jorge Johnson", "Rafael David Rincón", "José Luis Montoya"],
    estado: "propuesta",
    contenido: [
      "Uso académico de la IA y la justificación de trabajos.",
      "Especificación y requisitos como disciplina previa al código.",
    ],
  },
];

// ------------------------------------------------------------
// BACKLOG — temas propuestos sin fecha asignada
// prioridad: "alta" | "media" | "baja"
// ------------------------------------------------------------
const BACKLOG = [
  { titulo: "Curso de preparación para la certificación oficial de Anthropic", proponente: "Sergio Monsalve · Juan David Torres", prioridad: "alta", nota: "Estructurar programa de formación. Sesión 8." },
  { titulo: "Glosario vivo de 40 términos", proponente: "El grupo", prioridad: "alta", nota: "Fundamentos, contexto y memoria, seguridad y control, operación y evaluación. Sesión 7." },
  { titulo: "Loop Engineering", proponente: "Juan David Torres", prioridad: "alta", nota: "Complemento del harness engineering para desarrollo con agentes." },
  { titulo: "Agentes en Raspberry Pi", proponente: "Sergio Monsalve", prioridad: "media", nota: "Viabilidad técnica de ejecución en hardware modesto." },
  { titulo: "Modelos locales disponibles", proponente: "El grupo", prioridad: "media", nota: "Inventario de modelos ejecutables sin nube." },
  { titulo: "MemPalas — memoria institucional", proponente: "Juan David Pineda Cárdenas", prioridad: "media", nota: "Palacios de memoria aplicados a memoria organizacional. Sesión 3." },
  { titulo: "Metodología Némesis", proponente: "Juan Francisco Cardona McCormick", prioridad: "media", nota: "Interacción crítica y adversarial con modelos." },
  { titulo: "Huellas y sesgos de modelos", proponente: "Juan David Torres", prioridad: "media", nota: "Estilos de escritura identificables por modelo." },
  { titulo: "El futuro de los dashboards", proponente: "Andrés Pérez", prioridad: "baja", nota: "Storytelling de datos frente al tablero tradicional. Sesión 5." },
  { titulo: "Vibe Engineering", proponente: "Juan David Torres", prioridad: "media", nota: "Crítica a la ilusión de velocidad y la deuda técnica acumulada. Libro en curso." },
  { titulo: "Automatización de talleres de electrónica con sensores", proponente: "José Luis Montoya Pareja", prioridad: "baja", nota: "Video de la experiencia en España." },
  { titulo: "Agilismo en la era de la IA", proponente: "Carlos Eduardo Monsalve", prioridad: "baja", nota: "¿Hay un retorno a fases de análisis tipo cascada?" },
];

// ------------------------------------------------------------
// PARTICIPANTES
// ------------------------------------------------------------
const PARTICIPANTES = [
  {
    nombre: "Sergio Monsalve",
    rol: "Organizador y anfitrión",
    campo: "Emprendimiento · Producto",
    bio: "Fundó el grupo desde una inquietud personal por entender qué estaba pasando en el mundo. Plataforma de cursos «Songo Sorongo» con infraestructura propia; cerró exitosamente un negocio de cultivo de hongos con apoyo de IA. Explora Obsidian, biblioteca digital personal, generación multimedia y un asistente tipo Jarvis. Gestiona la IA como «un ejército de juniors» al que hay que entrenar con lineamientos. Aficionado al parapente.",
    desde: 1,
    tags: ["Skills", "Obsidian", "Jarvis", "Documentación"],
  },
  {
    nombre: "Jorge Johnson",
    rol: "Moderador y jefe de disciplina",
    campo: "Desarrollo de software",
    bio: "Desarrollador veterano y voz crítica del grupo. Su proyecto insignia es «Catalejo», software de astronomía —simulación de Saturno y Júpiter, catálogos Hipparcos/ESA— escrito en «punk», un lenguaje de programación propio creado con asistencia de IA. Mantiene 9.350 pruebas automatizadas y un archivo cordura.md con reglas para la IA. Escéptico de la automatización total, defensor de la supervisión rigurosa. Quiere presentar su software en un planetario.",
    desde: 1,
    tags: ["Catalejo", "punk", "Testing", "Escepticismo productivo"],
  },
  {
    nombre: "Juan David Torres",
    rol: "Investigación y experimentación",
    campo: "Ingeniería de datos",
    bio: "Aporta la mirada histórica: compara el salto tecnológico del siglo XX con el momento actual, donde se gestan cinco innovaciones simultáneas —blockchain pública, almacenamiento de energía, IA, robótica y secuenciamiento multiómico—. Investiga huellas de modelos, despliegue eficiente de agentes y optimización de consumo de RAM. Autor del libro en curso «Vibe Engineering».",
    desde: 1,
    tags: ["Agentes", "OpenRouter", "Vibe Engineering", "Seguridad"],
  },
  {
    nombre: "Diego Fernando Robledo",
    rol: "Práctica aplicada",
    campo: "Ingeniería de datos · Globant",
    bio: "Usa agentes para leer repositorios de GitHub, convertir SQL a modelos DBT y automatizar documentación y PRs. Frustrado con herramientas corporativas como Cortex de Snowflake. Desarrolló su página personal con Superpowers y Cloudflare. Conecta el grupo con su rol de padre —hijo estudiando mecatrónica— y con la academia. Tiene pendiente el proyecto «Domus».",
    desde: 1,
    tags: ["DBT", "Agentes", "Obsidian", "Domus"],
  },
  {
    nombre: "Daniel Moreno Agudelo",
    rol: "Referente en Skills",
    campo: "Finanzas y cooperación internacional · Sabio",
    bio: "El más avanzado del grupo en Skills: automatización de reportes financieros, exploración de bases NoSQL con MongoDB, conexión con ERP y CRM. Promotor de la revelación progresiva y del marco GSD. Construye un agente personal que resume su correo. Explora también el concepto Jarvis con Obsidian.",
    desde: 1,
    tags: ["Skills", "MongoDB", "Revelación progresiva", "GSD"],
  },
  {
    nombre: "Juan Pablo Duque Ochoa",
    rol: "Referente técnico y estratégico",
    campo: "Consultoría",
    bio: "Enfatiza fundamentos —RAG, MCP—, encapsulamiento, modularidad, poda de contexto y el skill creator de Anthropic. Articuló la estrategia de servicios híbridos y la idea de «ser dueños del problema». Verbalizó la paradoja emocional que genera el ritmo de la IA.",
    desde: 1,
    tags: ["RAG", "MCP", "Estrategia", "Skill creator"],
  },
  {
    nombre: "Cristina Aristizábal Johnson",
    rol: "Diseño, estrategia e investigación",
    campo: "Diseño · Ámbito jurídico",
    bio: "Creó un sitio web funcional para un baby shower sin saber programar — el caso que abrió la primera sesión. Busca profesionalizar el uso de IA en sus distintos roles. Aportó la mirada ética sobre alucinaciones en Derecho y Medicina.",
    desde: 1,
    tags: ["Ética", "Diseño", "No-code"],
  },
  {
    nombre: "Carlos Eduardo Monsalve",
    rol: "Gobernanza y liderazgo",
    campo: "Dirección de tecnología",
    bio: "Enfocado en liderazgo y gobernanza de IA más que en ejecución técnica. Aportó datos de industria —80% del código de Anthropic generado por IA—, el concepto de «infoxicación» de Alfons Cornella y el debate sobre agilismo y posibles retornos a fases de análisis tipo cascada. Trabaja en definir gobierno, estrategia y presupuesto de IA para su organización.",
    desde: 1,
    tags: ["Gobernanza", "Estrategia", "Infoxicación"],
  },
  {
    nombre: "Juan David Pineda Cárdenas",
    rol: "DevOps / Tech Lead",
    campo: "Linux y hardware",
    bio: "Perfil técnico Linux y hardware —configuración de firmware por Bluetooth—. Presentó MemPalas, herramienta de memoria institucional basada en palacios de memoria, ya implementada en su oficina. Valora el grupo como espacio de intercambio intelectual sin tareas obligatorias, y fue de los primeros en frenar cualquier intento de imponer deberes.",
    desde: 1,
    tags: ["MemPalas", "Linux", "Firmware"],
  },
  {
    nombre: "Pablo Álvarez",
    rol: "Estrategia de marca",
    campo: "Ingeniería mecánica · Agencia",
    bio: "Ingeniero mecánico en agencia de estrategia y conceptualización de marca. Usuario intensivo de Claude. Promotor del «segundo cerebro» con Obsidian para centralizar contextos de clientes y conectar ideas.",
    desde: 2,
    tags: ["Obsidian", "Segundo cerebro", "Marca"],
  },
  {
    nombre: "Nicolás Montoya",
    rol: "Producción creativa",
    campo: "Audiovisual",
    bio: "Metodología en tres capas: Claude para planeación y razonamiento, modelos menores para ejecución, humano en el ciclo. Trabaja con Eleven Labs para clonación de voz, Gemini, edición y Touch Designer para experiencias inmersivas reactivas al sonido. Hoy entrega repositorios de GitHub completos y organizados gracias a la IA.",
    desde: 2,
    tags: ["Eleven Labs", "Touch Designer", "Multimodal"],
  },
  {
    nombre: "Jorge González",
    rol: "Colaborador",
    campo: "Ingeniería electrónica · Globant",
    bio: "Su afición al aeromodelismo lo reconectó con la ingeniería electrónica. Los LLMs le facilitan programación y automatización en sus pasatiempos.",
    desde: 2,
    tags: ["Aeromodelismo", "Electrónica"],
  },
  {
    nombre: "Andrés Pérez",
    rol: "Aplicación comercial",
    campo: "Logística",
    bio: "Usa LLMs para generación y calificación de leads según perfil de cliente ideal (ICP), y skills personalizadas como un asistente mecánico que consulta manuales y foros para diagnóstico vehicular. Planteó el debate sobre el futuro de los dashboards.",
    desde: 3,
    tags: ["ICP", "Skills", "Logística"],
  },
  {
    nombre: "Juan Francisco Cardona McCormick",
    rol: "Perspectiva crítica",
    campo: "Ingeniería",
    bio: "Se incorporó en la sesión 6. Introdujo la metodología Némesis como enfoque de interacción crítica y adversarial con los modelos. Interesado en el debate sobre inteligencia artificial general y sus argumentos prácticos.",
    desde: 6,
    tags: ["Némesis", "AGI", "Pensamiento crítico"],
  },
  {
    nombre: "Rafael David Rincón Bermúdez",
    rol: "Especificación y requisitos",
    campo: "Academia · Profesor universitario retirado",
    bio: "Experto en requisitos y especificación. Su llegada refuerza la línea del grupo sobre specs como fuente de verdad y criterios de aceptación binarios.",
    desde: 7,
    tags: ["Requisitos", "Especificación", "Academia"],
  },
  {
    nombre: "Alejandra Santamaría",
    rol: "Ingeniería aplicada",
    campo: "Ingeniería biológica",
    bio: "Ingeniera biológica. Colabora con Sergio en un curso de robótica con ESP32, ampliando el alcance del grupo hacia hardware y educación técnica.",
    desde: 7,
    tags: ["ESP32", "Robótica", "Biología"],
  },
  {
    nombre: "José Luis Montoya Pareja",
    rol: "Educación y comunidad",
    campo: "Ingeniería de sistemas · Docencia",
    bio: "Reconocido profesor de ingeniería de sistemas y creador de comunidad. Trabaja en automatización de talleres de electrónica con sensores, proyecto desarrollado en España.",
    desde: 7,
    tags: ["Docencia", "Sensores", "Comunidad"],
  },
  {
    nombre: "Martín Gonzalo Aguilar",
    rol: "Participación puntual",
    campo: "Aviación",
    bio: "Trayectoria en aviación. Participación puntual en las sesiones iniciales.",
    desde: 1,
    tags: ["Aviación"],
  },
];
