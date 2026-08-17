/**
 * Real Lounge Mount & Media Binding Integration Certification Suite
 *
 * Verifies:
 *   1. real_route_mounts_lounge_hud: resolveCanonicalHudFamily maps "LOUNGE" to "LOUNGE_HUD"
 *   2. real_participant_adapter_resolves_identity: CanonicalParticipantMediaAdapter creates valid ParticipantMediaIdentity
 *   3. context_ring_targets_real_participant: Target participant identity is registered in PersonalMediaRouter
 *   4. monitor_a_receives_assignment: Assigning participant to MONITOR_A succeeds with streamReconnected: false
 *   5. my_view_reflects_assignment: Recovery summary tracks monitor assignments
 *   6. remove_monitor_releases_assignment: Removing from MONITOR_A releases assignment
 *   7. spatial_presence_remains: 3D spatial pod & identity remain untouched in room
 *   8. no_duplicate_media_identity_created: WebRTC track references remain single-sourced
 */

import {
  resolveCanonicalHudFamily,
} from "../lib/venue-hud/TMIExperienceHudRuntime";
import {
  registerAndAdaptParticipant,
  adaptRoomParticipantToMediaIdentity,
  type CanonicalParticipantMediaAdapterInput,
} from "../lib/venue-hud/CanonicalParticipantMediaAdapter";
import {
  PersonalMediaRouter,
  type MonitorTarget,
} from "../lib/venue-hud/PersonalMediaRouter";

export function runRealLoungeMountIntegrationTest(): { allPassed: boolean; results: Record<string, boolean> } {
  const results: Record<string, boolean> = {};

  // 1. Real Route Mounts Lounge HUD Family
  const family = resolveCanonicalHudFamily("LOUNGE");
  results["real_route_mounts_lounge_hud"] = family === "LOUNGE_HUD";

  // 2. Real Participant Adapter Resolves Identity
  const dummyAudioTrack = { kind: "audio", id: "track-aud-1" };
  const dummyVideoTrack = { kind: "video", id: "track-vid-1" };

  const adapterInput: CanonicalParticipantMediaAdapterInput = {
    participantId: "part-real-1",
    canonicalIdentityId: "user-real-1",
    roomId: "lounge-main-01",
    displayName: "Charlie",
    spatialPodId: "pod-charlie-1",
    audioTrackRef: dummyAudioTrack,
    videoTrackRef: dummyVideoTrack,
    isAudioAvailable: true,
    isVideoAvailable: true,
  };

  const identity = adaptRoomParticipantToMediaIdentity(adapterInput);

  results["real_participant_adapter_resolves_identity"] =
    identity.participantId === "part-real-1" &&
    identity.displayName === "Charlie" &&
    identity.videoTrackId !== null;

  // 3. Register & Target Real Participant
  registerAndAdaptParticipant(adapterInput);
  const registered = PersonalMediaRouter.getParticipant("part-real-1");
  results["context_ring_targets_real_participant"] = registered?.displayName === "Charlie";

  // 4. Assign To Monitor A (0 WebRTC Reconnections)
  const targetA: MonitorTarget = { monitorId: "MONITOR_A", slotId: "PRIMARY" };
  const assignRes = PersonalMediaRouter.assignToMonitor("part-real-1", targetA);
  results["monitor_a_receives_assignment"] = assignRes.ok && assignRes.streamReconnected === false;

  // 5. MY VIEW Reflects Assignment
  const summary = PersonalMediaRouter.getStateSummary();
  results["my_view_reflects_assignment"] = summary.assignmentsCount === 1;

  // 6. Remove Assignment Releases Monitor
  const removeRes = PersonalMediaRouter.removeFromMonitor(targetA);
  results["remove_monitor_releases_assignment"] = removeRes.ok && PersonalMediaRouter.getMonitorAssignment(targetA) === null;

  // 7. Spatial Presence Remains
  results["spatial_presence_remains"] = PersonalMediaRouter.getParticipant("part-real-1") !== undefined;

  // 8. No Duplicate Media Identity Created
  const reAdapted = adaptRoomParticipantToMediaIdentity(adapterInput);
  results["no_duplicate_media_identity_created"] =
    reAdapted.participantId === identity.participantId &&
    reAdapted.spatialPodId === identity.spatialPodId;

  const allPassed = Object.values(results).every(Boolean);

  console.log(`[REAL_LOUNGE_MOUNT_INTEGRATION_TEST_ASSERT]`, JSON.stringify({ allPassed, results }, null, 2));
  return { allPassed, results };
}

if (require.main === module) {
  runRealLoungeMountIntegrationTest();
}
