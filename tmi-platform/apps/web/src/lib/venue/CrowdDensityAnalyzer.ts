/**
 * CrowdDensityAnalyzer
 * Tracks per-zone crowd density in a venue and produces heatmap data
 * for venue intelligence and lighting/sound adaptation.
 */

import { getVenueState } from "@/lib/venue/VenueStateEngine";

export type VenueZone =
  | "stage-front"
  | "center-floor"
  | "back-floor"
  | "vip-left"
  | "vip-right"
  | "balcony"
  | "bar"
  | "entrance"
  | "photo-pit"
  | "side-wing";

export interface ZoneDensity {
  zone: VenueZone;
  occupancy: number;         // 0-1
  capacity: number;
  occupied: number;
  hotspot: boolean;
  trend: "filling" | "stable" | "emptying";
  lastUpdatedAt: number;
}

export interface VenueDensitySnapshot {
  venueId: string;
  zones: ZoneDensity[];
  peakZone: VenueZone | null;
  overallDensity: number;  // 0-1
  hotspotCount: number;
  snapshotAt: number;
}

type DensityListener = (snapshot: VenueDensitySnapshot) => void;

const ZONE_CAPACITIES: Record<VenueZone, number> = {
  "stage-front": 80,
  "center-floor": 150,
  "back-floor": 100,
  "vip-left": 30,
  "vip-right": 30,
  "balcony": 60,
  "bar": 40,
  "entrance": 20,
  "photo-pit": 15,
  "side-wing": 25,
};

const HOTSPOT_THRESHOLD = 0.75;

const densitySnapshots = new Map<string, VenueDensitySnapshot>();
const prevZoneOccupancy = new Map<string, Map<VenueZone, number>>();
const densityListeners = new Map<string, Set<DensityListener>>();

function deriveTrend(current: number, prev: number): ZoneDensity["trend"] {
  if (current > prev + 0.05) return "filling";
  if (current < prev - 0.05) return "emptying";
  return "stable";
}

function notify(venueId: string, snapshot: VenueDensitySnapshot): void {
  densityListeners.get(venueId)?.forEach(l => l(snapshot));
}

export function updateZoneDensity(
  venueId: string,
  zoneData: Partial<Record<VenueZone, number>>  // zone → count of people
): VenueDensitySnapshot {
  const prevByZone = prevZoneOccupancy.get(venueId) ?? new Map<VenueZone, number>();
  const allZones = Object.keys(ZONE_CAPACITIES) as VenueZone[];

  const zones: ZoneDensity[] = allZones.map(zone => {
    const cap = ZONE_CAPACITIES[zone];
    const occupied = Math.min(cap, zoneData[zone] ?? 0);
    const occupancy = occupied / cap;
    const prev = prevByZone.get(zone) ?? occupancy;
    const trend = deriveTrend(occupancy, prev);

    return {
      zone,
      occupancy,
      capacity: cap,
      occupied,
      hotspot: occupancy >= HOTSPOT_THRESHOLD,
      trend,
      lastUpdatedAt: Date.now(),
    };
  });

  // Update prev
  const newPrev = new Map<VenueZone, number>();
  for (const z of zones) newPrev.set(z.zone, z.occupancy);
  prevZoneOccupancy.set(venueId, newPrev);

  const peakZone = zones.reduce((best, z) => z.occupancy > (best?.occupancy ?? -1) ? z : best, zones[0]);
  const totalOccupied = zones.reduce((s, z) => s + z.occupied, 0);
  const totalCapacity = zones.reduce((s, z) => s + z.capacity, 0);

  const snapshot: VenueDensitySnapshot = {
    venueId,
    zones,
    peakZone: peakZone.occupancy > 0 ? peakZone.zone : null,
    overallDensity: totalOccupied / totalCapacity,
    hotspotCount: zones.filter(z => z.hotspot).length,
    snapshotAt: Date.now(),
  };

  densitySnapshots.set(venueId, snapshot);
  notify(venueId, snapshot);
  return snapshot;
}

export function syncDensityFromVenueState(venueId: string): VenueDensitySnapshot | null {
  const venueState = getVenueState(venueId);
  if (!venueState) return null;

  const total = venueState.capacity.occupied;
  const fractions: Partial<Record<VenueZone, number>> = {
    "stage-front":  Math.round(total * 0.20),
    "center-floor": Math.round(total * 0.30),
    "back-floor":   Math.round(total * 0.15),
    "vip-left":     Math.round(venueState.capacity.vipOccupied * 0.5),
    "vip-right":    Math.round(venueState.capacity.vipOccupied * 0.5),
    "balcony":      Math.round(total * 0.10),
    "bar":          Math.round(total * 0.08),
    "entrance":     Math.round(total * 0.04),
    "photo-pit":    0,
    "side-wing":    Math.round(total * 0.03),
  };

  return updateZoneDensity(venueId, fractions);
}

export function getDensitySnapshot(venueId: string): VenueDensitySnapshot | null {
  return densitySnapshots.get(venueId) ?? null;
}

export function subscribeToDensity(venueId: string, listener: DensityListener): () => void {
  if (!densityListeners.has(venueId)) densityListeners.set(venueId, new Set());
  densityListeners.get(venueId)!.add(listener);
  const current = densitySnapshots.get(venueId);
  if (current) listener(current);
  return () => densityListeners.get(venueId)?.delete(listener);
}

export function getZoneDensity(venueId: string, zone: VenueZone): ZoneDensity | null {
  return densitySnapshots.get(venueId)?.zones.find(z => z.zone === zone) ?? null;
}
