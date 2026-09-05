/**
 * universalMediaPlayerWatchRoute — Lobby Wall / discovery → Universal Media Player.
 *
 * Product law (Marcel 2026-08-31): watchable experiences are seen through the
 * Universal Media Player Runtime (Command Center dual monitors / chassis),
 * not a siloed /live/rooms page as the primary viewer.
 *
 * Spatial room routes remain valid for LobbyEntryFlow seat assignment when
 * needed; primary *watch* entry for published live sessions is hub media player.
 */

export function hubPathForWatchRole(role?: string | null): "/hub/fan" | "/hub/performer" {
  const r = (role ?? "FAN").trim().toUpperCase();
  if (
    r === "PERFORMER" ||
    r === "BAND" ||
    r === "ARTIST" ||
    r === "PRODUCER" ||
    r === "ADMIN" ||
    r === "SUPERADMIN"
  ) {
    return "/hub/performer";
  }
  return "/hub/fan";
}

/** Infer discovery category from room id slug (watch binding — not rank authority). */
export function inferWatchCategoryFromRoomId(roomId: string): string {
  const s = roomId.trim().toLowerCase();
  if (!s) return "live";
  if (s.includes("lounge")) return "lounge";
  if (s.includes("battle")) return "battle";
  if (s.includes("cypher")) return "cypher";
  if (s.includes("challenge")) return "challenge";
  if (s.includes("monday") || s.includes("monday-night")) return "monday-night-stage";
  return "live";
}

/** Canonical watch href — opens hub Command Center media stack with session bound. */
export function mediaPlayerWatchHref(
  roomId: string,
  opts?: { role?: string | null; from?: string },
): string {
  const rid = roomId.trim();
  if (!rid) return "/hub/fan";
  const hub = hubPathForWatchRole(opts?.role);
  const params = new URLSearchParams();
  params.set("watch", rid);
  if (opts?.from) params.set("from", opts.from);
  return `${hub}?${params.toString()}`;
}
