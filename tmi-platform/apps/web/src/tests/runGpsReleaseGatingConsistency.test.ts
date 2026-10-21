/**
 * TMI Release-Convergence Gate: GPS release-state gating consistency.
 * Fixes two real inconsistencies found by audit (2026-10-05), updated
 * 2026-10-06 after Cursor's RED/YELLOW exhaustion pass relocated the
 * messages/community gate:
 *
 * 1. MESSAGES/COMMUNITY must never reach the real messaging/community
 *    backend while gpsReleaseAllowlist marks them held. As of the Cursor
 *    convergence pass, this is enforced inside HubCommunicationsRail's tab
 *    content (gpsDestinationState("messages"/"community") === "LIVE" gates
 *    whether MessagingCanister/CommunityFeedPanel render at all, falling
 *    back to a real ReleaseHeldNote otherwise) rather than at the mobile
 *    quick-action-bar click handler — HubMobileQuickActionBar now just opens
 *    the tab via onOpenCommunications and lets the single, centralized
 *    HubCommunicationsRail gate decide what's actually rendered. This is
 *    the one place that matters: every surface that opens a comms tab
 *    (desktop rail, mobile drawer) renders through this same component, so
 *    gating here is equivalent to gating at every call site individually.
 * 2. gpsReleaseAllowlist marked "articles" LIVE even though the underlying
 *    performer Article authoring/publish/revision chain is confirmed broken
 *    end-to-end (audit, 2026-10-05) — the GPS control opens a drawer whose
 *    "Magazine Article" tab has no editing UI at all. Reclassified to
 *    COMING_SOON, matching "biography" (the sibling destination in the same
 *    drawer, already correctly COMING_SOON).
 *
 * Static-source verification, matching this repo's existing test convention.
 */

import { readFileSync } from "fs";
import { join } from "path";

const FILES = {
  allowlist: join(__dirname, "..", "lib", "commandCenter", "gpsReleaseAllowlist.ts"),
  communicationsRail: join(__dirname, "..", "components", "commandCenter", "HubCommunicationsRail.tsx"),
} as const;

export function runGpsReleaseGatingConsistencyTest(): {
  allPassed: boolean;
  results: Record<string, boolean>;
} {
  const results: Record<string, boolean> = {};
  const allowlistSrc = readFileSync(FILES.allowlist, "utf8");
  const railSrc = readFileSync(FILES.communicationsRail, "utf8");

  results["articles_reclassified_coming_soon"] =
    /id:\s*"articles"[^}]*state:\s*"COMING_SOON"/.test(allowlistSrc);
  results["articles_no_longer_live"] = !/id:\s*"articles"[^}]*state:\s*"LIVE"/.test(allowlistSrc);
  results["biography_still_coming_soon"] =
    /id:\s*"biography"[^}]*state:\s*"COMING_SOON"/.test(allowlistSrc);

  results["comms_rail_imports_gate"] =
    /import\s*\{\s*gpsDestinationById,\s*gpsDestinationState\s*\}\s*from\s*["']@\/lib\/commandCenter\/gpsReleaseAllowlist["']/.test(
      railSrc,
    );
  // The real MessagingCanister/CommunityFeedPanel backend must only render
  // when the gate says LIVE — otherwise a truthful ReleaseHeldNote renders
  // instead. Checked per-destination since they're two independent gates.
  results["comms_rail_gates_messages_tab"] =
    /gpsDestinationState\("messages"\) === "LIVE"\s*\?\s*\(\s*<MessagingCanister/.test(railSrc);
  results["comms_rail_gates_community_tab"] =
    /gpsDestinationState\("community"\) === "LIVE"\s*\?\s*\(\s*<CommunityFeedPanel/.test(railSrc);
  results["comms_rail_has_release_held_fallback"] = /function ReleaseHeldNote/.test(railSrc);

  const allPassed = Object.values(results).every(Boolean);

  console.log(
    "[GPS_RELEASE_GATING_CONSISTENCY_TEST_ASSERT]",
    JSON.stringify({ allPassed, results }, null, 2),
  );
  return { allPassed, results };
}

describe("GPS release gating consistency", () => {
  it("keeps held destinations off live messaging surfaces", () => {
    const report = runGpsReleaseGatingConsistencyTest();
    expect(report.allPassed).toBe(true);
    expect(report.results.articles_reclassified_coming_soon).toBe(true);
    expect(report.results.comms_rail_gates_messages_tab).toBe(true);
    expect(report.results.comms_rail_gates_community_tab).toBe(true);
  });
});
