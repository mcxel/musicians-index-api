/**
 * Home 1 canonical live-discovery rotation certification (Gap 2).
 */

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "../..");
const src = path.join(root, "src");

function read(rel) {
  return fs.readFileSync(path.join(src, rel), "utf8");
}

const results = {};

function assert(name, cond) {
  results[name] = Boolean(cond);
}

const timingSrc = read("lib/motion/timingRegistry.ts");
assert("rotation_constant_13000", timingSrc.includes("broadcastDeckRotation: 13_000"));

const engineSrc = read("lib/discovery/HomeDiscoveryRotationEngine.ts");
assert(
  "home_discovery_engine_exports",
  engineSrc.includes("pickHomeOrbitRotationSlots") &&
    engineSrc.includes("verifyHomeOrbitRecordEligible") &&
    engineSrc.includes("HOME_DISCOVERY_FETCHED"),
);

const filtersSrc = read("lib/discovery/homepageDiscoveryFilters.ts");
assert(
  "home1_orbit_surface_filter",
  filtersSrc.includes('"home1_orbit"') && filtersSrc.includes("HOME1_ORBIT_CATS"),
);

const hookSrc = read("lib/discovery/useHomeDiscoveryRotation.ts");
assert(
  "use_home_discovery_rotation_hook",
  hookSrc.includes("HOME_BROADCAST_ROTATION_MS") &&
    hookSrc.includes("useDiscoveryBus"),
);

const home1Src = read("components/home/Home1CoverPage.tsx");
assert(
  "home1_orbit_uses_discovery_hook",
  home1Src.includes("useHomeDiscoveryRotation") && home1Src.includes("orbitDiscoveryEmpty"),
);
assert(
  "home1_orbit_not_registry_driven",
  !home1Src.includes("visibleOrbitCards = performersWithRealLiveness") &&
    home1Src.includes("directoryPerformers"),
);
assert(
  "home1_exact_join_wired",
  home1Src.includes("resolveInstantJoin") &&
    home1Src.includes("verifyHomeOrbitRecordEligible") &&
    home1Src.includes("handleOrbitDiscoveryJoin"),
);
assert(
  "home1_rails_use_canonical_ms",
  home1Src.includes("HOME_BROADCAST_ROTATION_MS"),
);

const rotationSrc = read("lib/broadcast/BroadcastRotationEngine.ts");
assert(
  "broadcast_rotation_discovery_feeds",
  rotationSrc.includes("discoveryRecordsToBroadcastFeeds") &&
    rotationSrc.includes("discoveryRecords"),
);

const deckSrc = read("components/broadcast/BroadcastDeckWall.tsx");
assert(
  "deck_wall_no_performer_registry",
  !deckSrc.includes("PERFORMER_REGISTRY") && deckSrc.includes("useDiscoveryBus"),
);
assert("deck_wall_canonical_interval", deckSrc.includes("HOME_BROADCAST_ROTATION_MS"));

const featuredSrc = read("components/discovery/HomeFeaturedChannelPanels.tsx");
assert("featured_channels_13s", featuredSrc.includes("HOME_BROADCAST_ROTATION_MS"));

const publisherSrc = read("lib/discovery/DiscoveryPublisher.ts");
assert(
  "discovery_publisher_canonical",
  publisherSrc.includes("publishLiveRoom") && publisherSrc.includes("DiscoveryBus.upsert"),
);

const instantSrc = read("lib/discovery/InstantJoinRuntime.ts");
assert("role_aware_instant_join", instantSrc.includes("resolveParticipationEntry"));

const allPassed = Object.values(results).every(Boolean);
console.log("[HOME_DISCOVERY_ROTATION_TEST]", { allPassed, results });

if (!allPassed) {
  const failed = Object.entries(results)
    .filter(([, v]) => !v)
    .map(([k]) => k);
  throw new Error(`[HOME_DISCOVERY_ROTATION_TEST] FAILED: ${failed.join(", ")}`);
}
