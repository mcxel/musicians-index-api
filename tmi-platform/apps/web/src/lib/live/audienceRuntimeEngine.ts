// AudienceRuntimeEngine — audience tracking, venue occupancy, presence

export type AudienceMember = {
  userId: string;
  displayName: string;
  role: "fan" | "artist" | "host" | "bot";
  joinedAt: number;
  seatId: string | null;
  active: boolean;
};

export type VenueOccupancy = {
  venueSlug: string;
  capacity: number;
  present: number;
  members: AudienceMember[];
  peakPresent: number;
};

const occupancyRegistry = new Map<string, VenueOccupancy>();

const DEFAULT_CAPACITY = 10000;

export function getVenueOccupancy(venueSlug: string): VenueOccupancy {
  if (!occupancyRegistry.has(venueSlug)) {
    occupancyRegistry.set(venueSlug, {
      venueSlug,
      capacity: DEFAULT_CAPACITY,
      present: 0,
      members: [],
      peakPresent: 0,
    });
  }
  return occupancyRegistry.get(venueSlug)!;
}

export function joinAudience(venueSlug: string, member: Omit<AudienceMember, "joinedAt" | "active">): VenueOccupancy {
  const occ = getVenueOccupancy(venueSlug);
  const existing = occ.members.find((m) => m.userId === member.userId);
  if (existing) {
    existing.active = true;
    return occ;
  }
  occ.members.push({ ...member, joinedAt: Date.now(), active: true });
  occ.present = occ.members.filter((m) => m.active).length;
  occ.peakPresent = Math.max(occ.peakPresent, occ.present);
  return occ;
}

export function leaveAudience(venueSlug: string, userId: string): VenueOccupancy {
  const occ = getVenueOccupancy(venueSlug);
  const member = occ.members.find((m) => m.userId === userId);
  if (member) {
    member.active = false;
  }
  occ.present = occ.members.filter((m) => m.active).length;
  return occ;
}

export function getAudienceSnapshot(venueSlug: string) {
  const occ = getVenueOccupancy(venueSlug);
  return {
    venueSlug: occ.venueSlug,
    present: occ.present,
    capacity: occ.capacity,
    peakPresent: occ.peakPresent,
    occupancyPct: Math.round((occ.present / occ.capacity) * 100),
    activeMembers: occ.members.filter((m) => m.active).slice(0, 100),
  };
}

export function listAllOccupancies(): VenueOccupancy[] {
  return Array.from(occupancyRegistry.values());
}
