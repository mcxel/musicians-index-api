/**
 * AnchorRoomCapacityMatrix — locked day-one room-size matrix (Marcel 2026-08-06).
 *
 * Three SEPARATE worlds (Rule 20):
 *  1. Human world — real viewers + participants + queue (never inflated)
 *  2. Platform support — Venue Support / Room Coordinators (ops only)
 *  3. VR / glasses visible scale — seat/stage footprint users see
 *
 * Prefer existing engines; where they only expose a single maxCapacity blob,
 * this matrix splits the contract honestly for Anchor Network assembly.
 *
 * Sources consulted:
 *  - LiveRoomEngine DEFAULT_CONFIG.maxCapacity (battle 500 / cypher 1000 / venue 2000 / …)
 *  - LivingRoomEngine channel capacityThreshold (battle 200 / cypher 150 / dance 150)
 *  - SeatGridEngine default generateLayout(rows=6, cols=10) → 60 seats
 *  - BotCrowdFillEngine Rule 15 hard cap ~92 ambient seats (NOT human viewers)
 *  - VenueSupportPresenceEngine light spawn (0–2 initial) — ops only
 *  - VenueGeometryEngine zone capacities (lounge/arena metaphors)
 */

export type AnchorRoomFamily =
  | "fan_lobby"
  | "battle"
  | "cypher"
  | "song_challenge"
  | "creative_challenge"
  | "playlist_lounge"
  | "conversation_lounge"
  | "dance"
  | "variety";

export type VrVenueMetaphor =
  | "avatar_lobby_grid"
  | "battle_arena_split"
  | "cypher_circle"
  | "contest_stage"
  | "playlist_lounge"
  | "conversation_lounge"
  | "dance_floor"
  | "variety_gameshow";

export interface AnchorRoomCapacity {
  family: AnchorRoomFamily;
  /** Max real humans on stage / in open-call roster / speaking */
  humanParticipantsMax: number;
  /** Max real human viewers/audience (excludes support + ambient bots) */
  humanViewersMax: number;
  /** Max human queue waiting to join/compete */
  humanQueueMax: number;
  /** Max labeled Venue Support / Room Coordinator agents (never count as viewers) */
  supportAgentsMax: number;
  /** VR/glasses visible seat/stage footprint */
  vrVisibleSeats: number;
  vrMetaphor: VrVenueMetaphor;
  vrNote: string;
  /** Code sources that informed these day-one locks */
  codeSources: readonly string[];
}

/**
 * Family defaults — day-one locks.
 * Human totals intentionally tighter than LiveRoomEngine's legacy maxCapacity
 * so overflow knobs fire before absurd single-room loads.
 */
