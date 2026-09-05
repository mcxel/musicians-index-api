/**
 * ChannelMixerDirector certification — PERSONAL vs PROGRAM isolation,
 * program auth, crowd-zero safety, session invariants.
 */

import {
  ChannelMixerDirector,
  MIXER_VIRTUAL_CHANNEL_IDS,
} from "../lib/audio/mixer/ChannelMixerDirector";
import { resolveExperienceAudioProfile } from "../lib/audio/mixer/ExperienceAudioPolicy";
import { CanonicalPerformanceGlueDirector } from "../lib/audio/mixer/CanonicalPerformanceGlueDirector";
import { FidelityIntelligenceDirector } from "../lib/audio/mixer/FidelityIntelligenceDirector";
import {
  ensureLiveRoomMixerBound,
  injectAudioOwnerForTests,
  leaveLiveRoomMixer,
  resetLiveRoomMixerBindForTests,
  syncDailyCallRemoteAudio,
} from "../lib/audio/mixer/LiveRoomMixerBind";

export async function runChannelMixerDirectorTest(): Promise<{
  allPassed: boolean;
  results: Record<string, boolean>;
}> {
  const results: Record<string, boolean> = {};

  ChannelMixerDirector.reset();

  // Session bind
  const bind = ChannelMixerDirector.bindSession({
    roomId: "room-mixer-1",
    liveSessionId: "live:room-mixer-1",
    experienceType: "BATTLE",
  });
  results["session_bind_ok"] = bind.ok === true;
  const session = ChannelMixerDirector.getSession();
  results["session_room_invariant"] = session?.roomId === "room-mixer-1";
  results["session_live_invariant"] = session?.liveSessionId === "live:room-mixer-1";

  // Policy
  const policy = resolveExperienceAudioProfile("BATTLE");
  results["battle_competitive_fairness"] = policy.competitiveFairness === true;
  results["policy_on_director"] = ChannelMixerDirector.getPolicy().profileId === "BATTLE";

  // Roster
  ChannelMixerDirector.upsertParticipantChannel({
    participantId: "perf-a",
    displayName: "Guitar",
    role: "performer",
    hasRealSource: true,
  });
  ChannelMixerDirector.upsertParticipantChannel({
    participantId: "perf-b",
    displayName: "Vocals",
    role: "performer",
    hasRealSource: true,
  });

  // Reconnect same id — no Guitar(2)
  const reconnect = ChannelMixerDirector.upsertParticipantChannel({
    participantId: "perf-a",
    displayName: "Guitar",
    role: "performer",
    hasRealSource: true,
  });
  results["reconnect_no_duplicate"] = reconnect.code === "MIX-006";
  const guitarChannels = ChannelMixerDirector.getChannels().filter(
    (c) => c.participantId === "perf-a",
  );
  results["single_guitar_channel"] = guitarChannels.length === 1;

  // Snapshot PROGRAM before PERSONAL change
  const programBefore = ChannelMixerDirector.getProgramBusSnapshot("participant:perf-a");
  ChannelMixerDirector.setGain({
    channelId: "participant:perf-a",
    bus: "PERSONAL",
    gain: 0.2,
    auth: { userId: "listener-2", role: "fan" },
  });
  const programAfter = ChannelMixerDirector.getProgramBusSnapshot("participant:perf-a");
  results["personal_does_not_affect_program"] =
    programBefore?.gain === programAfter?.gain && programBefore?.muted === programAfter?.muted;

  // Second listener PERSONAL isolation (sim): program store untouched while personal changes
  const personal = ChannelMixerDirector.getPersonalBusSnapshot("participant:perf-a");
  results["personal_gain_updated"] = personal?.gain === 0.2;

  // Fan denied PROGRAM
  const fanProgram = ChannelMixerDirector.setGain({
    channelId: "participant:perf-a",
    bus: "PROGRAM",
    gain: 0.5,
    auth: { userId: "fan-1", role: "fan" },
  });
  results["program_auth_denied_for_fan"] =
    fanProgram.ok === false && fanProgram.code === "MIX-002";

  // Host allowed PROGRAM
  const hostProgram = ChannelMixerDirector.setGain({
    channelId: "participant:perf-a",
    bus: "PROGRAM",
    gain: 0.7,
    auth: { userId: "host-1", role: "host", isRoomOwner: true },
  });
  results["program_auth_ok_for_host"] = hostProgram.ok === true;
  results["program_gain_host_set"] =
    ChannelMixerDirector.getProgramBusSnapshot("participant:perf-a")?.gain === 0.7;

  // Crowd 0 does not mute performers
  ChannelMixerDirector.setGain({
    channelId: MIXER_VIRTUAL_CHANNEL_IDS.crowd,
    bus: "PERSONAL",
    gain: 0,
    auth: { userId: "fan-1", role: "fan" },
  });
  const performerEffective = ChannelMixerDirector.getEffectivePersonalGain("participant:perf-b");
  const crowdEffective = ChannelMixerDirector.getEffectivePersonalGain(MIXER_VIRTUAL_CHANNEL_IDS.crowd);
  results["crowd_zero_safe"] = crowdEffective === 0 && performerEffective > 0;

  // Auto balance without owner = OFF
  ChannelMixerDirector.bindAudioOwner(null);
  const auto = ChannelMixerDirector.runAutoBalance({ userId: "host-1", role: "host" });
  results["auto_balance_off_without_measurement"] =
    auto.ok === false && auto.code === "MIX-008";
  results["auto_balance_status_off"] = ChannelMixerDirector.getAutoBalanceStatus().mode === "OFF";

  // Authority
  const authReport = ChannelMixerDirector.getAuthorityReport();
  results["duplicate_engines_zero"] = authReport.duplicateEngines === 0;
  results["mixer_authority_channel_director"] =
    authReport.mixerAuthority === "ChannelMixerDirector";

  // Glue scaffold honest
  CanonicalPerformanceGlueDirector.setMode("BALANCED");
  const glue = CanonicalPerformanceGlueDirector.getSnapshot();
  results["glue_not_fake_on"] = glue.powerState === "IMPLEMENTED_NOT_INTEGRATED";
  const spectral = glue.features.find((f) => f.featureId === "SPECTRAL_MASKING");
  results["spectral_not_integrated"] =
    spectral?.powerState === "IMPLEMENTED_NOT_INTEGRATED";

  // Fidelity — no fake Hi-Fi
  FidelityIntelligenceDirector.reset();
  const fidEmpty = FidelityIntelligenceDirector.getHealth();
  results["fidelity_default_only_no_hifi"] =
    fidEmpty.powerState === "DEFAULT_ONLY" && fidEmpty.claimsHiFi === "UNCLAIMED";
  FidelityIntelligenceDirector.setProvenance({ delivered: "720p" });
  const fid720 = FidelityIntelligenceDirector.getHealth();
  results["fidelity_no_false_4k"] = fid720.claims4k !== "EVIDENCED";

  // SYSTEMS health includes mixer families
  const systems = ChannelMixerDirector.getSystemHealth().map((s) => s.systemId);
  results["systems_include_audio_mixer"] = systems.includes("AUDIO_MIXER");
  results["systems_include_personal"] = systems.includes("PERSONAL_MIX");
  results["systems_include_program"] = systems.includes("PROGRAM_MIX");
  results["systems_include_crowd"] = systems.includes("CROWD_MIX");
  results["systems_include_glue"] = systems.includes("PERFORMANCE_GLUE");

  // Late join roster
  ChannelMixerDirector.syncRoster([
    { participantId: "perf-b", displayName: "Vocals", role: "performer", hasRealSource: true },
    { participantId: "perf-c", displayName: "Bass", role: "performer", hasRealSource: true },
  ]);
  results["late_join_removes_left"] = !ChannelMixerDirector.getChannel("participant:perf-a");
  results["late_join_adds_new"] = Boolean(ChannelMixerDirector.getChannel("participant:perf-c"));

  // Live bind path — PERSONAL/PROGRAM faders → mock AudioOwner (no AudioContext)
  const ownerGains: Record<string, number> = {};
  const mockOwner = {
    setMasterVolume(volume: number) {
      ownerGains.__master__ = volume;
    },
    setChannelGain(userId: string, gain: number) {
      ownerGains[userId] = gain;
    },
    getVolumeMap() {
      return { ...ownerGains };
    },
    getTrackIds() {
      return Object.keys(ownerGains).filter((k) => k !== "__master__");
    },
  };
  injectAudioOwnerForTests(mockOwner);
  ensureLiveRoomMixerBound({
    roomId: "bind-room",
    liveSessionId: "live:bind-room",
    experienceType: "LIVE",
  });
  results["audio_owner_bound"] = ChannelMixerDirector.getAudioOwnerBound() === true;
  results["authority_audio_owner_named"] =
    ChannelMixerDirector.getAuthorityReport().audioOwner === "TMIAudioSafetyMixer";

  ChannelMixerDirector.upsertParticipantChannel({
    participantId: "remote-1",
    displayName: "Remote A",
    role: "performer",
    hasRealSource: true,
  });
  ChannelMixerDirector.setGain({
    channelId: "participant:remote-1",
    bus: "PERSONAL",
    gain: 0.42,
    auth: { userId: "listener", role: "fan" },
  });
  results["personal_applies_to_owner"] = ownerGains["remote-1"] === 0.42;

  ChannelMixerDirector.setGain({
    channelId: "participant:remote-1",
    bus: "PROGRAM",
    gain: 0.55,
    auth: { userId: "host-1", role: "host", isRoomOwner: true },
  });
  results["program_applies_to_owner"] = ownerGains["remote-1"] === 0.55;

  // Reconnect same participantId — no Guitar(2)
  const re = ChannelMixerDirector.upsertParticipantChannel({
    participantId: "remote-1",
    displayName: "Remote A",
    role: "performer",
    hasRealSource: true,
  });
  results["live_reconnect_no_duplicate"] = re.code === "MIX-006";
  results["live_single_channel"] =
    ChannelMixerDirector.getChannels().filter((c) => c.participantId === "remote-1").length === 1;

  // Crowd stays DEFAULT_ONLY without real reaction source
  const crowdCh = ChannelMixerDirector.getChannel(MIXER_VIRTUAL_CHANNEL_IDS.crowd);
  results["crowd_default_only_no_fake"] =
    crowdCh?.sourceAvailable === false && crowdCh?.hasRealSource === false;

  // Daily-like sync: mute Daily speaker path + roster channel (injected owner — no AudioContext)
  leaveLiveRoomMixer();
  resetLiveRoomMixerBindForTests();
  injectAudioOwnerForTests(mockOwner);
  const volumesSet: Array<{ id: string; vol: number }> = [];
  const fakeTrack = { id: "track-golive-1", readyState: "live" } as MediaStreamTrack;
  const mockDailyCall = {
    participants() {
      return {
        local: {
          local: true,
          session_id: "local-1",
          tracks: { audio: { persistentTrack: fakeTrack, state: "playable" } },
        },
        "remote-sess": {
          local: false,
          session_id: "remote-sess",
          user_name: "Guest Fan",
          tracks: { audio: { persistentTrack: fakeTrack, state: "playable" } },
        },
      };
    },
    setParticipantVolume(sessionId: string, volume: number) {
      volumesSet.push({ id: sessionId, vol: volume });
    },
  };

  await syncDailyCallRemoteAudio(mockDailyCall, {
    roomId: "golive-room",
    liveSessionId: "golive:golive-room",
    experienceType: "LIVE",
    remoteRole: "audience",
    localMicAvailable: true,
  });

  results["daily_speaker_mute_path"] =
    volumesSet.some((v) => v.id === "remote-sess" && v.vol === 0);
  results["daily_remote_channel_bound"] = Boolean(
    ChannelMixerDirector.getChannel("participant:remote-sess")?.hasRealSource,
  );
  results["daily_bound_room"] =
    ChannelMixerDirector.getSession()?.roomId === "golive-room";

  leaveLiveRoomMixer();
  resetLiveRoomMixerBindForTests();

  // Cross-room rebind soft-resets (navigation) — session invariants hold for active room
  const crossRoom = ChannelMixerDirector.bindSession({
    roomId: "other-room",
    liveSessionId: "live:other",
    experienceType: "LOUNGE",
  });
  results["cross_room_rebind_ok"] = crossRoom.ok === true;
  results["cross_room_session_switched"] =
    ChannelMixerDirector.getSession()?.roomId === "other-room" &&
    ChannelMixerDirector.getSession()?.liveSessionId === "live:other";

  // Same-room same-session rebind preserves invariants
  const sameAgain = ChannelMixerDirector.bindSession({
    roomId: "other-room",
    liveSessionId: "live:other",
    experienceType: "LOUNGE",
  });
  results["same_session_rebind_stable"] =
    sameAgain.ok === true && ChannelMixerDirector.getSession()?.liveSessionId === "live:other";

  ChannelMixerDirector.reset();

  const allPassed = Object.values(results).every(Boolean);
  console.log("[CHANNEL_MIXER_DIRECTOR_TEST_ASSERT]", JSON.stringify({ allPassed, results }, null, 2));
  return { allPassed, results };
}
