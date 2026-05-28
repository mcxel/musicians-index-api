/**
 * PerceptionPriorityEngine
 * Humans do not process every entity equally.
 *
 * This engine computes a dynamic perception priority score for every avatar
 * in a room, then maps that score to LOD tier, audio gain, animation budget,
 * and camera weight. Famous users, emotionally bonded users, active performers,
 * and legendary participants are seen more clearly, heard more loudly, and
 * rendered at higher fidelity — automatically.
 *
 * This creates social hierarchy realism without scripting it.
 */

import { universalNow } from './UniversalClockRuntime';
import { getTopBonds } from './EmotionalMemoryEngine';

// ── Types ─────────────────────────────────────────────────────────────────────

export type PerceptionTier =
  | 'featured'    // Max priority: performer on-stage, legendary in peak
  | 'prominent'   // High: VIP, sponsor, bonded partner, active speaker
  | 'standard'    // Mid: fan in mid-row, regular attendee
  | 'background'  // Low: back-row, low-energy, not bonded to observer
  | 'ambient';    // Minimal: ultra-far, bot, truly background presence

export type LODTier = 'near' | 'medium' | 'far' | 'ultra-far';

export interface AvatarPerceptionScore {
  avatarId: string;
  score: number;               // 0–100 composite
  tier: PerceptionTier;
  lodTier: LODTier;
  audioGain: number;           // 0–1
  animationBudget: number;     // bone count allocation (0–54)
  cameraWeight: number;        // 0–1 influence on cinematic framing
  factors: PerceptionFactors;
  updatedAt: number;
}

export interface PerceptionFactors {
  roleScore: number;           // role-based base priority
  bondScore: number;           // bond strength from observer's perspective
  energyScore: number;         // avatar's current crowd energy
  legendaryScore: number;      // recent legendary participation
  spatialScore: number;        // distance to observer (closer = higher)
  activityScore: number;       // recently speaking, gesturing, or active
  fameScore: number;           // platform-level reputation (visits, tips received)
}

export interface PerceptionContext {
  observerUserId: string;      // whose perception we're computing from
  roomId: string;
  observerRow: number;
  observerCol: number;
}

// ── Role base scores ──────────────────────────────────────────────────────────

const ROLE_BASE: Record<string, number> = {
  performer: 55,
  host:      50,
  artist:    48,
  vip:       40,
  sponsor:   35,
  fan:       20,
  bot:       5,
};

// ── Tier thresholds ───────────────────────────────────────────────────────────

function scoreToTier(score: number): PerceptionTier {
  if (score >= 75) return 'featured';
  if (score >= 50) return 'prominent';
  if (score >= 30) return 'standard';
  if (score >= 15) return 'background';
  return 'ambient';
}

function tierToLOD(tier: PerceptionTier): LODTier {
  switch (tier) {
    case 'featured':   return 'near';
    case 'prominent':  return 'medium';
    case 'standard':   return 'far';
    case 'background': return 'ultra-far';
    case 'ambient':    return 'ultra-far';
  }
}

const TIER_AUDIO: Record<PerceptionTier, number> = {
  featured:   1.0,
  prominent:  0.75,
  standard:   0.45,
  background: 0.2,
  ambient:    0.05,
};

// Bone counts by LOD (matching AvatarLODGovernor)
const TIER_BONES: Record<PerceptionTier, number> = {
  featured:   54,
  prominent:  22,
  standard:   4,
  background: 0,
  ambient:    0,
};

const TIER_CAMERA: Record<PerceptionTier, number> = {
  featured:   1.0,
  prominent:  0.6,
  standard:   0.2,
  background: 0.05,
  ambient:    0,
};

// ── State ─────────────────────────────────────────────────────────────────────

// Cache: contextKey → avatarId → score
const scoreCache = new Map<string, Map<string, AvatarPerceptionScore>>();
const activityTimestamps = new Map<string, number>(); // avatarId → last active timestamp
const legendaryTimestamps = new Map<string, number>(); // avatarId → last legendary event
const fameScores = new Map<string, number>();          // avatarId → accumulated fame

