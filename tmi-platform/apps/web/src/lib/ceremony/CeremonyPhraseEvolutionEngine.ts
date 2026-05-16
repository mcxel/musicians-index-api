/**
 * CeremonyPhraseEvolutionEngine
 * Generates winner declaration phrases that never feel repetitive.
 *
 * Pools are weighted. Phrases that get used are deprioritized.
 * Over time the engine learns which phrase styles perform best
 * by tracking dwell time and engagement per ceremony.
 *
 * Usage:
 *   const line = ceremonyPhraseEngine.pick("battle", winnerName, isUpset);
 */

export type PhraseContext = "battle" | "cypher" | "dirty-dozens" | "contest";

interface PhraseTemplate {
  id: string;
  template: string; // use {winner} as placeholder
  tone: "epic" | "hype" | "poetic" | "cold" | "theatrical";
  /** 0–1 base weight. Reduced temporarily after use. */
  baseWeight: number;
  usedCount: number;
  lastUsedAt: number;
}

/** Cooldown ms before a phrase can be re-weighted to full */
const PHRASE_COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes

const BATTLE_PHRASES: PhraseTemplate[] = [
  { id: "b1",  template: "Tonight's crown belongs to {winner}.",          tone: "epic",        baseWeight: 1.0, usedCount: 0, lastUsedAt: 0 },
  { id: "b2",  template: "History was written tonight by {winner}.",       tone: "epic",        baseWeight: 1.0, usedCount: 0, lastUsedAt: 0 },
  { id: "b3",  template: "A new king rises. The name is {winner}.",        tone: "theatrical",  baseWeight: 0.9, usedCount: 0, lastUsedAt: 0 },
  { id: "b4",  template: "Victory belongs to {winner}.",                   tone: "cold",        baseWeight: 0.8, usedCount: 0, lastUsedAt: 0 },
  { id: "b5",  template: "The arena has spoken. {winner} stands alone.",   tone: "epic",        baseWeight: 1.0, usedCount: 0, lastUsedAt: 0 },
  { id: "b6",  template: "{winner} came. {winner} conquered.",             tone: "cold",        baseWeight: 0.9, usedCount: 0, lastUsedAt: 0 },
  { id: "b7",  template: "Bars don't lie. {winner} wins.",                 tone: "hype",        baseWeight: 0.8, usedCount: 0, lastUsedAt: 0 },
  { id: "b8",  template: "This crowd has decided. {winner} is champion.",  tone: "theatrical",  baseWeight: 0.9, usedCount: 0, lastUsedAt: 0 },
  { id: "b9",  template: "The mic goes to {winner}.",                      tone: "cold",        baseWeight: 0.7, usedCount: 0, lastUsedAt: 0 },
  { id: "b10", template: "Nobody touches {winner} tonight.",               tone: "hype",        baseWeight: 0.8, usedCount: 0, lastUsedAt: 0 },
  { id: "b11", template: "Undeniable. Unmatchable. {winner}.",             tone: "poetic",      baseWeight: 0.9, usedCount: 0, lastUsedAt: 0 },
  { id: "b12", template: "When the smoke clears, only {winner} remains.",  tone: "poetic",      baseWeight: 1.0, usedCount: 0, lastUsedAt: 0 },
];

const UPSET_PHRASES: PhraseTemplate[] = [
  { id: "u1", template: "Nobody saw this coming. {winner} UPSETS the room.", tone: "hype",       baseWeight: 1.0, usedCount: 0, lastUsedAt: 0 },
  { id: "u2", template: "The underdog wins. {winner} rewrites the narrative.", tone: "epic",     baseWeight: 1.0, usedCount: 0, lastUsedAt: 0 },
  { id: "u3", template: "Chaos. Glory. {winner}.",                             tone: "cold",     baseWeight: 0.9, usedCount: 0, lastUsedAt: 0 },
  { id: "u4", template: "{winner} said hold my mic. And they meant it.",       tone: "hype",     baseWeight: 0.8, usedCount: 0, lastUsedAt: 0 },
  { id: "u5", template: "The odds were wrong. {winner} was right.",            tone: "poetic",   baseWeight: 0.9, usedCount: 0, lastUsedAt: 0 },
];

const CYPHER_PHRASES: PhraseTemplate[] = [
  { id: "c1", template: "The cypher belongs to {winner}.",                   tone: "cold",       baseWeight: 1.0, usedCount: 0, lastUsedAt: 0 },
  { id: "c2", template: "Every bar counted. {winner} counted more.",         tone: "poetic",     baseWeight: 1.0, usedCount: 0, lastUsedAt: 0 },
  { id: "c3", template: "{winner} owned the circle tonight.",                tone: "hype",       baseWeight: 0.9, usedCount: 0, lastUsedAt: 0 },
  { id: "c4", template: "The judges have spoken. {winner} tops the list.",   tone: "theatrical", baseWeight: 0.8, usedCount: 0, lastUsedAt: 0 },
  { id: "c5", template: "90 seconds was enough. {winner} is this week's champion.", tone: "epic", baseWeight: 1.0, usedCount: 0, lastUsedAt: 0 },
];

