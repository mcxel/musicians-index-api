/**
 * Master HUD & Spatial Video Presence Certification Suite (Gates A, B, C, D, E).
 *
 * Verifies:
 *   GATE A — Venue Role Personalities (Fan vs Performer capability separation)
 *   GATE B — Chevron Action Registry (Action expansion tray & entitlement filtering)
 *   GATE C — Stream & Win Radio Module (Venue HUD radio integration)
 *   GATE D — Lounge Runtime (Sibling TMILoungeHudRuntime & proximity solver)
 *   GATE E — Spatial Video Presence Director (Transform updates without stream reconnection & dual collision solver)
 */

import {
  resolveHudCapabilities,
  resolveCanonicalHudFamily,
  HudCommandBus,
} from "../lib/venue-hud/TMIExperienceHudRuntime";
import {
  filterActionsForUser,
  getAllRegisteredHudActions,
} from "../lib/venue-hud/HudActionRegistry";
import {
  resolveLoungeProximityActions,
  type ProximityTarget,
} from "../lib/venue-hud/TMILoungeHudRuntime";
import {
  registerSpatialPanel,
  updatePanelTransformWithoutReconnect,
  resolveDualCollisions,
  calculateLodQuality,
} from "../lib/venue-hud/SpatialVideoPresenceDirector";

export function runMasterHudSuite(): { allPassed: boolean; results: Record<string, boolean> } {
  const results: Record<string, boolean> = {};

  // GATE A: Venue Role Personalities
  const fanCaps = resolveHudCapabilities("fan");
  const perfCaps = resolveHudCapabilities("performer");

  results["gateA_fan_cannot_go_live"] = fanCaps.canGoLive === false;
  results["gateA_fan_can_follow"] = fanCaps.canFollow === true;
  results["gateA_performer_can_go_live"] = perfCaps.canGoLive === true;
  results["gateA_performer_can_record"] = perfCaps.canRecord === true;

  // GATE B: Chevron Action Registry
  const fanActions = filterActionsForUser("fan");
  const perfActions = filterActionsForUser("performer");

  results["gateB_registered_actions_exist"] = getAllRegisteredHudActions().length >= 10;
  results["gateB_fan_has_support_vote"] = fanActions.some((a) => a.id === "act-support-vote");
  results["gateB_fan_no_performer_cue"] = !fanActions.some((a) => a.id === "act-cue-next");
  results["gateB_performer_has_cue"] = perfActions.some((a) => a.id === "act-cue-next");

  // GATE C: Stream & Win Radio
  const radioFamily = resolveCanonicalHudFamily("STREAM_AND_WIN_RADIO");
  const loungeFamily = resolveCanonicalHudFamily("LOUNGE");

  results["gateC_radio_maps_to_venue_hud"] = radioFamily === "VENUE_HUD";
  results["gateC_lounge_maps_to_lounge_hud"] = loungeFamily === "LOUNGE_HUD";

  // GATE D: Lounge Runtime & Proximity Solver
  const target: ProximityTarget = {
    id: "seat-1",
    type: "SEAT",
    label: "VIP Couch",
    distanceMeters: 1.0,
    availableActions: ["LOUNGE_SIT"],
  };
  const proxActions = resolveLoungeProximityActions(target);

  results["gateD_proximity_sit_action"] = proxActions.some((a) => a.actionId === "LOUNGE_SIT");

  // GATE E: Spatial Video Presence Director
  const panel = registerSpatialPanel({
    panelId: "panel-test-1",
    userId: "user-1",
    streamId: "stream-abc",
  });

  const updateRes = updatePanelTransformWithoutReconnect("panel-test-1", {
    positionXyz: [2, 1.5, -4],
    scale: 1.4,
    chassisSkinId: "chassis-platinum",
  });

  results["gateE_no_reconnect_on_transform"] = updateRes.streamReconnected === false;
  results["gateE_position_updated"] = updateRes.panel?.positionXyz[0] === 2 && updateRes.panel?.scale === 1.4;

  const obstacle = { minX: 1, maxX: 3, minY: 0, maxY: 3, minZ: -5, maxZ: -3 };
  const clearedXyz = resolveDualCollisions("panel-test-1", [2, 1.5, -4], [obstacle]);

  results["gateE_collision_cleared"] = clearedXyz[0] !== 2 || clearedXyz[2] !== -4;
  results["gateE_lod_hero"] = calculateLodQuality(2.0) === "hero";
  results["gateE_lod_audio_only"] = calculateLodQuality(40.0) === "audio_only";

  const allPassed = Object.values(results).every(Boolean);

  console.log(`[MASTER_HUD_SUITE_TEST_ASSERT]`, JSON.stringify({ allPassed, results }, null, 2));
  return { allPassed, results };
}

if (require.main === module) {
  runMasterHudSuite();
}
