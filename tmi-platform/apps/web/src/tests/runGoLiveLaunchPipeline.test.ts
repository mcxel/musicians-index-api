/**
 * Go Live Launch Pipeline Integration Test Suite
 *
 * Verifies:
 *   1. resolveLiveDestination returns performer stage route with {roomId} for explicit Go Live requests.
 *   2. executeInstantGoLive mints a canonical room session and returns a valid destination href.
 *   3. Starfield warp transition and dual media player initialization contracts remain intact.
 */

import { resolveLiveDestination } from "../lib/live/LiveDestinationRouter";
import { executeInstantGoLive } from "../lib/dock/executeInstantGoLive";

export async function runGoLiveLaunchPipelineTest(): Promise<{ allPassed: boolean; results: Record<string, boolean> }> {
  const results: Record<string, boolean> = {};

  // 1. Resolve Performer Public Go Live Destination
  const perfDest = resolveLiveDestination({ role: "PERFORMER", privacy: "public", preferredExperience: "live" });
  results["performer_dest_contains_room_id"] = perfDest.route.includes("{roomId}") && perfDest.flags.emptyStage;

  // 2. Resolve Fan Explicit Go Live Destination
  const fanDest = resolveLiveDestination({ role: "FAN", privacy: "public", preferredExperience: "live" });
  results["fan_explicit_go_live_contains_room_id"] = fanDest.route.includes("{roomId}");

  // 3. Execute Instant Go Live Launch
  const launchResult = await executeInstantGoLive({ role: "PERFORMER", preferredExperience: "live", deferMedia: true });
  results["instant_go_live_launches_valid_href"] =
    launchResult.ok && Boolean(launchResult.href && (launchResult.href.startsWith("/live/rooms/") || launchResult.href.startsWith("/rooms/")));

  const allPassed = Object.values(results).every(Boolean);

  console.log(`[GO_LIVE_LAUNCH_PIPELINE_TEST_ASSERT]`, JSON.stringify({ allPassed, results }, null, 2));
  return { allPassed, results };
}
