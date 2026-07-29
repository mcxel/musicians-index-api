/**
 * Achievement Collectibles — Fan + Performer parallel (PROGRESSION)
 *
 * LOCKED three-area model (do not collapse into photo Collections):
 *   1. Memory Wall / Collections (MEDIA) — photos, motion, YoPho, ticket keepsakes
 *   2. Achievements / Showcase Collectibles (PROGRESSION) — THIS FILE
 *   3. Analytics (STATS) — roleAnalyticsContracts
 *
 * Marcel: profile Collections hub may tab to Achievement showcase — never stuff
 * belts/wins into the photo MotionGrid.
 *
 * Rule 26: Fans and Performers get parallel systems (same kinds, different earn paths).
 * Not a lesser fan clone of performer.
 *
 * SCAFFOLD ONLY — no fake unlocks, no fabricated Golden Ticket grants (Rule 20).
 * Earn criteria below are documented rules for a future grant engine — not counts.
 *
 * Wire: EOS MemoryLedger WINNER_DECLARED → achievementBridge → Achievement path
 * (see core/eos/achievementBridge.ts). Never → Memory Wall photos.
 */

import type { AchievementDraft } from "./achievementBridge";

// ─── Kinds ────────────────────────────────────────────────────────────────────

export type AchievementCollectibleKind =
  | "belt"
  | "trophy"
  | "badge"
  | "GOLDEN_TICKET"
  | "PLATINUM_TICKET"
  | "DIAMOND_TICKET"
  | "seasonal";

export const ACHIEVEMENT_COLLECTIBLE_KINDS: readonly AchievementCollectibleKind[] = [
  "belt",
  "trophy",
  "badge",
  "GOLDEN_TICKET",
  "PLATINUM_TICKET",
  "DIAMOND_TICKET",
  "seasonal",
] as const;

export type AchievementRolePath = "FAN" | "PERFORMER";

export type SeasonalKey =
  | "HALLOWEEN"
  | "HOLIDAY"
  | "NEW_YEAR"
  | "SUMMER"
  | "CUSTOM";

/** Documented earn rule — not a fabricated grant. */
export interface AchievementEarnCriteria {
  /** Human-readable rule for Build Director / grant engine */
  rule: string;
  /** Suggested ledger / system signal (when wired) */
  signalHints?: string[];
}

export interface AchievementCollectibleDefinition {
  id: string;
  kind: AchievementCollectibleKind;
  rolePath: AchievementRolePath;
  title: string;
  description: string;
  earnCriteria: AchievementEarnCriteria;
  seasonKey?: SeasonalKey | string;
  /** Visual asset key — presentation only; no fake inventory */
  artworkKey?: string;
}

/**
 * User-owned achievement collectible record (DTO).
 * earnedAt null/undefined = not earned — never invent a grant (Rule 20).
 */
