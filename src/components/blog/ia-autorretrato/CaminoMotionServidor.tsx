import { DATOS } from '@/lib/ia-autorretrato/datos'
import CaminoMotion from './CaminoMotion'

/** Componente de servidor para el MDX (`<CaminoMotion />`): al cliente solo viaja `camino`, no todo el JSON. */
export default function CaminoMotionServidor() {
  return <CaminoMotion camino={DATOS.camino} />
}
