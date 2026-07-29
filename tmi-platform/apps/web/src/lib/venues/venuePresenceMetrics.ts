/**
 * Venue presence metrics — Instant Go Live honesty contract (Marcel / Rule 20).
 *
 * humanViewers / humanParticipants NEVER include support bots.
 * occupiedPositions MAY include support (seats taken for ops), but public
 * popularity, trending, votes, payouts, ad analytics, ticket attendance,
 * and fan achievements must use humanViewers only.
 */

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
