import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EJEMPLO } from '@/lib/ia-autorretrato/ejemplo'
import CalendarioActividad, { nivel, ubicarEnSemanas, PASO } from '../CalendarioActividad'
import BarrasHerramientas, { nombreCorto } from '../BarrasHerramientas'
import CoautoriaMensual, { completarMeses } from '../CoautoriaMensual'

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key, useLocale: () => 'es' }))

describe('CalendarioActividad', () => {
  it('rellena los días sin actividad y ubica por semana (lunes = fila 0)', () => {
    const celdas = ubicarEnSemanas(EJEMPLO.actividadDiaria)
    expect(celdas).toHaveLength(10) // 5 al 14 de octubre
    expect(celdas[0]).toMatchObject({ fecha: '2026-10-05', fila: 0, col: 0 }) // lunes
    expect(celdas[1].prompts).toBe(0)
  })
  it('nivel 0–4 sin dividir por cero', () => {
    expect(nivel(0, 0)).toBe(0)
    expect(nivel(10, 10)).toBe(4)
    expect(nivel(1, 10)).toBe(1)
  })
  it('es accesible y trae la tabla de datos', () => {
    render(<CalendarioActividad datos={EJEMPLO} />)
    expect(screen.getByRole('img', { name: 'resumen' })).toBeInTheDocument()
    expect(screen.getByText('2026-10-07')).toBeInTheDocument()
  })
  it('un rango corto no infla el viewBox: ancho >= 26 semanas', () => {
    const { container } = render(<CalendarioActividad datos={EJEMPLO} />)
    const ancho = Number(container.querySelector('svg')!.getAttribute('viewBox')!.split(' ')[2])
    expect(ancho).toBeGreaterThanOrEqual(26 * PASO)
  })
  it('la tabla incluye los commits por mes, incluso sin días de actividad', () => {
    const datos = { ...EJEMPLO, commitsPorMes: [...EJEMPLO.commitsPorMes, { mes: '2025-01', total: 77, coautoriaClaude: 0, porTipo: {} }] }
    render(<CalendarioActividad datos={datos} />)
    const fila = screen.getByText('2026-10', { selector: 'td' }).closest('tr')!
    expect(fila).toHaveTextContent('20')
    expect(screen.getByText('2025-01', { selector: 'td' }).closest('tr')).toHaveTextContent('77')
  })
  it('con datos vacíos no dibuja NaN ni Infinity', () => {
    const { container } = render(<CalendarioActividad datos={{ ...EJEMPLO, actividadDiaria: [], commitsPorMes: [] }} />)
    expect(container.innerHTML).not.toMatch(/NaN|Infinity/)
  })
})

describe('BarrasHerramientas', () => {
  it('una barra por herramienta', () => {
    const { container } = render(<BarrasHerramientas datos={EJEMPLO} />)
    expect(container.querySelectorAll('[data-herramienta]')).toHaveLength(2)
    expect(container.innerHTML).not.toMatch(/NaN|Infinity/)
  })
})

describe('nombreCorto de herramientas MCP', () => {
  it('acorta los MCP conocidos y el resto', () => {
    expect(nombreCorto('mcp:plugin_playwright_playwright')).toBe('Playwright')
    expect(nombreCorto('mcp:claude-in-chrome')).toBe('Chrome')
    expect(nombreCorto('mcp:claude_ai_Vercel')).toBe('Vercel')
    expect(nombreCorto('mcp:plugin_vercel_vercel')).toBe('Vercel')
    expect(nombreCorto('mcp:railway')).toBe('Railway')
    expect(nombreCorto('mcp:plugin_slack_x')).toBe('slack_x')
    expect(nombreCorto('mcp:otro')).toBe('otro')
    expect(nombreCorto('Bash')).toBe('Bash')
  })
  it('muestra el nombre corto pero conserva el completo en <title> y tabla', () => {
    const datos = { ...EJEMPLO, herramientas: [{ nombre: 'mcp:plugin_playwright_playwright', usos: 9, grupo: 'mcp' as const }] }
    const { container } = render(<BarrasHerramientas datos={datos} />)
    expect(container.querySelector('svg text')!.textContent).toBe('Playwright')
    expect(container.querySelector('title')!.textContent).toContain('mcp:plugin_playwright_playwright')
    expect(screen.getByText('mcp:plugin_playwright_playwright', { selector: 'td' })).toBeInTheDocument()
  })
})

describe('BarrasHerramientas: nombres largos', () => {
  it('trunca la etiqueta pero conserva el nombre completo en la tabla', () => {
    const largo = 'mcp__plugin_playwright_playwright__browser_click'
    const datos = { ...EJEMPLO, herramientas: [{ nombre: largo, usos: 9, grupo: 'mcp' as const }] }
    const { container } = render(<BarrasHerramientas datos={datos} />)
    const etiqueta = container.querySelector('svg text')!.textContent!
    expect(etiqueta.endsWith('…')).toBe(true)
    expect(etiqueta.length).toBeLessThanOrEqual(16)
    expect(screen.getByText(largo, { selector: 'td' })).toBeInTheDocument()
  })
})

describe('CoautoriaMensual', () => {
  it('la leyenda queda fuera del role=img', () => {
    render(<CoautoriaMensual datos={EJEMPLO} />)
    const leyenda = screen.getByText(/soloHumano/)
    expect(leyenda.closest('[role="img"]')).toBeNull()
  })
  it('una columna por mes y el modelo principal', () => {
    const { container } = render(<CoautoriaMensual datos={EJEMPLO} />)
    expect(container.querySelectorAll('[data-mes]')).toHaveLength(3) // agosto, septiembre (relleno) y octubre
    expect(screen.getAllByText('Claude Opus 5.5').length).toBeGreaterThan(0)
  })
  it('un mes con total 0 no rompe', () => {
    const { container } = render(<CoautoriaMensual datos={{ ...EJEMPLO, commitsPorMes: [{ mes: '2026-09', total: 0, coautoriaClaude: 0, porTipo: {} }] }} />)
    expect(container.innerHTML).not.toMatch(/NaN|Infinity/)
  })
})

describe('completarMeses', () => {
  const m = (mes: string, total: number) => ({ mes, total, coautoriaClaude: 0, porTipo: {} })
  it('rellena los meses vacíos, también al cruzar de año', () => {
    expect(completarMeses([m('2025-11', 3), m('2026-02', 5)]).map(x => [x.mes, x.total])).toEqual([['2025-11', 3], ['2025-12', 0], ['2026-01', 0], ['2026-02', 5]])
  })
  it('deja igual listas de 0 o 1 mes', () => {
    expect(completarMeses([])).toEqual([])
    expect(completarMeses([m('2026-03', 1)])).toHaveLength(1)
  })
})
