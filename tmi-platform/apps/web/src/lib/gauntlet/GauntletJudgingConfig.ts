/**
 * GauntletJudgingConfig — stubs for JUDGES_ONLY / CROWD_ONLY / HYBRID.
 * Gifts never silently count as votes (Rule 20 honesty).
 */

export type GauntletJudgingMode = "JUDGES_ONLY" | "CROWD_ONLY" | "HYBRID";

export type GauntletJudgingConfig = {
  mode: GauntletJudgingMode;
  /** Crowd vote weight when HYBRID (0–1). Judges get the remainder. */
  crowdWeight: number;
  /** Gifts may boost XP/cosmetics but NEVER silent vote power. */
  giftsAffectVotes: false;
  giftBoostLabel: "xp-and-cosmetics-only";
};

export const DEFAULT_GAUNTLET_JUDGING: GauntletJudgingConfig = {
  mode: "HYBRID",
  crowdWeight: 0.4,
  giftsAffectVotes: false,
  giftBoostLabel: "xp-and-cosmetics-only",
};

const configs = new Map<string, GauntletJudgingConfig>();

export function getGauntletJudgingConfig(roomId: string): GauntletJudgingConfig {
  return configs.get(roomId) ?? { ...DEFAULT_GAUNTLET_JUDGING };
}

export function setGauntletJudgingMode(
  roomId: string,
  mode: GauntletJudgingMode,
): GauntletJudgingConfig {
  const next: GauntletJudgingConfig = {
    ...getGauntletJudgingConfig(roomId),
    mode,
    crowdWeight: mode === "CROWD_ONLY" ? 1 : mode === "JUDGES_ONLY" ? 0 : 0.4,
    giftsAffectVotes: false,
    giftBoostLabel: "xp-and-cosmetics-only",
  };
  configs.set(roomId, next);
  return next;
}

/** Explicit: a gift tip never becomes a vote tally. */
export function giftContributesToVote(): false {
  return false;
}
