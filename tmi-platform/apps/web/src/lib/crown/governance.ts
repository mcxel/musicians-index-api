import type { CrownCandidate } from "./candidates";
import { Analytics } from "@/lib/analytics/PersonaAnalyticsEngine";

export type CrownResolution = {
  genre: string;
  winner: CrownCandidate | null;
  pool: CrownCandidate[];
  termDaysHeld: number;
  remainingTenureDays: number;
  warningActive: boolean;
  cooldownAppliedToFormerWinner?: boolean;
};

export type CrownGovernanceResult = {
  nextState: Record<string, unknown>;
  resolutions: CrownResolution[];
};

export const crownGovernance: CrownGovernanceResult = {
  nextState: {
    rules: { maxTenureDays: 14 },
    updatedAt: new Date().toISOString(),
  },
  resolutions: [],
};

export function resolveCrownState(
  state: Record<string, unknown> = {},
  candidates: CrownCandidate[] = [],
  _actor = "system"
): CrownGovernanceResult {
  const byGenre = new Map<string, CrownCandidate[]>();
  for (const candidate of candidates) {
    const genre = candidate.genre || "General";
    const pool = byGenre.get(genre) ?? [];
    pool.push(candidate);
    byGenre.set(genre, pool);
  }

  const resolutions: CrownResolution[] = Array.from(byGenre.entries()).map(([genre, pool]) => {
    const ranked = [...pool].sort((a, b) => b.score - a.score);
    return {
      genre,
      winner: ranked[0] ?? null,
      pool: ranked,
      termDaysHeld: 0,
      remainingTenureDays: 14,
      warningActive: false,
      cooldownAppliedToFormerWinner: false,
    };
  });

  resolutions.forEach((r) => {
    if (r.winner) {
      Analytics.ranking({ userId: r.winner.id, points: r.winner.score, rankDelta: 0, category: r.genre, activePersona: 'artist' });
    }
  });

  return {
    nextState: {
      ...state,
      updatedAt: new Date().toISOString(),
      rules: {
        maxTenureDays: 14,
      },
    },
    resolutions,
  };
}