export const ANCHOR_FAMILY_CAPACITY: Record<AnchorRoomFamily, AnchorRoomCapacity> = {
  fan_lobby: {
    family: "fan_lobby",
    humanParticipantsMax: 24,
    humanViewersMax: 80,
    humanQueueMax: 16,
    supportAgentsMax: 4,
    vrVisibleSeats: 60,
    vrMetaphor: "avatar_lobby_grid",
    vrNote: "SeatGridEngine 6×10 grid; ambient bots may fill empty seats up to Rule-15 92% but never count as humans",
    codeSources: [
      "lib/live/SeatGridEngine.ts (default 6×10=60)",
      "lib/live/LiveRoomEngine.ts venue maxCapacity 2000 (soft ceiling; day-one human cap tighter)",
      "lib/live/BotCrowdFillEngine.ts (ambient only — not humanViewers)",
    ],
  },
  battle: {
    family: "battle",
    humanParticipantsMax: 6,
    humanViewersMax: 200,
    humanQueueMax: 24,
    supportAgentsMax: 6,
    vrVisibleSeats: 60,
    vrMetaphor: "battle_arena_split",
    vrNote: "Split-stage arena; LivingRoomEngine battle-channel capacityThreshold 200 humans before shard consideration",
    codeSources: [
      "lib/live/LivingRoomEngine.ts battle-channel capacityThreshold:200",
      "lib/live/LiveRoomEngine.ts battle maxCapacity:500",
      "lib/live/SeatGridEngine.ts 6×10=60 visible seats",
    ],
  },
  cypher: {
    family: "cypher",
    humanParticipantsMax: 8,
    humanViewersMax: 150,
    humanQueueMax: 20,
    supportAgentsMax: 4,
    vrVisibleSeats: 60,
    vrMetaphor: "cypher_circle",
    vrNote: "Circle stage metaphor; LivingRoomEngine cypher-channel threshold 150",
    codeSources: [
      "lib/live/LivingRoomEngine.ts cypher-channel capacityThreshold:150",
      "lib/live/LiveRoomEngine.ts cypher maxCapacity:1000",
      "lib/live/SeatGridEngine.ts 6×10=60",
    ],
  },
  song_challenge: {
    family: "song_challenge",
    humanParticipantsMax: 2,
    humanViewersMax: 150,
    humanQueueMax: 16,
    supportAgentsMax: 4,
    vrVisibleSeats: 60,
    vrMetaphor: "contest_stage",
    vrNote: "Work-vs-work needs exactly 2 songs/artists; audience watches on contest stage",
    codeSources: [
      "lib/challenge/SongChallengeMatchEngine.ts (2 challengers)",
      "lib/live/LivingRoomEngine.ts cypher/challenge channel 150",
      "lib/live/LiveRoomEngine.ts contest maxCapacity:10000 (soft; day-one human cap 150)",
    ],
  },
  creative_challenge: {
    family: "creative_challenge",
    humanParticipantsMax: 4,
    humanViewersMax: 120,
    humanQueueMax: 16,
    supportAgentsMax: 4,
    vrVisibleSeats: 60,
    vrMetaphor: "contest_stage",
    vrNote: "Rotating creative matchups; LivingRoomEngine comedy-channel-scale 120 as day-one audience lock",
    codeSources: [
      "lib/live/LivingRoomEngine.ts comedy-channel capacityThreshold:120",
      "lib/live/SeatGridEngine.ts 6×10=60",
    ],
  },
  playlist_lounge: {
    family: "playlist_lounge",
    humanParticipantsMax: 12,
    humanViewersMax: 40,
    humanQueueMax: 8,
    supportAgentsMax: 2,
    vrVisibleSeats: 48,
    vrMetaphor: "playlist_lounge",
    vrNote: "VenueGeometryEngine club/lounge standing+bar metaphor (~40–60); intimate listening circle",
    codeSources: [
      "lib/venue/VenueGeometryEngine.ts standing-floor/bar-zone capacities",
      "lib/live/LiveRoomEngine.ts venue maxCapacity:2000 (soft)",
      "lib/venues/VenueSupportPresenceEngine.ts light 0–2 ops spawn",
    ],
  },
  conversation_lounge: {
    family: "conversation_lounge",
    humanParticipantsMax: 16,
    humanViewersMax: 32,
    humanQueueMax: 8,
    supportAgentsMax: 2,
    vrVisibleSeats: 32,
    vrMetaphor: "conversation_lounge",
    vrNote: "Open 24/7 voice/video; small ambient room — no recruit banners, no host fill",
    codeSources: [
      "lib/venues/VenueSupportPresenceEngine.ts supportAgentsMax day-one 2",
      "lib/live/SeatGridEngine.ts scaled-down visible grid 32",
    ],
  },
  dance: {
    family: "dance",
    humanParticipantsMax: 40,
    humanViewersMax: 150,
    humanQueueMax: 20,
    supportAgentsMax: 4,
    vrVisibleSeats: 80,
    vrMetaphor: "dance_floor",
    vrNote: "World Dance floor; LivingRoomEngine dance-channel threshold 150; geometry standing-floor ~200 soft",
    codeSources: [
      "lib/live/LivingRoomEngine.ts dance-channel capacityThreshold:150",
      "lib/venue/VenueGeometryEngine.ts standing-floor capacity:200",
      "lib/live/SeatGridEngine.ts / dance floor visible ~80 day-one",
    ],
  },
  variety: {
    family: "variety",
    humanParticipantsMax: 8,
    humanViewersMax: 180,
    humanQueueMax: 24,
    supportAgentsMax: 6,
    vrVisibleSeats: 60,
    vrMetaphor: "variety_gameshow",
    vrNote: "Deal or Feud / Variety gameshow stage; contestants + audience; support runs ops only",
    codeSources: [
      "lib/live/LiveRoomEngine.ts contest maxCapacity:10000 (soft)",
      "lib/live/LivingRoomEngine.ts all-genre-channel capacityThreshold:240 (overflow hint)",
      "lib/live/SeatGridEngine.ts 6×10=60",
    ],
  },
};

export function getCapacityForFamily(family: AnchorRoomFamily): AnchorRoomCapacity {
  return ANCHOR_FAMILY_CAPACITY[family];
}

/** Total human world soft-cap (participants + viewers + queue) for overflow knobs. */
export function humanWorldSoftCap(family: AnchorRoomFamily): number {
  const c = ANCHOR_FAMILY_CAPACITY[family];
  return c.humanParticipantsMax + c.humanViewersMax + c.humanQueueMax;
}

export function listCapacityMatrixRows(): AnchorRoomCapacity[] {
  return Object.values(ANCHOR_FAMILY_CAPACITY);
}
