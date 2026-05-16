import { LobbyState } from './LobbyStateEngine';
import { emitSystemEvent } from '@/lib/events/systemEventBus';

export type PropAction = 'wave' | 'toss' | 'equip' | 'emote';

export class LobbyPropInteractionEngine {
  static canUseProps(state: LobbyState): boolean {
    // Full props allowed in free roam, pre-show, and post-show
    return state === 'FREE_ROAM' || state === 'PRE_SHOW' || state === 'POST_SHOW';
  }

  static canUseEmotesOnly(state: LobbyState): boolean {
    // Only lightweight emotes allowed during seating lock and live show
    return state === 'SEATING' || state === 'LIVE_SHOW' || state === 'QUEUE_OPEN';
  }

  static triggerAction(action: PropAction, propId: string, state: LobbyState): boolean {
    if (!this.canUseProps(state) && !this.canUseEmotesOnly(state)) return false;

    emitSystemEvent({
      type: 'lobby.prop.used',
      actor: 'user',
      message: `Lobby prop used: ${action} (${propId}) in ${state}`,
    });
    return true;
  }
}