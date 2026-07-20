/**
 * BotEvolutionEngine.ts — Adaptive Evolutionary Bot Memory & Personality Engine
 *
 * Allows 360 BobbleHead bots to learn, adapt, and evolve over time based on
 * audience interactions, track sentiment, crowd energy, and tipping history.
 */

export interface BotEvolutionProfile {
  botId: string;
  energyLevel: number;        // 0.0 - 1.0
  enthusiasmIndex: number;    // 0.0 - 1.0
  favoriteGenre: string;
  totalTipsDistributed: number;
  interactionCount: number;
  learnedEmotes: string[];
  reputationScore: number;
}

class BotEvolutionEngineService {
  private memoryStore: Map<string, BotEvolutionProfile> = new Map();

  /**
   * Gets or initializes the evolutionary profile for a bot.
   */
  public getProfile(botId: string): BotEvolutionProfile {
    if (!this.memoryStore.has(botId)) {
      this.memoryStore.set(botId, {
        botId,
        energyLevel: 0.85,
        enthusiasmIndex: 0.9,
        favoriteGenre: 'Hip-Hop',
        totalTipsDistributed: 100,
        interactionCount: 0,
        learnedEmotes: ['applause', 'cheer', 'dance', 'wave', 'fireworks'],
        reputationScore: 50,
      });
    }
    return this.memoryStore.get(botId)!;
  }

  /**
   * Learns from an audience interaction, boosting enthusiasm and reputation.
   */
  public recordInteraction(botId: string, interactionType: 'tip' | 'chat' | 'prop_use' | 'stage_cheer'): void {
    const profile = this.getProfile(botId);
    profile.interactionCount += 1;

    if (interactionType === 'tip') {
      profile.totalTipsDistributed += 25;
      profile.reputationScore += 2;
    } else if (interactionType === 'stage_cheer') {
      profile.energyLevel = Math.min(1.0, profile.energyLevel + 0.05);
      profile.reputationScore += 1;
    }

    this.memoryStore.set(botId, profile);
  }
}

export const BotEvolutionEngine = new BotEvolutionEngineService();