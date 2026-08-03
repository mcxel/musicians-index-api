/**
 * ChampionshipTitle — canonical competitive asset types (Phase 2B).
 * Crowns / belts / trophies share one registry surface.
 * Rule 20: never invent win records or live holders without a real source.
 */

export type ChampionshipAssetType = "CROWN" | "BELT" | "TROPHY";

export type GeographicTier = "CITY" | "STATE" | "COUNTRY" | "GLOBAL";

export type ChampionshipStatus =
  | "ACTIVE"
  | "VACANT"
  | "INTERIM"
  | "FROZEN"
  | "RETIRED";

export type ChampionshipChallengeKind =
  | "REQUEST_CROWN_CHALLENGE"
  | "REQUEST_BELT_CHALLENGE";

export interface ChampionshipLineageEntry {
  holderId: string;
  from: string; // ISO
  to?: string; // ISO — open-ended when current
}

export interface ChampionshipTitle {
  id: string;
  assetType: ChampionshipAssetType;
  geographicTier: GeographicTier;
  /** Genre / discipline / division label (e.g. Hip-Hop, Overall, Battle). */
  category: string;
  division: string;
  label: string;
  currentHolderId: string | null;
  status: ChampionshipStatus;
  /** ISO deadline by which holder must defend or title warns/vacates. */
  defenseDeadline: string | null;
  successfulDefenses: number;
  lineage: ChampionshipLineageEntry[];
  /** Source engine this title inherits from (audit trail). */
  source:
    | "PerformerRegistry.crown"
    | "ChampionshipYearlyEngine"
    | "TrophyEngine"
    | "seed_vacant";
}

export interface ChampionshipDefenseConfig {
  /** Days until warning status signal for crowns. */
  crownWarningDays: number;
  /** Days until vacant for crowns. */
  crownVacantDays: number;
  /** Days until warning for belts. */
  beltWarningDays: number;
  /** Days until vacant for belts. */
  beltVacantDays: number;
  /** Trophy hold window (informational; trophies are typically permanent awards). */
  trophyWarningDays: number;
  trophyVacantDays: number;
}

/** Anti-hoarding windows — crowns short, belts longer. */
export const CHAMPIONSHIP_DEFENSE_CONFIG: ChampionshipDefenseConfig = {
  crownWarningDays: 7,
  crownVacantDays: 14,
  beltWarningDays: 30,
  beltVacantDays: 60,
  trophyWarningDays: 90,
  trophyVacantDays: 180,
};

export type ChallengeQueueStatus =
  | "queued"
  | "eligible"
  | "rejected"
  | "fulfilled";

export interface ChampionshipChallengeRequest {
  id: string;
  kind: ChampionshipChallengeKind;
  titleId: string;
  challengerId: string;
  division: string;
  status: ChallengeQueueStatus;
  reason?: string;
  createdAt: string;
}

export interface ChallengeEligibilityResult {
  eligible: boolean;
  reason: string;
  /** Honest: only true when a verified win ledger entry exists. */
  hasVerifiedWins: boolean;
}
