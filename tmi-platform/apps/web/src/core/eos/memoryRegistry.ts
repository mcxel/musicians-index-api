/**
 * EOS Phase 7 — Memory Registry (competition / runtime event taxonomy)
 *
 * Canonical schema for platform events recorded in the Memory Ledger.
 * The MemoryLedger records facts; the HighlightEngine assigns importance.
 *
 * NOT the Memory Wall scrapbook. Photo/ticket/YoPho collectibles use
 * `MemoryCollectibleKind` in lib/memory/collectiblesContracts.ts.
 * Playlist / tip / follower kinds here feed Achievement/history — never
 * auto-insert into MemoryCollectible rows.
 *
 * Builds on top of types/memory.ts (MemoryItem, MemoryItemKind) — does NOT
 * replace those UI types. This layer adds EOS-specific event contracts.
 */

// ─── Event kind taxonomy ──────────────────────────────────────────────────────

/** All platform events that can be recorded in the Memory Ledger. */
export type MemoryEventKind =
  // Competition
  | "MATCH_STARTED"
  | "MATCH_COMPLETED"
  | "WINNER_DECLARED"
  | "FIRST_PLACE"
  | "SECOND_PLACE"
  | "ROUND_COMPLETED"
  | "NEW_RECORD"
  | "PERFECT_SCORE"
  | "HIGHEST_BOO_METER"
  // Live events
  | "ROOM_CREATED"
  | "ROOM_JOINED"
  | "CONCERT_COMPLETED"
  | "LISTENING_PARTY_HOSTED"
  | "FIRST_PERFORMANCE"
  // Music / playlists
  | "PLAYLIST_CREATED"
  | "PLAYLIST_SHARED"
  | "ALBUM_RELEASED"
  // Social milestones
  | "NEW_FOLLOWER"
  | "BAND_CREATED"
  | "TIP_RECEIVED"
  | "TICKET_SOLD"
  // Platform milestones
  | "TOP_100_REACHED"
  | "MONTHLY_IDOL_CHAMPION"
  | "SOLD_OUT_CONCERT"
  | "VIRAL_PLAYLIST";

// ─── Importance tiers ─────────────────────────────────────────────────────────

/** Four-tier editorial importance assigned by HighlightEngine. */
export type MemoryImportance = "NORMAL" | "IMPORTANT" | "FEATURED" | "LEGENDARY";

// ─── Core interfaces ──────────────────────────────────────────────────────────

/**
 * Canonical structure for every event appended to the ledger.
 * Facts only — no editorial weight. HighlightEngine adds that.
 */
export interface LedgerEntry {
  /** Unique id — callers must supply (use crypto.randomUUID()). */
  readonly id: string;
  readonly kind: MemoryEventKind;
  /** UserId of the primary actor (performer, fan, band, etc.). */
  readonly actorId: string;
  /** ExperienceRegistry id of the room where the event occurred, if applicable. */
  readonly roomId?: string;
  readonly experienceId?: string;
  /** Optional free-form context (score, rank, participantIds, etc.). */
  readonly payload?: Record<string, unknown>;
  readonly occurredAtMs: number;
}

/**
 * A promoted LedgerEntry after HighlightEngine scoring.
 * Feeds Achievement/history adapters, Auto-Director idle cards, and Discovery.
 * Does NOT write into Memory & Collectibles (photo wall) tables.
 */
export interface MemoryHighlight {
  readonly entry: LedgerEntry;
  readonly importance: MemoryImportance;
  /** Display-ready label, e.g. "Won Monthly Idol". */
  readonly label: string;
  /** Emoji prefix for timeline rendering. */
  readonly icon: string;
}

// ─── Promotion rule sets (referenced by HighlightEngine) ──────────────────────

/** Kinds that auto-promote to LEGENDARY. */
export const LEGENDARY_KINDS: ReadonlySet<MemoryEventKind> = new Set<MemoryEventKind>([
  "MONTHLY_IDOL_CHAMPION",
  "SOLD_OUT_CONCERT",
  "VIRAL_PLAYLIST",
  "NEW_RECORD",
  "PERFECT_SCORE",
]);

