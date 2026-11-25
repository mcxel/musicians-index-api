/**
 * SystemRoomIds — the VERIFIED set of permanent TMI system rooms, read from their canonical code
 * registries (provenance = defined in TMI source, not inferred from a database row):
 *   - Anchor rooms: lib/live/AnchorRoomNetwork.ts ANCHOR_ROOM_DEFS (roomId "anchor-…")
 *   - Genre lobbies (fan + performer): lib/live/CanonicalGenreRegistry.ts listGenreRoomDefinitions()
 * Owner decision 2026-11-19: these are OFFICIAL (TMI-owned, staff-run, no bot owner). Overflow rooms are
 * registered OFFICIAL at creation by ElasticRoomOrchestrator.
 */

import { ANCHOR_ROOM_DEFS } from "@/lib/live/AnchorRoomNetwork";
import { listGenreRoomDefinitions } from "@/lib/live/CanonicalGenreRegistry";

let cache: ReadonlySet<string> | null = null;

export function canonicalSystemRoomIds(): ReadonlySet<string> {
  if (!cache) cache = new Set([...ANCHOR_ROOM_DEFS.map((d) => d.roomId), ...listGenreRoomDefinitions().map((d) => d.roomId)]);
  return cache;
}

export const isCanonicalSystemRoomId = (roomId: string) => canonicalSystemRoomIds().has(roomId);
