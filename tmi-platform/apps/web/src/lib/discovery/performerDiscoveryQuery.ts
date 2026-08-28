/**
 * Performer/venue discovery query — registry-first filters for Command Center walls.
 * Boosts adjust exposure weight only; organic rank/XP untouched.
 */

import {
  PERFORMER_REGISTRY,
  type PerformerIdentity,
  type PerformerCategory,
} from "@/lib/performers/PerformerRegistry";
import {
  getAllVenues,
  type VenueIdentity,
} from "@/lib/venues/VenueRegistry";
import {
  getBookingProfile,
  listLookingForProfiles,
  type LookingForRole,
} from "@/lib/booking/BookingProfileStore";
import {
  applyDiscoveryExposureWeight,
  getActiveBoostForTarget,
} from "@/lib/discovery/DiscoveryBoostEngine";
import {
  parseCityRegion,
  resolveCityRegionPoint,
} from "@/lib/discovery/cityRegionMap";

export type DiscoveryEntityKind = "performer" | "venue";

export interface DiscoveryFilter {
  query?: string;
  genre?: string;
  category?: PerformerCategory | string;
  city?: string;
  bookableOnly?: boolean;
  liveOnly?: boolean;
  trending?: boolean;
  lookingFor?: LookingForRole;
  kind?: DiscoveryEntityKind | "all";
}

export interface DiscoveryTile {
  id: string;
  kind: DiscoveryEntityKind;
  slug: string;
  name: string;
  photoUrl: string;
  genreOrCategory: string;
  city: string;
  region: string;
  lat: number;
  lng: number;
  isLive: boolean;
  isVerified: boolean;
  bookable: boolean;
  availableTonight: boolean;
  availableThisWeekend: boolean;
  bookingStatus: "open" | "closed" | "virtual";
  profileRoute: string;
  bookRoute: string;
  messageRoute: string;
  liveRoomRoute?: string;
  promoted: boolean;
  organicScore: number;
  weightedScore: number;
  lookingFor: LookingForRole[];
  tierLabel?: string;
}

function performerOrganicScore(p: PerformerIdentity): number {
  return (p.isLive ? 1000 : 0) + (p.xp || 0) + (p.fanCount || 0) * 0.01;
}

function venueOrganicScore(v: VenueIdentity): number {
  return (v.isLive ? 1000 : 0) + (v.openTickets || 0) + (v.capacity || 0) * 0.01;
}

function toPerformerTile(p: PerformerIdentity): DiscoveryTile {
  const { city, region } = parseCityRegion(p.city);
  const point = resolveCityRegionPoint(p.city);
  const booking = getBookingProfile("performer", p.slug) ?? getBookingProfile("performer", p.id);
  const organic = performerOrganicScore(p);
  const { weighted, promoted } = applyDiscoveryExposureWeight(organic, p.slug);
  const lookingFor = booking?.lookingFor ?? [];
  let bookingStatus: DiscoveryTile["bookingStatus"] = "closed";
  if (booking?.bookMeEnabled) {
    bookingStatus = booking.virtualAvailable && !booking.availableTonight ? "virtual" : "open";
  }
  return {
    id: p.id,
    kind: "performer",
    slug: p.slug,
    name: p.name,
    photoUrl: p.profileImageUrl || "/images/tmi-placeholder.jpg",
    genreOrCategory: p.category,
    city,
    region,
    lat: point.lat,
    lng: point.lng,
    isLive: Boolean(p.isLive),
    isVerified: (p.tier !== "FREE" && p.tier !== "PRO") || (p.xp ?? 0) > 10000,
    bookable: Boolean(booking?.bookMeEnabled),
    availableTonight: Boolean(booking?.availableTonight),
    availableThisWeekend: Boolean(booking?.availableThisWeekend),
    bookingStatus,
    profileRoute: p.profileRoute || `/performers/${p.slug}`,
    bookRoute: `/booking/artists?artist=${encodeURIComponent(p.slug)}`,
    messageRoute: `/messages?to=${encodeURIComponent(p.slug)}`,
    liveRoomRoute: p.isLive ? p.liveRoomRoute : undefined,
    promoted,
    organicScore: organic,
    weightedScore: weighted,
    lookingFor,
    tierLabel: p.tier,
  };
}

