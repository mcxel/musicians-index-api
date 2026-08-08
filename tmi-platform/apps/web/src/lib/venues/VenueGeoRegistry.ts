/**
 * VenueGeoRegistry — geo layer over VenueRegistry (Pass 8.x Venue Concierge).
 *
 * Lat/lng are static city anchors for registry venues (not GPS telemetry).
 * Vibe / heat is derived ONLY from real live-session signals — never Math.random().
 * When no live data exists: activityStatus = "NO_DATA", heatScore = null.
 */

import {
  getAllVenues,
  getVenueById,
  getVenueBySlug,
  type VenueIdentity,
} from "@/lib/venues/VenueRegistry";
import { getActiveSessions } from "@/lib/broadcast/globalLiveSessionStore";

export interface VenueGeoPoint {
  venueId: string;
  slug: string;
  lat: number;
  lng: number;
}

/** Optional origin for proximity ranking (performer profile or browser geolocation). */
export interface GeoOrigin {
  lat: number;
  lng: number;
}

export type VenueActivityStatus = "LIVE" | "NO_DATA";

export interface VenueGeoEntry {
  venue: VenueIdentity;
  lat: number;
  lng: number;
  /** km from origin when origin provided; otherwise null */
  distanceKm: number | null;
  /**
   * Heat 0–100 only when a real live session exists for this venue's roomId.
   * null = no live activity data (honest empty — Rule 20).
   */
  heatScore: number | null;
  activityStatus: VenueActivityStatus;
  liveViewerCount: number | null;
}

/** City-level anchors keyed by VenueIdentity.id — not fabricated occupancy. */
export const VENUE_GEO_POINTS: VenueGeoPoint[] = [
  { venueId: "arena-prime-v", slug: "arena-prime", lat: 40.7128, lng: -74.006 },
  { venueId: "cypher-dome-v", slug: "cypher-dome", lat: 33.749, lng: -84.388 },
  { venueId: "battle-amphitheater-v", slug: "battle-amphitheater", lat: 41.8781, lng: -87.6298 },
  { venueId: "neon-pit-v", slug: "neon-pit", lat: 34.0522, lng: -118.2437 },
  { venueId: "rnb-basement-v", slug: "rnb-basement", lat: 29.7604, lng: -95.3698 },
  { venueId: "the-underground-v", slug: "the-underground", lat: 42.3314, lng: -83.0458 },
  { venueId: "crown-duel-stage-v", slug: "crown-duel-stage", lat: 25.7617, lng: -80.1918 },
  { venueId: "jakarta-arena-v", slug: "jakarta-arena", lat: -6.2088, lng: 106.8456 },
];

const _geoById = new Map(VENUE_GEO_POINTS.map((g) => [g.venueId, g]));
const _geoBySlug = new Map(VENUE_GEO_POINTS.map((g) => [g.slug, g]));

export function getVenueGeoById(venueId: string): VenueGeoPoint | null {
  return _geoById.get(venueId) ?? null;
}

export function getVenueGeoBySlug(slug: string): VenueGeoPoint | null {
  return _geoBySlug.get(slug) ?? null;
}

/** Haversine distance in kilometers. */
export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Heat from real live session only.
 * Scales viewerCount against venue capacity when both are known; caps at 100.
 * Returns null when no live session — never invents a score.
 */
function deriveHeatFromLive(
  venue: VenueIdentity,
  viewerCount: number | undefined
): { heatScore: number | null; activityStatus: VenueActivityStatus; liveViewerCount: number | null } {
  if (viewerCount === undefined) {
    return { heatScore: null, activityStatus: "NO_DATA", liveViewerCount: null };
  }
  const cap = Math.max(1, venue.capacity);
  const heatScore = Math.min(100, Math.round((viewerCount / cap) * 100));
  return { heatScore, activityStatus: "LIVE", liveViewerCount: viewerCount };
}

function enrichVenue(
  venue: VenueIdentity,
  geo: VenueGeoPoint,
  origin: GeoOrigin | null,
  liveByRoomId: Map<string, { viewerCount: number }>
): VenueGeoEntry {
  const session = liveByRoomId.get(venue.roomId);
  const heat = deriveHeatFromLive(venue, session?.viewerCount);
  const distanceKm = origin
    ? haversineKm(origin.lat, origin.lng, geo.lat, geo.lng)
    : null;
  return {
    venue,
    lat: geo.lat,
    lng: geo.lng,
    distanceKm,
    ...heat,
  };
}

/** All registry venues that have geo anchors, with honest live heat. */
export function listVenuesWithGeo(origin?: GeoOrigin | null): VenueGeoEntry[] {
  const liveSessions = getActiveSessions();
  const liveByRoomId = new Map(
    liveSessions.map((s) => [s.roomId, { viewerCount: s.viewerCount }])
  );
  const originPoint = origin ?? null;
  const entries: VenueGeoEntry[] = [];

  for (const geo of VENUE_GEO_POINTS) {
    const venue = getVenueById(geo.venueId) ?? getVenueBySlug(geo.slug);
    if (!venue) continue;
    entries.push(enrichVenue(venue, geo, originPoint, liveByRoomId));
  }

  if (originPoint) {
    entries.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
  } else {
    entries.sort((a, b) => a.venue.name.localeCompare(b.venue.name));
  }

  return entries;
}

/**
 * Venues within radiusKm of origin.
 * If origin is missing, returns all geo venues unsorted by distance (honest fallback).
 */
export function getVenuesNear(
  lat: number | null | undefined,
  lng: number | null | undefined,
  radiusKm = 500
): VenueGeoEntry[] {
  const hasOrigin =
    typeof lat === "number" &&
    typeof lng === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng);

  if (!hasOrigin) {
    return listVenuesWithGeo(null);
  }

  const origin: GeoOrigin = { lat: lat!, lng: lng! };
  return listVenuesWithGeo(origin).filter(
    (e) => e.distanceKm !== null && e.distanceKm <= radiusKm
  );
}

/** Convenience: geo + identity for a single venue. */
export function getVenueGeoEntry(
  venueIdOrSlug: string,
  origin?: GeoOrigin | null
): VenueGeoEntry | null {
  const venue =
    getVenueById(venueIdOrSlug) ?? getVenueBySlug(venueIdOrSlug) ?? null;
  if (!venue) return null;
  const geo = getVenueGeoById(venue.id) ?? getVenueGeoBySlug(venue.slug);
  if (!geo) return null;
  const liveSessions = getActiveSessions();
  const liveByRoomId = new Map(
    liveSessions.map((s) => [s.roomId, { viewerCount: s.viewerCount }])
  );
  return enrichVenue(venue, geo, origin ?? null, liveByRoomId);
}

/** Registry venues that still lack geo — for honest UI notes. */
export function listVenuesMissingGeo(): VenueIdentity[] {
  return getAllVenues().filter(
    (v) => !getVenueGeoById(v.id) && !getVenueGeoBySlug(v.slug)
  );
}
