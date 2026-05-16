import { LobbyState } from './LobbyStateEngine';
import { emitSystemEvent } from '@/lib/events/systemEventBus';

export class LobbyEnvironmentInteractionEngine {
  static canInteract(state: LobbyState): boolean {
    return state === 'FREE_ROAM' || state === 'PRE_SHOW' || state === 'POST_SHOW';
  }

  static interactWith(toy: 'disco_ball' | 'dance_floor' | 'jukebox' | 'confetti' | 'camera', state: LobbyState): boolean {
    if (!this.canInteract(state)) return false;
    emitSystemEvent({ type: 'lobby.env.interaction', actor: 'user', message: `Lobby env interaction: ${toy} (${state})` });
    return true;
  }
}