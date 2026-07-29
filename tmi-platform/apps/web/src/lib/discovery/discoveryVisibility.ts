/**
 * Visibility / entitlement filter for Live Lobby Walls.
 * Public rooms only unless the viewer is authorized for friends/invite/private.
 */

import type { LiveDiscoveryRecord, LiveDiscoveryVisibility } from "./LiveDiscoveryRecord";

export interface DiscoveryViewerContext {
  /** Authenticated user id, if any */
  userId?: string | null;
  /** Uppercase role */
  role?: string | null;
  /** Friend host user ids the viewer may see */
  friendHostIds?: ReadonlySet<string> | string[];
  /** Invite room ids the viewer may enter */
  invitedRoomIds?: ReadonlySet<string> | string[];
  /** When true, staff/admin may see private_invited rail (still not fake rooms) */
  isStaff?: boolean;
}

function asSet(input?: ReadonlySet<string> | string[]): Set<string> {
  if (!input) return new Set();
  if (input instanceof Set) return input;
  return new Set(input);
}

function isAuthorizedForVisibility(
  record: LiveDiscoveryRecord,
  ctx: DiscoveryViewerContext,
): boolean {
  const visibility: LiveDiscoveryVisibility = record.visibility;
  if (visibility === "public") return true;

  const userId = ctx.userId?.trim();
  if (!userId) return false;

  // Host always sees their own room
  if (record.hostUserId && record.hostUserId === userId) return true;

  if (ctx.isStaff) return true;

  if (visibility === "friends") {
    return asSet(ctx.friendHostIds).has(record.hostUserId);
  }

  if (visibility === "invite" || visibility === "private") {
    return asSet(ctx.invitedRoomIds).has(record.roomId);
  }

  return false;
}

/**
 * Filter discovery records for the current viewer.
 * Never invents rooms — only hides unauthorized private/friends/invite tiles.
 */
export function filterDiscoverableRecords(
  records: readonly LiveDiscoveryRecord[],
  ctx: DiscoveryViewerContext = {},
): LiveDiscoveryRecord[] {
  return records.filter((r) => r.isLive && isAuthorizedForVisibility(r, ctx));
}

export function recordMatchesCategory(
  record: LiveDiscoveryRecord,
  category: string,
): boolean {
  if (record.category === category) return true;
  return record.categories.includes(category as LiveDiscoveryRecord["category"]);
}
