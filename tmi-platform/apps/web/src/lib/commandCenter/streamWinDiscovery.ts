/**
 * Stream & Win discovery filter — canonical GlobalLiveSessionRegistry / DiscoveryBus only.
 */

import type { LiveDiscoveryRecord } from "@/lib/discovery/LiveDiscoveryRecord";

export function isStreamWinDiscoveryRecord(r: LiveDiscoveryRecord): boolean {
  const id = r.roomId.toLowerCase();
  const title = r.title.toLowerCase();
  return (
    r.category === "listening" ||
    r.categories.includes("listening") ||
    id.includes("stream-win") ||
    id.includes("lounge-playlist") ||
    id.includes("playlist-lounge") ||
    title.includes("stream & win") ||
    title.includes("stream and win")
  );
}

export function filterStreamWinDiscoveryRecords(
  records: LiveDiscoveryRecord[],
): LiveDiscoveryRecord[] {
  return records.filter(isStreamWinDiscoveryRecord);
}