const SCORE_TTL_MS = 500;   // recompute every 500ms max
const ACTIVITY_DECAY_MS = 15_000;
const LEGENDARY_DECAY_MS = 120_000;

// ── Activity tracking ─────────────────────────────────────────────────────────

export function markAvatarActive(avatarId: string): void {
  activityTimestamps.set(avatarId, universalNow());
}

export function markAvatarLegendary(avatarId: string): void {
  legendaryTimestamps.set(avatarId, universalNow());
  fameScores.set(avatarId, Math.min(100, (fameScores.get(avatarId) ?? 0) + 15));
}

export function addFameScore(avatarId: string, delta: number): void {
  fameScores.set(avatarId, Math.min(100, Math.max(0, (fameScores.get(avatarId) ?? 0) + delta)));
}

// ── Score computation ─────────────────────────────────────────────────────────

export interface AvatarInput {
  avatarId: string;
  role: string;
  energy: number;         // 0–1 current crowd energy
  row: number;
  col: number;
  isOnStage?: boolean;    // if true, role score gets a multiplier
  isSpeaking?: boolean;
}

export function computePerceptionScore(
  target: AvatarInput,
  context: PerceptionContext,
): AvatarPerceptionScore {
  const now = universalNow();
  const cacheKey = `${context.observerUserId}:${context.roomId}`;
  const cacheEntry = scoreCache.get(cacheKey)?.get(target.avatarId);

  if (cacheEntry && now - cacheEntry.updatedAt < SCORE_TTL_MS) {
    return cacheEntry;
  }

  // ── Factor computation ───────────────────────────────────────────────

  // Role
  const roleBase = ROLE_BASE[target.role] ?? 20;
  const roleScore = target.isOnStage ? Math.min(100, roleBase * 1.5) : roleBase;

  // Bond (from observer's perspective)
  const bonds = getTopBonds(context.observerUserId, 10);
  const bondMatch = bonds.find((b) => b.toUserId === target.avatarId);
  const bondScore = bondMatch ? bondMatch.strength * 40 : 0;

  // Energy
  const energyScore = target.energy * 20;

  // Legendary recency
  const legendaryAt = legendaryTimestamps.get(target.avatarId) ?? 0;
  const legendaryAge = now - legendaryAt;
  const legendaryScore = legendaryAge < LEGENDARY_DECAY_MS
    ? (1 - legendaryAge / LEGENDARY_DECAY_MS) * 25
    : 0;

  // Spatial: Manhattan distance from observer, normalized to room bounds
  const dRow = Math.abs(target.row - context.observerRow);
  const dCol = Math.abs(target.col - context.observerCol);
  const maxDist = 12;  // max reasonable distance in a grid
  const spatialScore = Math.max(0, (1 - (dRow + dCol) / maxDist)) * 20;

  // Activity recency
  const activeAt = activityTimestamps.get(target.avatarId) ?? 0;
  const activityAge = now - activeAt;
  const activityScore = activityAge < ACTIVITY_DECAY_MS
    ? (1 - activityAge / ACTIVITY_DECAY_MS) * 15
    : 0;
  const speakingBonus = target.isSpeaking ? 10 : 0;

  // Fame
  const fameScore = (fameScores.get(target.avatarId) ?? 0) * 0.15;  // 0–15

  // ── Composite score ──────────────────────────────────────────────────

  const raw =
    roleScore * 0.30 +
    bondScore * 0.25 +
    energyScore * 0.15 +
    legendaryScore * 0.12 +
    spatialScore * 0.10 +
    activityScore * 0.05 +
    speakingBonus * 0.03 +
    fameScore;

  const score = Math.min(100, Math.max(0, raw));
  const tier = scoreToTier(score);
  const lodTier = tierToLOD(tier);

  const result: AvatarPerceptionScore = {
    avatarId: target.avatarId,
    score: Math.round(score * 10) / 10,
    tier, lodTier,
    audioGain: TIER_AUDIO[tier],
    animationBudget: TIER_BONES[tier],
    cameraWeight: TIER_CAMERA[tier],
    factors: {
      roleScore: Math.round(roleScore * 10) / 10,
      bondScore: Math.round(bondScore * 10) / 10,
      energyScore: Math.round(energyScore * 10) / 10,
      legendaryScore: Math.round(legendaryScore * 10) / 10,
      spatialScore: Math.round(spatialScore * 10) / 10,
      activityScore: Math.round(activityScore * 10) / 10,
      fameScore: Math.round(fameScore * 10) / 10,
    },
    updatedAt: now,
  };

  // Cache result
  if (!scoreCache.has(cacheKey)) scoreCache.set(cacheKey, new Map());
  scoreCache.get(cacheKey)!.set(target.avatarId, result);

  return result;
}

