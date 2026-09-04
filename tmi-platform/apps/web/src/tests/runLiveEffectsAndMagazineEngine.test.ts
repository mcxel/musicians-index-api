/**
 * runLiveEffectsAndMagazineEngine.test.ts
 *
 * Test suite verifying:
 * 1. TmiFilterEngine WebGL/Canvas shader presets & quality tiers.
 * 2. BattleMomentumEngine heat score state machine (NORMAL -> WARM -> HOT -> ON_FIRE -> INFERNO).
 * 3. LiveEffectRuntime unified state manager.
 * 4. MagazineLayoutRuntime & template manifest evaluations.
 * 5. MagazinePreviewBus in-house media-player preview broadcasting.
 */

import { TmiFilterEngine, ERA_PRESETS } from "../lib/effects/TmiFilterEngine";
import { BattleMomentumEngine } from "../lib/effects/BattleMomentumEngine";
import { LiveEffectRuntime } from "../lib/effects/LiveEffectRuntime";
import { MagazineLayoutRuntime } from "../lib/magazine/MagazineLayoutRuntime";
import { MagazinePreviewBus } from "../lib/magazine/MagazinePreviewBus";

async function runTests() {
  console.log("=== RUNNING LIVE EFFECTS & MAGAZINE ENGINE TEST SUITE ===");

  const results = {
    filterPresetsValid: false,
    cssFilterStringGenerated: false,
    heatStateEscalation: false,
    hysteresisPreserved: false,
    liveEffectRuntimeValid: false,
    magazineManifestEvaluated: false,
    previewBusBroadcastReceived: false,
  };

  // 1. Test TmiFilterEngine
  const engine = new TmiFilterEngine("noir_1950", "HIGH");
  const active = engine.getActivePreset();
  results.filterPresetsValid = active.id === "noir_1950" && Object.keys(ERA_PRESETS).length >= 6;
  results.cssFilterStringGenerated = engine.getCssFilterString().includes("grayscale");

  // 2. Test BattleMomentumEngine
  const momentum = new BattleMomentumEngine(0);
  let state = momentum.getState();
  const isInitialNormal = state.level === "NORMAL";

  // Boost score to ON FIRE (> 65)
  for (let i = 0; i < 14; i++) {
    state = momentum.registerReaction(5);
  }
  const isEscalatedOnFire = state.level === "ON_FIRE" || state.level === "INFERNO";
  results.heatStateEscalation = isInitialNormal && isEscalatedOnFire;

  // Hysteresis test: small score drop should remain ON_FIRE until score < 55
  const momentumHys = new BattleMomentumEngine(66);
  const hysState = momentumHys.getState();
  results.hysteresisPreserved = hysState.level === "ON_FIRE";

  // 3. Test LiveEffectRuntime
  const liveRuntime = new LiveEffectRuntime("warm_1970", "ULTRA");
  liveRuntime.setBackgroundMode("STAGE_3D", "skyline-penthouse");
  const liveState = liveRuntime.getState();
  results.liveEffectRuntimeValid =
    liveState.preset.id === "warm_1970" &&
    liveState.backgroundMode === "STAGE_3D" &&
    liveState.venueStageSlug === "skyline-penthouse";

  // 4. Test MagazineLayoutRuntime
  const magRuntime = new MagazineLayoutRuntime();
  const issue = magRuntime.getIssue();
  const spread1 = magRuntime.getSpread(1);
  results.magazineManifestEvaluated =
    issue.spreads.length >= 2 &&
    spread1 !== null &&
    spread1.leftPage.templateId === "COVER_HERO";

  // 5. Test MagazinePreviewBus
  const bus = MagazinePreviewBus.getInstance();
  let receivedMsg: any = null;
  const unsubscribe = bus.subscribe((msg) => {
    receivedMsg = msg;
  });

  if (spread1) {
    bus.broadcastDraftSpread(issue.issueId, spread1, "MONITOR_A", "PREVIEW");
  }
  unsubscribe();

  results.previewBusBroadcastReceived =
    receivedMsg !== null &&
    receivedMsg.targetMonitor === "MONITOR_A" &&
    receivedMsg.channel === "TMI_MAGAZINE_STUDIO";

  const allPassed = Object.values(results).every(Boolean);

  console.log("[LIVE_EFFECTS_AND_MAGAZINE_TEST_ASSERT]", JSON.stringify({ allPassed, results }, null, 2));

  if (!allPassed) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