export interface UserAchievementCollectibleRecord {
  id: string;
  userId: string;
  definitionId: string;
  kind: AchievementCollectibleKind;
  rolePath: AchievementRolePath;
  title: string;
  earnedAt?: string | null;
  featured: boolean;
  seasonKey?: string;
  sourceLedgerEntryId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/** Profile showcase pin list (contract field). */
export interface AchievementShowcaseState {
  userId: string;
  rolePath: AchievementRolePath;
  /** Definition ids pinned to profile — real owned ids only when UI wires */
  featuredCollectibleIds: string[];
  /** Honest empty when none earned */
  owned: UserAchievementCollectibleRecord[];
}

// ─── Registry — documented earn paths (no auto-grants) ───────────────────────

export const FAN_ACHIEVEMENT_DEFINITIONS: readonly AchievementCollectibleDefinition[] = [
  {
    id: "fan.badge.first_vote",
    kind: "badge",
    rolePath: "FAN",
    title: "First Vote",
    description: "Cast a real vote in a live competition room.",
    earnCriteria: {
      rule: "Award when fan casts first verified BattleVote / room vote (real DB row).",
      signalHints: ["BattleVote", "vote.cast"],
    },
  },
  {
    id: "fan.badge.attendance",
    kind: "badge",
    rolePath: "FAN",
    title: "In the Room",
    description: "Attend a live event as audience (seat or presence claim).",
    earnCriteria: {
      rule: "Award when fan has a real seat/presence claim for a completed live session.",
      signalHints: ["seat-presence", "MATCH_COMPLETED audience"],
    },
  },
  {
    id: "fan.ticket.golden",
    kind: "GOLDEN_TICKET",
    rolePath: "FAN",
    title: "Golden Participation Ticket",
    description: "Season participation milestone for fans (game shows, votes, attendance).",
    earnCriteria: {
      rule: "Award only when Fan Participation Meter / season criteria are met from real activity — never seed.",
      signalHints: ["ParticipationLedger", "season.pass"],
    },
  },
  {
    id: "fan.ticket.platinum",
    kind: "PLATINUM_TICKET",
    rolePath: "FAN",
    title: "Platinum Participation Ticket",
    description: "Higher-tier fan participation award.",
    earnCriteria: {
      rule: "Award after Golden threshold + additional verified engagement (votes, attendance, shares).",
      signalHints: ["ParticipationLedger"],
    },
  },
  {
    id: "fan.ticket.diamond",
    kind: "DIAMOND_TICKET",
    rolePath: "FAN",
    title: "Diamond Participation Ticket",
    description: "Top-tier fan participation award for the season.",
    earnCriteria: {
      rule: "Award only at season close from real ranked participation — never fabricate.",
      signalHints: ["season.close", "ParticipationLedger"],
    },
  },
  {
    id: "fan.seasonal.halloween",
    kind: "seasonal",
    rolePath: "FAN",
    title: "Halloween Fan",
    description: "Seasonal fan participation collectible.",
    seasonKey: "HALLOWEEN",
    earnCriteria: {
      rule: "FUTURE — award during Halloween window from real seasonal event participation.",
      signalHints: ["seasonal.event"],
    },
  },
] as const;

export const PERFORMER_ACHIEVEMENT_DEFINITIONS: readonly AchievementCollectibleDefinition[] =
  [
    {
      id: "performer.belt.battle_win",
      kind: "belt",
      rolePath: "PERFORMER",
      title: "Battle Belt",
      description: "Win a verified live battle.",
      earnCriteria: {
        rule: "Award when MemoryLedger WINNER_DECLARED fires for this performer with real winnerParticipantId.",
        signalHints: ["WINNER_DECLARED", "achievementBridge"],
      },
    },
    {
      id: "performer.trophy.monthly_idol",
      kind: "trophy",
      rolePath: "PERFORMER",
      title: "Monthly Idol Trophy",
      description: "Champion of Monthly Idol (official outcome).",
      earnCriteria: {
        rule: "Award on MONTHLY_IDOL_CHAMPION ledger kind from Official Automated Event result — never stub.",
        signalHints: ["MONTHLY_IDOL_CHAMPION"],
      },
    },
    {
      id: "performer.trophy.sold_out",
      kind: "trophy",
      rolePath: "PERFORMER",
      title: "Sold Out",
      description: "Performer-linked show reaches real sell-out (venue inventory exhausted).",
      earnCriteria: {
        rule: "Award when Venue/Promoter ticket inventory for the performer’s billed event hits sold-out from real ticketEngine counts.",
        signalHints: ["ticket.inventory.sold_out"],
      },
    },
    {
      id: "performer.badge.first_place",
      kind: "badge",
      rolePath: "PERFORMER",
      title: "First Place",
      description: "Finish first in a scored competition.",
      earnCriteria: {
        rule: "Award on FIRST_PLACE ledger entry with real actorId.",
        signalHints: ["FIRST_PLACE"],
      },
    },
    {
      id: "performer.ticket.golden",
      kind: "GOLDEN_TICKET",
      rolePath: "PERFORMER",
      title: "Golden Stage Ticket",
      description: "Performer season participation milestone.",
      earnCriteria: {
        rule: "Award from real season participation (shows played, not fabricated viewer counts).",
        signalHints: ["season.pass", "MATCH_COMPLETED performer"],
      },
    },
    {
      id: "performer.ticket.platinum",
      kind: "PLATINUM_TICKET",
      rolePath: "PERFORMER",
      title: "Platinum Stage Ticket",
      description: "Higher-tier performer season award.",
      earnCriteria: {
        rule: "Award after Golden + verified wins/placements from Achievement path.",
        signalHints: ["WINNER_DECLARED", "season.pass"],
      },
    },
    {
      id: "performer.ticket.diamond",
      kind: "DIAMOND_TICKET",
      rolePath: "PERFORMER",
      title: "Diamond Stage Ticket",
      description: "Top-tier performer season award.",
      earnCriteria: {
        rule: "Award only at season close from real ranked competition outcomes.",
        signalHints: ["season.close"],
      },
    },
    {
      id: "performer.seasonal.halloween",
      kind: "seasonal",
      rolePath: "PERFORMER",
      title: "Halloween Stage",
      description: "Seasonal performer participation collectible.",
      seasonKey: "HALLOWEEN",
      earnCriteria: {
        rule: "FUTURE — award during Halloween window from real seasonal stage participation.",
        signalHints: ["seasonal.event"],
      },
    },
  ] as const;

export const ALL_ACHIEVEMENT_DEFINITIONS: readonly AchievementCollectibleDefinition[] = [
  ...FAN_ACHIEVEMENT_DEFINITIONS,
  ...PERFORMER_ACHIEVEMENT_DEFINITIONS,
];

export function getAchievementDefinitionsForRole(
  rolePath: AchievementRolePath,
): readonly AchievementCollectibleDefinition[] {
  return rolePath === "FAN"
    ? FAN_ACHIEVEMENT_DEFINITIONS
    : PERFORMER_ACHIEVEMENT_DEFINITIONS;
}

export function getAchievementDefinition(
  definitionId: string,
): AchievementCollectibleDefinition | undefined {
  return ALL_ACHIEVEMENT_DEFINITIONS.find((d) => d.id === definitionId);
}

/**
 * Map AchievementDraft → candidate definition ids (suggestion only).
 * Does NOT persist or grant — grant engine is FUTURE.
 */
export function suggestDefinitionsFromDraft(
  draft: AchievementDraft,
  rolePath: AchievementRolePath = "PERFORMER",
): string[] {
  const defs = getAchievementDefinitionsForRole(rolePath);
  const hints = new Set<string>([draft.kind, ...(draft.payload?.signals as string[] | undefined) ?? []]);
  return defs
    .filter((d) =>
      (d.earnCriteria.signalHints ?? []).some((h) => hints.has(h) || draft.kind === h),
    )
    .map((d) => d.id);
}

/** Honest empty showcase — no fake owned rows. */
export function emptyAchievementShowcase(
  userId: string,
  rolePath: AchievementRolePath,
): AchievementShowcaseState {
  return {
    userId,
    rolePath,
    featuredCollectibleIds: [],
    owned: [],
  };
}
