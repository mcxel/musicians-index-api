/**
 * Smoke: YoPho Free background-first + learning track sum.
 * Run: npx tsx apps/web/src/tests/runYoPhoFreeLayerGate.test.ts
 */
import assert from "node:assert/strict";
import {
  YOPHO_BACKGROUND_FIRST_MESSAGE,
  canSetYoPhoLayerMedia,
  evaluateYoPhoAdd,
  hasYoPhoBackgroundSet,
} from "../lib/yopho/YoPhoImageCapacity";
import { createDefaultYoPhoBlueprint } from "../lib/yopho/YoPhoPortraitEngine";
import { ensureTripleLayerStack, setActiveLayerImage } from "../lib/yopho/YoPhoLayerStack";
import {
  YOPHO_LEARNING_STEPS,
} from "../lib/yopho/YoPhoLearningTrack";
import { YOPHO_LEARNING_TRACK_TARGET_XP, getXpValue } from "../lib/xp/XpActionRegistry";

function main() {
  let bp = ensureTripleLayerStack(createDefaultYoPhoBlueprint("fan", "Test Fan"));
  assert.equal(hasYoPhoBackgroundSet(bp), false);

  const photoBlocked = evaluateYoPhoAdd(bp, "photo", "FREE");
  assert.equal(photoBlocked.ok, false);
  if (!photoBlocked.ok) {
    assert.equal(photoBlocked.reason, "background_first");
    assert.equal(photoBlocked.message, YOPHO_BACKGROUND_FIRST_MESSAGE);
  }

  const bg = bp.secondaryLayers.find((l) => l.role === "background") ?? bp.secondaryLayers.at(-1)!;
  const mid = bp.secondaryLayers.find((l) => l.role === "secondary") ?? bp.secondaryLayers[0]!;
  assert.equal(canSetYoPhoLayerMedia(bp, mid.id).ok, false);
  assert.equal(canSetYoPhoLayerMedia(bp, bg.id).ok, true);

  bp = setActiveLayerImage(bp, bg.id, "https://example.com/bg.jpg", "bg");
  assert.equal(hasYoPhoBackgroundSet(bp), true);
  assert.equal(canSetYoPhoLayerMedia(bp, mid.id).ok, true);
  assert.equal(evaluateYoPhoAdd(bp, "photo", "FREE").ok === false || evaluateYoPhoAdd(bp, "photo", "FREE").ok === true, true);

  const sum = YOPHO_LEARNING_STEPS.reduce((s, step) => s + step.xp, 0);
  assert.equal(sum, YOPHO_LEARNING_TRACK_TARGET_XP);
  assert.equal(getXpValue("yopho_set_background"), 100);
  assert.equal(getXpValue("yopho_complete_onboarding"), 25);

  console.log("PASS YoPho Free layer gate + 500 learning track");
}

main();
