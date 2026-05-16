/**
 * BotPerformanceScoringEngine
 * Tracks the tangible effectiveness of a bot's actions in the ecosystem.
 */
export interface BotPerformanceScore {
  botId: string;
  engagementDriven: number;
  retentionImpact: number;
  tasksCompleted: number;
  totalScore: number;
  lastCalculated: number;
}

export class BotPerformanceScoringEngine {
  private scores = new Map<string, BotPerformanceScore>();

  recordTaskSuccess(botId: string): void {
    const score = this.getScore(botId);
    score.tasksCompleted += 1;
    score.totalScore += 5;
    this.scores.set(botId, score);
  }

  recordEngagement(botId: string, impactValue: number): void {
    const score = this.getScore(botId);
    score.engagementDriven += impactValue;
    score.totalScore += (impactValue * 2);
    this.scores.set(botId, score);
  }

  getScore(botId: string): BotPerformanceScore {
    return this.scores.get(botId) || {
      botId, engagementDriven: 0, retentionImpact: 0, tasksCompleted: 0, totalScore: 0, lastCalculated: Date.now()
    };
  }
}

export const botPerformanceScoringEngine = new BotPerformanceScoringEngine();