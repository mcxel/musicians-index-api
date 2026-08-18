/**
 * Interior and exterior are environment shards of the same event.
 * Portals must not restart show, media, tickets, or seat identity.
 * Geometry remains MISSING — this is policy, not a walkable mesh.
 */

import type { GeometryProvenance, VenueEnvironmentSlot } from "@/lib/venues/VenuePlatformContract";

export const VENUE_PORTAL_LAWS = {
  sameEvent: "Plaza, concourse, auditorium, lounge, backstage, and outdoor share one eventId.",
  noRestart: "Crossing a portal must not restart the show clock, media transport, or ticket state.",
  seatPersist: "Seat and occupancy-zone identity persist unless a committed migration succeeds.",
  skinsCosmetic: "A skin never relocates a portal, seat ID, or collision volume.",
} as const;

export type VenuePortalDefinition = {
  id: string;
  fromEnvironmentId: VenueEnvironmentSlot["kind"];
  toEnvironmentId: VenueEnvironmentSlot["kind"];
  preservesShowAuthority: true;
  preservesMediaTransport: true;
  geometryStatus: GeometryProvenance;
};

export const DEFAULT_CAMPUS_PORTALS: VenuePortalDefinition[] = [
  {
    id: "plaza-to-concourse",
    fromEnvironmentId: "exterior",
    toEnvironmentId: "concourse",
    preservesShowAuthority: true,
    preservesMediaTransport: true,
    geometryStatus: "MISSING",
  },
  {
    id: "concourse-to-auditorium",
    fromEnvironmentId: "concourse",
    toEnvironmentId: "auditorium",
    preservesShowAuthority: true,
    preservesMediaTransport: true,
    geometryStatus: "MISSING",
  },
  {
    id: "auditorium-to-lounge",
    fromEnvironmentId: "auditorium",
    toEnvironmentId: "lounge",
    preservesShowAuthority: true,
    preservesMediaTransport: true,
    geometryStatus: "MISSING",
  },
  {
    id: "auditorium-to-backstage",
    fromEnvironmentId: "auditorium",
    toEnvironmentId: "backstage",
    preservesShowAuthority: true,
    preservesMediaTransport: true,
    geometryStatus: "MISSING",
  },
];
