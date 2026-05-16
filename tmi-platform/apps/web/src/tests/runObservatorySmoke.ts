/**
 * Observatory Smoke Test
 * Verifies admin observatory data layer, engine imports, and runtime shape.
 * Run: pnpm exec ts-node --project tsconfig.test.json -r tsconfig-paths/register src/tests/runObservatorySmoke.ts
 */

import * as fs from "fs";
import * as path from "path";
import { getObservatorySnapshot, getAllAlerts } from "@/lib/admin/AdminObservatoryChat";
import { getRoomPopulation, tickPopulation } from "@/lib/rooms/RoomPopulationEngine";
import { getIntentSummary, pushIntentEvent } from "@/lib/rooms/CrowdIntentEngine";
import { getCameraFocusPlan, tickCameraFocus } from "@/lib/live/CameraFocusReactionEngine";
import { getActiveSponsorGifts, registerSponsorGift } from "@/lib/commerce/SponsorGiftCommerceEngine";
import { getActivePreviews, registerBillboardSlot } from "@/lib/live/BillboardPreviewHoverEngine";

// ─── Test runner ──────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function check(label: string, fn: () => boolean): void {
  try {
    const ok = fn();
    if (ok) {
      console.log(`  ✅  ${label}`);
      passed++;
    } else {
      console.error(`  ❌  ${label} — returned false`);
      failed++;
    }
  } catch (err) {
    console.error(`  ❌  ${label} — threw: ${(err as Error).message}`);
    failed++;
  }
}

// ─── Setup: seed engines with baseline data ───────────────────────────────────

console.log("\n── Observatory Smoke Test ─────────────────────────────");
console.log("   Seeding engines...\n");

const roomIds = [
  "monthly-idol", "monday-night-stage", "deal-or-feud",
  "name-that-tune", "circle-squares", "cypher-arena", "venue-room",
] as const;

for (const roomId of roomIds) {
  tickPopulation(roomId);
  pushIntentEvent(roomId, "smoke-test-user", "hype", 72, Date.now());
  tickCameraFocus(roomId);
}

registerSponsorGift(
  "smoke-sponsor-1", "TMI Smoke Sponsor", "subscription_credit",
  "Smoke Test Credit", "Test gift for smoke runner", 999, 10,
);

registerBillboardSlot({
  slotId: "smoke-billboard-1",
  type: "sponsor_ad",
  title: "Smoke Billboard Ad",
  href: "/sponsors/smoke",
  sponsorName: "Smoke Sponsor",
});

// ─── Section 1: Admin Observatory engine ─────────────────────────────────────

console.log("Section 1 — AdminObservatoryChat engine");

check("getObservatorySnapshot() returns without throwing", () => {
  const snap = getObservatorySnapshot();
  return typeof snap === "object" && snap !== null;
});

check("snapshot.rooms has 7 entries", () => getObservatorySnapshot().rooms.length === 7);

check("snapshot.capturedAt is recent", () => getObservatorySnapshot().capturedAt > Date.now() - 5000);

check("snapshot.totalOccupancy >= 0", () => {
  const snap = getObservatorySnapshot();
  return typeof snap.totalOccupancy === "number" && snap.totalOccupancy >= 0;
});

check("snapshot.activeGifts is an array", () => Array.isArray(getObservatorySnapshot().activeGifts));

check("snapshot.activeBillboards is an array", () => Array.isArray(getObservatorySnapshot().activeBillboards));

check("snapshot.hottest is ChatRoomId or null", () => {
  const h = getObservatorySnapshot().hottest;
  return h === null || typeof h === "string";
});

// ─── Section 2: Room population ───────────────────────────────────────────────

console.log("\nSection 2 — RoomPopulationEngine");

check("all rooms have audienceCount >= 0", () =>
  roomIds.every(id => getRoomPopulation(id).audienceCount >= 0));

check("all rooms have heatLevel in [0, 100]", () =>
  roomIds.every(id => { const h = getRoomPopulation(id).heatLevel; return h >= 0 && h <= 100; }));

check("monthly-idol baseline > venue-room baseline", () =>
  getRoomPopulation("monthly-idol").audienceCount > getRoomPopulation("venue-room").audienceCount);

// ─── Section 3: Intent summaries ─────────────────────────────────────────────

console.log("\nSection 3 — CrowdIntentEngine");

check("getIntentSummary returns valid shape for all rooms", () =>
  roomIds.every(id => {
    const s = getIntentSummary(id, Date.now());
    return typeof s.hypeScore === "number" && typeof s.dominantIntent === "string";
  }));

check("intent distribution is a record object", () => {
  const dist = getIntentSummary("monthly-idol", Date.now()).distribution;
  return typeof dist === "object" && dist !== null;
});

// ─── Section 4: Camera engine ─────────────────────────────────────────────────

console.log("\nSection 4 — CameraFocusReactionEngine");

check("getCameraFocusPlan returns plan with mode + intensityScore", () =>
  roomIds.every(id => {
    const p = getCameraFocusPlan(id);
    return typeof p.mode === "string" && typeof p.intensityScore === "number";
  }));

check("camera intensityScore in [0, 100]", () =>
  roomIds.every(id => { const s = getCameraFocusPlan(id).intensityScore; return s >= 0 && s <= 100; }));

// ─── Section 5: Commerce ──────────────────────────────────────────────────────

console.log("\nSection 5 — SponsorGiftCommerceEngine");

check("getActiveSponsorGifts() returns array", () => Array.isArray(getActiveSponsorGifts()));

check("seeded test gift is active", () =>
  getActiveSponsorGifts().some(g => g.sponsorId === "smoke-sponsor-1"));

// ─── Section 6: Billboard ─────────────────────────────────────────────────────

console.log("\nSection 6 — BillboardPreviewHoverEngine");

check("getActivePreviews() returns array", () => Array.isArray(getActivePreviews()));

// ─── Section 7: Alerts ────────────────────────────────────────────────────────

console.log("\nSection 7 — Alert system");

check("getAllAlerts() returns array", () => Array.isArray(getAllAlerts()));

check("alerts have id, roomId, severity, message", () =>
  getAllAlerts().every(a =>
    typeof a.id === "string" &&
    typeof a.roomId === "string" &&
    typeof a.severity === "string" &&
    typeof a.message === "string"));

// ─── Section 8: File existence ────────────────────────────────────────────────

console.log("\nSection 8 — File existence");

// __dirname = apps/web/src/tests → ../../ = apps/web
const webRoot = path.resolve(__dirname, "../..");

const filesToCheck = [
  "src/app/admin/observatory/chat/page.tsx",
  "src/lib/admin/AdminObservatoryChat.ts",
  "src/lib/rooms/RoomPopulationEngine.ts",
  "src/lib/rooms/RoomClock.ts",
  "src/lib/rooms/CrowdIntentEngine.ts",
  "src/lib/camera/CameraFocusReactionEngine.ts",
  "src/lib/live/CameraFocusReactionEngine.ts",
  "src/components/billboards/BillboardPreviewHover.tsx",
  "src/components/sponsors/SponsorMotionLayer.tsx",
];

for (const rel of filesToCheck) {
  const abs = path.join(webRoot, rel);
  check(`exists: ${rel}`, () => fs.existsSync(abs));
}

// ─── Result ───────────────────────────────────────────────────────────────────

console.log(`\n── Result: ${passed} passed, ${failed} failed ────────────────────`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log("   ✅  All smoke checks passed.\n");
  process.exit(0);
}
