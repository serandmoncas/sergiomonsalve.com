import type { ReactNode } from 'react'

type Tabla = { columnas: string[]; filas: (string | number)[][] }

/** Marco común: título, gráfico accesible, resumen con la cifra clave y tabla de datos. */
function TablaDatos({ tabla }: { tabla: Tabla }) {
  return (
    <table className="mt-2 w-full text-left text-xs">
      <thead>
        <tr>{tabla.columnas.map((c, i) => <th key={i} scope="col" className="py-1 pr-3 font-mono font-normal text-text-secondary">{c}</th>)}</tr>
      </thead>
      <tbody>
        {tabla.filas.map((f, i) => (
          <tr key={i} className="border-t border-border">{f.map((v, j) => <td key={j} className="py-1 pr-3">{v}</td>)}</tr>
        ))}
      </tbody>
    </table>
  )
}

export default function Figura({ id, titulo, resumen, etiquetaDatos, tabla, tablaExtra, pie, imgEnSvg, children }: {
  imgEnSvg?: boolean; id: string; titulo: string; resumen: string; etiquetaDatos: string; tabla: Tabla; tablaExtra?: Tabla; pie?: ReactNode; children: ReactNode
}) {
  return (
    <figure id={id} className="not-italic my-10">
      <figcaption className="font-mono text-xs text-accent mb-3">{titulo}</figcaption>
      {/* imgEnSvg: el hijo contiene controles enfocables (zona desplazable), así que role=img va en su <svg>. */}
      {imgEnSvg ? <div>{children}</div> : <div role="img" aria-label={resumen}>{children}</div>}
      {pie}
      <p className="text-sm text-text-secondary mt-3">{resumen}</p>
      <details className="mt-2 text-sm">
        <summary className="cursor-pointer font-mono text-xs text-text-secondary">{etiquetaDatos}</summary>
        <div className="overflow-x-auto max-h-80">
          <TablaDatos tabla={tabla} />
          {tablaExtra && <TablaDatos tabla={tablaExtra} />}
        </div>
      </details>
    </figure>
  )
}
