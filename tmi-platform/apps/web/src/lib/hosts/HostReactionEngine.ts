/**
 * Host Reaction Engine
 * Maps contestant performance scores and judge tier labels to
 * host verbal reaction lines and emotional state payloads.
 * Tiers: bad | okay | hot | insane
 */
import { HostEmotionReactionEngine, type HostEmotionalReaction } from './HostEmotionReactionEngine';

export type ReactionTier = 'bad' | 'okay' | 'hot' | 'insane';

export interface HostReactionPayload {
  tier: ReactionTier;
  line: string;
  emotion: HostEmotionalReaction;
}

const REACTION_LINES: Record<ReactionTier, string[]> = {
  bad: [
    "That's a no from me.",
    "The stage expected more.",
    "We'll find someone else.",
    "Bravery points. Skill points — zero.",
    "Next.",
  ],
  okay: [
    "Serviceable. Barely.",
    "You're still standing. That counts.",
    "The crowd is being generous.",
    "Technically alive up there.",
    "Room to grow. A lot of room.",
  ],
  hot: [
    "Now we're talking.",
    "That's the standard. Keep it.",
    "I felt something in that.",
    "The crowd agrees. So do I.",
    "Don't let it go to your head.",
  ],
  insane: [
    "THAT is what this platform was built for.",
    "Did you all see that?! INSANE.",
    "The meter went past full. I don't know how.",
    "Someone get this person a contract. Right now.",
    "Stage is yours. You earned every inch of it.",
  ],
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export class HostReactionEngine {
  static scoreToTier(score: number): ReactionTier {
    if (score < 25) return 'bad';
    if (score < 55) return 'okay';
    if (score < 80) return 'hot';
    return 'insane';
  }

  static getReaction(tier: ReactionTier): HostReactionPayload {
    const emotionEvent =
      tier === 'bad'    ? 'bad_score'   :
      tier === 'okay'   ? 'okay_score'  :
      tier === 'hot'    ? 'hot_score'   :
                          'elite_score';

    return {
      tier,
      line: pick(REACTION_LINES[tier]),
      emotion: HostEmotionReactionEngine.getReactionForEvent(emotionEvent),
    };
  }

  static getReactionForScore(score: number): HostReactionPayload {
    return HostReactionEngine.getReaction(HostReactionEngine.scoreToTier(score));
  }
}
