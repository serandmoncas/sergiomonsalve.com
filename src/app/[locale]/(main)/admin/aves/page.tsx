import fs from 'fs'
import path from 'path'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getEspecies } from '@/lib/aves/catalogo'
import { leerRegistro } from '@/lib/aves/ilustraciones'
import type { RasgosEspecie } from '@/lib/aves/prompts'
import type { EstadoIlustracion, Ilustracion } from '@/lib/aves/tipos'
import { aprobar, rechazarConFormulario } from './acciones'

// Revisión de ilustraciones por Sergio. Solo existe en desarrollo: escribe content/aves/ilustraciones.json.
const ORDEN: EstadoIlustracion[] = ['marcada', 'revisada-auto', 'generada']

function leerRasgos(familia: string): Record<string, RasgosEspecie> {
  const archivo = path.join(process.cwd(), 'content/aves/prompts', `${familia.toLowerCase()}.json`)
  return fs.existsSync(archivo) ? JSON.parse(fs.readFileSync(archivo, 'utf-8')) : {}
}

export default function RevisionAvesPage() {
  if (process.env.NODE_ENV !== 'development') notFound()

  const porKey = new Map(getEspecies().map(e => [String(e.speciesKey), e]))
  const pendientes = Object.entries(leerRegistro())
    .flatMap(([key, lista]) => lista.map(i => ({ especie: porKey.get(key)!, i })))
    .filter(({ especie, i }) => especie && ORDEN.includes(i.estado))
    .sort((a, b) => ORDEN.indexOf(a.i.estado) - ORDEN.indexOf(b.i.estado) || a.especie.puestoColombia - b.especie.puestoColombia)

  return (
    <div>
      <h1 className="text-2xl font-bold text-text mb-2">Revisión de ilustraciones</h1>
      <p className="text-sm text-text-secondary mb-8">
        {pendientes.length} por revisar. Primero las marcadas por la revisión automática.
      </p>
      <div className="space-y-8">
        {pendientes.map(({ especie, i }) => (
          <Tarjeta key={i.archivo} i={i} nombre={especie.nombreEs} cientifico={especie.cientifico} rasgos={leerRasgos(especie.familia)[especie.speciesKey]?.[i.variante] ?? ''} />
        ))}
      </div>
    </div>
  )
}

function Tarjeta({ i, nombre, cientifico, rasgos }: { i: Ilustracion; nombre: string; cientifico: string; rasgos: string }) {
  return (
    <article className="border border-border rounded-sm p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Image
          src={`/aves/${i.archivo}-1024.webp`}
          alt={`${nombre} — ${i.variante}`}
          width={1024}
          height={768}
          unoptimized
          className="w-full h-auto bg-white border border-border"
        />
        <div className="text-sm space-y-3">
          <p className="font-semibold text-text">
            {nombre} <span className="italic font-normal text-text-secondary">{cientifico}</span>
          </p>
          <p className="font-mono text-xs text-text-muted">{i.variante} · {i.estado}</p>
          {i.nota && <p className="text-red-600">{i.nota}</p>}
          <p className="text-text-secondary">{rasgos}</p>
          <ol className="list-decimal pl-5 text-xs">
            {i.referencias.map(r => (
              <li key={r.url}>
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">referencia</a>
              </li>
            ))}
          </ol>
          <form action={aprobar.bind(null, i.archivo)}>
            <button type="submit" className="bg-accent text-background font-mono text-xs px-4 py-2 rounded-sm">Aprobar</button>
          </form>
          <form action={rechazarConFormulario.bind(null, i.archivo)} className="flex gap-2">
            <input name="nota" required placeholder="Qué está mal" className="flex-1 bg-surface border border-border rounded-sm px-3 py-2 text-xs" />
            <button type="submit" className="border border-border font-mono text-xs px-4 py-2 rounded-sm">Rechazar</button>
          </form>
        </div>
      </div>
    </article>
  )
}
