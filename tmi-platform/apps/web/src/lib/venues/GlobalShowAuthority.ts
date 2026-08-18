/**
 * One show clock per event. Shard occupancy is local.
 * Remote LOD / aggregated reactions are NOT_BUILT — do not fake them.
 */

import { getActiveSessions, type LiveSession } from "@/lib/broadcast/globalLiveSessionStore";
import { getOverflowBySlug } from "@/lib/live/ElasticRoomOrchestrator";
import { isAnchorSlug } from "@/lib/live/AnchorRoomRegistry";

export const GLOBAL_SHOW_AUTHORITY_LAWS = {
  oneClock: "Every auditorium shard of an event follows the same show authority.",
  portal: "Changing interior/exterior environment must not restart media or the show clock.",
  localPresence: "Seat presence, RTC, and collision stay shard-local.",
  remoteLod: "Remote shards render aggregated reactions / LOD — NOT_BUILT.",
} as const;

export type GlobalShowAuthoritySnapshot = {
  eventId: string;
  parentRoomId: string;
  shardRoomId: string;
  startedAt: number | null;
  stageState: LiveSession["stageState"] | null;
  hostUserId: string | null;
  remoteLod: "NOT_BUILT";
  portalsPreserveShow: true;
};

export function eventIdForRoom(roomId: string): string {
  const overflow = getOverflowBySlug(roomId);
  const parent = overflow?.parentAnchorSlug ?? roomId;
  return overflow?.meshAddress?.eventId ?? `event-${parent}`;
}

export function getGlobalShowAuthority(roomId: string): GlobalShowAuthoritySnapshot {
  const overflow = getOverflowBySlug(roomId);
  const parentRoomId = overflow?.parentAnchorSlug ?? roomId;
  const sessions = getActiveSessions();
  const session =
    sessions.find((s) => s.roomId === roomId) ??
    sessions.find((s) => s.roomId === parentRoomId) ??
    null;

  return {
    eventId: eventIdForRoom(roomId),
    parentRoomId,
    shardRoomId: roomId,
    startedAt: session?.startedAt ?? null,
    stageState: session?.stageState ?? null,
    hostUserId: session?.userId ?? null,
    remoteLod: "NOT_BUILT",
    portalsPreserveShow: true,
  };
}

export function isPermanentShowAnchor(roomId: string): boolean {
  return isAnchorSlug(roomId);
}
