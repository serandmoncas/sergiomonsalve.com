// ============================================================
// Glosario de Experiencias IA
// Contenido autorizado bajo excepción explícita a la regla de "no
// inventar contenido" — ver docs/superpowers/specs/2026-07-23-experiencias-ia-glosario-design.md
// secciones 1 y 4. Cada `referencia.url` fue verificada como
// alcanzable (HTTP 200) antes de incluirse aquí — nunca se fabrica
// una URL: si no hay una referencia verificada, el campo se omite.
// ============================================================

export type CategoriaGlosario = 'fundamentos' | 'contexto-memoria' | 'seguridad-control' | 'operacion-evaluacion'
export type TipoReferencia = 'articulo' | 'paper' | 'libro' | 'sitio' | 'video'

export type ReferenciaGlosario = {
  titulo: string
  url: string
  tipo: TipoReferencia
}

export type TerminoGlosario = {
  slug: string
  termino: string
  definicion: string
  categoria: CategoriaGlosario
  sesionOrigen?: number
  ejemplo?: string
  referencia?: ReferenciaGlosario
}

export const CATEGORIAS: Record<CategoriaGlosario, string> = {
  'fundamentos': 'Fundamentos',
  'contexto-memoria': 'Contexto y memoria',
  'seguridad-control': 'Seguridad y control',
  'operacion-evaluacion': 'Operación y evaluación',
}

export const ORDEN_CATEGORIAS: CategoriaGlosario[] = [
  'fundamentos',
  'contexto-memoria',
  'seguridad-control',
  'operacion-evaluacion',
]

