/**
 * Real Lounge Page Mount + CanonicalParticipantMediaAdapter + Monitor A/B bind.
 *
 * Honest contract suite. Live WebRTC device continuity remains OPEN / certified: false.
 */

import {
  CANONICAL_LOUNGE_CONTAINER,
  loungeAllowsAvatars,
  loungeDatingAccess,
  loungeHudMountsForRoom,
} from "../lib/venue-hud/loungeContainer";
import {
  CANONICAL_WORLD_VIEW_LAW,
  CANONICAL_WORLD_ZONE,
  LOUNGE_RUNTIME_LAW,
  LOUNGE_SIDE_ROOM_ROUTE_MAP,
  loungeSideRoomEntryHref,
  resolveLoungeMonitorViewport,
  resolveLoungeWorldEntry,
  zoneAllowsAvatars,
} from "../lib/live/canonicalWorldViewport";
import {
  adaptRoomParticipantToMediaIdentity,
  consumeCanonicalMonitorAssignment,
  createCountingMediaTransport,
  createPersonalMediaCommandBus,
  createPersonalMediaRouter,
  DEFAULT_MONITOR_A,
  getParticipantMediaMenu,
  LIVE_LOUNGE_MEDIA_ROUTING_CERT,
  registerAndAdaptParticipant,
} from "../lib/personal-media";

