import { randomUUID } from 'crypto';

export interface ReplayEvent {
  atMs: number;
  type: 'start' | 'performance' | 'vote' | 'winner' | 'end';
  payload: Record<string, unknown>;
}

export interface BattleReplay {
  id: string;
  battleId: string;
  events: ReplayEvent[];
  createdAt: string;
}

const REPLAYS = new Map<string, BattleReplay>();

export class BattleReplayEngine {
  static createReplay(battleId: string): BattleReplay {
    const replay: BattleReplay = {
      id: randomUUID(),
      battleId,
      events: [],
      createdAt: new Date().toISOString(),
    };
    REPLAYS.set(battleId, replay);
    return replay;
  }

  static pushEvent(battleId: string, event: ReplayEvent): BattleReplay | null {
    const replay = REPLAYS.get(battleId) || this.createReplay(battleId);
    replay.events.push(event);
    return replay;
  }

  static getReplay(battleId: string): BattleReplay | null {
    return REPLAYS.get(battleId) || null;
  }

  static listReplays(limit: number = 100): BattleReplay[] {
    return Array.from(REPLAYS.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }
}

export default BattleReplayEngine;
