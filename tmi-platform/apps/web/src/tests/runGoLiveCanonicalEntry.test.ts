/**
 * Step 4 Slice 1 — Canonical Go Live entry + continuity contracts (source-level).
 * Does not claim physical cam/session PASS.
 */

import * as fs from "fs";
import * as path from "path";

const WEB_SRC = path.resolve(__dirname, "..");

function readSrc(...parts: string[]): string {
  return fs.readFileSync(path.join(WEB_SRC, ...parts), "utf8");
}

export async function runGoLiveCanonicalEntryTest(): Promise<{
  allPassed: boolean;
  results: Record<string, boolean>;
}> {
  const results: Record<string, boolean> = {};

  const canon = readSrc("lib", "dock", "presentInstantGoLiveInPlace.ts");
  results["canon_declares_entry_authority"] =
    canon.includes("CANONICAL GO LIVE ENTRY") &&
    canon.includes("export async function triggerCanonicalGoLive") &&
    canon.includes("presentInstantGoLiveInPlace") &&
    canon.includes("executeInstantGoLive");

  const hud = readSrc("components", "venue-hud", "TMIInteractiveVenueHud.tsx");
  results["hud_golive_no_fake_800ms"] =
    !/setTimeout\(res,\s*800\)/.test(hud) &&
    hud.includes('HudCommandBus.register("GO_LIVE"') &&
    hud.includes("presentInstantGoLiveInPlace") &&
    hud.includes("endInstantGoLiveSession");

  results["hud_golive_respects_published_continuity"] =
    hud.includes("isLivePublished") && hud.includes("publishedRoomId");

  const launcher = readSrc("components", "live", "InstantGoLiveLauncher.tsx");
  results["launcher_uses_trigger_canonical"] =
    launcher.includes("triggerCanonicalGoLive") &&
    !launcher.includes("executeInstantGoLive({");

  const panel = readSrc("components", "performer", "GoLiveControlPanel.tsx");
  results["legacy_panel_uses_trigger_canonical"] =
    panel.includes("triggerCanonicalGoLive") &&
    !panel.includes("fetch('/api/live/go'");

  const liveGoPage = readSrc("app", "live", "go", "page.tsx");
  results["live_go_redirects_to_hub"] =
    liveGoPage.includes('redirect(\'/hub/performer?golive=1\')') ||
    liveGoPage.includes('redirect("/hub/performer?golive=1")');

  const allPassed = Object.values(results).every(Boolean);
  console.log(
    `[GO_LIVE_CANONICAL_ENTRY_TEST_ASSERT]`,
    JSON.stringify({ allPassed, results }, null, 2),
  );
  return { allPassed, results };
}

describe("Go Live Canonical Entry (Step 4 Slice 1)", () => {
  it("wires HUD + legacy shells to triggerCanonicalGoLive / presentInstantGoLiveInPlace", async () => {
    const { allPassed } = await runGoLiveCanonicalEntryTest();
    expect(allPassed).toBe(true);
  });
});
