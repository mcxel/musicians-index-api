import { LobbyState } from './LobbyStateEngine';

export interface VideoPresence {
  userId: string;
  isSpeaking: boolean;
  isMuted: boolean;
  isPinned: boolean;
}

export class LobbyVideoPresenceEngine {
  static getVisibility(state: LobbyState): 'hidden' | 'minimized' | 'visible' {
    // Minimize distraction during actual shows
    if (state === 'LIVE_SHOW') return 'minimized';
    if (state === 'SEATING') return 'hidden';
    return 'visible';
  }
}