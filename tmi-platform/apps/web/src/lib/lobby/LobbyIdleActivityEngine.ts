import { LobbyState } from './LobbyStateEngine';

export type IdleActivity = 'dance' | 'sit' | 'chat' | 'wave' | 'clap' | 'bob' | 'pose' | 'none';

export class LobbyIdleActivityEngine {
  static getIdleActivity(state: LobbyState, waitTimeMs: number): IdleActivity {
    if (state === 'LIVE_SHOW') return 'bob'; // Subtle head bobbing to music
    if (state === 'SEATING') return 'sit'; // Lock to seat
    if (state === 'QUEUE_OPEN') return 'wave'; // Cheering for queued artists
    
    // Free roam idle behaviors based on wait time
    if (waitTimeMs > 15000 && state === 'FREE_ROAM') return 'dance';
    return 'chat'; // Default social idle
  }
}