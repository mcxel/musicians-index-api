// SeasonPassProgressionEngine
// Level 1–10 system layered over SeasonPassEngine XP.
// Levels map to visual fretboard/instrument progression positions.
// Each level unlock triggers a visual animation sequence.

import { seasonPassEngine, type SeasonPassTier } from "./SeasonPassEngine";
import { getActiveSkin, type SeasonSkin } from "./SeasonPassSkinEngine";

export type LevelState = "locked" | "in_progress" | "unlocked";

export type PassLevel = {
  level: number;         // 1–10
  xpRequired: number;   // XP floor for this level
  xpNext: number;       // XP floor for next level (or same as required at 10)
  state: LevelState;
  rewardPreview?: string; // short label: "NFT Drop", "Gold Tee", etc.
  rewardLocked: boolean;
};

export type ProgressionSnapshot = {
  userId: string;
  seasonId: string;
  tier: SeasonPassTier;
  currentLevel: number;  // 1–10
  xpEarned: number;
  xpGoal: number;
  progressPct: number;   // 0–100 within current level
  levels: PassLevel[];
  skin: SeasonSkin;
  justLeveledUp: boolean;
  newLevel?: number;
};

// XP thresholds for levels 1–10 within a season
const LEVEL_XP_THRESHOLDS: number[] = [0, 500, 1000, 1500, 2200, 3000, 4000, 5200, 6600, 8500];
// Level 10 is reached at 8500 XP

// Reward previews per level
const LEVEL_REWARDS: Record<number, string> = {
  1: "Newcomer Badge",
  2: "Fan XP Boost",
  3: "Crown Wave Emote",
  4: "Gold Tee",
  5: "Beat Pack",
  6: "NFT Drop",
  7: "VIP Ticket",
  8: "Studio Credit",
  9: "Venue Backstage",
  10: "Legend Crown",
};

// In-memory previous level cache to detect level-ups
const _prevLevels: Record<string, number> = {};

// ── Helpers ───────────────────────────────────────────────────────────────────

function computeLevel(xp: number): number {
  let level = 1;
  for (let i = LEVEL_XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_XP_THRESHOLDS[i]!) {
      level = i + 1;
      break;
    }
  }
  return Math.min(level, 10);
}

function computeLevelProgress(xp: number, level: number): number {
  const floor = LEVEL_XP_THRESHOLDS[level - 1] ?? 0;
  const ceiling = LEVEL_XP_THRESHOLDS[level] ?? floor;
  if (ceiling === floor) return 100;
  return Math.round(Math.min(((xp - floor) / (ceiling - floor)) * 100, 100));
}

function buildLevels(xp: number, tier: SeasonPassTier): PassLevel[] {
  const currentLevel = computeLevel(xp);
  const isLegend = tier === "LEGEND_PASS";
  const isPaid = tier !== "FREE";

  return Array.from({ length: 10 }, (_, i) => {
    const level = i + 1;
    const xpRequired = LEVEL_XP_THRESHOLDS[i] ?? 0;
    const xpNext = LEVEL_XP_THRESHOLDS[i + 1] ?? xpRequired;
    let state: LevelState = "locked";
    if (xp >= xpRequired) state = level === currentLevel ? "in_progress" : "unlocked";
    const isPremiumLevel = level >= 6;
    const rewardLocked = isPremiumLevel && !isPaid && !isLegend;

    return {
      level,
      xpRequired,
      xpNext,
      state,
      rewardPreview: LEVEL_REWARDS[level],
      rewardLocked,
    };
  });
}

// ── Core API ──────────────────────────────────────────────────────────────────

export function getProgressionSnapshot(userId: string, seasonId = "season-1"): ProgressionSnapshot {
  const pass = seasonPassEngine.getPass(userId);
  const skin = getActiveSkin();
  const xpEarned = pass?.xpEarned ?? 0;
  const xpGoal = pass?.xpGoal ?? 8500;
  const tier = pass?.tier ?? "FREE";
  const currentLevel = computeLevel(xpEarned);
  const progressPct = computeLevelProgress(xpEarned, currentLevel);
  const levels = buildLevels(xpEarned, tier);

  const prevLevel = _prevLevels[userId] ?? currentLevel;
  const justLeveledUp = currentLevel > prevLevel;
  _prevLevels[userId] = currentLevel;

  return {
    userId,
    seasonId,
    tier,
    currentLevel,
    xpEarned,
    xpGoal,
    progressPct,
    levels,
    skin,
    justLeveledUp,
    newLevel: justLeveledUp ? currentLevel : undefined,
  };
}

export function addXpAndSnapshot(userId: string, xp: number, seasonId = "season-1"): ProgressionSnapshot {
  // Capture level before adding XP
  const pass = seasonPassEngine.getPass(userId);
  const prevXp = pass?.xpEarned ?? 0;
  _prevLevels[userId] = computeLevel(prevXp);
  seasonPassEngine.addXP(userId, xp);
  return getProgressionSnapshot(userId, seasonId);
}

export function getLevelLabel(level: number): string {
  return `Level ${level}`;
}

export function getLevelRewardPreview(level: number): string {
  return LEVEL_REWARDS[level] ?? "Unlock";
}

export function getXpToNextLevel(xpEarned: number): number {
  const level = computeLevel(xpEarned);
  if (level >= 10) return 0;
  const nextThreshold = LEVEL_XP_THRESHOLDS[level] ?? 0;
  return Math.max(0, nextThreshold - xpEarned);
}

// Convenience: get a mock snapshot for unauthenticated display
export function getMockProgressionSnapshot(level = 3, seasonId = "season-1"): ProgressionSnapshot {
  const skin = getActiveSkin();
  const xpEarned = LEVEL_XP_THRESHOLDS[level - 1] ?? 0;
  const levels = buildLevels(xpEarned, "FAN_PASS");
  const progressPct = computeLevelProgress(xpEarned, level);

  return {
    userId: "guest",
    seasonId,
    tier: "FAN_PASS",
    currentLevel: level,
    xpEarned,
    xpGoal: 8500,
    progressPct,
    levels,
    skin,
    justLeveledUp: false,
  };
}
