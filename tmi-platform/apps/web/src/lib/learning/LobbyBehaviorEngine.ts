import { platformLearningCore } from './PlatformLearningCore';

export interface LobbyBehaviorSignal {
  lobbyId: string;
  joins: number;
  exits: number;
  avgDurationMs: number;
  retentionScore: number;
}

export class LobbyBehaviorEngine {
  getLobbySignals(limit = 20): LobbyBehaviorSignal[] {
    const events = platformLearningCore.listEvents(30000);
    const map = new Map<string, { joins: number; exits: number; totalDurationMs: number; durationCount: number }>();

    for (const event of events) {
      const lobbyId = event.context?.lobbyId?.toString() || event.targetId || event.route || 'unknown-lobby';
      const row = map.get(lobbyId) || { joins: 0, exits: 0, totalDurationMs: 0, durationCount: 0 };

      if (event.type === 'join' || event.type === 'lobby_move') row.joins += 1;
      if (event.type === 'leave' || event.type === 'exit' || event.type === 'dropoff') row.exits += 1;
      if (event.type === 'watch' && event.durationMs) {
        row.totalDurationMs += event.durationMs;
        row.durationCount += 1;
      }
      map.set(lobbyId, row);
    }

    return [...map.entries()]
      .map(([lobbyId, row]) => {
        const avgDuration = row.durationCount > 0 ? Math.round(row.totalDurationMs / row.durationCount) : 0;
        const retentionScore = Number(((row.joins / Math.max(row.exits, 1)) * 100).toFixed(2));
        return { lobbyId, joins: row.joins, exits: row.exits, avgDurationMs: avgDuration, retentionScore };
      })
      .sort((a, b) => b.retentionScore - a.retentionScore)
      .slice(0, limit);
  }
}

export const lobbyBehaviorEngine = new LobbyBehaviorEngine();
