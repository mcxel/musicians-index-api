/**
 * ChampionshipRegistry — canonical crowns / belts / trophies (Phase 2B).
 *
 * Inherits:
 *   - Overall crown holder from PerformerRegistry.getCrownHolder / getCrownRotationStatus
 *   - Title slots from ChampionshipYearlyEngine categories (seed VACANT)
 *   - Trophy lineage shape from TrophyLineageEngine (no fake holders)
 *
 * Rule 20: VACANT when no verified holder; never invent champion names.
 */

import {
  getCrownHolder,
  getCrownRotationStatus,
  getPerformerById,
} from "@/lib/performers/PerformerRegistry";
import { CATEGORY_LABELS, type CompetitionCategory } from "@/lib/competition/ChampionshipYearlyEngine";
import {
  appendChallenge,
  listChallengesForChallenger,
  loadChallengeQueue,
} from "./championshipChallengeStore";
import {
  CHAMPIONSHIP_DEFENSE_CONFIG,
  type ChallengeEligibilityResult,
  type ChampionshipAssetType,
  type ChampionshipChallengeRequest,
  type ChampionshipStatus,
  type ChampionshipTitle,
  type GeographicTier,
} from "./types";

const GENRE_CROWN_CATEGORIES = [
  "Hip-Hop",
  "R&B",
  "Country",
  "Rock",
  "Gospel",
  "Comedy",
  "Dance",
  "Producer",
] as const;

function daysFromNow(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString();
}

function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  return Math.floor((new Date(iso).getTime() - Date.now()) / 86_400_000);
}

function vacantTitle(partial: {
  id: string;
  assetType: ChampionshipAssetType;
  geographicTier: GeographicTier;
  category: string;
  division: string;
  label: string;
  source: ChampionshipTitle["source"];
}): ChampionshipTitle {
  return {
    ...partial,
    currentHolderId: null,
    status: "VACANT",
    defenseDeadline: null,
    successfulDefenses: 0,
    lineage: [],
  };
}

function buildSeedTitles(): ChampionshipTitle[] {
  const titles: ChampionshipTitle[] = [];

  // Overall GLOBAL crown — map real XP crown holder only
  const crown = getCrownHolder();
  const rotation = getCrownRotationStatus();
  const crownSince = crown.crownSince ?? null;
  const heldDays = crownSince ? daysSince(crownSince) : 0;
  const vacantDays = CHAMPIONSHIP_DEFENSE_CONFIG.crownVacantDays;
  const warningDays = CHAMPIONSHIP_DEFENSE_CONFIG.crownWarningDays;

  let overallStatus: ChampionshipStatus = "ACTIVE";
  let defenseDeadline: string | null = null;

  if (crownSince) {
    defenseDeadline = new Date(
      new Date(crownSince).getTime() + vacantDays * 86_400_000,
    ).toISOString();
    if (heldDays >= vacantDays || rotation?.rotationDue) {
      overallStatus = "VACANT";
    } else if (heldDays >= warningDays) {
      // Keep ACTIVE but anti-hoarding consumers see warning via getDefenseWarning()
      overallStatus = "ACTIVE";
    }
  } else {
    // Real holder by XP, no crownSince yet — ACTIVE with fresh defense window
    defenseDeadline = daysFromNow(vacantDays);
  }

  const overallHolderId =
    overallStatus === "VACANT" ? null : crown.id;

  titles.push({
    id: "crown.global.overall",
    assetType: "CROWN",
    geographicTier: "GLOBAL",
    category: "Overall",
    division: "open",
    label: "Overall Crown",
    currentHolderId: overallHolderId,
    status: overallHolderId ? overallStatus : "VACANT",
    defenseDeadline: overallHolderId ? defenseDeadline : null,
    successfulDefenses: 0,
    lineage: overallHolderId
      ? [
          {
            holderId: overallHolderId,
            from: crownSince ?? new Date().toISOString(),
          },
        ]
      : [],
    source: "PerformerRegistry.crown",
  });

  // Genre crowns — VACANT until a verified genre #1 hold is wired
  for (const genre of GENRE_CROWN_CATEGORIES) {
    titles.push(
      vacantTitle({
        id: `crown.global.genre.${genre.toLowerCase().replace(/\s+/g, "_")}`,
        assetType: "CROWN",
        geographicTier: "GLOBAL",
        category: genre,
        division: genre.toLowerCase(),
        label: `${genre} Crown`,
        source: "seed_vacant",
      }),
    );
  }

  // Weekly belts / monthly trophies / yearly crowns from ChampionshipYearlyEngine categories — VACANT
  for (const cat of Object.keys(CATEGORY_LABELS) as CompetitionCategory[]) {
    const label = CATEGORY_LABELS[cat];
    titles.push(
      vacantTitle({
        id: `belt.global.weekly.${cat}`,
        assetType: "BELT",
        geographicTier: "GLOBAL",
        category: cat,
        division: cat,
        label: `Weekly ${label} Belt`,
        source: "ChampionshipYearlyEngine",
      }),
    );
    titles.push(
      vacantTitle({
        id: `trophy.global.monthly.${cat}`,
        assetType: "TROPHY",
        geographicTier: "GLOBAL",
        category: cat,
        division: cat,
        label: `Monthly ${label} Trophy`,
        source: "ChampionshipYearlyEngine",
      }),
    );
  }

  return titles;
}

