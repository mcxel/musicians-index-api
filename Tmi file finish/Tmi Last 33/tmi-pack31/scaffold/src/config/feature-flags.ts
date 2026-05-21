// apps/web/src/config/feature-flags.ts
// Central feature flag registry. Change values to enable/disable features.

export const FEATURE_FLAGS = {
  // Core platform (always on)
  enableAuth:           true,
  enableOnboarding:     true,
  enableDashboard:      true,
  enableProfile:        true,
  enableArticles:       true,
  enableMagazine:       true,
  enableStations:       true,
  enableLobby:          true,
  enableLive:           true,
  enableClips:          true,
  enableContest:        true,
  enableSearch:         true,
  enableNotifications:  true,

  // Monetization (enabled at launch)
  enableSponsors:       true,
  enableAdvertisers:    true,
  enableAds:            true,
  enableEarnings:       true,
  enablePayouts:        true,

  // Social
  enablePartyLobby:     true,
  enableGames:          true,

  // Future systems (OFF until ready)
  enableCreatorStore:   false,
  enableDigitalSales:   false,
  enableBeatSales:      false,
  enableComedySales:    false,
  enableCheckout:       false,
  enableDownloads:      false,
  enableLicensing:      false,

  // Experimental
  enableGeoMatching:    false,
  enableABTesting:      false,
  enableLocalBusiness:  false,
} as const;

export type FeatureFlag = keyof typeof FEATURE_FLAGS;

export function isEnabled(flag: FeatureFlag): boolean {
  return FEATURE_FLAGS[flag] === true;
}
