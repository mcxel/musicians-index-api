/**
 * Venue presence metrics — Instant Go Live honesty contract (Marcel / Rule 20).
 *
 * humanViewers / humanParticipants NEVER include support bots.
 * occupiedPositions MAY include support (seats taken for ops), but public
 * popularity, trending, votes, payouts, ad analytics, ticket attendance,
 * and fan achievements must use humanViewers only.
 */

/**
 * Canonical presence taxonomy for attendance honesty.
 * Only HUMAN counts toward humanViewers / humanParticipants / public popularity.
 */
export type PresenceKind =
  | "HUMAN"
  | "OFFICIAL_SUPPORT_BOT"
  | "AMBIENT_PRESENTATION_INSTANCE";

export interface VenuePresenceMetrics {
  /** Real humans watching — never support bots */
  humanViewers: number;
  /** Real humans participating (on stage / in queue / mic) — never support bots */
  humanParticipants: number;
  /** Labeled TMI support / technician / assistant agents currently in room */
  supportAgents: number;
  /** Human or staff moderators (not support crew) */
  moderators: number;
  /** Seats/positions occupied — may include support agents */
  occupiedPositions: number;
}

/** True only for PresenceKind.HUMAN — never support or ambient presentation. */
export function isHumanAttendance(kind: PresenceKind): boolean {
  return kind === "HUMAN";
}

/**
 * Classify a presence row from role / displayName heuristics.
 * Opaque or unlabeled support/ambient never become HUMAN.
 */
export function classifyPresenceKind(input: {
  role?: string | null;
  displayName?: string | null;
  presenceKind?: PresenceKind | null;
}): PresenceKind {
  if (input.presenceKind) return input.presenceKind;
  const role = (input.role || "").toLowerCase();
  const name = (input.displayName || "").toLowerCase();

  if (
    role === "bot" ||
    role === "support" ||
    role === "official_support_bot" ||
    name.includes("[bot]") ||
    name.startsWith("bot:") ||
    name.includes("support crew") ||
    name.includes("venue technician") ||
    name.includes("performance assistant") ||
    name.includes("environment inspector")
  ) {
    return "OFFICIAL_SUPPORT_BOT";
  }

  if (
    role === "ambient" ||
    role === "ambient_presentation_instance" ||
    name.includes("[ambient]") ||
    name.includes("presentation instance")
  ) {
    return "AMBIENT_PRESENTATION_INSTANCE";
  }

  return "HUMAN";
}

/** Count only HUMAN rows — Rule 20 attendance honesty. */
export function countHumanAttendance(
  members: Array<{ role?: string | null; displayName?: string | null; presenceKind?: PresenceKind | null }>,
): number {
  return members.filter((m) => isHumanAttendance(classifyPresenceKind(m))).length;
}

export const EMPTY_VENUE_PRESENCE_METRICS: VenuePresenceMetrics = {
  humanViewers: 0,
  humanParticipants: 0,
  supportAgents: 0,
  moderators: 0,
  occupiedPositions: 0,
};

/** Public-facing counts that must never be inflated by support bots */
export function publicPopularityCount(m: VenuePresenceMetrics): number {
  return m.humanViewers;
}

export function mergeVenuePresenceMetrics(
  base: VenuePresenceMetrics,
  patch: Partial<VenuePresenceMetrics>,
): VenuePresenceMetrics {
  return { ...base, ...patch };
}
