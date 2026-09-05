// VenuePresenceCertificationAdapter — read-only observer over canonical engines.
// Reads from audienceRuntimeEngine only. No new sync authority, no mutation.

import { getVenueOccupancy, type AudienceMember } from "../live/audienceRuntimeEngine";

export interface PresenceCertSnapshot {
  venueSlug: string;
  capturedAt: number;
  memberCount: number;
  fanCount: number;
  performerCount: number;
  hostCount: number;
  botCount: number;
  seatedCount: number;
  members: Array<{
    userId: string;
    role: AudienceMember["role"];
    seatId: string | null;
    hasAvatar: boolean;
  }>;
}

export function capturePresenceSnapshot(venueSlug: string): PresenceCertSnapshot {
  const occ = getVenueOccupancy(venueSlug);
  return {
    venueSlug,
    capturedAt: Date.now(),
    memberCount: occ.present,
    fanCount:       occ.members.filter(m => m.role === "fan").length,
    performerCount: occ.members.filter(m => m.role === "artist").length,
    hostCount:      occ.members.filter(m => m.role === "host").length,
    botCount:       occ.members.filter(m => m.role === "bot").length,
    seatedCount:    occ.members.filter(m => m.seatId !== null).length,
    members: occ.members.map(m => ({
      userId: m.userId,
      role: m.role,
      seatId: m.seatId,
      hasAvatar: Boolean(m.avatarUrl),
    })),
  };
}

// Two-device minimum required for physical venue certification.
export function meetsPresenceMinimum(snapshot: PresenceCertSnapshot): boolean {
  const realCount = snapshot.fanCount + snapshot.performerCount + snapshot.hostCount;
  return realCount >= 2;
}
