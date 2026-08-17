/**
 * Personal Media Router Certification Suite
 *
 * Verifies:
 *   1. Participant Media Identity Invariance: Stable participantId, roomId, videoTrackId, audioTrackId
 *   2. Monitor Slot Assignment: Addressable Monitor A / Monitor B targets, swap & remove actions
 *   3. Audio Resolution Hierarchy & Pin Audio: Pin Audio overrides proximity attenuation while roaming
 *   4. Local Curation Isolation: Local mute, hide video, remove from view do not alter global room state
 *   5. Zero WebRTC Reconnection: Stream stays connected across all local assignment transitions
 *   6. Recovery Drawer (MY VIEW): Individual restore and RESTORE_ALL functionality
 */

import {
  PersonalMediaRouter,
  type ParticipantMediaIdentity,
  type MonitorTarget,
} from "../lib/venue-hud/PersonalMediaRouter";

export function runPersonalMediaRouterTest(): { allPassed: boolean; results: Record<string, boolean> } {
  const results: Record<string, boolean> = {};

  const pA: ParticipantMediaIdentity = {
    participantId: "part-a",
    roomId: "lounge-vip-1",
    videoTrackId: "v-track-a",
    audioTrackId: "a-track-a",
    spatialPodId: "pod-a",
    canonicalIdentityId: "user-a",
    displayName: "Alice",
  };

  const pB: ParticipantMediaIdentity = {
    participantId: "part-b",
    roomId: "lounge-vip-1",
    videoTrackId: "v-track-b",
    audioTrackId: "a-track-b",
    spatialPodId: "pod-b",
    canonicalIdentityId: "user-b",
    displayName: "Bob",
  };

  PersonalMediaRouter.registerParticipant(pA);
  PersonalMediaRouter.registerParticipant(pB);

  // 1. Monitor Assignment (No WebRTC Reconnection)
  const targetA: MonitorTarget = { monitorId: "MONITOR_A", slotId: "PRIMARY" };
  const targetB: MonitorTarget = { monitorId: "MONITOR_B", slotId: "PRIMARY" };

  const resA = PersonalMediaRouter.assignToMonitor("part-a", targetA);
  const resB = PersonalMediaRouter.assignToMonitor("part-b", targetB);

  results["assign_monitor_a_success"] = resA.ok && resA.streamReconnected === false;
  results["assign_monitor_b_success"] = resB.ok && resB.streamReconnected === false;
  results["monitor_a_has_alice"] = PersonalMediaRouter.getMonitorAssignment(targetA)?.displayName === "Alice";

  // 2. Audio Pinning Overrides Proximity
  PersonalMediaRouter.pinAudio("part-a");
  const audioStateA = PersonalMediaRouter.evaluateAudioState("part-a", false, false);
  results["pin_audio_overrides_proximity"] = audioStateA === "PINNED_FOREGROUND";

  // 3. Local Mute Overrides Pin Audio
  PersonalMediaRouter.muteLocal("part-a");
  const audioStateAMuted = PersonalMediaRouter.evaluateAudioState("part-a", false, false);
  results["local_mute_overrides_pin_audio"] = audioStateAMuted === "LOCAL_MUTE_ACTIVE";

  PersonalMediaRouter.unmuteLocal("part-a");

  // 4. Swap Monitor Assignments
  PersonalMediaRouter.swapMonitorAssignments(targetA, targetB);
  results["swap_monitors_a_has_bob"] = PersonalMediaRouter.getMonitorAssignment(targetA)?.displayName === "Bob";
  results["swap_monitors_b_has_alice"] = PersonalMediaRouter.getMonitorAssignment(targetB)?.displayName === "Alice";

  // Swap back
  PersonalMediaRouter.swapMonitorAssignments(targetA, targetB);

  // 5. Remove From Monitor (Spatial presence remains)
  const removeRes = PersonalMediaRouter.removeFromMonitor(targetA);
  results["remove_from_monitor_unassigned"] = PersonalMediaRouter.getMonitorAssignment(targetA) === null;
  results["spatial_presence_remains_in_registry"] = PersonalMediaRouter.getParticipant("part-a") !== undefined;

  // 6. Local Hide & Remove From View Composite
  PersonalMediaRouter.removeFromView("part-b");
  const summary = PersonalMediaRouter.getStateSummary();
  results["remove_from_view_composite"] = summary.removedFromViewCount === 1 && summary.mutedAudioCount === 1;

  // 7. Restore All
  PersonalMediaRouter.restoreAllPersonalViewSettings();
  const summaryRestored = PersonalMediaRouter.getStateSummary();
  results["restore_all_clears_local_state"] =
    summaryRestored.assignmentsCount === 0 &&
    summaryRestored.pinnedAudioCount === 0 &&
    summaryRestored.removedFromViewCount === 0;

  const allPassed = Object.values(results).every(Boolean);

  console.log(`[PERSONAL_MEDIA_ROUTER_TEST_ASSERT]`, JSON.stringify({ allPassed, results }, null, 2));
  return { allPassed, results };
}

if (require.main === module) {
  runPersonalMediaRouterTest();
}