export const GLOSARIO: TerminoGlosario[] = [
  // ---------- Fundamentos ----------
  {
    slug: 'prompt-engineering',
    termino: 'Prompt engineering',
    definicion: 'Un turno.',
    categoria: 'fundamentos',
    sesionOrigen: 7,
    ejemplo:
      "Cambiar 'resume esto' por 'resume esto en 3 viñetas, tono neutro, máximo 50 palabras' es prompt engineering: mejorar la instrucción de un solo turno.",
    referencia: {
      titulo: 'Simon Willison — Context engineering',
      url: 'https://simonwillison.net/2025/Jun/27/context-engineering/',
      tipo: 'articulo',
    },
  },
  {
    slug: 'context-engineering',
    termino: 'Context engineering',
    definicion: 'Una sesión.',
    categoria: 'fundamentos',
    sesionOrigen: 7,
    ejemplo:
      'Decidir qué documentos, historial de conversación y resultados de herramientas caben en la ventana de contexto de un agente antes de que responda — no es una instrucción, es diseñar todo el entorno informativo de la tarea.',
    referencia: {
      titulo: 'Simon Willison — Context engineering',
      url: 'https://simonwillison.net/2025/Jun/27/context-engineering/',
      tipo: 'articulo',
    },
  },
  {
    slug: 'harness-engineering',
    termino: 'Harness engineering',
    definicion:
      'Trabajo continuo: horas y cientos de decisiones, con herramientas, validación y restricciones arquitectónicas.',
    categoria: 'fundamentos',
    sesionOrigen: 7,
    ejemplo:
      'Un agente borra un archivo por error una vez; en vez de solo corregirlo, se agrega una regla permanente al harness (por ejemplo, un hook que bloquea `rm -rf` sin confirmación) para que ese error se vuelva estructuralmente imposible.',
    referencia: {
      titulo: 'Mitchell Hashimoto — My AI Adoption Journey (sección "Engineering the harness")',
      url: 'https://mitchellh.com/writing/my-ai-adoption-journey',
      tipo: 'articulo',
    },
  },
  {
    slug: 'patron-de-hashimoto',
    termino: 'Patrón de Hashimoto',
    definicion:
      'Cada error del agente se convierte en un arreglo permanente del entorno; el sistema se realimenta y mejora a sí mismo.',
    categoria: 'fundamentos',
    sesionOrigen: 7,
  },
  {
    slug: 'cinco-primitivas',
    termino: 'Cinco primitivas',
    definicion:
      'Sistema de archivos, ejecución de código, sandbox controlado, memoria persistente y gestión de contexto.',
    categoria: 'fundamentos',
    sesionOrigen: 7,
  },
  {
    slug: 'rag',
    termino: 'RAG (Retrieval-Augmented Generation)',
    definicion:
      'Técnica que recupera información de una fuente externa antes de generar la respuesta, en vez de depender solo del conocimiento entrenado en el modelo.',
    categoria: 'fundamentos',
    ejemplo:
      "Antes de responder una pregunta sobre una póliza de seguros, el sistema busca primero el documento real de esa póliza y se lo pasa al modelo como contexto, en vez de confiar en lo que el modelo 'recuerda' de su entrenamiento.",
    referencia: {
      titulo: 'Lewis et al. — Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks (2020)',
      url: 'https://arxiv.org/abs/2005.11401',
      tipo: 'paper',
    },
  },
  {
    slug: 'mcp',
    termino: 'MCP (Model Context Protocol)',
    definicion:
      'Protocolo abierto para conectar modelos con herramientas y fuentes de datos externas de forma estandarizada.',
    categoria: 'fundamentos',
    ejemplo:
      'Un servidor MCP de Supabase le permite a un agente consultar tablas reales de una base de datos sin que el desarrollador tenga que escribir código de integración a mano.',
    referencia: {
      titulo: 'Anthropic — Introducing the Model Context Protocol',
      url: 'https://www.anthropic.com/news/model-context-protocol',
      tipo: 'articulo',
    },
  },
  {
    slug: 'skills',
    termino: 'Skills',
    definicion:
      'Unidades modulares de comportamiento o conocimiento que se le enseñan a un agente para una tarea específica.',
    categoria: 'fundamentos',
    sesionOrigen: 2,
    ejemplo:
      "Una skill de 'generar factura' le enseña al agente el formato exacto, los campos obligatorios y el tono de las facturas de una empresa específica, para no repetir esas instrucciones cada vez.",
  },
  {
    slug: 'skill-creator',
    termino: 'Skill creator',
    definicion:
      'Skill de Anthropic para construir otras skills; camino para profesionalizar el uso de IA en vez de improvisar cada vez.',
    categoria: 'fundamentos',
    sesionOrigen: 4,
    referencia: {
      titulo: 'Anthropic — Extend Claude with skills (documentación oficial)',
      url: 'https://code.claude.com/docs/en/skills',
      tipo: 'sitio',
    },
  },
  {
    slug: 'agentes',
    termino: 'Agentes',
    definicion: 'Sistemas que usan un modelo para decidir y ejecutar acciones de forma autónoma, no solo responder texto.',
    categoria: 'fundamentos',
    sesionOrigen: 8,
  },

  // ---------- Contexto y memoria ----------
  {
    slug: 'gestion-de-contexto',
    termino: 'Gestión de contexto',
    definicion: 'Administrar qué información cabe y permanece relevante dentro de la ventana de contexto de un modelo.',
    categoria: 'contexto-memoria',
    sesionOrigen: 2,
    ejemplo:
      'Decidir si un historial completo de chat cabe en la ventana de contexto o si hay que resumirlo antes de la siguiente pregunta.',
  },
  {
    slug: 'memoria-persistente',
    termino: 'Memoria persistente',
    definicion: 'Información que un agente conserva entre sesiones, más allá de una sola conversación.',
    categoria: 'contexto-memoria',
    sesionOrigen: 5,
  },
  {
    slug: 'revelacion-progresiva',
    termino: 'Revelación progresiva',
    definicion: 'Entregarle contexto al modelo por capas, según lo va necesitando, en vez de todo de una vez.',
    categoria: 'contexto-memoria',
    ejemplo:
      'En vez de darle a un agente el manual completo de 200 páginas de una vez, se le entrega solo la sección que necesita para el paso actual, y la siguiente cuando la pida.',
  },
  {
    slug: 'poda-de-contexto',
    termino: 'Poda de contexto',
    definicion: 'Eliminar deliberadamente información acumulada que ya no aporta, para no saturar la ventana de contexto.',
    categoria: 'contexto-memoria',
    ejemplo:
      'Borrar deliberadamente los primeros 20 mensajes de una conversación larga cuando ya no aportan, para dejarle espacio a información nueva y relevante.',
  },
  {
    slug: 'obsidian',
    termino: 'Obsidian',
    definicion: 'Herramienta de notas enlazadas usada por varios del grupo como base de un "segundo cerebro".',
    categoria: 'contexto-memoria',
    sesionOrigen: 2,
  },
  {
    slug: 'segundo-cerebro',
    termino: 'Segundo cerebro',
    definicion: 'Sistema personal (típicamente en Obsidian) para centralizar contexto, ideas y notas de forma conectada.',
    categoria: 'contexto-memoria',
    ejemplo:
      "Guardar en Obsidian las notas de cada cliente, enlazadas entre sí, para poder preguntar 'qué sé de este cliente' en vez de buscar en la memoria o en correos sueltos.",
    referencia: {
      titulo: 'Tiago Forte — Building a Second Brain',
      url: 'https://www.buildingasecondbrain.com/book',
      tipo: 'libro',
    },
  },
  {
    slug: 'jarvis',
    termino: 'Jarvis (asistente personal)',
    definicion:
      'Proyecto tipo asistente personal que integra calendario, correo, WhatsApp y notas; limitado hoy por falta de memoria persistente real.',
    categoria: 'contexto-memoria',
    sesionOrigen: 5,
  },
  {
    slug: 'mempalas',
    termino: 'MemPalas',
    definicion:
      'Herramienta de memoria institucional basada en la técnica de palacios de memoria, aplicada a bases de datos no estructuradas.',
    categoria: 'contexto-memoria',
    sesionOrigen: 3,
    ejemplo:
      'Asociar cada proceso interno de una oficina con un lugar imaginario de un edificio conocido, para recordar el orden de los pasos sin necesidad de un manual escrito.',
    referencia: {
      titulo: 'Joshua Foer — Moonwalking with Einstein',
      url: 'https://www.goodreads.com/book/show/6346975-moonwalking-with-einstein',
      tipo: 'libro',
    },
  },
  {
    slug: 'infoxicacion',
    termino: 'Infoxicación',
    definicion:
      'Saturación por exceso de información, concepto de Alfons Cornellá que el grupo adoptó para nombrar la fatiga de estar al día con IA.',
    categoria: 'contexto-memoria',
    sesionOrigen: 2,
  },
  {
    slug: 'encapsulamiento',
    termino: 'Encapsulamiento',
    definicion:
      'Aislar una funcionalidad para que se pueda usar sin conocer su implementación interna — principio de diseño que el grupo aplica también al contexto que se le da a un modelo.',
    categoria: 'contexto-memoria',
    ejemplo:
      'Un componente de interfaz que solo expone un botón con un texto, sin que quien lo usa tenga que saber cómo se implementa el estilo o el evento de clic por dentro.',
  },

  // ---------- Seguridad y control ----------
  {
    slug: 'friccion-productiva',
    termino: 'Fricción productiva',
    definicion:
      'Puertas de diseño que obligan a un acto deliberado antes de avanzar; lo que realmente frena el sesgo de automatización, no la fuerza de voluntad.',
    categoria: 'seguridad-control',
    sesionOrigen: 7,
    ejemplo:
      'Exigir que un plan de implementación sea aprobado explícitamente antes de que el agente toque código — ese paso extra es la fricción que evita que el sesgo de automatización apruebe algo mal sin revisar.',
  },
  {
    slug: 'metodologia-nemesis',
    termino: 'Metodología Némesis',
    definicion:
      'Enfoque de interacción crítica y adversarial con los modelos, para no aceptar sus respuestas sin cuestionarlas.',
    categoria: 'seguridad-control',
    sesionOrigen: 6,
    ejemplo:
      'En vez de aceptar la primera respuesta de un modelo, pedirle explícitamente que argumente el caso contrario, para exponer los puntos débiles del razonamiento original.',
  },
  {
    slug: 'seguridad-en-codigo-generado',
    termino: 'Seguridad en código generado',
    definicion: 'Disciplina de no confiar ciegamente en código producido por IA sin auditoría técnica antes de producción.',
    categoria: 'seguridad-control',
    sesionOrigen: 6,
  },
  {
    slug: 'huellas-de-modelos',
    termino: 'Huellas de modelos',
    definicion: 'Patrones o estilos de escritura identificables que delatan qué modelo generó un texto.',
    categoria: 'seguridad-control',
  },
  {
    slug: 'escepticismo-productivo',
    termino: 'Escepticismo productivo',
    definicion:
      'Postura crítica frente a la automatización total que, en vez de rechazarla, exige supervisión rigurosa.',
    categoria: 'seguridad-control',
  },
  {
    slug: 'auditoria-de-codigo-ia',
    termino: 'Auditoría de código IA',
    definicion:
      'Revisión técnica deliberada de código generado antes de llevarlo a producción, en vez de asumir que "compila" significa "está bien".',
    categoria: 'seguridad-control',
    sesionOrigen: 6,
  },
  {
    slug: 'supervision-humana',
    termino: 'Supervisión humana',
    definicion:
      'Principio recurrente del grupo: la IA multiplica capacidades pero no reemplaza el juicio ni la responsabilidad ética de quien la usa.',
    categoria: 'seguridad-control',
  },
  {
    slug: 'agi',
    termino: 'AGI (inteligencia artificial general)',
    definicion:
      'Hipotética IA con capacidad cognitiva general equivalente o superior a la humana; tema de debate sobre sus argumentos prácticos, no solo especulativos.',
    categoria: 'seguridad-control',
    referencia: {
      titulo: 'Artificial general intelligence',
      url: 'https://en.wikipedia.org/wiki/Artificial_general_intelligence',
      tipo: 'sitio',
    },
  },
  {
    slug: 'etica-y-alucinaciones',
    termino: 'Ética y alucinaciones',
    definicion:
      'Debate fundacional del grupo sobre los riesgos de confiar en respuestas incorrectas generadas con total seguridad, especialmente en derecho y medicina.',
    categoria: 'seguridad-control',
    sesionOrigen: 1,
  },
  {
    slug: 'gsd',
    termino: 'GSD (Getting Stuff Done, marco)',
    definicion:
      'Marco de trabajo orientado a ejecución práctica más que a teoría, promovido como forma de estructurar el uso de IA en tareas reales.',
    categoria: 'seguridad-control',
  },

  // ---------- Operación y evaluación ----------
  {
    slug: 'loop-engineering',
    termino: 'Loop Engineering',
    definicion: 'Complemento del harness engineering enfocado en los ciclos de retroalimentación del desarrollo con agentes.',
    categoria: 'operacion-evaluacion',
    sesionOrigen: 7,
    ejemplo:
      'Un agente de codificación que revisa su propio diff, corre los tests, y si fallan vuelve a intentar antes de reportar terminado — el ciclo completo, no solo la respuesta inicial, es lo que se diseña.',
    referencia: {
      titulo: 'IBM — What Is Loop Engineering?',
      url: 'https://www.ibm.com/think/topics/loop-engineering',
      tipo: 'articulo',
    },
  },
  {
    slug: 'vibe-engineering',
    termino: 'Vibe Engineering',
    definicion:
      'Crítica a la ilusión de velocidad al programar con IA y a la deuda técnica que se acumula cuando no hay disciplina detrás.',
    categoria: 'operacion-evaluacion',
    ejemplo:
      "Aceptar todos los cambios que sugiere un agente sin revisar el diff porque 'se ve bien' es vibe coding; la crítica del grupo es que eso acumula deuda técnica invisible hasta que algo se rompe en producción.",
    referencia: {
      titulo: 'Simon Willison — Not all AI-assisted programming is vibe coding',
      url: 'https://simonwillison.net/2025/Mar/19/vibe-coding/',
      tipo: 'articulo',
    },
  },
  {
    slug: 'backlog-de-tickets',
    termino: 'Backlog de tickets',
    definicion:
      'Dividir un proyecto en tareas discretas y rastreables para mantener control sobre el avance, en vez de avanzar sin estructura.',
    categoria: 'operacion-evaluacion',
    sesionOrigen: 3,
  },
  {
    slug: 'pruebas-automatizadas',
    termino: 'Pruebas automatizadas (Testing)',
    definicion: 'Suite de tests que valida que el código generado por IA realmente funciona, no solo que "se ve bien".',
    categoria: 'operacion-evaluacion',
    ejemplo:
      '9.350 pruebas automatizadas (como las de Jorge Johnson en su proyecto Catalejo) permiten confirmar que un cambio generado por IA no rompió nada, sin tener que revisar manualmente cada línea.',
    referencia: {
      titulo: 'Kent Beck — Test-Driven Development: By Example',
      url: 'https://www.goodreads.com/book/show/6408726',
      tipo: 'libro',
    },
  },
  {
    slug: 'openrouter',
    termino: 'OpenRouter',
    definicion: 'Servicio para gestionar de forma centralizada múltiples llaves de API de distintos proveedores de modelos.',
    categoria: 'operacion-evaluacion',
    sesionOrigen: 7,
    ejemplo:
      'En vez de tener una cuenta y una llave de API distinta para cada proveedor de modelos, OpenRouter centraliza el acceso bajo una sola llave y una sola factura.',
    referencia: {
      titulo: 'OpenRouter — sitio oficial',
      url: 'https://openrouter.ai/about',
      tipo: 'sitio',
    },
  },
  {
    slug: 'modelos-locales',
    termino: 'Modelos locales',
    definicion: 'Modelos ejecutados en hardware propio en vez de la nube, por costo, privacidad o independencia de proveedor.',
    categoria: 'operacion-evaluacion',
    sesionOrigen: 8,
  },
  {
    slug: 'metaaprendizaje',
    termino: 'Metaaprendizaje',
    definicion: 'Usar la IA como mentor para aprender a aprender más rápido, no solo para resolver una tarea puntual.',
    categoria: 'operacion-evaluacion',
    sesionOrigen: 8,
  },
  {
    slug: 'icp',
    termino: 'ICP (perfil de cliente ideal)',
    definicion: 'Definición del cliente ideal usada para calificar leads generados o evaluados con LLMs.',
    categoria: 'operacion-evaluacion',
    sesionOrigen: 5,
    ejemplo:
      "Definir que el cliente ideal de un taller mecánico es 'dueño de flota de más de 5 vehículos en Medellín' para que un LLM califique leads entrantes contra ese perfil, en vez de tratarlos todos igual.",
  },
  {
    slug: 'comunidad-de-practica',
    termino: 'Comunidad de práctica',
    definicion:
      'Modelo de operación del grupo: presentaciones cortas, repositorio compartido, sin tareas obligatorias ni estructura académica rígida.',
    categoria: 'operacion-evaluacion',
    sesionOrigen: 4,
  },
  {
    slug: 'agilismo-en-la-era-de-la-ia',
    termino: 'Agilismo en la era de la IA',
    definicion: 'Pregunta abierta del grupo sobre si el ritmo de la IA implica un retorno a fases de análisis más tipo cascada.',
    categoria: 'operacion-evaluacion',
  },
]

export function getTerminosPorCategoria(categoria: CategoriaGlosario): TerminoGlosario[] {
  return GLOSARIO.filter(t => t.categoria === categoria)
}

export function getTermino(slug: string): TerminoGlosario | undefined {
  return GLOSARIO.find(t => t.slug === slug)
}
