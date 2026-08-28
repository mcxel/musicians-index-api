/**
 * Public city/region map helpers — city centroid only (never private home GPS).
 * Used by Performer/Venue Near You map for visual clustering.
 */

export interface CityRegionPoint {
  city: string;
  region: string;
  /** Approximate public city center — display only. */
  lat: number;
  lng: number;
}

/** Known public city centers for registry cities. */
export const CITY_REGION_CENTROIDS: Record<string, CityRegionPoint> = {
  "new york": { city: "New York", region: "NY", lat: 40.7128, lng: -74.006 },
  "los angeles": { city: "Los Angeles", region: "CA", lat: 34.0522, lng: -118.2437 },
  atlanta: { city: "Atlanta", region: "GA", lat: 33.749, lng: -84.388 },
  chicago: { city: "Chicago", region: "IL", lat: 41.8781, lng: -87.6298 },
  houston: { city: "Houston", region: "TX", lat: 29.7604, lng: -95.3698 },
  miami: { city: "Miami", region: "FL", lat: 25.7617, lng: -80.1918 },
  nashville: { city: "Nashville", region: "TN", lat: 36.1627, lng: -86.7816 },
  "las vegas": { city: "Las Vegas", region: "NV", lat: 36.1699, lng: -115.1398 },
  detroit: { city: "Detroit", region: "MI", lat: 42.3314, lng: -83.0458 },
  seattle: { city: "Seattle", region: "WA", lat: 47.6062, lng: -122.3321 },
  denver: { city: "Denver", region: "CO", lat: 39.7392, lng: -104.9903 },
  philadelphia: { city: "Philadelphia", region: "PA", lat: 39.9526, lng: -75.1652 },
  dallas: { city: "Dallas", region: "TX", lat: 32.7767, lng: -96.797 },
  "san francisco": { city: "San Francisco", region: "CA", lat: 37.7749, lng: -122.4194 },
  boston: { city: "Boston", region: "MA", lat: 42.3601, lng: -71.0589 },
  austin: { city: "Austin", region: "TX", lat: 30.2672, lng: -97.7431 },
  memphis: { city: "Memphis", region: "TN", lat: 35.1495, lng: -90.049 },
  "new orleans": { city: "New Orleans", region: "LA", lat: 29.9511, lng: -90.0715 },
  phoenix: { city: "Phoenix", region: "AZ", lat: 33.4484, lng: -112.074 },
  portland: { city: "Portland", region: "OR", lat: 45.5152, lng: -122.6784 },
};

function normalizeCityKey(raw: string): string {
  const base = raw.split(",")[0]?.trim().toLowerCase() ?? "";
  return base.replace(/\s+/g, " ");
}

/** Deterministic jitter for unknown cities — region-scale only, not street-level. */
function hashToApproxPoint(cityKey: string): CityRegionPoint {
  let h = 0;
  for (let i = 0; i < cityKey.length; i++) {
    h = (h * 31 + cityKey.charCodeAt(i)) | 0;
  }
  const lat = 25 + (Math.abs(h) % 2500) / 100; // ~25–50°N
  const lng = -125 + (Math.abs(h >> 8) % 5500) / 100; // ~-125–-70°W
  const label = cityKey
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return { city: label || "Unknown", region: "US", lat, lng };
}

export function resolveCityRegionPoint(cityField: string): CityRegionPoint {
  const key = normalizeCityKey(cityField);
  if (!key) {
    return { city: "Unlisted", region: "—", lat: 39.5, lng: -98.35 };
  }
  const known = CITY_REGION_CENTROIDS[key];
  if (known) return known;
  // Try partial match
  for (const [k, v] of Object.entries(CITY_REGION_CENTROIDS)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return hashToApproxPoint(key);
}

export function parseCityRegion(cityField: string): { city: string; region: string } {
  const parts = cityField.split(",").map((p) => p.trim());
  if (parts.length >= 2) {
    return { city: parts[0], region: parts[1] };
  }
  const point = resolveCityRegionPoint(cityField);
  return { city: point.city, region: point.region };
}
