import type { AutorretratoIA } from './tipos'

/** Datos inventados y pequeños, solo para tests y para arrancar antes de la primera corrida real. */
export const EJEMPLO: AutorretratoIA = {
  generado: '2026-10-15T00:00:00.000Z',
  periodo: { desde: '2026-10-05', hasta: '2026-10-14' },
  actividadDiaria: [
    { fecha: '2026-10-05', prompts: 3, sesiones: 1 },
    { fecha: '2026-10-07', prompts: 10, sesiones: 2 },
    { fecha: '2026-10-14', prompts: 6, sesiones: 1 },
  ],
  commitsPorMes: [
    { mes: '2026-08', total: 10, coautoriaClaude: 6, porTipo: { feat: 4, docs: 6 } },
    { mes: '2026-10', total: 20, coautoriaClaude: 19, porTipo: { feat: 10, docs: 10 } },
  ],
  promptsPorDominio: [
    { dominio: 'producto-web', prompts: 12, reposPublicos: ['sergiomonsalve.com'] },
    { dominio: 'hongos-iot', prompts: 7, reposPublicos: [] },
  ],
  herramientas: [
    { nombre: 'Bash', usos: 30, grupo: 'ejecucion' },
    { nombre: 'WebSearch', usos: 5, grupo: 'investigacion' },
  ],
  modelos: [
    { modelo: 'claude-opus-5-5', respuestas: 80 },
    { modelo: 'claude-opus-5', respuestas: 20 },
  ],
  ecosistema: [
    { herramienta: 'Claude Code', fuente: 'medido', uso: { es: 'Agente de código', en: 'Coding agent' }, intensidad: 3 },
    { herramienta: 'ChatGPT', fuente: 'declarado', uso: { es: 'Consultas', en: 'Questions' }, intensidad: 2 },
  ],
  conceptos: [
    { slug: 'rag', termino: 'RAG', categoria: 'fundamentos', hablado: 3, preguntado: 0, construido: true, cuadrante: 'ambos', corregido: false },
    { slug: 'mcp', termino: 'MCP', categoria: 'operacion-evaluacion', hablado: 0, preguntado: 2, construido: false, cuadrante: 'ninguno', corregido: false },
  ],
  perfilPrompts: { total: 19, medianaCaracteres: 120, pctPreguntas: 30, pctEspanol: 90 },
  eras: [
    { cuenta: 'smonsalve', desde: '2013-01-18', hasta: '2025-12-03', commitsPropios: 420, reposActivos: 60, medianaMensaje: 14, medianaMensajeSinTrailer: 14, coautores: [{ tipo: 'persona', n: 3 }, { tipo: 'modelo', n: 0 }] },
    { cuenta: 'serandmoncas', desde: '2026-02-25', hasta: '2026-10-15', commitsPropios: 1443, reposActivos: 32, medianaMensaje: 139, medianaMensajeSinTrailer: 88, coautores: [{ tipo: 'persona', n: 0 }, { tipo: 'modelo', n: 6 }] },
  ],
  modelosPorMes: [
    { mes: '2026-08', modelo: 'Claude Opus 5', commits: 6 },
    { mes: '2026-10', modelo: 'Claude Opus 5.5', commits: 19 },
  ],
  grafoCoautoria: [
    {
      era: 'smonsalve',
      nodos: [
        { id: 'sergio', tipo: 'sergio', etiqueta: 'Sergio', peso: 10, x: 0.32, y: 0.333 },
        { id: 'persona-1', tipo: 'persona', etiqueta: 'Persona 1', peso: 3, x: 0.32, y: 0.667 },
        { id: 'dominio:producto-web', tipo: 'dominio', etiqueta: 'producto-web', peso: 13, x: 0.72, y: 0.5 },
      ],
      aristas: [
        { de: 'sergio', a: 'dominio:producto-web', peso: 10 },
        { de: 'persona-1', a: 'dominio:producto-web', peso: 3 },
      ],
    },
    {
      era: 'serandmoncas',
      nodos: [
        { id: 'sergio', tipo: 'sergio', etiqueta: 'Sergio', peso: 20, x: 0.32, y: 0.333 },
        { id: 'modelo:Claude Opus 5.5', tipo: 'modelo', etiqueta: 'Claude Opus 5.5', peso: 19, x: 0.32, y: 0.667 },
        { id: 'dominio:agentes', tipo: 'dominio', etiqueta: 'agentes', peso: 39, x: 0.72, y: 0.5 },
      ],
      aristas: [
        { de: 'sergio', a: 'dominio:agentes', peso: 20 },
        { de: 'modelo:Claude Opus 5.5', a: 'dominio:agentes', peso: 19 },
      ],
    },
  ],
  grafoDiscurso: {
    nodos: [
      { id: 'vibe-coding', etiqueta: 'vibe coding', etiquetaEn: 'vibe coding', resaltado: true, x: 0.82, y: 0.5 },
      { id: 'agentic-engineering', etiqueta: 'ingeniería agéntica', etiquetaEn: 'agentic engineering', resaltado: false, x: 0.18, y: 0.5 },
    ],
    aristas: [{ de: 'vibe-coding', a: 'agentic-engineering', motivo: 'mismo acto, distinto grado de revisión' }],
  },
  contexto: [
    { cifra: '~4%', mide: 'Commits públicos diarios en GitHub con firma de Claude Code', fuente: 'SemiAnalysis vía Xataka', fecha: '2026-02-06', url: 'https://www.xataka.com/robotica-e-ia/claude-code-esta-siendo-gran-favorito-programadores-que-firma-4-todo-que-se-sube-a-github' },
  ],
  camino: {
    nodos: [
      { id: 'logica', etiqueta: 'Lógica y algoritmos', etiquetaEn: 'Logic and algorithms', rama: 'fundamentos', evidencia: 'inferido' },
      { id: 'python', etiqueta: 'Python', etiquetaEn: 'Python', rama: 'backend', evidencia: 'github', repos: ['POCVT'], primeraEvidencia: '2014-10' },
      { id: 'fastapi', etiqueta: 'FastAPI', etiquetaEn: 'FastAPI', rama: 'backend', evidencia: 'github', repos: ['brayan'], primeraEvidencia: '2025-11', hoy: true },
    ],
    aristas: [{ de: 'logica', a: 'python' }, { de: 'python', a: 'fastapi' }],
  },
}
