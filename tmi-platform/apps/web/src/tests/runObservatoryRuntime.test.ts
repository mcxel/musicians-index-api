import {
  OVERSEER_DECK_ROUTE,
  OBSERVATORY_ROUTE,
  OVERSEER_BLUEPRINT_SLOTS,
  ANCHOR_NETWORK_CONTROLS_SOURCE,
} from "../lib/admin/OverseerDeckBlueprintMap";

function runObservatoryRuntimeTest() {
  const results: Record<string, boolean> = {};

  // 1. Canonical route declarations
  results["overseer_deck_route_is_admin_overseer"] =
    OVERSEER_DECK_ROUTE === "/admin/overseer";
  results["observatory_route_is_admin_observatory"] =
    OBSERVATORY_ROUTE === "/admin/observatory";
  results["anchor_source_is_anchor_room_network"] =
    ANCHOR_NETWORK_CONTROLS_SOURCE === "lib/live/AnchorRoomNetwork.ts";

  // 2. Blueprint slots validity
  results["blueprint_slots_count_is_valid"] = OVERSEER_BLUEPRINT_SLOTS.length >= 5;

  const validZones = new Set([
    "top",
    "operations",
    "ticker",
    "intelligence",
    "footer",
    "overlay",
    "left",
    "center",
    "right",
    "bottom",
  ]);

  const allSlotsValid = OVERSEER_BLUEPRINT_SLOTS.every(
    (slot) =>
      slot.id &&
      slot.blueprintLabel &&
      validZones.has(slot.zone) &&
      slot.codeTarget &&
      ["KEEP", "ALIGN", "DEFER"].includes(slot.status)
  );

  results["all_blueprint_slots_well_formed"] = allSlotsValid;

  const allPassed = Object.values(results).every(Boolean);

  console.log("[OBSERVATORY_RUNTIME_TEST_ASSERT]", { allPassed, results });

  if (!allPassed) {
    const failed = Object.entries(results)
      .filter(([, v]) => !v)
      .map(([k]) => k);
    throw new Error(`[OBSERVATORY_RUNTIME_TEST] FAILED: ${failed.join(", ")}`);
  }
}

runObservatoryRuntimeTest();
