import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import BarrasHerramientas from './blog/ia-autorretrato/BarrasHerramientas'
import CalendarioActividad from './blog/ia-autorretrato/CalendarioActividad'
import CaminoMotion from './blog/ia-autorretrato/CaminoMotionServidor'
import CoautoriaMensual from './blog/ia-autorretrato/CoautoriaMensual'
import CuadranteConceptos from './blog/ia-autorretrato/CuadranteConceptos'
import MapaDiscurso from './blog/ia-autorretrato/MapaDiscurso'
import MatrizEcosistema from './blog/ia-autorretrato/MatrizEcosistema'
import PerfilPrompts from './blog/ia-autorretrato/PerfilPrompts'
import RedCoautoria from './blog/ia-autorretrato/RedCoautoria'

function Step({ number, children }: { number?: number; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 mb-4 not-italic">
      {number != null && (
        <span className="font-mono text-xs text-accent shrink-0 pt-1">{number}.</span>
      )}
      <div>{children}</div>
    </div>
  )
}

// h1 is already rendered by the lesson page — suppress duplicates from MDX source
export const components = {
  Step,
  h1: () => null,
  // Autorretrato con IA
  CalendarioActividad,
  BarrasHerramientas,
  CoautoriaMensual,
  MatrizEcosistema,
  CuadranteConceptos,
  PerfilPrompts,
  RedCoautoria,
  MapaDiscurso,
  CaminoMotion,
}

export default function MDXContent({ source }: { source: string }) {
  return (
    <div className="mdx-prose">
      <MDXRemote
        source={source}
        components={components}
        options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
      />
    </div>
  )
}
