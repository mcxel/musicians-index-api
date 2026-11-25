/**
 * BeatLockerTitleAuthority — unique active normalized title law.
 * Title uniqueness ≠ audio fingerprint dedup (both required).
 * Extends existing Beat Locker — not a second catalog.
 */

/**
 * Server-authoritative Beat Locker title key.
 * Does NOT mutate creator displayTitle — callers keep display separately.
 * Scope: GLOBAL_ACTIVE_BEAT_LOCKER only (not YoPho/magazine/room/username).
 */
export function normalizeBeatTitle(raw: string): string {
  return raw
    .normalize("NFKC")
    .trim()
    .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035']/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036"]/g, '"')
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2015\u2212-]/g, "-")
    .replace(/[^\p{L}\p{N}\s'-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export const BEAT_TITLE_UNIQUENESS_SCOPE = "GLOBAL_ACTIVE_BEAT_LOCKER" as const;

export type TitleConflictCode = "TITLE_CONFLICT";

export function titleConflictPayload(input: {
  displayTitle: string;
  normalizedTitle: string;
  conflictListingId: string;
}): {
  ok: false;
  code: TitleConflictCode;
  error: "TITLE_CONFLICT";
  displayTitle: string;
  normalizedTitle: string;
  conflictListingId: string;
  message: string;
} {
  return {
    ok: false,
    code: "TITLE_CONFLICT",
    error: "TITLE_CONFLICT",
    displayTitle: input.displayTitle,
    normalizedTitle: input.normalizedTitle,
    conflictListingId: input.conflictListingId,
    message: "An ACTIVE Beat Locker listing already owns this normalized title. Choose a different title.",
  };
}

export type BeatTitleReservationStatus =
  | "AVAILABLE"
  | "IN_USE"
  | "RESERVED_PROCESSING"
  | "INVALID";

export interface BeatTitleCheckResult {
  displayTitle: string;
  normalizedTitle: string;
  status: BeatTitleReservationStatus;
  conflictLockerEntryId?: string;
  message?: string;
}

const ACTIVE_TITLE_STATUSES = new Set([
  "RESERVED",
  "PROCESSING",
  "QUARANTINED",
  "RIGHTS_PENDING",
  "APPROVED",
  "QUEUED",
  "AVAILABLE",
  "SCHEDULED",
  "ACTIVE",
  "LIVE",
  "FEATURED",
  "SANDBOX",
  "published",
  "PUBLISHED",
]);

/** In-memory reservation map for concurrent client-side checks; DB is final authority. */
const localReservations = new Map<string, { lockerEntryId: string; expiresAt: number }>();

export function isActiveBeatStatus(status: string | null | undefined): boolean {
  if (!status) return true;
  return ACTIVE_TITLE_STATUSES.has(status) || ACTIVE_TITLE_STATUSES.has(status.toUpperCase());
}

export function checkBeatTitleLocally(
  title: string,
  existing: Array<{ id: string; title: string; status?: string | null }>,
): BeatTitleCheckResult {
  const displayTitle = title.trim().replace(/\s+/g, " ");
  const normalizedTitle = normalizeBeatTitle(displayTitle);
  if (!normalizedTitle) {
    return { displayTitle, normalizedTitle, status: "INVALID", message: "Title is required." };
  }

  const local = localReservations.get(normalizedTitle);
  if (local && local.expiresAt > Date.now()) {
    return {
      displayTitle,
      normalizedTitle,
      status: "RESERVED_PROCESSING",
      conflictLockerEntryId: local.lockerEntryId,
      message: "That title is reserved while another submission processes. Choose another title.",
    };
  }

  const hit = existing.find(
    (b) => normalizeBeatTitle(b.title) === normalizedTitle && isActiveBeatStatus(b.status),
  );
  if (hit) {
    return {
      displayTitle,
      normalizedTitle,
      status: "IN_USE",
      conflictLockerEntryId: hit.id,
      message: "That title is already in the Beat Locker. Choose another title.",
    };
  }

  return { displayTitle, normalizedTitle, status: "AVAILABLE" };
}

export function reserveBeatTitleLocally(normalizedTitle: string, lockerEntryId: string, ttlMs = 120_000): void {
  localReservations.set(normalizedTitle, { lockerEntryId, expiresAt: Date.now() + ttlMs });
}

export function releaseBeatTitleLocally(normalizedTitle: string): void {
  localReservations.delete(normalizedTitle);
}
