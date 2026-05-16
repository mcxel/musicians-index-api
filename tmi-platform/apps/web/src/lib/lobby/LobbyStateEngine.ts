export type LobbyState = 
  | 'FREE_ROAM'
  | 'PRE_SHOW'
  | 'QUEUE_OPEN'
  | 'SEATING'
  | 'LATE_ENTRY'
  | 'NEXT_SHOW_RESERVED'
  | 'STANDBY_QUEUE'
  | 'FORFEIT_WINDOW'
  | 'PRE_RESET'
  | 'LIVE_SHOW'
  | 'POST_SHOW'
  | 'POST_RESET'
  | 'RESET';

export type LobbyRuntimeState = LobbyState;

class LobbyStateEngine {
  private currentState: LobbyState = 'FREE_ROAM';
  private listeners: Set<(state: LobbyState) => void> = new Set();
  private readonly allowedTransitions: Record<LobbyState, LobbyState[]> = {
    FREE_ROAM: ['PRE_SHOW', 'QUEUE_OPEN', 'LATE_ENTRY'],
    PRE_SHOW: ['QUEUE_OPEN', 'SEATING', 'LATE_ENTRY'],
    QUEUE_OPEN: ['SEATING', 'STANDBY_QUEUE', 'LATE_ENTRY'],
    SEATING: ['LIVE_SHOW', 'NEXT_SHOW_RESERVED', 'STANDBY_QUEUE', 'LATE_ENTRY'],
    LATE_ENTRY: ['SEATING', 'STANDBY_QUEUE', 'LIVE_SHOW'],
    NEXT_SHOW_RESERVED: ['SEATING', 'STANDBY_QUEUE', 'LIVE_SHOW'],
    STANDBY_QUEUE: ['SEATING', 'LIVE_SHOW', 'NEXT_SHOW_RESERVED'],
    FORFEIT_WINDOW: ['LIVE_SHOW', 'PRE_RESET', 'POST_SHOW'],
    LIVE_SHOW: ['FORFEIT_WINDOW', 'PRE_RESET', 'POST_SHOW'],
    PRE_RESET: ['POST_RESET', 'RESET'],
    POST_SHOW: ['PRE_RESET', 'POST_RESET', 'RESET'],
    POST_RESET: ['FREE_ROAM', 'PRE_SHOW', 'RESET'],
    RESET: ['FREE_ROAM'],
  };

  getState(): LobbyState {
    return this.currentState;
  }

  setState(newState: LobbyState) {
    if (!this.canTransition(newState)) {
      return;
    }
    this.currentState = newState;
    this.notify();
  }

  canTransition(nextState: LobbyState): boolean {
    if (nextState === this.currentState) return true;
    const allowed = this.allowedTransitions[this.currentState] ?? [];
    return allowed.includes(nextState);
  }

  subscribe(listener: (state: LobbyState) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(listener => listener(this.currentState));
  }
}

export const lobbyStateEngine = new LobbyStateEngine();