/**
 * Compute perception scores for an entire room from one observer's viewpoint.
 * Returns avatars sorted by score descending.
 */
export function computeRoomPerception(
  avatars: AvatarInput[],
  context: PerceptionContext,
): AvatarPerceptionScore[] {
  return avatars
    .map((av) => computePerceptionScore(av, context))
    .sort((a, b) => b.score - a.score);
}

/**
 * Get the camera priority list — the top N avatars the cinematic engine
 * should consider framing, with their weights.
 */
export function getCameraPriorityList(
  avatars: AvatarInput[],
  context: PerceptionContext,
  topN = 5,
): Array<{ avatarId: string; cameraWeight: number; tier: PerceptionTier }> {
  return computeRoomPerception(avatars, context)
    .slice(0, topN)
    .map((s) => ({ avatarId: s.avatarId, cameraWeight: s.cameraWeight, tier: s.tier }));
}

/**
 * Get a full tier summary for a room — useful for LOD budget estimation.
 */
export function getRoomTierSummary(
  avatars: AvatarInput[],
  context: PerceptionContext,
): {
  tierBreakdown: Partial<Record<PerceptionTier, number>>;
  totalBoneCount: number;
  estimatedRenderBudget: number;  // 0–1, fraction of full-near baseline
} {
  const scores = computeRoomPerception(avatars, context);
  const tierBreakdown: Partial<Record<PerceptionTier, number>> = {};
  let totalBones = 0;
  const maxBones = avatars.length * 54;  // all-near baseline

  for (const s of scores) {
    tierBreakdown[s.tier] = (tierBreakdown[s.tier] ?? 0) + 1;
    totalBones += s.animationBudget;
  }

  return {
    tierBreakdown,
    totalBoneCount: totalBones,
    estimatedRenderBudget: maxBones > 0 ? Math.round((totalBones / maxBones) * 100) / 100 : 0,
  };
}

/**
 * Promote an avatar to featured tier for a duration (e.g., solo moment).
 * Sets high activity + legendary timestamps to guarantee tier.
 */
export function promoteToFeatured(avatarId: string, durationMs = 10_000): void {
  markAvatarActive(avatarId);
  markAvatarLegendary(avatarId);
  // Override legendary timestamp to sustain past normal decay
  legendaryTimestamps.set(avatarId, universalNow() + durationMs - LEGENDARY_DECAY_MS);
  addFameScore(avatarId, 20);
}

export function getPerceptionStats(
  avatars: AvatarInput[],
  context: PerceptionContext,
): {
  featured: number;
  prominent: number;
  standard: number;
  background: number;
  ambient: number;
  topAvatarId: string | null;
  topScore: number;
} {
  const scores = computeRoomPerception(avatars, context);
  const counts = { featured: 0, prominent: 0, standard: 0, background: 0, ambient: 0 };
  for (const s of scores) counts[s.tier]++;
  const top = scores[0];
  return {
    ...counts,
    topAvatarId: top?.avatarId ?? null,
    topScore: top?.score ?? 0,
  };
}
