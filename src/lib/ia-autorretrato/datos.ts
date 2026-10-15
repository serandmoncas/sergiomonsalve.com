import datos from '../../../data/ia-autorretrato.json'
import type { AutorretratoIA } from './tipos'

/** El único dato publicado del post: lo genera `npx tsx scripts/ia-autorretrato/index.ts`. */
export const DATOS = datos as unknown as AutorretratoIA
