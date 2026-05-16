import { platformLearningCore } from './PlatformLearningCore';

export interface BotGrowthSignal {
  promptId: string;
  attempts: number;
  successes: number;
  failures: number;
  successRate: number;
  recommendation: string;
}

export class BotIntelligenceGrowthEngine {
  getPromptEffectiveness(limit = 30): BotGrowthSignal[] {
    const events = platformLearningCore.listEvents(30000);
    const map = new Map<string, BotGrowthSignal>();

    for (const event of events) {
      if (event.context?.botEvent !== true) continue;

      const promptId = event.context?.promptId?.toString() || event.targetId || 'unknown-prompt';
      const row =
        map.get(promptId) ||
        ({ promptId, attempts: 0, successes: 0, failures: 0, successRate: 0, recommendation: 'tune prompt' } as BotGrowthSignal);

      row.attempts += 1;
      if (event.context?.outcome === 'success') row.successes += 1;
      if (event.context?.outcome === 'failure') row.failures += 1;
      row.successRate = Number(((row.successes / Math.max(row.attempts, 1)) * 100).toFixed(2));

      if (row.successRate >= 75) row.recommendation = 'promote prompt';
      else if (row.successRate >= 45) row.recommendation = 'iterate prompt';
      else row.recommendation = 'retire prompt';

      map.set(promptId, row);
    }

    return [...map.values()].sort((a, b) => b.successRate - a.successRate).slice(0, limit);
  }
}

export const botIntelligenceGrowthEngine = new BotIntelligenceGrowthEngine();
