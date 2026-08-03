/**
 * Legacy Score — measured championship history only (Phase 2C).
 * NOT used for active competitive ranking. No dollar/stream inventing.
 */

import {
  listChampionshipTitles,
  listTitlesForHolder,
} from "./ChampionshipRegistry";
import type { ChampionshipTitle } from "./types";

export interface LegacyScoreBreakdown {
  performerId: string;
  /** Weighted total — display only; never feeds live ranks. */
  legacyScore: number;
  activeTitles: number;
  successfulDefenses: number;
  trophyAwards: number;
  lineageHolds: number;
  longevityDays: number;
  disclaimer: string;
}

const WEIGHTS = {
  activeTitle: 100,
  defense: 40,
  trophy: 60,
  lineageHold: 25,
  longevityDay: 0.5,
} as const;

export const LEGACY_SCORE_DISCLAIMER =
  "Legacy Score is historical prestige only — NOT used for active competitive ranking.";

function longevityDaysFromLineage(title: ChampionshipTitle, holderId: string): number {
  let days = 0;
  for (const entry of title.lineage) {
    if (entry.holderId !== holderId) continue;
    const from = new Date(entry.from).getTime();
    const to = entry.to ? new Date(entry.to).getTime() : Date.now();
    if (!Number.isFinite(from) || !Number.isFinite(to) || to < from) continue;
    days += Math.floor((to - from) / 86_400_000);
  }
  return days;
}

/** Hall of Fame alumni = past lineage holders (to set) + any current trophy holders. */
export function listHallOfFameAlumni(): {
  performerId: string;
  titleId: string;
  titleLabel: string;
  from: string;
  to?: string;
  kind: "alumni" | "trophy" | "active_champion";
}[] {
  const out: {
    performerId: string;
    titleId: string;
    titleLabel: string;
    from: string;
    to?: string;
    kind: "alumni" | "trophy" | "active_champion";
  }[] = [];

  for (const title of listChampionshipTitles()) {
    for (const entry of title.lineage) {
      const isPast = Boolean(entry.to) || title.currentHolderId !== entry.holderId;
      if (isPast) {
        out.push({
          performerId: entry.holderId,
          titleId: title.id,
          titleLabel: title.label,
          from: entry.from,
          to: entry.to,
          kind: "alumni",
        });
      } else if (title.assetType === "TROPHY") {
        out.push({
          performerId: entry.holderId,
          titleId: title.id,
          titleLabel: title.label,
          from: entry.from,
          to: entry.to,
          kind: "trophy",
        });
      } else if (title.status === "ACTIVE" && title.currentHolderId === entry.holderId) {
        out.push({
          performerId: entry.holderId,
          titleId: title.id,
          titleLabel: title.label,
          from: entry.from,
          kind: "active_champion",
        });
      }
    }
  }
  return out;
}

export function computeLegacyScore(performerId: string): LegacyScoreBreakdown {
  const held = listTitlesForHolder(performerId);
  const all = listChampionshipTitles();
  let successfulDefenses = 0;
  let trophyAwards = 0;
  let lineageHolds = 0;
  let longevityDays = 0;

  for (const title of all) {
    for (const entry of title.lineage) {
      if (entry.holderId !== performerId) continue;
      lineageHolds += 1;
      longevityDays += longevityDaysFromLineage(title, performerId);
    }
    if (title.assetType === "TROPHY") {
      const won = title.lineage.some((e) => e.holderId === performerId);
      if (won) trophyAwards += 1;
    }
  }

  for (const t of held) {
    successfulDefenses += t.successfulDefenses;
  }

  const legacyScore = Math.round(
    held.length * WEIGHTS.activeTitle +
      successfulDefenses * WEIGHTS.defense +
      trophyAwards * WEIGHTS.trophy +
      lineageHolds * WEIGHTS.lineageHold +
      longevityDays * WEIGHTS.longevityDay,
  );

  return {
    performerId,
    legacyScore,
    activeTitles: held.length,
    successfulDefenses,
    trophyAwards,
    lineageHolds,
    longevityDays,
    disclaimer: LEGACY_SCORE_DISCLAIMER,
  };
}

/** Real Observatory counts from registry + challenge queue. */
export function getChampionshipObservatoryCounts(openChallenges: number): {
  vacantTitles: number;
  openChallenges: number;
  activeChampions: number;
} {
  const titles = listChampionshipTitles();
  const vacantTitles = titles.filter((t) => t.status === "VACANT").length;
  const holderIds = new Set(
    titles
      .filter((t) => t.status === "ACTIVE" && t.currentHolderId)
      .map((t) => t.currentHolderId!),
  );
  return {
    vacantTitles,
    openChallenges,
    activeChampions: holderIds.size,
  };
}
