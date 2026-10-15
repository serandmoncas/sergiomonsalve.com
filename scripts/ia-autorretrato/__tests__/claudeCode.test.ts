import { describe, it, expect } from 'vitest'
import { actividadDiaria, grupoDe, leerHistorial, leerSesiones, nombreHerramienta, perfilPrompts, seleccionarCitas } from '../claudeCode'

const linea = (display: string, iso: string, project = '/Users/x/Code/HER', sessionId = 's1') =>
  JSON.stringify({ display, pastedContents: {}, timestamp: Date.parse(iso), project, sessionId })

describe('historial', () => {
  it('lee prompts, ignora líneas corruptas y vacías, fecha en Bogotá', () => {
    const texto = [
      linea('hola, ¿qué es RAG?', '2026-10-15T03:00:00Z'),
      '{"display": "cortad',
      linea('   ', '2026-10-15T12:00:00Z'),
      linea('arma el pipeline', '2026-10-15T12:00:00Z', '/Users/x/Code/sergiomonsalve.com', 's2'),
    ].join('\n')
    const ps = leerHistorial(texto)
    expect(ps).toHaveLength(2)
    expect(ps[0]).toMatchObject({ fecha: '2026-10-14', proyecto: 'HER', sesion: 's1' })
    expect(ps[1].proyecto).toBe('sergiomonsalve.com')
  })
  it('actividad diaria cuenta prompts y sesiones distintas', () => {
    const ps = leerHistorial([
      linea('a', '2026-10-15T12:00:00Z', '/p/A', 's1'),
      linea('b', '2026-10-15T13:00:00Z', '/p/A', 's1'),
      linea('c', '2026-10-15T14:00:00Z', '/p/A', 's2'),
      linea('d', '2026-10-16T14:00:00Z', '/p/A', 's3'),
    ].join('\n'))
    expect(actividadDiaria(ps)).toEqual([
      { fecha: '2026-10-15', prompts: 3, sesiones: 2 },
      { fecha: '2026-10-16', prompts: 1, sesiones: 1 },
    ])
  })
})

describe('sesiones', () => {
  it('cuenta herramientas y modelos; ignora <synthetic> y líneas rotas', () => {
    const a = (model: string, tools: string[]) => JSON.stringify({ type: 'assistant', message: { model, content: tools.map(name => ({ type: 'tool_use', name })) } })
    const texto = [a('claude-opus-5-5', ['Bash', 'Bash', 'mcp__claude-in-chrome__navigate']), a('<synthetic>', ['Bash']), 'xx{', a('claude-opus-5', ['Read'])].join('\n')
    const r = leerSesiones([texto])
    expect(r.modelos).toEqual([{ modelo: 'claude-opus-5', respuestas: 1 }, { modelo: 'claude-opus-5-5', respuestas: 1 }])
    expect(r.herramientas).toEqual([
      { nombre: 'Bash', usos: 2, grupo: 'ejecucion' },
      { nombre: 'mcp:claude-in-chrome', usos: 1, grupo: 'navegador' }, // empate: orden alfabético (localeCompare)
      { nombre: 'Read', usos: 1, grupo: 'edicion' },
    ])
  })
  it('agrupa herramientas', () => {
    expect(nombreHerramienta('mcp__plugin_playwright_playwright__browser_click')).toBe('mcp:plugin_playwright_playwright')
    expect(grupoDe('mcp:plugin_playwright_playwright')).toBe('navegador')
    expect(grupoDe('mcp:railway')).toBe('mcp')
    expect(grupoDe('WebFetch')).toBe('investigacion')
    expect(grupoDe('Agent')).toBe('orquestacion')
  })
})

describe('perfil y citas', () => {
  const ps = leerHistorial([
    linea('¿qué es un embedding?', '2026-10-15T12:00:00Z'),
    linea('arma el pipeline de datos con los commits y escribe la spec', '2026-10-15T12:00:00Z'),
    linea('/clear', '2026-10-15T12:00:00Z'),
    linea('please fix the tests and the build', '2026-10-15T12:00:00Z'),
  ].join('\n'))
  it('perfil excluye comandos y calcula porcentajes enteros', () => {
    const p = perfilPrompts(ps)
    expect(p.total).toBe(3)
    expect(p.pctPreguntas).toBe(33)
    expect(p.pctEspanol).toBe(67)
  })
  it('citas: solo prompts de largo medio, sin URLs ni comandos', () => {
    const largo = 'quiero que el análisis muestre cómo cambió mi forma de escribir commits desde que trabajo con agentes'
    const cs = seleccionarCitas(leerHistorial([linea(largo, '2026-10-15T12:00:00Z'), linea('mira https://x.y ' + largo, '2026-10-15T12:00:00Z'), linea('corto', '2026-10-15T12:00:00Z')].join('\n')))
    expect(cs.map(c => c.texto)).toEqual([largo])
  })
})

describe('revisión: preguntas con acento y líneas no objeto', () => {
  it('cuenta preguntas en español sin signo de interrogación (límite Unicode)', () => {
    const ps = leerHistorial([
      linea('cómo hago el deploy', '2026-10-15T12:00:00Z'),
      linea('qué es un embedding', '2026-10-15T12:00:00Z'),
      linea('cuál usar', '2026-10-15T12:00:00Z'),
      linea('comohago algo', '2026-10-15T12:00:00Z'),
    ].join('\n'))
    expect(perfilPrompts(ps).pctPreguntas).toBe(75) // 3 de 4: "comohago" no cuenta
  })
  it('ignora líneas JSON que no son objetos (null, número, texto, arreglo)', () => {
    const ps = leerHistorial(['null', '42', '"txt"', '[1]', linea('ok', '2026-10-15T12:00:00Z')].join('\n'))
    expect(ps.map(p => p.texto)).toEqual(['ok'])
  })
  it('ignora timestamps que no son números finitos', () => {
    const texto = '{"display":"x","timestamp":"2026-10-15","project":"/p/A","sessionId":"s1"}'
    expect(leerHistorial(texto)).toEqual([])
  })
  it('sesiones: ignora líneas JSON que no son objetos sin lanzar', () => {
    const sesion = JSON.stringify({ type: 'assistant', message: { model: 'claude-opus-5', content: [{ type: 'tool_use', name: 'Bash' }] } })
    const r = leerSesiones(['null\n42\n"txt"\n[1]\n' + sesion])
    expect(r.modelos).toEqual([{ modelo: 'claude-opus-5', respuestas: 1 }])
    expect(r.herramientas).toEqual([{ nombre: 'Bash', usos: 1, grupo: 'ejecucion' }])
  })
})
