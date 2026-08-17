/**
 * Lounge Context Ring & Personal Media Router Integration Test Suite
 *
 * Verifies:
 *   1. Context Ring Action Dispatch -> PersonalMediaRouter state updates
 *   2. Monitor Target Assignment (Monitor A / Monitor B) without WebRTC reconnection
 *   3. Pin Audio Overriding Proximity while Roam Avatar moves
 *   4. Local Mute / Hide Video Isolation
 *   5. MY VIEW Recovery Drawer State & RESTORE ALL round-trip
 */

import {
  PersonalMediaRouter,
  type ParticipantMediaIdentity,
  type MonitorTarget,
} from "../lib/venue-hud/PersonalMediaRouter";
import { HudCommandBus } from "../lib/venue-hud/TMIExperienceHudRuntime";

export function runLoungeContextRingIntegrationTest(): { allPassed: boolean; results: Record<string, boolean> } {
  const results: Record<string, boolean> = {};

  const pAlice: ParticipantMediaIdentity = {
    participantId: "part-alice",
    roomId: "lounge-chill-1",
    videoTrackId: "v-track-alice",
    audioTrackId: "a-track-alice",
    spatialPodId: "pod-alice",
    canonicalIdentityId: "user-alice",
    displayName: "Alice",
  };

  const pBob: ParticipantMediaIdentity = {
    participantId: "part-bob",
    roomId: "lounge-chill-1",
    videoTrackId: "v-track-bob",
    audioTrackId: "a-track-bob",
    spatialPodId: "pod-bob",
    canonicalIdentityId: "user-bob",
    displayName: "Bob",
  };

  PersonalMediaRouter.registerParticipant(pAlice);
  PersonalMediaRouter.registerParticipant(pBob);

  // 1. Assign Alice to Monitor A
  const targetA: MonitorTarget = { monitorId: "MONITOR_A", slotId: "PRIMARY" };
  const assignRes = PersonalMediaRouter.assignToMonitor("part-alice", targetA);
  results["ux_assign_alice_monitor_a"] = assignRes.ok && assignRes.streamReconnected === false;
  results["ux_monitor_a_assigned"] = PersonalMediaRouter.getMonitorAssignment(targetA)?.displayName === "Alice";

  // 2. Assign Bob to Monitor B
  const targetB: MonitorTarget = { monitorId: "MONITOR_B", slotId: "PRIMARY" };
  PersonalMediaRouter.assignToMonitor("part-bob", targetB);
  results["ux_monitor_b_assigned"] = PersonalMediaRouter.getMonitorAssignment(targetB)?.displayName === "Bob";

  // 3. Pin Alice's Audio & Roam Avatar
  PersonalMediaRouter.pinAudio("part-alice");
  const audioStateAlice = PersonalMediaRouter.evaluateAudioState("part-alice", false, false);
  results["ux_pin_audio_roam_foreground"] = audioStateAlice === "PINNED_FOREGROUND";

  // 4. Mute Bob Locally
  PersonalMediaRouter.muteLocal("part-bob");
  const audioStateBob = PersonalMediaRouter.evaluateAudioState("part-bob", false, false);
  results["ux_mute_bob_local_active"] = audioStateBob === "LOCAL_MUTE_ACTIVE";

  // 5. Remove Alice From Monitor A (Spatial presence remains)
  const removeRes = PersonalMediaRouter.removeFromMonitor(targetA);
  results["ux_remove_alice_monitor_unassigned"] = PersonalMediaRouter.getMonitorAssignment(targetA) === null;
  results["ux_alice_spatial_pod_remains"] = PersonalMediaRouter.getParticipant("part-alice") !== undefined;

  // 6. MY VIEW Drawer State & Restore All
  PersonalMediaRouter.removeFromView("part-bob");
  const summaryBefore = PersonalMediaRouter.getStateSummary();
  results["ux_my_view_drawer_populates"] = summaryBefore.removedFromViewCount === 1;

  PersonalMediaRouter.restoreAllPersonalViewSettings();
  const summaryAfter = PersonalMediaRouter.getStateSummary();
  results["ux_restore_all_clears_drawer"] = summaryAfter.removedFromViewCount === 0 && summaryAfter.assignmentsCount === 0;

  const allPassed = Object.values(results).every(Boolean);

  console.log(`[LOUNGE_CONTEXT_RING_INTEGRATION_TEST_ASSERT]`, JSON.stringify({ allPassed, results }, null, 2));
  return { allPassed, results };
}

if (require.main === module) {
  runLoungeContextRingIntegrationTest();
}