function toVenueTile(v: VenueIdentity): DiscoveryTile {
  const { city, region } = parseCityRegion(v.city);
  const point = resolveCityRegionPoint(v.city);
  const booking = getBookingProfile("venue", v.slug) ?? getBookingProfile("venue", v.id);
  const organic = venueOrganicScore(v);
  const { weighted, promoted } = applyDiscoveryExposureWeight(organic, v.slug);
  return {
    id: v.id,
    kind: "venue",
    slug: v.slug,
    name: v.name,
    photoUrl: v.profileImage || v.tileImage || "/images/tmi-placeholder.jpg",
    genreOrCategory: v.category,
    city,
    region,
    lat: point.lat,
    lng: point.lng,
    isLive: Boolean(v.isLive),
    isVerified: v.tier === "Gold" || v.tier === "Platinum" || v.tier === "Diamond",
    bookable: Boolean(booking?.bookMeEnabled),
    availableTonight: Boolean(booking?.availableTonight),
    availableThisWeekend: Boolean(booking?.availableThisWeekend),
    bookingStatus: booking?.bookMeEnabled ? "open" : "closed",
    profileRoute: v.profileRoute || `/venues/${v.slug}`,
    bookRoute: `/venues/${v.slug}/booking`,
    messageRoute: `/messages?to=${encodeURIComponent(v.slug)}`,
    liveRoomRoute: v.isLive ? v.liveRoomRoute : undefined,
    promoted,
    organicScore: organic,
    weightedScore: weighted,
    lookingFor: booking?.lookingFor ?? [],
    tierLabel: v.tier,
  };
}

export function buildDiscoveryTiles(filter: DiscoveryFilter = {}): DiscoveryTile[] {
  const kind = filter.kind ?? "all";
  const q = (filter.query ?? "").trim().toLowerCase();
  let tiles: DiscoveryTile[] = [];

  if (kind === "all" || kind === "performer") {
    tiles = tiles.concat(PERFORMER_REGISTRY.map(toPerformerTile));
  }
  if (kind === "all" || kind === "venue") {
    tiles = tiles.concat(getAllVenues().map(toVenueTile));
  }

  tiles = tiles.filter((t) => {
    if (q) {
      const hay = `${t.name} ${t.genreOrCategory} ${t.city} ${t.region}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (filter.genre) {
      if (!t.genreOrCategory.toLowerCase().includes(filter.genre.toLowerCase())) return false;
    }
    if (filter.category) {
      if (!t.genreOrCategory.toLowerCase().includes(String(filter.category).toLowerCase())) {
        return false;
      }
    }
    if (filter.city) {
      if (!t.city.toLowerCase().includes(filter.city.toLowerCase())) return false;
    }
    if (filter.bookableOnly && !t.bookable) return false;
    if (filter.liveOnly && !t.isLive) return false;
    if (filter.lookingFor) {
      if (!t.lookingFor.includes(filter.lookingFor)) return false;
    }
    return true;
  });

  tiles.sort((a, b) => {
    if (filter.trending) {
      return b.weightedScore - a.weightedScore;
    }
    // LIVE first, then weighted (boost), then organic
    if (a.isLive !== b.isLive) return a.isLive ? -1 : 1;
    return b.weightedScore - a.weightedScore;
  });

  return tiles;
}

export function listCollabLookingForTiles(): DiscoveryTile[] {
  const profiles = listLookingForProfiles();
  if (profiles.length === 0) return [];
  const all = buildDiscoveryTiles({ kind: "all" });
  const ids = new Set(profiles.map((p) => p.entityId));
  return all.filter((t) => ids.has(t.slug) || ids.has(t.id));
}

/** Honest demand scaffold — no fabricated HIGH demand. */
export interface DemandCitySignal {
  city: string;
  region: string;
  searchCount: number;
  requestCount: number;
  level: "none" | "low" | "medium" | "high";
}

const demandSignals = new Map<string, { searches: number; requests: number }>();

export function recordDemandSignal(
  city: string,
  kind: "search" | "request",
): void {
  const key = city.trim().toLowerCase() || "unknown";
  const cur = demandSignals.get(key) ?? { searches: 0, requests: 0 };
  if (kind === "search") cur.searches += 1;
  else cur.requests += 1;
  demandSignals.set(key, cur);
}

export function listDemandHeatSignals(): DemandCitySignal[] {
  if (demandSignals.size === 0) return [];
  return [...demandSignals.entries()].map(([city, counts]) => {
    const total = counts.searches + counts.requests;
    let level: DemandCitySignal["level"] = "none";
    if (total >= 20) level = "high";
    else if (total >= 8) level = "medium";
    else if (total >= 1) level = "low";
    const point = resolveCityRegionPoint(city);
    return {
      city: point.city,
      region: point.region,
      searchCount: counts.searches,
      requestCount: counts.requests,
      level,
    };
  });
}

export function isTargetPromoted(slug: string): boolean {
  return Boolean(getActiveBoostForTarget(slug));
}