/** Kinds that resolve to FEATURED (unless already LEGENDARY). */
export const FEATURED_KINDS: ReadonlySet<MemoryEventKind> = new Set<MemoryEventKind>([
  "FIRST_PLACE",
  "WINNER_DECLARED",
  "TOP_100_REACHED",
  "FIRST_PERFORMANCE",
  "ALBUM_RELEASED",
  "BAND_CREATED",
  "LISTENING_PARTY_HOSTED",
  "CONCERT_COMPLETED",
]);

/** Kinds that resolve to IMPORTANT (unless already FEATURED/LEGENDARY). */
export const IMPORTANT_KINDS: ReadonlySet<MemoryEventKind> = new Set<MemoryEventKind>([
  "MATCH_COMPLETED",
  "SECOND_PLACE",
  "HIGHEST_BOO_METER",
  "PLAYLIST_CREATED",
  "PLAYLIST_SHARED",
  "NEW_FOLLOWER",
  "TIP_RECEIVED",
  "TICKET_SOLD",
]);

// ─── Display copy ─────────────────────────────────────────────────────────────

export const MEMORY_LABELS: Readonly<Record<MemoryEventKind, string>> = {
  MATCH_STARTED:          "Match started",
  MATCH_COMPLETED:        "Match completed",
  WINNER_DECLARED:        "Winner declared",
  FIRST_PLACE:            "First place finish",
  SECOND_PLACE:           "Runner-up finish",
  ROUND_COMPLETED:        "Round completed",
  NEW_RECORD:             "New personal record",
  PERFECT_SCORE:          "Perfect score",
  HIGHEST_BOO_METER:      "Highest Boo Meter",
  ROOM_CREATED:           "Room created",
  ROOM_JOINED:            "Room joined",
  CONCERT_COMPLETED:      "Concert completed",
  LISTENING_PARTY_HOSTED: "Listening Party hosted",
  FIRST_PERFORMANCE:      "First performance",
  PLAYLIST_CREATED:       "Playlist created",
  PLAYLIST_SHARED:        "Playlist shared",
  ALBUM_RELEASED:         "Album released",
  NEW_FOLLOWER:           "New follower",
  BAND_CREATED:           "Band formed",
  TIP_RECEIVED:           "Tip received",
  TICKET_SOLD:            "Ticket sold",
  TOP_100_REACHED:        "Reached Top 100",
  MONTHLY_IDOL_CHAMPION:  "Monthly Idol champion",
  SOLD_OUT_CONCERT:       "Sold-out concert",
  VIRAL_PLAYLIST:         "Viral playlist",
};

export const MEMORY_ICONS: Readonly<Record<MemoryEventKind, string>> = {
  MATCH_STARTED:          "⚡",
  MATCH_COMPLETED:        "✅",
  WINNER_DECLARED:        "🥇",
  FIRST_PLACE:            "🏆",
  SECOND_PLACE:           "🥈",
  ROUND_COMPLETED:        "🔔",
  NEW_RECORD:             "📈",
  PERFECT_SCORE:          "💯",
  HIGHEST_BOO_METER:      "💥",
  ROOM_CREATED:           "🎤",
  ROOM_JOINED:            "🚪",
  CONCERT_COMPLETED:      "🎵",
  LISTENING_PARTY_HOSTED: "🎧",
  FIRST_PERFORMANCE:      "⭐",
  PLAYLIST_CREATED:       "🎶",
  PLAYLIST_SHARED:        "📤",
  ALBUM_RELEASED:         "💿",
  NEW_FOLLOWER:           "👥",
  BAND_CREATED:           "🎸",
  TIP_RECEIVED:           "💰",
  TICKET_SOLD:            "🎟️",
  TOP_100_REACHED:        "📊",
  MONTHLY_IDOL_CHAMPION:  "👑",
  SOLD_OUT_CONCERT:       "🔥",
  VIRAL_PLAYLIST:         "🌊",
};
