/**
 * EOS Layer 6 — Relationship Graph contracts (registry-first).
 *
 * Schema only: kinds, edges, presence states, entity refs.
 * Does NOT fabricate friends, online lists, or viewer counts (Rule 20).
 * Does NOT replace Prisma Follow/Friendship/FanClub or lib/social/* engines
 * (Rule 8) — those remain the persistence / product sources when wired.
 *
 * Role matrix lives in RelationshipRegistry (Rule 26 aware).
 */

// ─── Entity roles (platform + relationship specialties) ───────────────────────

/**
 * Roles that can appear on either end of a RelationshipEdge.
 * Aligns with Rule 26 provisioning + Prisma Role / PerformerType specialties.
 * DJ / PRODUCER / MANAGER / HOST are relationship specialties, not always
 * separate account types.
 */
export type RelationshipEntityRole =
  | "FAN"
  | "PERFORMER"
  | "BAND"
  | "VENUE"
  | "PROMOTER"
  | "SPONSOR"
  | "ADVERTISER"
  | "WRITER"
  | "JUDGE"
  | "ADMIN"
  | "STAFF"
  | "DJ"
  | "PRODUCER"
  | "HOST"
  | "MANAGER"
  | "USER";

/** Lightweight identity ref — never invent display names or avatars here. */
export interface RelationshipEntityRef {
  userId: string;
  role: RelationshipEntityRole;
}

// ─── Relationship kinds ───────────────────────────────────────────────────────

/**
 * Canonical edge kinds for the EOS relationship graph.
 * Product APIs (Follow, Friendship, FanClub) map into these when bridged.
 */
export type RelationshipKind =
  | "FOLLOW"
  | "FRIEND"
  | "FAN_CLUB"
  | "BLOCK"
  | "BAND_MEMBER"
  | "PRODUCER"
  | "DJ"
  | "VENUE_HOST"
  | "PLAYLIST_COLLABORATOR"
  | "MODERATOR"
  | "JUDGE"
  | "MANAGER"
  | "COLLABORATES_WITH"
  | "INVITED_BY"
  | "SPONSOR_OF"
  | "MENTOR";

export type RelationshipEdgeStatus =
  | "PENDING"
  | "ACTIVE"
  | "DECLINED"
  | "REVOKED";

/**
 * Directed graph edge. from → to semantics depend on kind
 * (e.g. FOLLOW: from follows to; BLOCK: from blocks to; FRIEND: mutual when
 * both ACTIVE edges exist or status encodes acceptance).
 */
export interface RelationshipEdge {
  id: string;
  kind: RelationshipKind;
  from: RelationshipEntityRef;
  to: RelationshipEntityRef;
  status: RelationshipEdgeStatus;
  createdAtMs: number;
  updatedAtMs?: number;
  /** Optional free-form context (bandId, fanClubId, playlistId) — never fake counts. */
  meta?: Record<string, unknown>;
}

// ─── Presence (schema only) ───────────────────────────────────────────────────

/**
 * EOS presence vocabulary for social / Auto-Director surfaces.
 * Distinct from lib/social/PresenceEngine's coarser online|away|offline —
 * PresenceCatalog maps existing sources into this enum (or OFFLINE honestly).
 */
export type EosPresenceState =
  | "ONLINE"
  | "BUSY"
  | "WATCHING"
  | "PERFORMING"
  | "IN_LOBBY"
  | "IN_BATTLE"
  | "IN_LISTENING_PARTY"
  | "IN_WDP"
  | "OFFLINE";

export interface EosPresenceSnapshot {
  userId: string;
  state: EosPresenceState;
  /** Room / experience id when known from a real presence source */
  roomId?: string;
  experienceId?: string;
  /** Last observed update; omit when defaulting to OFFLINE with no source */
  updatedAtMs?: number;
  /** Which adapter produced this row — for debugging honesty */
  source: "social_presence" | "audience_entity" | "room_session" | "default_offline";
}
