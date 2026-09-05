/**
 * YoPho Free onboarding + learning track (500 XP) certification smoke.
 * Run: npx tsx apps/web/src/tests/runYoPhoOnboardingPoints.test.ts
 */

import assert from "node:assert/strict";
import {
  YOPHO_LEARNING_ACTION_KEYS,
  YOPHO_LEARNING_TRACK_TARGET_XP,
  getXpValue,
} from "../lib/xp/XpActionRegistry";
import {
  YOPHO_FREE_ALLOWANCE_COPY,
  YOPHO_BACKGROUND_FIRST_MESSAGE,
  evaluateYoPhoAdd,
  evaluateYoPhoBackgroundFirst,
  getYoPhoImageCapacity,
  hasYoPhoBackgroundSet,
  canSetYoPhoLayerMedia,
} from "../lib/yopho/YoPhoImageCapacity";
import {
  YOPHO_LEARNING_STEPS,
  isYoPhoLearningAction,
  markYoPhoLearningLocal,
  loadYoPhoLearningProgress,
} from "../lib/yopho/YoPhoLearningTrack";
import {
  createDefaultYoPhoBlueprint,
} from "../lib/yopho/YoPhoPortraitEngine";
import { ensureTripleLayerStack, setActiveLayerImage } from "../lib/yopho/YoPhoLayerStack";
import { getActiveStepsForRole } from "../lib/onboarding/FirstRunExperienceEngine";

async function main() {
  // ── Free allowance (shipped canon: 1 bg + 2 images = 3 slots) ────────────
  const free = getYoPhoImageCapacity("FREE");
  assert.equal(free.maxImages, 3, "FREE image slots = 3 (1 background + 2 content)");
  assert.ok(YOPHO_FREE_ALLOWANCE_COPY.includes("1 background"));
  assert.ok(YOPHO_FREE_ALLOWANCE_COPY.includes("2 user-imported"));
  assert.ok(YOPHO_BACKGROUND_FIRST_MESSAGE.toLowerCase().includes("background first"));

  // ── Learning track totals 500 via XpActionRegistry ───────────────────────
  assert.equal(YOPHO_LEARNING_TRACK_TARGET_XP, 500);
  const sum = YOPHO_LEARNING_ACTION_KEYS.reduce((s, key) => s + getXpValue(key), 0);
  assert.equal(sum, 500, `learning actions must sum to 500, got ${sum}`);
  assert.equal(YOPHO_LEARNING_STEPS.length, YOPHO_LEARNING_ACTION_KEYS.length);
  for (const key of YOPHO_LEARNING_ACTION_KEYS) {
    assert.ok(isYoPhoLearningAction(key));
    assert.ok(getXpValue(key) > 0, `${key} must have xp > 0`);
  }

  // ── Background-first soft gate ───────────────────────────────────────────
  let bp = ensureTripleLayerStack(createDefaultYoPhoBlueprint("fan", "Cert"));
  assert.equal(hasYoPhoBackgroundSet(bp), false);
  // FREE default already seeds 3 image slots — adding another image layer is capped.
  assert.equal(evaluateYoPhoAdd(bp, "background", "FREE").ok, false);

  const blockPhoto = evaluateYoPhoBackgroundFirst(bp, "photo");
  assert.equal(blockPhoto.ok, false);
  if (!blockPhoto.ok) assert.equal(blockPhoto.reason, "background_first");

  const bgLayer =
    bp.secondaryLayers.find((l) => l.role === "background") ??
    bp.primaryLayer;
  bp = setActiveLayerImage(bp, bgLayer.id, "https://example.com/bg.jpg", "bg");
  assert.equal(hasYoPhoBackgroundSet(bp), true);

  // After background media is set, content layers may be filled (soft gate open).
  const fillPhoto = evaluateYoPhoBackgroundFirst(bp, "photo");
  assert.equal(fillPhoto.ok, true);

  const mediaOk = canSetYoPhoLayerMedia(bp, bp.primaryLayer.id, { allowSkipAck: true });
  assert.equal(mediaOk.ok, true);

  // ── Local learning progress mark (no network) ────────────────────────────
  // Isolate storage key pollution in Node by using a memory stub if needed.
  if (typeof globalThis.localStorage === "undefined") {
    const store = new Map<string, string>();
    (globalThis as { localStorage: Storage }).localStorage = {
      getItem: (k) => store.get(k) ?? null,
      setItem: (k, v) => {
        store.set(k, String(v));
      },
      removeItem: (k) => {
        store.delete(k);
      },
      clear: () => store.clear(),
      key: () => null,
      length: 0,
    };
  }
  localStorage.removeItem("tmi_yopho_learning_track_v1");
  const p0 = loadYoPhoLearningProgress();
  assert.equal(p0.earnedXp, 0);
  const p1 = markYoPhoLearningLocal("yopho_set_background");
  assert.equal(p1.earnedXp, getXpValue("yopho_set_background"));
  const p1b = markYoPhoLearningLocal("yopho_set_background");
  assert.equal(p1b.earnedXp, p1.earnedXp, "once-only local mark");

  // ── First-run surfaces YoPho without inventing a second CMS ──────────────
  const fanSteps = getActiveStepsForRole("fan");
  assert.ok(fanSteps.some((s) => s.id === "fan-yopho-card"));
  const performerSteps = getActiveStepsForRole("performer");
  assert.ok(performerSteps.some((s) => s.id === "performer-yopho-card"));

  console.log("PASS YoPho onboarding + Free allowance + 500 learning XP track");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
