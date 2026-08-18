/**
 * Lounge context-ring + PersonalMediaCommandBus integration.
 * Uses the canonical PersonalMediaRouter — no fake 3D lounge, no WebRTC reconnect.
 */

import {
  createCountingMediaTransport,
  createPersonalMediaCommandBus,
  createPersonalMediaRouter,
  DEFAULT_MONITOR_A,
  DEFAULT_MONITOR_B,
  getParticipantMediaMenu,
  LIVE_LOUNGE_MEDIA_ROUTING_CERT,
  type ParticipantMediaIdentity,
} from "../lib/personal-media";
import { HudCommandBus } from "../lib/venue-hud/TMIExperienceHudRuntime";

export function runLoungeContextRingIntegrationTest(): {
  allPassed: boolean;
  results: Record<string, boolean>;
} {
  const results: Record<string, boolean> = {};
  results["live_cert_still_open"] = LIVE_LOUNGE_MEDIA_ROUTING_CERT.certified === false;

  const { transport, counts } = createCountingMediaTransport();
  const router = createPersonalMediaRouter({ mediaTransport: transport });
  const bus = createPersonalMediaCommandBus(router);

  const alice: ParticipantMediaIdentity = {
    participantId: "part-alice",
    canonicalIdentityId: "user-alice",
    roomId: "lounge-chill-1",
    videoTrackId: "v-track-alice",
    audioTrackId: "a-track-alice",
    spatialPodId: "pod-alice",
    displayName: "Alice",
  };
  const bob: ParticipantMediaIdentity = {
    participantId: "part-bob",
    canonicalIdentityId: "user-bob",
    roomId: "lounge-chill-1",
    videoTrackId: "v-track-bob",
    audioTrackId: "a-track-bob",
    spatialPodId: null,
    displayName: "Bob",
  };

  router.registerParticipant(alice);
  router.registerParticipant(bob);

  const unbind = bus.bindToHudBus(HudCommandBus as never);

  void HudCommandBus.execute("MEDIA.ASSIGN_TO_MONITOR", {
    params: { participantId: "part-alice", target: DEFAULT_MONITOR_A },
  });
  void HudCommandBus.execute("MEDIA.ASSIGN_TO_MONITOR", {
    params: { participantId: "part-bob", target: DEFAULT_MONITOR_B },
  });

  results["hud_bus_assigns_monitor_a"] = router.getMonitorAssignment(DEFAULT_MONITOR_A)?.participantId === "part-alice";
  results["hud_bus_assigns_monitor_b"] = router.getMonitorAssignment(DEFAULT_MONITOR_B)?.participantId === "part-bob";

  const menuAssigned = getParticipantMediaMenu(router, "part-alice", { profileHref: "/profiles/user-alice" });
  results["context_watch_on"] = menuAssigned.some((item) => item.id === "WATCH_ON");
  results["context_move_to"] = menuAssigned.some((item) => item.id === "MOVE_TO");
  results["context_remove_from_monitor"] = menuAssigned.some((item) => item.id === "REMOVE_FROM_MONITOR");
  results["context_pin_audio"] = menuAssigned.some((item) => item.id === "PIN_AUDIO");
  results["context_mute_for_me"] = menuAssigned.some((item) => item.id === "MUTE_FOR_ME");
  results["context_hide_video"] = menuAssigned.some((item) => item.id === "HIDE_VIDEO_FOR_ME");
  results["context_remove_from_my_view"] = menuAssigned.some((item) => item.id === "REMOVE_FROM_MY_VIEW");
  results["context_profile"] = menuAssigned.some((item) => item.id === "PROFILE");

  void HudCommandBus.execute("MEDIA.PIN_AUDIO", { params: { participantId: "part-alice" } });
  router.simulateAvatarMove("part-alice", 40);
  const roam = router.evaluateAudio("part-alice");
  results["pin_overrides_proximity_while_roaming"] = roam.audible && roam.resolvedBy === "pinned_audio";

  void HudCommandBus.execute("MEDIA.MUTE_LOCAL", { params: { participantId: "part-bob" } });
  results["mute_bob_local"] = router.evaluateAudio("part-bob").resolvedBy === "local_mute";

  void HudCommandBus.execute("MEDIA.REMOVE_FROM_MONITOR", { params: { target: DEFAULT_MONITOR_A } });
  results["alice_unassigned"] = router.getMonitorAssignment(DEFAULT_MONITOR_A) === null;
  results["alice_identity_remains"] = router.getParticipant("part-alice")?.spatialPodId === "pod-alice";

  void HudCommandBus.execute("MEDIA.REMOVE_FROM_VIEW", { params: { participantId: "part-bob" } });
  results["my_view_removed_bob"] = router.isRemovedFromView("part-bob");

  void HudCommandBus.execute("MEDIA.RESTORE_ALL");
  const clean = router.getStateSummary();
  results["restore_all_clears_my_view"] =
    clean.assignmentsCount === 0 &&
    clean.removedFromViewCount === 0 &&
    clean.pinnedAudioCount === 0 &&
    clean.mutedAudioCount === 0;

  results["zero_webrtc_reconnects"] = counts.subscribe === 0 && counts.reconnect === 0;

  unbind();
  const allPassed = Object.values(results).every(Boolean);
  console.log(`[LOUNGE_CONTEXT_RING_INTEGRATION_TEST_ASSERT]`, JSON.stringify({ allPassed, results }, null, 2));
  return { allPassed, results };
}

declare const require: { main: unknown };
declare const module: { exports: unknown };

if (typeof require !== "undefined" && require.main === module) {
  const outcome = runLoungeContextRingIntegrationTest();
  if (!outcome.allPassed) process.exitCode = 1;
}
