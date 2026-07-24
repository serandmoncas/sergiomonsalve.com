const CAPAS = [
  { i: 'Un turno', b: 'Prompt engineering', p: 'Un turno.' },
  { i: 'Una sesión', b: 'Context engineering', p: 'Una sesión.' },
  {
    i: 'Trabajo continuo',
    b: 'Harness engineering',
    p: 'Horas y cientos de decisiones, con herramientas, validación y restricciones arquitectónicas.',
  },
] as const

export default function CapasHarness() {
  return (
    <div className="capas">
      {CAPAS.map(capa => (
        <div className="capa" key={capa.b}>
          <i>{capa.i}</i>
          <b>{capa.b}</b>
          <p>{capa.p}</p>
        </div>
      ))}
    </div>
  )
}