export function runRealLoungeMountIntegrationTest(): {
  allPassed: boolean;
  results: Record<string, boolean>;
} {
  const results: Record<string, boolean> = {};

  results["live_webrtc_device_continuity_open"] = LIVE_LOUNGE_MEDIA_ROUTING_CERT.certified === false;
  results["live_webrtc_device_continuity_status_open"] = LIVE_LOUNGE_MEDIA_ROUTING_CERT.status === "open";

  results["real_lounge_container_mounts_hud"] =
    CANONICAL_LOUNGE_CONTAINER.routePattern === "/live/rooms/[id]" &&
    CANONICAL_LOUNGE_CONTAINER.exampleRoute === "/live/rooms/lounge-playlist" &&
    CANONICAL_LOUNGE_CONTAINER.renderer === "UniversalVenueRenderer" &&
    CANONICAL_LOUNGE_CONTAINER.hud === "TMIInteractiveLoungeHud" &&
    loungeHudMountsForRoom("lounge-playlist") === true &&
    loungeHudMountsForRoom("playlist-lounge") === true &&
    loungeHudMountsForRoom("battle-thunder-dome") === false;

  results["lounge_side_room_zone_locked"] =
    CANONICAL_WORLD_ZONE.LOUNGE_SIDE_ROOM === "LOUNGE_SIDE_ROOM" &&
    CANONICAL_LOUNGE_CONTAINER.zone === "LOUNGE_SIDE_ROOM" &&
    CANONICAL_WORLD_VIEW_LAW.loungeAllowsAvatars === false &&
    LOUNGE_RUNTIME_LAW.loungeAllowsAvatars === false &&
    loungeAllowsAvatars("lounge-playlist") === false &&
    zoneAllowsAvatars(CANONICAL_WORLD_ZONE.LOUNGE_SIDE_ROOM) === false &&
    zoneAllowsAvatars(CANONICAL_WORLD_ZONE.FAN_AVATAR_LOBBY) === true;

  results["lounge_joins_existing_mill_not_lounge_v2"] =
    !resolveLoungeWorldEntry("playlist-lounge").href.includes("/lounge?") &&
    resolveLoungeWorldEntry("playlist-lounge").href.includes("/live/rooms/lounge-playlist") &&
    resolveLoungeWorldEntry("playlist-lounge").href.includes("zone=LOUNGE_SIDE_ROOM") &&
    LOUNGE_SIDE_ROOM_ROUTE_MAP["/rooms/playlist-lounge"].millRoomId === "lounge-playlist" &&
    loungeSideRoomEntryHref("playlist-lounge").includes("/live/rooms/lounge-playlist") &&
    CANONICAL_WORLD_VIEW_LAW.gate3PhysicalWorld === "OPEN" &&
    LOUNGE_RUNTIME_LAW.photorealMesh === false;

  const monA = resolveLoungeMonitorViewport("A");
  const monB = resolveLoungeMonitorViewport("B");
  results["lounge_monitor_a_conversation_no_uvr"] =
    monA.slot === "A" &&
    monA.zone === "LOUNGE_SIDE_ROOM" &&
    monA.usesUvr === false &&
    /conversation|self cam/i.test(monA.label);
  results["lounge_monitor_b_group_uvr"] =
    monB.slot === "B" &&
    monB.zone === "LOUNGE_SIDE_ROOM" &&
    monB.usesUvr === true &&
    /group|room/i.test(monB.label);

  const dating16 = loungeDatingAccess(
    {
      userId: "u16",
      ageYears: 16,
      accountSafetyState: "active",
      ageAssurance: "VERIFIED_TEEN",
    },
    "date-lounge",
  );
  const dating21 = loungeDatingAccess(
    {
      userId: "u21",
      ageYears: 21,
      accountSafetyState: "active",
      ageAssurance: "VERIFIED_ADULT",
    },
    "date-lounge",
  );
  results["dating_lounge_still_21_gated"] =
    dating16.allowed === false &&
    dating21.allowed === true;

  const { transport, counts } = createCountingMediaTransport();
  const router = createPersonalMediaRouter({ mediaTransport: transport });
  const bus = createPersonalMediaCommandBus(router);

  const videoTrack = { id: "v-track-charlie", kind: "video" as const };
  const audioTrack = { id: "a-track-charlie", kind: "audio" as const };

  const identity = adaptRoomParticipantToMediaIdentity({
    participantId: "part-charlie",
    canonicalIdentityId: "user-charlie",
    roomId: "lounge-playlist",
    displayName: "Charlie",
    spatialPodId: "pod-charlie-1",
    videoTrackRef: videoTrack,
    audioTrackRef: audioTrack,
  });

  results["participant_adapter_resolves_identity"] =
    identity.participantId === "part-charlie" &&
    identity.canonicalIdentityId === "user-charlie" &&
    identity.roomId === "lounge-playlist" &&
    identity.videoTrackId === "v-track-charlie" &&
    identity.audioTrackId === "a-track-charlie" &&
    identity.spatialPodId === "pod-charlie-1";

  const remoteOnly = adaptRoomParticipantToMediaIdentity({
    participantId: "part-dana",
    canonicalIdentityId: "user-dana",
    roomId: "lounge-playlist",
    displayName: "Dana",
  });
  results["adapter_does_not_invent_missing_tracks"] =
    remoteOnly.videoTrackId === null &&
    remoteOnly.audioTrackId === null &&
    remoteOnly.spatialPodId === null;

  const streamShaped = { id: "stream-not-a-track", getTracks: () => [] };
  const ignoredStream = adaptRoomParticipantToMediaIdentity({
    participantId: "part-stream",
    canonicalIdentityId: "user-stream",
    roomId: "lounge-playlist",
    videoTrackRef: streamShaped,
    audioTrackRef: streamShaped,
  });
  results["adapter_ignores_mediastream_as_track"] =
    ignoredStream.videoTrackId === null && ignoredStream.audioTrackId === null;

  registerAndAdaptParticipant(
    {
      participantId: "part-charlie",
      canonicalIdentityId: "user-charlie",
      roomId: "lounge-playlist",
      displayName: "Charlie",
      spatialPodId: "pod-charlie-1",
      videoTrackId: "v-track-charlie",
      audioTrackId: "a-track-charlie",
    },
    router,
  );

  const menu = getParticipantMediaMenu(router, "part-charlie");
  results["real_participant_reaches_context_ring"] =
    router.getParticipant("part-charlie")?.canonicalIdentityId === "user-charlie" &&
    menu.some((item) => item.id === "WATCH_ON") &&
    menu.some((item) => item.id === "PIN_AUDIO") &&
    menu.some((item) => item.id === "MUTE_FOR_ME") &&
    menu.some((item) => item.id === "HIDE_VIDEO_FOR_ME") &&
    menu.some((item) => item.id === "REMOVE_FROM_MY_VIEW");

  results["watch_on_monitor_a_creates_assignment"] = bus.execute("MEDIA.ASSIGN_TO_MONITOR", {
    participantId: "part-charlie",
    target: DEFAULT_MONITOR_A,
  });

  const consumed = consumeCanonicalMonitorAssignment(DEFAULT_MONITOR_A, router);
  results["canonical_monitor_a_consumes_assignment"] =
    consumed.identity?.participantId === "part-charlie" &&
    consumed.identity.videoTrackId === "v-track-charlie" &&
    consumed.streamReconnected === false &&
    consumed.createdVideoElement === false &&
    consumed.source === "PersonalMediaRouter.getAssignment" &&
    router.getAssignment(DEFAULT_MONITOR_A)?.participantId === "part-charlie";

  const snapshot = router.getSnapshot();
  results["my_view_reflects_assignment"] =
    snapshot.assignments.length === 1 &&
    snapshot.assignments[0]?.identity.participantId === "part-charlie" &&
    snapshot.assignments[0]?.target.monitorId === "MONITOR_A";

  results["remove_monitor_releases_assignment"] =
    bus.execute("MEDIA.REMOVE_FROM_MONITOR", { target: DEFAULT_MONITOR_A }) &&
    router.getAssignment(DEFAULT_MONITOR_A) === null &&
    consumeCanonicalMonitorAssignment(DEFAULT_MONITOR_A, router).identity === null;

  results["spatial_participant_remains"] =
    router.getParticipant("part-charlie")?.spatialPodId === "pod-charlie-1" &&
    router.getParticipant("part-charlie")?.videoTrackId === "v-track-charlie";

  results["pin_audio_reaches_local_audio_policy"] =
    bus.execute("MEDIA.PIN_AUDIO", { participantId: "part-charlie" }) &&
    (() => {
      router.simulateAvatarMove("part-charlie", 40);
      const resolved = router.evaluateAudio("part-charlie");
      return resolved.audible && resolved.resolvedBy === "pinned_audio";
    })();

  registerAndAdaptParticipant(
    {
      participantId: "part-charlie",
      canonicalIdentityId: "user-charlie",
      roomId: "lounge-playlist",
      displayName: "Charlie",
      spatialPodId: "pod-charlie-1",
      videoTrackId: "v-track-charlie",
      audioTrackId: "a-track-charlie",
    },
    router,
  );
  results["no_duplicate_track_identity_created"] =
    router.getStateSummary().identityCount === 1 &&
    router.getParticipant("part-charlie")?.videoTrackId === "v-track-charlie" &&
    counts.subscribe === 0 &&
    counts.reconnect === 0;

  const allPassed = Object.values(results).every(Boolean);
  console.log(`[REAL_LOUNGE_MOUNT_INTEGRATION_TEST_ASSERT]`, JSON.stringify({ allPassed, results }, null, 2));
  return { allPassed, results };
}