/** Mutable in-memory registry (seeded once). */
let _titles: ChampionshipTitle[] | null = null;

function ensureRegistry(): ChampionshipTitle[] {
  if (!_titles) {
    _titles = buildSeedTitles();
    applyAntiHoarding(_titles);
  }
  return _titles;
}

/**
 * Anti-hoarding: update status from defenseDeadline only — never from fake activity.
 * Crowns: warn 7d / vacant 14d. Belts: warn 30d / vacant 60d.
 */
export function applyAntiHoarding(titles: ChampionshipTitle[] = ensureRegistry()): ChampionshipTitle[] {
  const now = Date.now();
  for (const t of titles) {
    if (!t.currentHolderId || !t.defenseDeadline) continue;
    if (t.status === "RETIRED" || t.status === "FROZEN") continue;

    const deadline = new Date(t.defenseDeadline).getTime();
    // Past absolute defense deadline → VACANT (strip holder). No fake activity signals.
    if (now >= deadline) {
      const last = t.lineage[t.lineage.length - 1];
      if (last && !last.to) last.to = new Date().toISOString();
      t.currentHolderId = null;
      t.status = "VACANT";
      t.defenseDeadline = null;
    }
  }
  return titles;
}

export function getDefenseWarning(
  title: ChampionshipTitle,
): { level: "none" | "warning" | "vacant"; daysRemaining: number | null } {
  if (title.status === "VACANT") {
    return { level: "vacant", daysRemaining: 0 };
  }
  if (!title.defenseDeadline || !title.currentHolderId) {
    return { level: "none", daysRemaining: null };
  }
  const remaining = daysUntil(title.defenseDeadline);
  if (remaining == null) return { level: "none", daysRemaining: null };
  if (remaining <= 0) return { level: "vacant", daysRemaining: 0 };

  const warningDays =
    title.assetType === "CROWN"
      ? CHAMPIONSHIP_DEFENSE_CONFIG.crownWarningDays
      : title.assetType === "BELT"
        ? CHAMPIONSHIP_DEFENSE_CONFIG.beltWarningDays
        : CHAMPIONSHIP_DEFENSE_CONFIG.trophyWarningDays;

  if (remaining <= warningDays) {
    return { level: "warning", daysRemaining: remaining };
  }
  return { level: "none", daysRemaining: remaining };
}

export function listChampionshipTitles(): ChampionshipTitle[] {
  return applyAntiHoarding([...ensureRegistry()]);
}

export function getChampionshipTitle(id: string): ChampionshipTitle | null {
  return listChampionshipTitles().find((t) => t.id === id) ?? null;
}

