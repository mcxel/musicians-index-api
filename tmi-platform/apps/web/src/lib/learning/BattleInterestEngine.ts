import { platformLearningCore } from './PlatformLearningCore';

export interface BattleInterestSignal {
  battleId: string;
  joins: number;
  votes: number;
  tips: number;
  watchMs: number;
  hypeScore: number;
}

export class BattleInterestEngine {
  getBattleSignals(limit = 20): BattleInterestSignal[] {
    const events = platformLearningCore.listEvents(20000);
    const map = new Map<string, BattleInterestSignal>();

    for (const event of events) {
      const battleId = event.context?.battleId?.toString() || event.targetId || event.route || 'unknown-battle';
      const row =
        map.get(battleId) ||
        ({ battleId, joins: 0, votes: 0, tips: 0, watchMs: 0, hypeScore: 0 } as BattleInterestSignal);

      if (event.type === 'battle_join') row.joins += 1;
      if (event.type === 'vote') row.votes += 1;
      if (event.type === 'tip') row.tips += 1;
      if (event.type === 'watch') row.watchMs += event.durationMs ?? 0;

      row.hypeScore = Number((row.joins * 1.5 + row.votes * 1.3 + row.tips * 2 + row.watchMs / 15000).toFixed(2));
      map.set(battleId, row);
    }

    return [...map.values()].sort((a, b) => b.hypeScore - a.hypeScore).slice(0, limit);
  }
}

export const battleInterestEngine = new BattleInterestEngine();
