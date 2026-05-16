/**
 * BotEvolutionEngine
 * Improves bot success rates over time by tweaking their mutation factors based on their historical performance scores.
 */
export interface EvolutionMetrics {
  botId: string;
  generation: number;
  successRate: number;
  mutationFactor: number;
}

export class BotEvolutionEngine {
  private metrics = new Map<string, EvolutionMetrics>();

  evolve(botId: string, performanceScore: number): EvolutionMetrics {
    const current = this.metrics.get(botId) || { botId, generation: 1, successRate: 0, mutationFactor: 0.1 };
    
    const newGeneration = current.generation + 1;
    const newMutation = performanceScore < 50 ? current.mutationFactor + 0.05 : current.mutationFactor * 0.9;
    
    const evolved: EvolutionMetrics = {
      botId,
      generation: newGeneration,
      successRate: performanceScore,
      mutationFactor: Math.min(Math.max(newMutation, 0.01), 0.5), // Bounds 1% to 50%
    };
    
    this.metrics.set(botId, evolved);
    return evolved;
  }
}

export const botEvolutionEngine = new BotEvolutionEngine();