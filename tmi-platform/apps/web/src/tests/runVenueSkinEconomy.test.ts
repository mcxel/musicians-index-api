import {
  listGauntletVenueSkins,
  getGauntletVenueSkin,
} from "../lib/gauntlet/GauntletVenueManifest";
import {
  FLEX_STORE_CATALOG,
  type FlexStoreItem,
} from "../lib/store/FlexStoreLedger";

function runVenueSkinEconomyTest() {
  const results: Record<string, boolean> = {};

  // 1. Gauntlet Venue Skin Manifest
  const skins = listGauntletVenueSkins();
  results["venue_skins_count_is_5"] = skins.length === 5;

  const amphitheater = getGauntletVenueSkin("gauntlet-amphitheater");
  results["amphitheater_lighting_is_sunset"] = amphitheater.lightingPreset === "SUNSET";
  results["amphitheater_outdoor_is_true"] = amphitheater.outdoor === true;

  const rooftop = getGauntletVenueSkin("gauntlet-rooftop");
  results["rooftop_venue_index_is_1"] = rooftop.venueIndex === 1;

  // 2. Flex Store Catalog — VENUE_SKIN Items
  const venueStoreItems = FLEX_STORE_CATALOG.filter(
    (item: FlexStoreItem) => item.itemType === "VENUE_SKIN"
  );
  results["venue_store_items_exist"] = venueStoreItems.length >= 2;

  const penthouseItem = FLEX_STORE_CATALOG.find(
    (i) => i.id === "venue-skin-rooftop-penthouse"
  );
  results["penthouse_price_is_499_cents"] = penthouseItem?.priceCents === 499;
  results["penthouse_type_is_venue_skin"] = penthouseItem?.itemType === "VENUE_SKIN";

  const cypherItem = FLEX_STORE_CATALOG.find(
    (i) => i.id === "venue-skin-underground-cypher"
  );
  results["cypher_price_is_299_cents"] = cypherItem?.priceCents === 299;
  results["cypher_type_is_venue_skin"] = cypherItem?.itemType === "VENUE_SKIN";

  const allPassed = Object.values(results).every(Boolean);

  console.log("[VENUE_SKIN_ECONOMY_TEST_ASSERT]", { allPassed, results });

  if (!allPassed) {
    const failed = Object.entries(results)
      .filter(([, v]) => !v)
      .map(([k]) => k);
    throw new Error(`[VENUE_SKIN_ECONOMY_TEST] FAILED: ${failed.join(", ")}`);
  }
}

runVenueSkinEconomyTest();
