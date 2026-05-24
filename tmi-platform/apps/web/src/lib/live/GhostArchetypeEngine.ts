// Deterministic personality profiles for ghost bots.
// Each ghost ID maps to one of 5 archetypes via stable hash — no Math.random.

export type GhostPersonality =
  | "hype-man"
  | "observer"
  | "battle-fan"
  | "vibe-seeker"
  | "silent-watcher";

export interface GhostArchetypeProfile {
  personality: GhostPersonality;
  label: string;
  emoteSequence: string[];
  reactionMultiplier: number; // scales energy contribution (0.2–2.0)
}

const PROFILES: GhostArchetypeProfile[] = [
  {
    personality: "hype-man",
    label: "Hype Man",
    emoteSequence: ["🔥", "⚡", "🔥", "👑", "🎤"],
    reactionMultiplier: 2.0,
  },
  {
    personality: "observer",
    label: "Observer",
    emoteSequence: ["👀", "🤔", "✨", "🎧"],
    reactionMultiplier: 0.5,
  },
  {
    personality: "battle-fan",
    label: "Battle Fan",
    emoteSequence: ["⚔️", "🥊", "⚡", "👊", "🏆"],
    reactionMultiplier: 1.8,
  },
  {
    personality: "vibe-seeker",
    label: "Vibe Seeker",
    emoteSequence: ["🌊", "✨", "🎧", "💜", "🌙"],
    reactionMultiplier: 1.2,
  },
  {
    personality: "silent-watcher",
    label: "Silent Watcher",
    emoteSequence: ["👁️", "⚫"],
    reactionMultiplier: 0.2,
  },
];

function stableHash(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function getGhostArchetype(ghostId: string): GhostArchetypeProfile {
  return PROFILES[stableHash(ghostId) % PROFILES.length]!;
}

export function getSpotlightEmotes(ghostId: string): string[] {
  return getGhostArchetype(ghostId).emoteSequence;
}

export function getReactionMultiplier(ghostId: string): number {
  return getGhostArchetype(ghostId).reactionMultiplier;
}
