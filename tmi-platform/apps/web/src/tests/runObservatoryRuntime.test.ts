import {
  OVERSEER_DECK_ROUTE,
  OBSERVATORY_ROUTE,
  OVERSEER_BLUEPRINT_SLOTS,
  ANCHOR_NETWORK_CONTROLS_SOURCE,
} from "../lib/admin/OverseerDeckBlueprintMap";

function runObservatoryRuntimeTest(): {
  allPassed: boolean;
  results: Record<string, boolean>;
} {
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
  return { allPassed, results };
}

describe("Observatory / Overseer Runtime Certification", () => {
  it("canonical overseer + observatory routes and blueprint slots admit", () => {
    const report = runObservatoryRuntimeTest();
    expect(report.results.overseer_deck_route_is_admin_overseer).toBe(true);
    expect(report.results.observatory_route_is_admin_observatory).toBe(true);
    expect(report.results.anchor_source_is_anchor_room_network).toBe(true);
    expect(report.results.blueprint_slots_count_is_valid).toBe(true);
    expect(report.results.all_blueprint_slots_well_formed).toBe(true);
    expect(report.allPassed).toBe(true);
  });
});

if (typeof describe === "undefined") {
  const report = runObservatoryRuntimeTest();
  console.log("[OBSERVATORY_RUNTIME_TEST_ASSERT]", report);
  if (!report.allPassed) {
    const failed = Object.entries(report.results)
      .filter(([, v]) => !v)
      .map(([k]) => k);
    console.error(`[OBSERVATORY_RUNTIME_TEST] FAILED: ${failed.join(", ")}`);
    process.exitCode = 1;
  }
}

export { runObservatoryRuntimeTest };
