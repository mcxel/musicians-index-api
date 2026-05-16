import { getRotationMode, type RegionRotation } from "./TimezoneRotationEngine";
import { getLiveAcrossTheWorldFeed, type GlobalFeedSection } from "./GlobalFeedEngine";
import { getCultureSpotlights, type CultureSpotlight } from "./CultureDiscoveryEngine";

export interface NightFallbackState {
  active: boolean;
  mode: RegionRotation["mode"];
  globalSections: GlobalFeedSection[];
  spotlights: CultureSpotlight[];
  bannerMessage: string;
  ctaLabel: string;
  ctaRoute: string;
}

export function getNightFallbackState(localCountryCode = "US"): NightFallbackState {
  const rotation = getRotationMode(localCountryCode);
  const isGlobalMode = rotation.mode === "global-dominant" || rotation.mode === "global-only";

  const bannerMessages: Record<RegionRotation["mode"], string> = {
    "local-dominant":  "Your scene is live — explore global too",
    "mixed":           "Local meets global — the world is awake",
    "global-dominant": "Your region is winding down — the world is still live",
    "global-only":     "No local activity right now — join the global party",
  };

  const ctaLabels: Record<RegionRotation["mode"], string> = {
    "local-dominant":  "Explore Global",
    "mixed":           "Discover World Music",
    "global-dominant": "See What's Live Worldwide",
    "global-only":     "Join A Global Room",
  };

  return {
    active: isGlobalMode,
    mode: rotation.mode,
    globalSections: getLiveAcrossTheWorldFeed(),
    spotlights: getCultureSpotlights(isGlobalMode ? 6 : 3),
    bannerMessage: bannerMessages[rotation.mode],
    ctaLabel: ctaLabels[rotation.mode],
    ctaRoute: "/global",
  };
}

export function getGlobalNowLiveBanner(localCountryCode = "US"): {
  show: boolean;
  message: string;
  activeCountries: number;
} {
  const rotation = getRotationMode(localCountryCode);
  const show = rotation.mode !== "local-dominant";
  return {
    show,
    message: show ? `${rotation.fallbackRegions.length + rotation.primaryRegions.length} countries active right now` : "",
    activeCountries: rotation.primaryRegions.length + rotation.fallbackRegions.length,
  };
}