export function listTitlesByAssetType(
  assetType: ChampionshipAssetType,
): ChampionshipTitle[] {
  return listChampionshipTitles().filter((t) => t.assetType === assetType);
}

export function listTitlesForHolder(holderId: string): ChampionshipTitle[] {
  return listChampionshipTitles().filter((t) => t.currentHolderId === holderId);
}

/**
 * Verified wins stub — returns 0 until a real battle win ledger is wired.
 * Rule 20: never invent wins.
 */
export function getVerifiedWinCount(_performerId: string): number {
  return 0;
}

export function checkChallengeEligibility(input: {
  challengerId: string;
  titleId: string;
  /** Account considered active (session stub). */
  accountActive?: boolean;
}): ChallengeEligibilityResult {
  const title = getChampionshipTitle(input.titleId);
  if (!title) {
    return {
      eligible: false,
      reason: "Title not found.",
      hasVerifiedWins: false,
    };
  }
  if (title.status === "RETIRED" || title.status === "FROZEN") {
    return {
      eligible: false,
      reason: `Title is ${title.status}.`,
      hasVerifiedWins: false,
    };
  }
  if (input.accountActive === false) {
    return {
      eligible: false,
      reason: "Account must be active to challenge.",
      hasVerifiedWins: false,
    };
  }
  const performer = getPerformerById(input.challengerId);
  if (!performer && input.accountActive !== true) {
    // Allow session id passthrough when accountActive explicitly true
    return {
      eligible: false,
      reason: "Challenger not found in PerformerRegistry.",
      hasVerifiedWins: false,
    };
  }
  if (title.currentHolderId === input.challengerId) {
    return {
      eligible: false,
      reason: "You already hold this title.",
      hasVerifiedWins: getVerifiedWinCount(input.challengerId) > 0,
    };
  }
  const wins = getVerifiedWinCount(input.challengerId);
  if (wins <= 0) {
    return {
      eligible: false,
      reason: "No verified competition wins yet. Win a battle or cypher to unlock challenges.",
      hasVerifiedWins: false,
    };
  }
  return {
    eligible: true,
    reason: "Eligible to challenge.",
    hasVerifiedWins: true,
  };
}

export function requestChampionshipChallenge(input: {
  kind: ChampionshipChallengeRequest["kind"];
  titleId: string;
  challengerId: string;
  accountActive?: boolean;
}): { ok: boolean; request?: ChampionshipChallengeRequest; error?: string } {
  const title = getChampionshipTitle(input.titleId);
  if (!title) return { ok: false, error: "Title not found." };

  if (
    (input.kind === "REQUEST_CROWN_CHALLENGE" && title.assetType !== "CROWN") ||
    (input.kind === "REQUEST_BELT_CHALLENGE" && title.assetType !== "BELT")
  ) {
    return { ok: false, error: "Challenge kind does not match title asset type." };
  }

  const eligibility = checkChallengeEligibility({
    challengerId: input.challengerId,
    titleId: input.titleId,
    accountActive: input.accountActive,
  });

  const request: ChampionshipChallengeRequest = {
    id: `chal_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    kind: input.kind,
    titleId: input.titleId,
    challengerId: input.challengerId,
    division: title.division,
    status: eligibility.eligible ? "queued" : "rejected",
    reason: eligibility.reason,
    createdAt: new Date().toISOString(),
  };

  appendChallenge(request);

  if (!eligibility.eligible) {
    return { ok: false, request, error: eligibility.reason };
  }
  return { ok: true, request };
}

export function getChallengeQueue(): ChampionshipChallengeRequest[] {
  return loadChallengeQueue();
}

export function getChallengesForPerformer(
  performerId: string,
): ChampionshipChallengeRequest[] {
  return listChallengesForChallenger(performerId);
}

/** Reset seed (tests / hot reload). */
export function resetChampionshipRegistryForTests(): void {
  _titles = null;
}
