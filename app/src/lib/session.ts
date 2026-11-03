/**
 * Estado del flujo actual (sugerencia → cámara → versiones → frases → compartir).
 * Se guarda en memoria: no hace falta persistirlo.
 */
import type { Suggestion } from './suggestions';

export type Mode = 'solo-foto' | 'foto-texto';

export interface Photo {
  uri: string;
  width: number;
  height: number;
}

interface FlowState {
  mode: Mode;
  suggestion?: Suggestion;
  photo?: Photo;
}

export const flow: FlowState = { mode: 'solo-foto' };

export function startFlow(mode: Mode, suggestion?: Suggestion) {
  flow.mode = mode;
  flow.suggestion = suggestion;
  flow.photo = undefined;
}
