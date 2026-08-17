/**
 * Personal Media Router contract suite.
 *
 * Asserts client-local routing only:
 *   ENTER two identities → A on Monitor A slot-main, B on Monitor B slot-main
 *   avatar move does not request reconnect
 *   pin A audio survives walking past proximity
 *   mute B is local-only
 *   remove A from monitor (identity still exists)
 *   hide B video / restore B from MY VIEW
 *   remove-from-view / restore cycle
 *   RESTORE_ALL returns clean local state
 *   0 WebRTC subscribe/reconnect calls on injected transport
 *
 * Live lounge media-routing cert stays open / certified: false.
 */

import {
  AUDIO_RESOLUTION_ORDER,
  createCountingMediaTransport,
  createCountingRoomAuthorityPort,
  createPersonalMediaCommandBus,
  createPersonalMediaRouter,
  DEFAULT_MONITOR_A,
  DEFAULT_MONITOR_B,
  getParticipantMediaMenu,
  LIVE_LOUNGE_MEDIA_ROUTING_CERT,
  PERSONAL_MEDIA_COMMANDS,
  type ParticipantMediaIdentity,
} from "../lib/personal-media";

function identity(partial: Partial<ParticipantMediaIdentity> & { participantId: string; canonicalIdentityId: string }): ParticipantMediaIdentity {
  return {
    roomId: "lounge-1",
    videoTrackId: `v-${partial.participantId}`,
    audioTrackId: `a-${partial.participantId}`,
    spatialPodId: null,
    ...partial,
  };
}

