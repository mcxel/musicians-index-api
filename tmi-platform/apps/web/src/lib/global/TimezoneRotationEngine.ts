import { getLiveCountries, getCurrentPeakRegions, type CountryActivity } from "./GlobalActivityEngine";

export type FeedMode = "local-dominant" | "mixed" | "global-dominant" | "global-only";

export interface RegionRotation {
  mode: FeedMode;
  localPercent: number;
  globalPercent: number;
  primaryRegions: CountryActivity[];
  fallbackRegions: CountryActivity[];
  reason: string;
}

function getLocalHour(): number {
  return new Date().getHours();
}

function getLocalActivityScore(localCountryCode: string): number {
  const all = getLiveCountries();
  const local = all.find(c => c.countryCode === localCountryCode);
  if (!local) return 0;
  const levels: Record<string, number> = { empty: 0, low: 1, moderate: 3, high: 7, peak: 10 };
  return levels[local.activityLevel] ?? 0;
}

export function getRotationMode(localCountryCode = "US"): RegionRotation {
  const score = getLocalActivityScore(localCountryCode);
  const peakRegions = getCurrentPeakRegions();
  const allRegions = getLiveCountries();
  const hour = getLocalHour();
  const isNight = hour >= 0 && hour < 6;

  if (score >= 7 && !isNight) {
    return {
      mode: "local-dominant",
      localPercent: 70,
      globalPercent: 30,
      primaryRegions: allRegions.slice(0, 3),
      fallbackRegions: peakRegions.slice(0, 2),
      reason: "Local region is active",
    };
  }
  if (score >= 3) {
    return {
      mode: "mixed",
      localPercent: 50,
      globalPercent: 50,
      primaryRegions: allRegions.slice(0, 2),
      fallbackRegions: peakRegions.slice(0, 3),
      reason: "Mixed local and global",
    };
  }
  if (score > 0) {
    return {
      mode: "global-dominant",
      localPercent: 30,
      globalPercent: 70,
      primaryRegions: peakRegions.slice(0, 4),
      fallbackRegions: allRegions.slice(0, 2),
      reason: "Local region quiet — surfacing global",
    };
  }
  return {
    mode: "global-only",
    localPercent: 0,
    globalPercent: 100,
    primaryRegions: peakRegions.slice(0, 5),
    fallbackRegions: [],
    reason: "Local region empty — full global mode",
  };
}

export function getAwakeRegions(): CountryActivity[] {
  return getLiveCountries().filter(c => c.activeRooms > 0);
}

export function shouldShowGlobalFallback(localCountryCode = "US"): boolean {
  const mode = getRotationMode(localCountryCode).mode;
  return mode === "global-dominant" || mode === "global-only";
}
