export type VenuePartialRescanRequest = {
  venueId: string;
  changedZones: string[];
  reason:
    | "new-furniture"
    | "new-stage"
    | "new-ad-slots"
    | "new-sponsor-placements"
    | "new-vip-seats"
    | "other";
  requestedAt: number;
};

const partialRescans: VenuePartialRescanRequest[] = [];

export function requestVenuePartialRescan(
  venueId: string,
  changedZones: string[],
  reason: VenuePartialRescanRequest["reason"],
): VenuePartialRescanRequest {
  const request: VenuePartialRescanRequest = {
    venueId,
    changedZones,
    reason,
    requestedAt: Date.now(),
  };
  partialRescans.push(request);
  return request;
}

export function listVenuePartialRescans(venueId?: string): VenuePartialRescanRequest[] {
  if (!venueId) return [...partialRescans];
  return partialRescans.filter((request) => request.venueId === venueId);
}