export function runPersonalMediaRouterTest(): { allPassed: boolean; results: Record<string, boolean> } {
  const results: Record<string, boolean> = {};

  results["live_lounge_media_routing_certified_false"] = LIVE_LOUNGE_MEDIA_ROUTING_CERT.certified === false;
  results["live_lounge_media_routing_status_open"] = LIVE_LOUNGE_MEDIA_ROUTING_CERT.status === "open";
  results["audio_resolution_order_law"] =
    AUDIO_RESOLUTION_ORDER[0] === "blocked_unauthorized" &&
    AUDIO_RESOLUTION_ORDER[1] === "local_mute" &&
    AUDIO_RESOLUTION_ORDER[2] === "private_channel_policy" &&
    AUDIO_RESOLUTION_ORDER[3] === "pinned_audio" &&
    AUDIO_RESOLUTION_ORDER[4] === "proximity_attenuation" &&
    AUDIO_RESOLUTION_ORDER.length === 5;

  const { transport, counts } = createCountingMediaTransport();
  const { port: roomAuthority, counts: roomCounts } = createCountingRoomAuthorityPort();
  const router = createPersonalMediaRouter({ mediaTransport: transport, roomAuthority });
  const bus = createPersonalMediaCommandBus(router);

  results["command_surface_complete"] = PERSONAL_MEDIA_COMMANDS.length === 12;

  // ENTER
  const pA = identity({
    participantId: "part-a",
    canonicalIdentityId: "user-a",
    displayName: "A",
    spatialPodId: "pod-a",
  });
  const pB = identity({
    participantId: "part-b",
    canonicalIdentityId: "user-b",
    displayName: "B",
  });
  router.registerParticipant(pA);
  router.registerParticipant(pB);

  results["enter_two_identities"] = router.getStateSummary().identityCount === 2;
  results["a_keeps_spatial_pod_id_without_faking_runtime"] = router.getParticipant("part-a")?.spatialPodId === "pod-a";
  results["b_spatial_pod_id_null_honest"] = router.getParticipant("part-b")?.spatialPodId === null;
  results["track_ids_stable_on_enter"] =
    router.getParticipant("part-a")?.videoTrackId === "v-part-a" &&
    router.getParticipant("part-a")?.audioTrackId === "a-part-a";

  const targetA = router.getDefaultMonitorA();
  const targetB = router.getDefaultMonitorB();
  results["default_monitor_a_slot_main"] = targetA.monitorId === "MONITOR_A" && targetA.slotId === "slot-main";
  results["default_monitor_b_slot_main"] = targetB.monitorId === "MONITOR_B" && targetB.slotId === "slot-main";
  results["slots_1_to_4_addressable_without_rewrite"] = router.listWatchTargets().some(
    (t) => t.monitorId === "MONITOR_A" && t.slotId === "slot-4",
  );

  results["assign_a_monitor_a"] = bus.execute("MEDIA.ASSIGN_TO_MONITOR", {
    participantId: "part-a",
    target: DEFAULT_MONITOR_A,
  });
  results["assign_b_monitor_b"] = bus.execute("MEDIA.ASSIGN_TO_MONITOR", {
    participantId: "part-b",
    target: DEFAULT_MONITOR_B,
  });
  results["monitor_a_has_a"] = router.getMonitorAssignment(targetA)?.participantId === "part-a";
  results["monitor_b_has_b"] = router.getMonitorAssignment(targetB)?.participantId === "part-b";

  const reconnectsAfterAssign = counts.subscribe + counts.reconnect;

  router.simulateAvatarMove("part-a", 42);
  results["avatar_move_does_not_reconnect"] =
    counts.subscribe + counts.reconnect === reconnectsAfterAssign;

  results["pin_a_audio"] = bus.execute("MEDIA.PIN_AUDIO", { participantId: "part-a" });
  const pinnedFar = router.evaluateAudio("part-a", { distanceMeters: 42 });
  results["pin_survives_beyond_proximity"] =
    pinnedFar.audible === true && pinnedFar.resolvedBy === "pinned_audio";

  router.setSafetyLock("part-a", { blocked: true });
  const pinnedBlocked = router.evaluateAudio("part-a");
  results["pin_does_not_override_safety"] =
    pinnedBlocked.audible === false && pinnedBlocked.resolvedBy === "blocked_unauthorized";
  router.setSafetyLock("part-a", { blocked: false, unauthorized: false });

  router.setPrivateChannelRestricted("part-a", true);
  const pinnedPrivate = router.evaluateAudio("part-a");
  results["pin_does_not_override_private_channel"] =
    pinnedPrivate.audible === false && pinnedPrivate.resolvedBy === "private_channel_policy";
  router.setPrivateChannelRestricted("part-a", false);

  results["mute_b_local"] = bus.execute("MEDIA.MUTE_LOCAL", { participantId: "part-b" });
  const mutedB = router.evaluateAudio("part-b");
  const unmutedA = router.evaluateAudio("part-a");
  results["mute_b_only"] = mutedB.resolvedBy === "local_mute" && unmutedA.audible === true;
  results["pin_does_not_override_explicit_mute"] = (() => {
    bus.execute("MEDIA.MUTE_LOCAL", { participantId: "part-a" });
    const r = router.evaluateAudio("part-a");
    bus.execute("MEDIA.UNMUTE_LOCAL", { participantId: "part-a" });
    return r.resolvedBy === "local_mute" && r.audible === false;
  })();

  const aTracksBeforeRemove = {
    v: router.getParticipant("part-a")?.videoTrackId,
    a: router.getParticipant("part-a")?.audioTrackId,
    pod: router.getParticipant("part-a")?.spatialPodId,
  };
  results["remove_a_from_monitor"] = bus.execute("MEDIA.REMOVE_FROM_MONITOR", { target: DEFAULT_MONITOR_A });
  results["a_unassigned_from_monitor"] = router.getMonitorAssignment(targetA) === null;
  results["a_still_spatially_exists"] =
    router.getParticipant("part-a") !== undefined &&
    router.getParticipant("part-a")?.spatialPodId === aTracksBeforeRemove.pod &&
    router.getParticipant("part-a")?.videoTrackId === aTracksBeforeRemove.v;

  results["hide_b_video"] = bus.execute("MEDIA.HIDE_VIDEO_LOCAL", { participantId: "part-b" });
  results["b_video_hidden"] = router.isVideoHidden("part-b") === true;
  results["restore_b_video_from_my_view"] = bus.execute("MEDIA.RESTORE_VIDEO_LOCAL", {
    participantId: "part-b",
  });
  results["b_video_restored"] = router.isVideoHidden("part-b") === false;

  router.setInteractionTarget("part-a");
  bus.execute("MEDIA.ASSIGN_TO_MONITOR", { participantId: "part-a", target: DEFAULT_MONITOR_A });
  results["remove_from_view"] = bus.execute("MEDIA.REMOVE_FROM_VIEW", { participantId: "part-a" });
  results["remove_from_view_hides_and_mutes"] =
    router.isRemovedFromView("part-a") &&
    router.isVideoHidden("part-a") &&
    router.evaluateAudio("part-a").resolvedBy === "local_mute";
  results["remove_from_view_clears_monitor_and_interaction"] =
    router.getMonitorAssignment(targetA) === null && router.getInteractionTargetId() === null;
  results["remove_from_view_did_not_kick"] =
    roomCounts.kick === 0 &&
    roomCounts.ban === 0 &&
    roomCounts.globalMute === 0 &&
    roomCounts.removeFromRoom === 0;

  results["restore_from_view"] = bus.execute("MEDIA.RESTORE_TO_VIEW", { participantId: "part-a" });
  results["restore_from_view_clears_removed"] =
    !router.isRemovedFromView("part-a") &&
    !router.isVideoHidden("part-a") &&
    router.evaluateAudio("part-a").resolvedBy !== "local_mute";

  bus.execute("MEDIA.ASSIGN_TO_MONITOR", { participantId: "part-a", target: DEFAULT_MONITOR_A });
  bus.execute("MEDIA.PIN_AUDIO", { participantId: "part-a" });
  bus.execute("MEDIA.MUTE_LOCAL", { participantId: "part-b" });
  bus.execute("MEDIA.HIDE_VIDEO_LOCAL", { participantId: "part-b" });
  bus.execute("MEDIA.SWAP_MONITOR_ASSIGNMENTS", { a: DEFAULT_MONITOR_A, b: DEFAULT_MONITOR_B });
  results["swap_then_restore_all"] = bus.execute("MEDIA.RESTORE_ALL");
  const clean = router.getStateSummary();
  results["restore_all_clean_local_state"] =
    clean.assignmentsCount === 0 &&
    clean.pinnedAudioCount === 0 &&
    clean.mutedAudioCount === 0 &&
    clean.hiddenVideoCount === 0 &&
    clean.removedFromViewCount === 0 &&
    clean.interactionTargetId === null;
  results["restore_all_keeps_identities"] = clean.identityCount === 2;

  results["zero_webrtc_subscribe_calls"] = counts.subscribe === 0;
  results["zero_webrtc_reconnect_calls"] = counts.reconnect === 0;
  results["zero_webrtc_unsubscribe_calls"] = counts.unsubscribe === 0;

  bus.execute("MEDIA.ASSIGN_TO_MONITOR", { participantId: "part-a", target: DEFAULT_MONITOR_A });
  const menu = getParticipantMediaMenu(router, "part-a", { profileHref: "/profiles/user-a" });
  results["context_has_watch_on"] = menu.some((item) => item.id === "WATCH_ON");
  results["context_has_move_and_remove_when_assigned"] =
    menu.some((item) => item.id === "MOVE_TO") && menu.some((item) => item.id === "REMOVE_FROM_MONITOR");
  results["context_has_profile_only_with_href"] = menu.some((item) => item.id === "PROFILE");
  results["context_omits_private_talk_without_handler"] = !menu.some((item) => item.id === "PRIVATE_TALK");

  const allPassed = Object.values(results).every(Boolean);
  console.log(`[PERSONAL_MEDIA_ROUTER_TEST_ASSERT]`, JSON.stringify({ allPassed, results }, null, 2));
  return { allPassed, results };
}

declare const require: { main: unknown; cache: unknown };
declare const module: { exports: unknown };

if (typeof require !== "undefined" && require.main === module) {
  const outcome = runPersonalMediaRouterTest();
  if (!outcome.allPassed) {
    process.exitCode = 1;
  }
}
