import type { VenueMeshAddress } from "@/lib/venues/VenuePlatformContract";

export function formatVenueMeshAddress(addr: VenueMeshAddress): string {
  const parts = [
    addr.eventId,
    addr.meshId,
    addr.environmentId,
    addr.clusterId,
    addr.auditoriumId,
    addr.sectionId,
    addr.rowId,
    addr.seatId ?? addr.occupancyZoneId,
  ].filter((p): p is string => Boolean(p && p.length > 0));
  return parts.join(":");
}

export function parseVenueMeshAddress(key: string): VenueMeshAddress | null {
  const parts = key.split(":").filter(Boolean);
  if (parts.length < 3) return null;
  return {
    eventId: parts[0],
    meshId: parts[1],
    environmentId: parts[2],
    clusterId: parts[3],
    auditoriumId: parts[4],
    sectionId: parts[5],
    rowId: parts[6],
    seatId: parts[7],
  };
}

export function auditoriumMeshAddress(input: {
  eventId: string;
  venueType: string;
  clusterId: string;
  auditoriumIndex: number;
}): VenueMeshAddress {
  const auditoriumId = `A${String(input.auditoriumIndex).padStart(2, "0")}`;
  return {
    eventId: input.eventId,
    meshId: `${input.venueType}-mesh`,
    environmentId: "auditorium",
    clusterId: input.clusterId,
    auditoriumId,
  };
}

/** Globally unique seat key — never a bare "Seat 12". */
export function formatMeshSeatId(addr: VenueMeshAddress): string {
  return formatVenueMeshAddress(addr);
}
