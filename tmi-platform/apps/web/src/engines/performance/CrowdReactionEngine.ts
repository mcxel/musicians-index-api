// Crowd Reaction Engine — applause intensity, hype, boos, emoji waves, vote weight
// Feeds into winner calculations via crowd score (0–100)
// SSR-safe: pure functions, no side effects at import time

// ── Reaction types ────────────────────────────────────────────────────────────

export type ReactionType =
  | "applause"
  | "hype"        // 🔥 — high energy positive
  | "boo"         // 👎 — negative
  | "crown"       // 👑 — winner call
  | "clap"        // 👏 — moderate positive
  | "fire"        // 🎆 — peak moment
  | "money"       // 💰 — tip trigger
  | "heart"       // ❤️ — fan support
  | "skull"       // 💀 — killed it
  | "wave";       // audience wave — ambient positivity

export type ReactionEvent = {
  userId: string;
  type: ReactionType;
  targetPerformerId: string;
  sessionId: string;
  timestampMs: number;
  isBot: boolean;
};

export type CrowdSnapshot = {
  sessionId: string;
  windowMs: number;        // rolling window duration
  events: ReactionEvent[];
  computedAtMs: number;
};

// ── Reaction weights → crowd score contribution ──────────────────────────────

const REACTION_WEIGHT: Record<ReactionType, number> = {
  applause:  2,
  hype:      4,
  boo:      -3,
  crown:     5,
  clap:      2,
  fire:      4,
  money:     3,
  heart:     2,
  skull:     3,
  wave:      1,
};

// ── Intensity thresholds ──────────────────────────────────────────────────────

export type CrowdIntensity = "dead" | "warm" | "loud" | "electric" | "peak";

function intensityFromScore(score: number): CrowdIntensity {
  if (score >= 85) return "peak";
  if (score >= 65) return "electric";
  if (score >= 40) return "loud";
  if (score >= 15) return "warm";
  return "dead";
}

// ── Per-performer score ───────────────────────────────────────────────────────

export type PerformerCrowdScore = {
  performerId: string;
  rawScore: number;        // sum of weighted reactions
  normalizedScore: number; // 0–100
  intensity: CrowdIntensity;
  reactionBreakdown: Partial<Record<ReactionType, number>>;
  voteWeightMultiplier: number;
};

export function computePerformerScore(
  performerId: string,
  snapshot: CrowdSnapshot,
): PerformerCrowdScore {
  const relevant = snapshot.events.filter((e) => e.targetPerformerId === performerId);
  const breakdown: Partial<Record<ReactionType, number>> = {};
  let raw = 0;

  for (const evt of relevant) {
    const w = REACTION_WEIGHT[evt.type] ?? 0;
    raw += w;
    breakdown[evt.type] = (breakdown[evt.type] ?? 0) + 1;
  }

  // Normalize: 100 = top realistic score for a session window
  const maxRaw = 300;
  const normalized = Math.min(100, Math.max(0, Math.round((raw / maxRaw) * 100)));
  const intensity = intensityFromScore(normalized);

  const voteWeightMultiplier = normalized >= 80 ? 1.5 : normalized >= 60 ? 1.25 : normalized >= 40 ? 1.1 : 1.0;

  return {
    performerId,
    rawScore: raw,
    normalizedScore: normalized,
    intensity,
    reactionBreakdown: breakdown,
    voteWeightMultiplier,
  };
}

// ── Session-wide crowd metrics ────────────────────────────────────────────────

export type SessionCrowdMetrics = {
  totalReactions: number;
  positiveRatio: number;   // 0–1
  peakIntensityMs: number | null;
  dominantReaction: ReactionType | null;
  byPerformer: Record<string, PerformerCrowdScore>;
  overallIntensity: CrowdIntensity;
};

export function computeSessionMetrics(
  snapshot: CrowdSnapshot,
  performerIds: string[],
): SessionCrowdMetrics {
  const total = snapshot.events.length;
  const positive = snapshot.events.filter((e) => (REACTION_WEIGHT[e.type] ?? 0) > 0).length;

  // Peak moment — find 30s window with most reactions
  let peakMs: number | null = null;
  if (snapshot.events.length > 0) {
    const sorted = [...snapshot.events].sort((a, b) => a.timestampMs - b.timestampMs);
    let maxInWindow = 0;
    for (let i = 0; i < sorted.length; i++) {
      const windowEnd = (sorted[i]?.timestampMs ?? 0) + 30_000;
      const inWindow = sorted.filter((e) => e.timestampMs >= (sorted[i]?.timestampMs ?? 0) && e.timestampMs <= windowEnd).length;
      if (inWindow > maxInWindow) { maxInWindow = inWindow; peakMs = sorted[i]?.timestampMs ?? null; }
    }
  }

  // Dominant reaction
  const reactionCounts: Partial<Record<ReactionType, number>> = {};
  for (const e of snapshot.events) {
    reactionCounts[e.type] = (reactionCounts[e.type] ?? 0) + 1;
  }
  const dominant = (Object.entries(reactionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null) as ReactionType | null;

  const byPerformer: Record<string, PerformerCrowdScore> = {};
  let totalNorm = 0;
  for (const pid of performerIds) {
    byPerformer[pid] = computePerformerScore(pid, snapshot);
    totalNorm += byPerformer[pid]?.normalizedScore ?? 0;
  }

  const avgNorm = performerIds.length > 0 ? totalNorm / performerIds.length : 0;

  return {
    totalReactions: total,
    positiveRatio: total > 0 ? positive / total : 0,
    peakIntensityMs: peakMs,
    dominantReaction: dominant,
    byPerformer,
    overallIntensity: intensityFromScore(avgNorm),
  };
}

// ── Snapshot management ───────────────────────────────────────────────────────

export function createSnapshot(sessionId: string, windowMs = 120_000): CrowdSnapshot {
  return { sessionId, windowMs, events: [], computedAtMs: Date.now() };
}

export function addReaction(snapshot: CrowdSnapshot, event: ReactionEvent): CrowdSnapshot {
  const cutoff = event.timestampMs - snapshot.windowMs;
  const trimmed = snapshot.events.filter((e) => e.timestampMs >= cutoff);
  return { ...snapshot, events: [...trimmed, event], computedAtMs: event.timestampMs };
}

// ── Bot reaction generator ────────────────────────────────────────────────────

const BOT_POSITIVE: ReactionType[] = ["applause", "hype", "clap", "fire", "heart", "skull", "wave"];
const BOT_NEGATIVE: ReactionType[] = ["boo"];

export function generateBotReaction(
  performerId: string,
  sessionId: string,
  seed: number,
  booProbability = 0.08,
): ReactionEvent {
  const isNeg = seed % 100 < booProbability * 100;
  const pool = isNeg ? BOT_NEGATIVE : BOT_POSITIVE;
  const type = pool[seed % pool.length] ?? "clap";
  return {
    userId: `bot-crowd-${seed % 999}`,
    type,
    targetPerformerId: performerId,
    sessionId,
    timestampMs: Date.now(),
    isBot: true,
  };
}

// ── Winner determination contribution ─────────────────────────────────────────

export function crowdScoreToWinnerWeight(normalizedScore: number): number {
  return 0.3 + (normalizedScore / 100) * 0.4;
}
