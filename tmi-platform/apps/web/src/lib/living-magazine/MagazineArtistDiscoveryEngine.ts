// MagazineArtistDiscoveryEngine
// Manages the discovery lane within each issue.
// Plugs in to discovery-rotation system to pick which artists appear in discovery spreads.

import type { DiscoveryArtist } from "../discovery-rotation/types";
import { buildRotation } from "./MagazineContentRotationEngine";
import { markSeen } from "../discovery-rotation/VisitExclusionEngine";
import { recordArtistSeen } from "../discovery-rotation/ReaderHistoryEngine";
import { recordSurfaced } from "../discovery-rotation/PlacementFloorEngine";

export interface DiscoveryLane {
  issueId: string;
  earlySlots: DiscoveryArtist[];
  midSlots: DiscoveryArtist[];
  lateSlots: DiscoveryArtist[];
  floorGuaranteed: DiscoveryArtist[];
  totalDiscoverySlots: number;
}

export function buildDiscoveryLane(
  issueId: string,
  allArtists: DiscoveryArtist[],
): DiscoveryLane {
  const rotation = buildRotation(allArtists, 10, 20, 10);

  const totalDiscoverySlots =
    rotation.earlyZoneArtists.length +
    rotation.midZoneArtists.length +
    rotation.lateZoneArtists.length;

  return {
    issueId,
    earlySlots: rotation.earlyZoneArtists,
    midSlots: rotation.midZoneArtists,
    lateSlots: rotation.lateZoneArtists,
    floorGuaranteed: rotation.floorGuaranteed,
    totalDiscoverySlots,
  };
}

export function recordDiscoveryView(
  visitId: string,
  readerId: string,
  artistId: string,
  issueNumber: number,
): void {
  markSeen(visitId, artistId);
  recordArtistSeen(readerId, artistId);
  recordSurfaced(artistId, issueNumber);
}

export function getAllDiscoveryArtists(lane: DiscoveryLane): DiscoveryArtist[] {
  const seenIds = new Set<string>();
  const result: DiscoveryArtist[] = [];
  for (const a of [
    ...lane.earlySlots,
    ...lane.midSlots,
    ...lane.lateSlots,
    ...lane.floorGuaranteed,
  ]) {
    if (!seenIds.has(a.id)) {
      seenIds.add(a.id);
      result.push(a);
    }
  }
  return result;
}
