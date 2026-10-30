// ============================================================
// Glosario de Experiencias IA (200 términos, 50 por categoría)
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
    sesionOrigen: 9,
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
    sesionOrigen: 9,
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
    sesionOrigen: 9,
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
    sesionOrigen: 9,
  },
  {
    slug: 'cinco-primitivas',
    termino: 'Cinco primitivas',
    definicion:
      'Sistema de archivos, ejecución de código, sandbox controlado, memoria persistente y gestión de contexto.',
    categoria: 'fundamentos',
    sesionOrigen: 9,
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
    sesionOrigen: 3,
    ejemplo:
      "Una skill de 'generar factura' le enseña al agente el formato exacto, los campos obligatorios y el tono de las facturas de una empresa específica, para no repetir esas instrucciones cada vez.",
  },
  {
    slug: 'skill-creator',
    termino: 'Skill creator',
    definicion:
      'Skill de Anthropic para construir otras skills; camino para profesionalizar el uso de IA en vez de improvisar cada vez.',
    categoria: 'fundamentos',
    sesionOrigen: 5,
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
    sesionOrigen: 11,
  },

  // ---------- Contexto y memoria ----------
  {
    slug: 'gestion-de-contexto',
    termino: 'Gestión de contexto',
    definicion: 'Administrar qué información cabe y permanece relevante dentro de la ventana de contexto de un modelo.',
    categoria: 'contexto-memoria',
    sesionOrigen: 3,
    ejemplo:
      'Decidir si un historial completo de chat cabe en la ventana de contexto o si hay que resumirlo antes de la siguiente pregunta.',
  },
  {
    slug: 'memoria-persistente',
    termino: 'Memoria persistente',
    definicion: 'Información que un agente conserva entre sesiones, más allá de una sola conversación.',
    categoria: 'contexto-memoria',
    sesionOrigen: 6,
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
    sesionOrigen: 3,
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
    sesionOrigen: 6,
  },
  {
    slug: 'mempalas',
    termino: 'MemPalas',
    definicion:
      'Herramienta de memoria institucional basada en la técnica de palacios de memoria, aplicada a bases de datos no estructuradas.',
    categoria: 'contexto-memoria',
    sesionOrigen: 4,
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
    sesionOrigen: 3,
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
    sesionOrigen: 9,
    ejemplo:
      'Exigir que un plan de implementación sea aprobado explícitamente antes de que el agente toque código — ese paso extra es la fricción que evita que el sesgo de automatización apruebe algo mal sin revisar.',
  },
  {
    slug: 'metodologia-nemesis',
    termino: 'Metodología Némesis',
    definicion:
      'Enfoque de interacción crítica y adversarial con los modelos, para no aceptar sus respuestas sin cuestionarlas.',
    categoria: 'seguridad-control',
    sesionOrigen: 7,
    ejemplo:
      'En vez de aceptar la primera respuesta de un modelo, pedirle explícitamente que argumente el caso contrario, para exponer los puntos débiles del razonamiento original.',
  },
  {
    slug: 'seguridad-en-codigo-generado',
    termino: 'Seguridad en código generado',
    definicion: 'Disciplina de no confiar ciegamente en código producido por IA sin auditoría técnica antes de producción.',
    categoria: 'seguridad-control',
    sesionOrigen: 7,
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
    sesionOrigen: 7,
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
    sesionOrigen: 2,
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
    sesionOrigen: 9,
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
    sesionOrigen: 4,
  },
  {
    slug: 'pruebas-automatizadas',
    termino: 'Pruebas automatizadas (Testing)',
    definicion: 'Suite de tests que valida que el código generado por IA realmente funciona, no solo que "se ve bien".',
    categoria: 'operacion-evaluacion',
    ejemplo:
      'Miles de pruebas automatizadas permiten confirmar que un cambio generado por IA no rompió nada, sin tener que revisar manualmente cada línea.',
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
    sesionOrigen: 9,
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
    sesionOrigen: 11,
  },
  {
    slug: 'metaaprendizaje',
    termino: 'Metaaprendizaje',
    definicion: 'Usar la IA como mentor para aprender a aprender más rápido, no solo para resolver una tarea puntual.',
    categoria: 'operacion-evaluacion',
    sesionOrigen: 11,
  },
  {
    slug: 'icp',
    termino: 'ICP (perfil de cliente ideal)',
    definicion: 'Definición del cliente ideal usada para calificar leads generados o evaluados con LLMs.',
    categoria: 'operacion-evaluacion',
    sesionOrigen: 6,
    ejemplo:
      "Definir que el cliente ideal de un taller mecánico es 'dueño de flota de más de 5 vehículos en Medellín' para que un LLM califique leads entrantes contra ese perfil, en vez de tratarlos todos igual.",
  },
  {
    slug: 'comunidad-de-practica',
    termino: 'Comunidad de práctica',
    definicion:
      'Modelo de operación del grupo: presentaciones cortas, repositorio compartido, sin tareas obligatorias ni estructura académica rígida.',
    categoria: 'operacion-evaluacion',
    sesionOrigen: 5,
  },
  {
    slug: 'agilismo-en-la-era-de-la-ia',
    termino: 'Agilismo en la era de la IA',
    definicion: 'Pregunta abierta del grupo sobre si el ritmo de la IA implica un retorno a fases de análisis más tipo cascada.',
    categoria: 'operacion-evaluacion',
  },
  // ---------- Términos nuevos (agosto – octubre 2026) ----------
  {
    slug: 'hook',
    termino: 'Hook',
    definicion: 'Regla que se ejecuta siempre ante un evento (antes de usar una herramienta, al enviar un prompt). Determinista, a diferencia de un skill.',
    categoria: 'seguridad-control',
    sesionOrigen: 17,
  },
  {
    slug: 'status-line',
    termino: 'Status line',
    definicion: 'Barra de estado de Claude Code; Jorge la usa con semáforo de consumo de contexto.',
    categoria: 'contexto-memoria',
  },
  {
    slug: 'handoff',
    termino: 'Handoff',
    definicion: 'Archivo de traspaso al cerrar una sesión para retomarla sin perder contexto.',
    categoria: 'contexto-memoria',
  },
  {
    slug: 'ley-del-minimo-token',
    termino: 'Ley del mínimo token',
    definicion: 'Observación del grupo: el modelo lee solo lo que cree suficiente de un archivo largo.',
    categoria: 'contexto-memoria',
    sesionOrigen: 17,
  },
  {
    slug: 'maximo-local',
    termino: 'Máximo local',
    definicion: 'Metáfora de Jorge: presionar al modelo lo encierra en una solución mediocre; a veces conviene reiniciar.',
    categoria: 'operacion-evaluacion',
  },
  {
    slug: 'superpowers',
    termino: 'Superpowers',
    definicion: 'Conjunto de skills que guía el ciclo completo: lluvia de ideas, especificación, implementación y pruebas.',
    categoria: 'operacion-evaluacion',
    sesionOrigen: 17,
  },
  {
    slug: 'omnirouter-llm-router',
    termino: 'OmniRouter / LLM Router',
    definicion: 'Enrutadores locales que reparten pedidos entre proveedores según costo o complejidad.',
    categoria: 'operacion-evaluacion',
    sesionOrigen: 14,
  },
  {
    slug: 'hermes-agent',
    termino: 'Hermes Agent',
    definicion: 'Marco de agente con memoria y conectores (WhatsApp, Drive) para asistentes tipo «Jarvis».',
    categoria: 'fundamentos',
  },
  {
    slug: 'adr',
    termino: 'ADR',
    definicion: 'Registro de decisiones de arquitectura, para saber por qué se cambió algo.',
    categoria: 'operacion-evaluacion',
  },
  {
    slug: 'ultimo-momento-responsable',
    termino: 'Último momento responsable',
    definicion: 'Posponer una decisión de diseño hasta que sea necesaria.',
    categoria: 'operacion-evaluacion',
  },
  {
    slug: 'capa-de-dominio',
    termino: 'Capa de dominio',
    definicion: 'Parte del software con las reglas del negocio, separada de la interfaz.',
    categoria: 'fundamentos',
  },
  {
    slug: 'sdr',
    termino: 'SDR',
    definicion: 'Radio definida por software: un dispositivo USB y un programa reciben señales de radio.',
    categoria: 'fundamentos',
    sesionOrigen: 16,
  },
  {
    slug: 'paradoja-de-jevons',
    termino: 'Paradoja de Jevons',
    definicion: 'Si producir software se abarata, se demanda más software, no menos.',
    categoria: 'operacion-evaluacion',
    sesionOrigen: 15,
  },
  {
    slug: 'software-desechable',
    termino: 'Software desechable',
    definicion: 'Predicción de Jorge: aplicaciones hechas al instante para una tarea y luego descartadas.',
    categoria: 'operacion-evaluacion',
    sesionOrigen: 15,
  },
  {
    slug: 'arqueologia-de-codigo',
    termino: 'Arqueología de código',
    definicion: 'Entender un sistema heredado sin documentación con ayuda de IA.',
    categoria: 'operacion-evaluacion',
    sesionOrigen: 13,
  },
  {
    slug: 'esteganografia',
    termino: 'Esteganografía',
    definicion: 'Ocultar información dentro de otra; base de las marcas de agua en texto generado.',
    categoria: 'seguridad-control',
    sesionOrigen: 13,
  },
  {
    slug: 'informacion-asimetrica',
    termino: 'Información asimétrica',
    definicion: 'Razón de ser de las certificaciones: demostrarle a un tercero lo que uno sabe.',
    categoria: 'operacion-evaluacion',
    sesionOrigen: 13,
  },
  {
    slug: 'aula-invertida',
    termino: 'Aula invertida',
    definicion: 'Los estudiantes revisan el material antes y la clase se dedica a resolver problemas.',
    categoria: 'operacion-evaluacion',
    sesionOrigen: 20,
  },
  // ---------- Ampliación a 200 términos (octubre 2026) ----------
  {
    slug: 'llm',
    termino: 'LLM (modelo de lenguaje grande)',
    definicion: 'Modelo entrenado con enormes cantidades de texto para predecir la siguiente pieza de texto. Es el «caballo» de la metáfora del grupo.',
    categoria: 'fundamentos',
  },
  {
    slug: 'token',
    termino: 'Token',
    definicion: 'Unidad mínima con la que un modelo lee y escribe: un pedazo de palabra, una palabra corta o un signo. Se cobra y se mide por tokens.',
    categoria: 'fundamentos',
  },
  {
    slug: 'tokenizacion',
    termino: 'Tokenización',
    definicion: 'Proceso de partir un texto en tokens antes de pasarlo al modelo. Por eso el español suele gastar más tokens que el inglés.',
    categoria: 'fundamentos',
  },
  {
    slug: 'transformer',
    termino: 'Transformer',
    definicion: 'Arquitectura de red neuronal (2017) en la que se basan casi todos los LLM actuales. Su pieza clave es el mecanismo de atención.',
    categoria: 'fundamentos',
  },
  {
    slug: 'mecanismo-de-atencion',
    termino: 'Mecanismo de atención',
    definicion: 'Parte del transformer que decide qué tanto pesa cada token del contexto al generar el siguiente.',
    categoria: 'fundamentos',
  },
  {
    slug: 'parametros',
    termino: 'Parámetros',
    definicion: 'Los números internos que el modelo ajusta durante el entrenamiento. Se usan como medida aproximada de su tamaño (7B, 70B…).',
    categoria: 'fundamentos',
  },
  {
    slug: 'pesos-abiertos',
    termino: 'Pesos abiertos (open weights)',
    definicion: 'Modelos cuyos parámetros se pueden descargar y ejecutar en hardware propio, aunque no siempre se publiquen los datos ni el código de entrenamiento.',
    categoria: 'fundamentos',
    sesionOrigen: 12,
  },
  {
    slug: 'preentrenamiento',
    termino: 'Preentrenamiento',
    definicion: 'Primera etapa del entrenamiento: el modelo aprende a predecir texto a partir de grandes volúmenes de datos, sin una tarea específica.',
    categoria: 'fundamentos',
  },
  {
    slug: 'ajuste-fino',
    termino: 'Ajuste fino (fine-tuning)',
    definicion: 'Entrenamiento adicional de un modelo ya preentrenado con datos de un dominio o estilo particular.',
    categoria: 'fundamentos',
  },
  {
    slug: 'rlhf',
    termino: 'RLHF',
    definicion: 'Aprendizaje por refuerzo con retroalimentación humana: personas califican respuestas y el modelo se ajusta para preferir las mejor calificadas.',
    categoria: 'fundamentos',
  },
  {
    slug: 'ia-constitucional',
    termino: 'IA constitucional',
    definicion: 'Técnica de Anthropic para alinear modelos con una lista explícita de principios, usando al propio modelo para criticar y corregir sus respuestas.',
    categoria: 'fundamentos',
  },
  {
    slug: 'modelo-de-razonamiento',
    termino: 'Modelo de razonamiento',
    definicion: 'Modelo entrenado para «pensar» en pasos intermedios antes de responder; rinde más en matemáticas, código y problemas de varios pasos.',
    categoria: 'fundamentos',
  },
  {
    slug: 'cadena-de-pensamiento',
    termino: 'Cadena de pensamiento',
    definicion: 'Pedirle al modelo que razone paso a paso antes de la respuesta final. Mejora la precisión en problemas complejos.',
    categoria: 'fundamentos',
  },
  {
    slug: 'pensamiento-extendido',
    termino: 'Pensamiento extendido',
    definicion: 'Modo en el que el modelo dedica tokens extra a razonar antes de contestar. Más tiempo y costo a cambio de mejores respuestas.',
    categoria: 'fundamentos',
  },
  {
    slug: 'temperatura',
    termino: 'Temperatura',
    definicion: 'Parámetro que controla qué tan aleatoria es la salida: baja para respuestas consistentes, alta para variedad.',
    categoria: 'fundamentos',
  },
  {
    slug: 'inferencia',
    termino: 'Inferencia',
    definicion: 'Usar un modelo ya entrenado para generar respuestas. Es lo que se paga cada vez que se le hace una pregunta.',
    categoria: 'fundamentos',
  },
  {
    slug: 'multimodalidad',
    termino: 'Multimodalidad',
    definicion: 'Capacidad de un modelo para trabajar con varios tipos de datos: texto, imágenes, audio o video.',
    categoria: 'fundamentos',
  },
  {
    slug: 'modelo-de-difusion',
    termino: 'Modelo de difusión',
    definicion: 'Tipo de modelo que genera imágenes, audio o video partiendo de ruido y limpiándolo poco a poco.',
    categoria: 'fundamentos',
  },
  {
    slug: 'few-shot',
    termino: 'Few-shot',
    definicion: 'Dar unos pocos ejemplos dentro del prompt para que el modelo entienda el formato o la tarea.',
    categoria: 'fundamentos',
  },
  {
    slug: 'zero-shot',
    termino: 'Zero-shot',
    definicion: 'Pedirle una tarea al modelo sin darle ningún ejemplo, solo la instrucción.',
    categoria: 'fundamentos',
  },
  {
    slug: 'prompt-de-sistema',
    termino: 'Prompt de sistema',
    definicion: 'Instrucciones de fondo que acompañan toda la conversación: rol, tono, reglas. El usuario normalmente no las ve.',
    categoria: 'fundamentos',
  },
  {
    slug: 'uso-de-herramientas',
    termino: 'Uso de herramientas (tool use)',
    definicion: 'Capacidad del modelo de pedir que se ejecute una función externa —buscar, leer un archivo, llamar una API— y usar el resultado.',
    categoria: 'fundamentos',
  },
  {
    slug: 'salida-estructurada',
    termino: 'Salida estructurada',
    definicion: 'Obligar al modelo a responder en un formato fijo, como JSON con un esquema, para que otro programa lo pueda leer.',
    categoria: 'fundamentos',
  },
  {
    slug: 'claude-code',
    termino: 'Claude Code',
    definicion: 'Agente de programación de Anthropic que trabaja en la terminal: lee el repositorio, edita archivos y ejecuta comandos.',
    categoria: 'fundamentos',
    sesionOrigen: 15,
  },
  {
    slug: 'cowork',
    termino: 'Cowork',
    definicion: 'Herramienta de Anthropic que lleva el modelo de trabajo de Claude Code a tareas de conocimiento, no solo de programación.',
    categoria: 'fundamentos',
    sesionOrigen: 15,
  },
  {
    slug: 'subagente',
    termino: 'Subagente',
    definicion: 'Agente secundario que recibe una tarea acotada de otro agente, la resuelve en su propio contexto y devuelve solo el resultado.',
    categoria: 'fundamentos',
  },
  {
    slug: 'orquestador-de-agentes',
    termino: 'Orquestador de agentes',
    definicion: 'Herramienta que coordina varios agentes: reparte tareas, junta resultados y decide el siguiente paso.',
    categoria: 'fundamentos',
    sesionOrigen: 19,
  },
  {
    slug: 'sistema-multiagente',
    termino: 'Sistema multiagente',
    definicion: 'Arquitectura en la que varios agentes especializados colaboran para resolver un problema.',
    categoria: 'fundamentos',
  },
  {
    slug: 'computer-use',
    termino: 'Computer use',
    definicion: 'Capacidad de un modelo para operar un computador como una persona: ver la pantalla, mover el mouse y escribir.',
    categoria: 'fundamentos',
  },
  {
    slug: 'modelo-fundacional',
    termino: 'Modelo fundacional',
    definicion: 'Modelo grande y general sobre el que se construyen muchas aplicaciones distintas.',
    categoria: 'fundamentos',
  },
  {
    slug: 'destilacion',
    termino: 'Destilación',
    definicion: 'Entrenar un modelo pequeño para imitar a uno grande. Se gana velocidad y costo a cambio de algo de capacidad.',
    categoria: 'fundamentos',
  },
  {
    slug: 'mezcla-de-expertos',
    termino: 'Mezcla de expertos (MoE)',
    definicion: 'Arquitectura en la que solo una parte del modelo se activa para cada token, lo que permite modelos enormes con un costo de inferencia menor.',
    categoria: 'fundamentos',
  },
  {
    slug: 'leyes-de-escalamiento',
    termino: 'Leyes de escalamiento',
    definicion: 'Observación empírica de que los modelos mejoran de forma predecible al aumentar datos, parámetros y cómputo.',
    categoria: 'fundamentos',
  },
  {
    slug: 'modelo-de-frontera',
    termino: 'Modelo de frontera',
    definicion: 'Los modelos más capaces del momento, de los laboratorios que empujan el estado del arte.',
    categoria: 'fundamentos',
  },
  {
    slug: 'ingeniero-de-avance',
    termino: 'Ingeniero de avance',
    definicion: 'Rol que se sienta con el cliente para implementar asistentes de IA sobre sus problemas reales (forward deployed engineer).',
    categoria: 'fundamentos',
    sesionOrigen: 11,
  },
  {
    slug: 'vibe-coding',
    termino: 'Vibe coding',
    definicion: 'Programar describiendo lo que se quiere y aceptando el código generado sin revisarlo a fondo. Útil para prototipos, riesgoso en producción.',
    categoria: 'fundamentos',
  },
  {
    slug: 'programacion-agentica',
    termino: 'Programación agéntica',
    definicion: 'Desarrollo en el que un agente planea, escribe, prueba y corrige código en ciclos, con el humano revisando y dirigiendo.',
    categoria: 'fundamentos',
  },
  {
    slug: 'ventana-de-contexto',
    termino: 'Ventana de contexto',
    definicion: 'Cantidad máxima de tokens que el modelo puede tener en cuenta a la vez: instrucciones, conversación, archivos y respuesta.',
    categoria: 'contexto-memoria',
  },
  {
    slug: 'embeddings',
    termino: 'Embeddings',
    definicion: 'Representación de un texto como una lista de números, de modo que textos con significado parecido quedan cerca.',
    categoria: 'contexto-memoria',
  },
  {
    slug: 'base-de-datos-vectorial',
    termino: 'Base de datos vectorial',
    definicion: 'Base de datos especializada en guardar embeddings y encontrar rápido los más parecidos a una consulta.',
    categoria: 'contexto-memoria',
  },
  {
    slug: 'busqueda-semantica',
    termino: 'Búsqueda semántica',
    definicion: 'Buscar por significado y no por palabras exactas, usando embeddings.',
    categoria: 'contexto-memoria',
  },
  {
    slug: 'chunking',
    termino: 'Fragmentación (chunking)',
    definicion: 'Partir documentos largos en pedazos manejables antes de indexarlos para RAG. El tamaño de los pedazos afecta mucho la calidad.',
    categoria: 'contexto-memoria',
  },
  {
    slug: 'reranking',
    termino: 'Reordenamiento (reranking)',
    definicion: 'Segundo paso de una búsqueda: un modelo reordena los resultados recuperados para dejar arriba los más relevantes.',
    categoria: 'contexto-memoria',
  },
  {
    slug: 'busqueda-hibrida',
    termino: 'Búsqueda híbrida',
    definicion: 'Combinar búsqueda por palabras clave con búsqueda semántica para aprovechar lo mejor de cada una.',
    categoria: 'contexto-memoria',
  },
  {
    slug: 'grafo-de-conocimiento',
    termino: 'Grafo de conocimiento',
    definicion: 'Forma de guardar información como entidades y relaciones entre ellas, útil para que un modelo navegue conocimiento conectado.',
    categoria: 'contexto-memoria',
  },
  {
    slug: 'claude-md',
    termino: 'CLAUDE.md',
    definicion: 'Archivo en la raíz del proyecto con las reglas y el contexto que Claude Code lee al empezar cada sesión. Una de las capas editables del harness.',
    categoria: 'contexto-memoria',
    sesionOrigen: 17,
  },
  {
    slug: 'proyectos-de-claude',
    termino: 'Proyectos (Claude)',
    definicion: 'Espacios en Claude que agrupan conversaciones con documentos e instrucciones compartidas, para no repetir el contexto cada vez.',
    categoria: 'contexto-memoria',
  },
  {
    slug: 'compactacion',
    termino: 'Compactación',
    definicion: 'Resumir automáticamente la conversación cuando la ventana de contexto se llena, para seguir trabajando sin empezar de cero.',
    categoria: 'contexto-memoria',
  },
  {
    slug: 'cache-de-prompts',
    termino: 'Caché de prompts',
    definicion: 'Guardar la parte repetida de un prompt para que las siguientes llamadas sean más baratas y rápidas.',
    categoria: 'contexto-memoria',
  },
  {
    slug: 'memoria-de-corto-plazo',
    termino: 'Memoria de corto plazo',
    definicion: 'Lo que el modelo recuerda dentro de la conversación actual, limitado por la ventana de contexto.',
    categoria: 'contexto-memoria',
  },
  {
    slug: 'memoria-de-largo-plazo',
    termino: 'Memoria de largo plazo',
    definicion: 'Información que sobrevive entre sesiones porque se guarda fuera del modelo: archivos, bases de datos, notas.',
    categoria: 'contexto-memoria',
  },
  {
    slug: 'memoria-episodica',
    termino: 'Memoria episódica',
    definicion: 'Registro de interacciones o eventos pasados que un agente puede consultar para no repetir errores.',
    categoria: 'contexto-memoria',
  },
  {
    slug: 'contexto-compartido',
    termino: 'Contexto compartido',
    definicion: 'Que todo un equipo trabaje con la misma información de fondo —reglas, decisiones, documentos— al usar IA.',
    categoria: 'contexto-memoria',
    sesionOrigen: 6,
  },
  {
    slug: 'limpieza-de-contexto',
    termino: 'Limpieza de contexto',
    definicion: 'Cerrar o limpiar la sesión antes de que el contexto se llene; Jorge recomienda hacerlo hacia el 25–30 %.',
    categoria: 'contexto-memoria',
    sesionOrigen: 13,
  },
  {
    slug: 'degradacion-de-contexto',
    termino: 'Degradación de contexto',
    definicion: 'Pérdida de calidad de las respuestas a medida que el contexto se llena de información vieja o irrelevante.',
    categoria: 'contexto-memoria',
  },
  {
    slug: 'perdido-en-el-medio',
    termino: 'Perdido en el medio',
    definicion: 'Tendencia de los modelos a usar mejor lo que está al principio y al final del contexto que lo que queda en el centro.',
    categoria: 'contexto-memoria',
  },
  {
    slug: 'aguja-en-el-pajar',
    termino: 'Aguja en el pajar',
    definicion: 'Prueba que esconde un dato puntual en un texto muy largo para medir si el modelo lo encuentra.',
    categoria: 'contexto-memoria',
  },
  {
    slug: 'notebooklm',
    termino: 'NotebookLM',
    definicion: 'Herramienta de Google para conversar con un conjunto de documentos propios. El grupo la recomendó para leer papers.',
    categoria: 'contexto-memoria',
    sesionOrigen: 16,
  },
  {
    slug: 'spec-como-fuente-de-verdad',
    termino: 'Spec como fuente de verdad',
    definicion: 'Escribir primero la especificación y que el código la siga, en vez de que el código sea la única documentación.',
    categoria: 'contexto-memoria',
    sesionOrigen: 9,
  },
  {
    slug: 'commit-frecuente',
    termino: 'Commit frecuente',
    definicion: 'Guardar el avance en git cada pocos minutos para poder volver atrás cuando el agente se equivoca.',
    categoria: 'contexto-memoria',
    sesionOrigen: 13,
  },
  {
    slug: 'llms-txt',
    termino: 'llms.txt',
    definicion: 'Archivo que algunos sitios publican con una versión resumida de su documentación pensada para que la lea un modelo.',
    categoria: 'contexto-memoria',
  },
  {
    slug: 'documentacion-viva',
    termino: 'Documentación viva',
    definicion: 'Documentación que se actualiza junto con el código, idealmente con ayuda del mismo agente que hace los cambios.',
    categoria: 'contexto-memoria',
  },
  {
    slug: 'memoria-institucional',
    termino: 'Memoria institucional',
    definicion: 'El conocimiento acumulado de una organización —decisiones, casos, aprendizajes— guardado para que no se pierda cuando la gente cambia.',
    categoria: 'contexto-memoria',
    sesionOrigen: 4,
  },
  {
    slug: 'resumen-recursivo',
    termino: 'Resumen recursivo',
    definicion: 'Resumir por partes y luego resumir los resúmenes, para condensar documentos que no caben en el contexto.',
    categoria: 'contexto-memoria',
  },
  {
    slug: 'recuperacion-agentica',
    termino: 'Recuperación agéntica',
    definicion: 'Cuando el propio agente decide qué buscar, dónde y cuándo, en lugar de un RAG fijo que siempre recupera lo mismo.',
    categoria: 'contexto-memoria',
  },
  {
    slug: 'mapa-del-repositorio',
    termino: 'Mapa del repositorio',
    definicion: 'Resumen de la estructura de un proyecto (carpetas, archivos, funciones) que se le da al agente para que se oriente rápido.',
    categoria: 'contexto-memoria',
  },
  {
    slug: 'traspaso-de-contexto-por-repositorio',
    termino: 'Traspaso de contexto por repositorio',
    definicion: 'Guardar el estado de una sesión en el repositorio para retomarla desde otra máquina.',
    categoria: 'contexto-memoria',
    sesionOrigen: 20,
  },
  {
    slug: 'comunicacion-entre-sesiones',
    termino: 'Comunicación entre sesiones',
    definicion: 'Hacer que varias sesiones de un agente intercambien información entre sí en lugar de trabajar aisladas.',
    categoria: 'contexto-memoria',
    sesionOrigen: 19,
  },
  {
    slug: 'ventana-deslizante',
    termino: 'Ventana deslizante',
    definicion: 'Estrategia de conservar solo los últimos mensajes de la conversación y descartar los más viejos.',
    categoria: 'contexto-memoria',
  },
  {
    slug: 'tokens-de-entrada-y-salida',
    termino: 'Tokens de entrada y salida',
    definicion: 'Lo que se le envía al modelo y lo que genera. Se cobran por separado y la salida suele ser más cara.',
    categoria: 'contexto-memoria',
  },
  {
    slug: 'presupuesto-de-tokens',
    termino: 'Presupuesto de tokens',
    definicion: 'Límite de tokens que se le asigna a una tarea o a un agente para controlar costo y tamaño del contexto.',
    categoria: 'contexto-memoria',
  },
  {
    slug: 'zettelkasten',
    termino: 'Zettelkasten',
    definicion: 'Método de notas pequeñas e interconectadas; inspira muchos «segundos cerebros» como los de Obsidian.',
    categoria: 'contexto-memoria',
  },
  {
    slug: 'conectores',
    termino: 'Conectores',
    definicion: 'Integraciones que le dan al modelo acceso a fuentes externas como correo, calendario o Drive.',
    categoria: 'contexto-memoria',
  },
  {
    slug: 'ingesta-de-documentos',
    termino: 'Ingesta de documentos',
    definicion: 'Proceso de convertir PDFs, páginas o archivos en texto limpio y fragmentado listo para que un modelo lo use.',
    categoria: 'contexto-memoria',
  },
  {
    slug: 'inyeccion-de-prompts',
    termino: 'Inyección de prompts',
    definicion: 'Ataque en el que un texto malicioso le da instrucciones al modelo para que ignore las originales.',
    categoria: 'seguridad-control',
  },
  {
    slug: 'inyeccion-indirecta',
    termino: 'Inyección indirecta',
    definicion: 'Inyección de prompts escondida en contenido que el agente lee —una página, un correo, un archivo— y no en lo que escribe el usuario.',
    categoria: 'seguridad-control',
  },
  {
    slug: 'jailbreak',
    termino: 'Jailbreak',
    definicion: 'Técnica para convencer al modelo de saltarse sus propias restricciones de seguridad.',
    categoria: 'seguridad-control',
  },
  {
    slug: 'sandbox',
    termino: 'Sandbox',
    definicion: 'Entorno aislado donde el agente puede ejecutar código sin poner en riesgo el sistema real ni los datos.',
    categoria: 'seguridad-control',
  },
  {
    slug: 'permisos-de-herramientas',
    termino: 'Permisos de herramientas',
    definicion: 'Reglas que definen qué puede hacer un agente sin preguntar, qué requiere aprobación y qué tiene prohibido.',
    categoria: 'seguridad-control',
  },
  {
    slug: 'humano-en-el-ciclo',
    termino: 'Humano en el ciclo',
    definicion: 'Diseño en el que una persona revisa o aprueba los pasos importantes antes de que el agente continúe.',
    categoria: 'seguridad-control',
  },
  {
    slug: 'puerta-de-aprobacion',
    termino: 'Puerta de aprobación',
    definicion: 'Punto obligado donde el agente se detiene y espera un sí humano, por ejemplo antes de tocar código o de borrar algo.',
    categoria: 'seguridad-control',
    sesionOrigen: 9,
  },
  {
    slug: 'guardarrailes',
    termino: 'Guardarraíles',
    definicion: 'Controles alrededor del modelo que filtran entradas y salidas para evitar respuestas dañinas o fuera de alcance.',
    categoria: 'seguridad-control',
  },
  {
    slug: 'alineacion',
    termino: 'Alineación',
    definicion: 'Lograr que un modelo actúe según las intenciones y los valores de las personas, incluso en situaciones no previstas.',
    categoria: 'seguridad-control',
  },
  {
    slug: 'sesgo-de-automatizacion',
    termino: 'Sesgo de automatización',
    definicion: 'Tendencia a confiar de más en lo que produce una máquina y dejar de revisarlo. La voluntad sola no lo frena; la fricción sí.',
    categoria: 'seguridad-control',
    sesionOrigen: 9,
  },
  {
    slug: 'fuga-de-datos',
    termino: 'Fuga de datos',
    definicion: 'Que información sensible termine expuesta, por ejemplo al pegarla en un servicio externo o en un log.',
    categoria: 'seguridad-control',
  },
  {
    slug: 'exfiltracion',
    termino: 'Exfiltración',
    definicion: 'Sacar datos de un sistema sin autorización; un riesgo cuando un agente con acceso a datos lee instrucciones maliciosas.',
    categoria: 'seguridad-control',
  },
  {
    slug: 'datos-personales',
    termino: 'Datos personales',
    definicion: 'Información que identifica a una persona. Usarlos con IA exige consentimiento, cuidado y saber a dónde van.',
    categoria: 'seguridad-control',
  },
  {
    slug: 'retencion-cero-de-datos',
    termino: 'Retención cero de datos',
    definicion: 'Acuerdo con un proveedor para que no guarde los prompts ni las respuestas después de procesarlos.',
    categoria: 'seguridad-control',
  },
  {
    slug: 'secretos-en-el-codigo',
    termino: 'Secretos en el código',
    definicion: 'Llaves de API o contraseñas escritas en el código; un error común en código generado que hay que revisar siempre.',
    categoria: 'seguridad-control',
  },
  {
    slug: 'cadena-de-suministro',
    termino: 'Cadena de suministro de software',
    definicion: 'Todas las dependencias de terceros de un proyecto. Un paquete comprometido compromete todo lo que lo usa.',
    categoria: 'seguridad-control',
  },
  {
    slug: 'slopsquatting',
    termino: 'Slopsquatting',
    definicion: 'Ataque que publica paquetes con los nombres que los modelos suelen inventar, esperando que alguien instale la dependencia alucinada.',
    categoria: 'seguridad-control',
  },
  {
    slug: 'minimo-privilegio',
    termino: 'Mínimo privilegio',
    definicion: 'Darle a un agente solo los permisos estrictamente necesarios para su tarea, y nada más.',
    categoria: 'seguridad-control',
  },
  {
    slug: 'red-teaming',
    termino: 'Red teaming',
    definicion: 'Atacar a propósito un modelo o sistema para descubrir fallas antes de que lo haga alguien con malas intenciones.',
    categoria: 'seguridad-control',
  },
  {
    slug: 'clasificador-de-seguridad',
    termino: 'Clasificador de seguridad',
    definicion: 'Modelo auxiliar que revisa entradas o salidas y bloquea las que considera peligrosas.',
    categoria: 'seguridad-control',
  },
  {
    slug: 'registro-de-auditoria',
    termino: 'Registro de auditoría',
    definicion: 'Bitácora de lo que hizo un agente —qué leyó, qué ejecutó, qué cambió— para poder revisarlo después.',
    categoria: 'seguridad-control',
  },
  {
    slug: 'marcas-de-agua',
    termino: 'Marcas de agua en texto IA',
    definicion: 'Señales estadísticas escondidas en el texto generado para poder detectar después que lo escribió un modelo.',
    categoria: 'seguridad-control',
    sesionOrigen: 13,
  },
  {
    slug: 'deepfake',
    termino: 'Deepfake',
    definicion: 'Imagen, audio o video falso pero realista, generado con IA para suplantar a una persona.',
    categoria: 'seguridad-control',
  },
  {
    slug: 'clonacion-de-voz',
    termino: 'Clonación de voz',
    definicion: 'Generar una voz sintética que imita a una persona real a partir de muestras de su voz. Útil y riesgosa a la vez.',
    categoria: 'seguridad-control',
  },
  {
    slug: 'derechos-de-autor-e-ia',
    termino: 'Derechos de autor e IA',
    definicion: 'Debate abierto sobre el uso de obras protegidas para entrenar modelos y sobre quién es dueño de lo que generan.',
    categoria: 'seguridad-control',
  },
  {
    slug: 'sesgo-algoritmico',
    termino: 'Sesgo algorítmico',
    definicion: 'Cuando un modelo reproduce o amplifica prejuicios presentes en sus datos de entrenamiento.',
    categoria: 'seguridad-control',
  },
  {
    slug: 'explicabilidad',
    termino: 'Explicabilidad',
    definicion: 'Poder dar razones comprensibles de por qué un sistema de IA llegó a una respuesta o decisión.',
    categoria: 'seguridad-control',
  },
  {
    slug: 'interpretabilidad',
    termino: 'Interpretabilidad',
    definicion: 'Investigación que estudia el interior de los modelos para entender qué representan y cómo calculan.',
    categoria: 'seguridad-control',
  },
  {
    slug: 'sicofancia',
    termino: 'Sicofancia',
    definicion: 'Tendencia del modelo a darle la razón al usuario o decirle lo que quiere oír, en vez de corregirlo.',
    categoria: 'seguridad-control',
  },
  {
    slug: 'envenenamiento-de-datos',
    termino: 'Envenenamiento de datos',
    definicion: 'Meter datos manipulados en el entrenamiento o en las fuentes de un RAG para alterar el comportamiento del modelo.',
    categoria: 'seguridad-control',
  },
  {
    slug: 'agencia-excesiva',
    termino: 'Agencia excesiva',
    definicion: 'Darle a un agente más permisos, herramientas o autonomía de los que necesita, lo que multiplica el daño posible.',
    categoria: 'seguridad-control',
  },
  {
    slug: 'condicion-de-parada',
    termino: 'Condición de parada',
    definicion: 'Regla explícita de cuándo un agente debe detenerse: tarea cumplida, límite de intentos o de costo, o señal de error.',
    categoria: 'seguridad-control',
    sesionOrigen: 9,
  },
  {
    slug: 'lista-de-permitidos',
    termino: 'Lista de permitidos (allowlist)',
    definicion: 'Enumerar de forma explícita los comandos, dominios o herramientas que un agente puede usar; todo lo demás queda bloqueado.',
    categoria: 'seguridad-control',
  },
  {
    slug: 'gobernanza-de-ia',
    termino: 'Gobernanza de IA',
    definicion: 'Reglas, roles y presupuesto con los que una organización decide cómo, dónde y bajo qué controles usa IA.',
    categoria: 'seguridad-control',
  },
  {
    slug: 'politica-de-uso-aceptable',
    termino: 'Política de uso aceptable',
    definicion: 'Reglas del proveedor o de la organización sobre para qué se puede y para qué no se puede usar un modelo.',
    categoria: 'seguridad-control',
  },
  {
    slug: 'ley-de-ia-europea',
    termino: 'Ley de IA de la Unión Europea',
    definicion: 'Regulación europea que clasifica los sistemas de IA por nivel de riesgo y exige obligaciones según ese nivel.',
    categoria: 'seguridad-control',
  },
  {
    slug: 'owasp-top-10-llm',
    termino: 'OWASP Top 10 para LLM',
    definicion: 'Lista de la fundación OWASP con los riesgos de seguridad más comunes en aplicaciones que usan modelos de lenguaje.',
    categoria: 'seguridad-control',
  },
  {
    slug: 'verificacion-de-fuentes',
    termino: 'Verificación de fuentes',
    definicion: 'Comprobar que las citas, datos y enlaces que da un modelo existen y dicen lo que él afirma.',
    categoria: 'seguridad-control',
  },
  {
    slug: 'evals',
    termino: 'Evals',
    definicion: 'Conjunto de pruebas para medir qué tan bien hace un modelo o un agente una tarea específica, y detectar si empeora.',
    categoria: 'operacion-evaluacion',
  },
  {
    slug: 'benchmark',
    termino: 'Benchmark',
    definicion: 'Prueba estandarizada para comparar modelos. Jorge armó el suyo: 19 modelos abiertos, 55 problemas, 11 lenguajes.',
    categoria: 'operacion-evaluacion',
    sesionOrigen: 12,
  },
  {
    slug: 'llm-como-juez',
    termino: 'LLM como juez',
    definicion: 'Usar un modelo para calificar las respuestas de otro según criterios definidos.',
    categoria: 'operacion-evaluacion',
  },
  {
    slug: 'conjunto-dorado',
    termino: 'Conjunto dorado',
    definicion: 'Colección de casos con su respuesta correcta conocida, usada como referencia fija en las evals.',
    categoria: 'operacion-evaluacion',
  },
  {
    slug: 'pruebas-de-regresion',
    termino: 'Pruebas de regresión',
    definicion: 'Pruebas que verifican que un cambio nuevo no rompió algo que ya funcionaba.',
    categoria: 'operacion-evaluacion',
  },
  {
    slug: 'tdd',
    termino: 'TDD (desarrollo guiado por pruebas)',
    definicion: 'Escribir primero la prueba que falla y luego el código que la hace pasar. Le da al agente un criterio claro de terminado.',
    categoria: 'operacion-evaluacion',
  },
  {
    slug: 'integracion-continua',
    termino: 'Integración continua',
    definicion: 'Correr pruebas y validaciones automáticamente con cada cambio que se sube al repositorio.',
    categoria: 'operacion-evaluacion',
  },
  {
    slug: 'observabilidad',
    termino: 'Observabilidad',
    definicion: 'Poder ver qué está pasando dentro de un sistema en producción a partir de logs, métricas y trazas.',
    categoria: 'operacion-evaluacion',
  },
  {
    slug: 'trazas',
    termino: 'Trazas',
    definicion: 'Registro paso a paso de lo que hizo un agente en una tarea: llamadas al modelo, herramientas usadas y tiempos.',
    categoria: 'operacion-evaluacion',
  },
  {
    slug: 'latencia',
    termino: 'Latencia',
    definicion: 'Tiempo que tarda un modelo en responder. Se suele medir hasta el primer token y hasta la respuesta completa.',
    categoria: 'operacion-evaluacion',
  },
  {
    slug: 'costo-por-token',
    termino: 'Costo por token',
    definicion: 'Precio de usar un modelo, cobrado por cada millón de tokens de entrada y de salida.',
    categoria: 'operacion-evaluacion',
  },
  {
    slug: 'enrutamiento-de-modelos',
    termino: 'Enrutamiento de modelos',
    definicion: 'Mandar cada pedido al modelo más adecuado según costo, velocidad o dificultad.',
    categoria: 'operacion-evaluacion',
    sesionOrigen: 14,
  },
  {
    slug: 'cuantizacion',
    termino: 'Cuantización',
    definicion: 'Reducir la precisión de los números de un modelo para que ocupe menos memoria y corra en hardware modesto.',
    categoria: 'operacion-evaluacion',
  },
  {
    slug: 'ollama',
    termino: 'Ollama',
    definicion: 'Herramienta para descargar y ejecutar modelos de pesos abiertos en el propio computador.',
    categoria: 'operacion-evaluacion',
  },
  {
    slug: 'modo-plan',
    termino: 'Modo plan',
    definicion: 'Pedirle al agente que proponga un plan y esperar aprobación antes de que toque el código.',
    categoria: 'operacion-evaluacion',
    sesionOrigen: 9,
  },
  {
    slug: 'criterios-de-aceptacion-binarios',
    termino: 'Criterios de aceptación binarios',
    definicion: 'Condiciones de terminado que se cumplen o no se cumplen, sin zonas grises, para que el agente sepa cuándo acabó.',
    categoria: 'operacion-evaluacion',
    sesionOrigen: 9,
  },
  {
    slug: 'deuda-tecnica',
    termino: 'Deuda técnica',
    definicion: 'El costo futuro de atajos tomados hoy. Con IA se acumula más rápido si nadie revisa lo generado.',
    categoria: 'operacion-evaluacion',
  },
  {
    slug: 'refactorizacion',
    termino: 'Refactorización',
    definicion: 'Reorganizar código sin cambiar lo que hace, para que sea más claro y fácil de mantener.',
    categoria: 'operacion-evaluacion',
    sesionOrigen: 4,
  },
  {
    slug: 'fomo',
    termino: 'FOMO',
    definicion: 'Miedo a quedarse atrás con cada novedad de IA. Para el grupo, compartir experiencias es la mejor defensa.',
    categoria: 'operacion-evaluacion',
    sesionOrigen: 19,
  },
  {
    slug: 'certificacion-claude-architect',
    termino: 'Certificación de arquitecto de Anthropic',
    definicion: 'Certificación oficial sobre diseño de soluciones con Claude. Torres aprobó Architect Foundations.',
    categoria: 'operacion-evaluacion',
    sesionOrigen: 14,
  },
  {
    slug: 'miniproyecto-comparativo',
    termino: 'Miniproyecto comparativo',
    definicion: 'Idea del grupo: que todos resuelvan el mismo ejercicio, cada uno con su harness, y comparar resultados.',
    categoria: 'operacion-evaluacion',
    sesionOrigen: 15,
  },
  {
    slug: 'mismo-harness-distinto-modelo',
    termino: 'Mismo harness, distinto modelo',
    definicion: 'Experimento propuesto por Torres: dejar fijo el harness y cambiar solo el modelo para ver cuánto aporta cada uno.',
    categoria: 'operacion-evaluacion',
    sesionOrigen: 16,
  },
  {
    slug: 'limite-de-gasto',
    termino: 'Límite de gasto',
    definicion: 'Tope de dinero configurado en un proveedor o una llave de API para no llevarse sorpresas en la factura.',
    categoria: 'operacion-evaluacion',
  },
  {
    slug: 'limite-de-uso',
    termino: 'Límite de uso (rate limit)',
    definicion: 'Máximo de pedidos o tokens por minuto que permite un proveedor; al superarlo, las llamadas fallan o esperan.',
    categoria: 'operacion-evaluacion',
  },
  {
    slug: 'procesamiento-por-lotes',
    termino: 'Procesamiento por lotes',
    definicion: 'Enviar muchos pedidos juntos para que se procesen sin prisa, a cambio de un precio menor.',
    categoria: 'operacion-evaluacion',
  },
  {
    slug: 'despliegue',
    termino: 'Despliegue',
    definicion: 'Poner una aplicación a funcionar en un servidor para que otros la usen.',
    categoria: 'operacion-evaluacion',
  },
  {
    slug: 'gamificacion',
    termino: 'Gamificación',
    definicion: 'Usar mecánicas de juego —puntos, niveles, retos— para motivar el aprendizaje o el uso de una aplicación.',
    categoria: 'operacion-evaluacion',
    sesionOrigen: 20,
  },
  {
    slug: 'voz-sintetica',
    termino: 'Voz sintética',
    definicion: 'Voz generada por IA a partir de texto. Diego la usa para narrar su podcast de astronomía.',
    categoria: 'operacion-evaluacion',
    sesionOrigen: 20,
  },
  {
    slug: 'burbuja-de-inversion-en-ia',
    termino: 'Burbuja de inversión en IA',
    definicion: 'Debate sobre si el dinero que entra a la IA supera el valor que realmente produce, y qué pasaría si se corrige.',
    categoria: 'operacion-evaluacion',
    sesionOrigen: 18,
  },
  {
    slug: 'donacion-de-tokens',
    termino: 'Donación de tokens',
    definicion: 'Iniciativa de aportar capacidad de cómputo de IA a causas como problemas matemáticos abiertos.',
    categoria: 'operacion-evaluacion',
    sesionOrigen: 17,
  },
  {
    slug: 'ultralearning',
    termino: 'Ultralearning (aprendizaje extremo)',
    definicion:
      'Aprender algo difícil con retos intensivos y autodirigidos, como aprender mandarín o ciencias de la computación en un año.',
    categoria: 'fundamentos',
    sesionOrigen: 21,
  },
  {
    slug: 'control-remoto-claude-code',
    termino: 'Control remoto de Claude Code',
    definicion:
      'Seguir y guiar una sesión de Claude Code desde otro dispositivo. Juan Pablo lo usa para que el desarrollo avance mientras está en reuniones.',
    categoria: 'operacion-evaluacion',
    sesionOrigen: 21,
  },
  {
    slug: 'ingenieria-inversa-de-aplicaciones',
    termino: 'Ingeniería inversa de aplicaciones',
    definicion:
      'Pedirle a un agente que analice una aplicación o un repositorio existente para entender sus casos de uso y reconstruirla a la medida. Ejemplo: el skill Reverse Engineer Anything.',
    categoria: 'operacion-evaluacion',
    sesionOrigen: 21,
  },
  {
    slug: 'hiperpersonalizacion',
    termino: 'Hiperpersonalización',
    definicion:
      'Adaptar una aplicación o una ruta de aprendizaje a una sola persona, algo que la automatización con IA hace viable.',
    categoria: 'fundamentos',
    sesionOrigen: 22,
  },
]

export function getTerminosPorCategoria(categoria: CategoriaGlosario): TerminoGlosario[] {
  return GLOSARIO.filter(t => t.categoria === categoria)
}

export function getTermino(slug: string): TerminoGlosario | undefined {
  return GLOSARIO.find(t => t.slug === slug)
}