const DIRTY_DOZENS_PHRASES: PhraseTemplate[] = [
  { id: "d1", template: "They came to talk. {winner} came to destroy.",       tone: "hype",      baseWeight: 1.0, usedCount: 0, lastUsedAt: 0 },
  { id: "d2", template: "Every round, every bar. {winner} dominated.",        tone: "epic",      baseWeight: 1.0, usedCount: 0, lastUsedAt: 0 },
  { id: "d3", template: "{winner} left nothing for anyone else.",             tone: "cold",      baseWeight: 0.9, usedCount: 0, lastUsedAt: 0 },
  { id: "d4", template: "Twelve rounds. One winner. {winner}.",               tone: "theatrical",baseWeight: 0.8, usedCount: 0, lastUsedAt: 0 },
];

const CONTEST_PHRASES: PhraseTemplate[] = [
  { id: "ct1", template: "The competition is over. {winner} stands at the top.", tone: "epic",   baseWeight: 1.0, usedCount: 0, lastUsedAt: 0 },
  { id: "ct2", template: "The votes are in. {winner} wins.",                      tone: "cold",  baseWeight: 0.9, usedCount: 0, lastUsedAt: 0 },
  { id: "ct3", template: "{winner} is this week's champion.",                     tone: "hype",  baseWeight: 0.8, usedCount: 0, lastUsedAt: 0 },
];

const PHRASE_POOLS: Record<PhraseContext, PhraseTemplate[]> = {
  battle:          BATTLE_PHRASES,
  cypher:          CYPHER_PHRASES,
  "dirty-dozens":  DIRTY_DOZENS_PHRASES,
  contest:         CONTEST_PHRASES,
};

export interface CeremonyPhrasePick {
  line: string;
  tone: "epic" | "hype" | "poetic" | "cold" | "theatrical";
  phraseId: string;
}

/** Engagement feedback to improve weighting */
export interface PhraseEngagementFeedback {
  phraseId: string;
  dwellMs: number;
  /** true if user stayed through full closeout */
  completedCeremony: boolean;
}

class CeremonyPhraseEvolutionEngine {
  /** phraseId → learned performance score multiplier (1.0 default) */
  private performanceScores = new Map<string, number>();

  private getPool(context: PhraseContext, isUpset: boolean): PhraseTemplate[] {
    if (isUpset) return UPSET_PHRASES;
    return PHRASE_POOLS[context] ?? BATTLE_PHRASES;
  }

  private effectiveWeight(phrase: PhraseTemplate): number {
    const now = Date.now();
    const timeSinceUse = now - phrase.lastUsedAt;
    const cooldownFactor = phrase.lastUsedAt === 0
      ? 1.0
      : Math.min(1.0, timeSinceUse / PHRASE_COOLDOWN_MS);

    const learned = this.performanceScores.get(phrase.id) ?? 1.0;
    return phrase.baseWeight * cooldownFactor * learned;
  }

  /**
   * Pick a phrase for the ceremony. Weighted random, cooldown-aware.
   */
  pick(context: PhraseContext, winnerName: string, isUpset: boolean): CeremonyPhrasePick {
    const pool = this.getPool(context, isUpset);
    const weights = pool.map((p) => this.effectiveWeight(p));
    const totalWeight = weights.reduce((a, b) => a + b, 0);

    let roll = Math.random() * totalWeight;
    let selected = pool[0];
    for (let i = 0; i < pool.length; i++) {
      roll -= weights[i];
      if (roll <= 0) {
        selected = pool[i];
        break;
      }
    }

    // Mark used
    selected.usedCount += 1;
    selected.lastUsedAt = Date.now();

    const line = selected.template.replace(/\{winner\}/g, winnerName);
    return { line, tone: selected.tone, phraseId: selected.id };
  }

  /**
   * Feed engagement data back to improve future selections.
   */
  recordEngagement(feedback: PhraseEngagementFeedback): void {
    const current = this.performanceScores.get(feedback.phraseId) ?? 1.0;
    // Reward long dwell (>10s) and full completion
    const dwellBonus    = feedback.dwellMs > 10000 ? 0.05 : 0;
    const completeBonus = feedback.completedCeremony ? 0.08 : -0.03;
    const updated = Math.min(2.0, Math.max(0.2, current + dwellBonus + completeBonus));
    this.performanceScores.set(feedback.phraseId, updated);
  }

  /** Get all phrase performance scores (for debugging/analytics) */
  getPerformanceReport(): { phraseId: string; score: number; usedCount: number }[] {
    const allPhrases = [
      ...BATTLE_PHRASES, ...UPSET_PHRASES, ...CYPHER_PHRASES,
      ...DIRTY_DOZENS_PHRASES, ...CONTEST_PHRASES,
    ];
    return allPhrases.map((p) => ({
      phraseId: p.id,
      score: this.performanceScores.get(p.id) ?? 1.0,
      usedCount: p.usedCount,
    }));
  }
}

export const ceremonyPhraseEngine = new CeremonyPhraseEvolutionEngine();
