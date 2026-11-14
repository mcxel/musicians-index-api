import { ChannelMixerDirector } from "./ChannelMixerDirector";
import {
  discoverMixStrips,
  monitorMixController,
  programMixAllowed,
  readMixPresence,
  resetMixPresenceForTests,
  retainAudibleExperience,
  retainMixSlot,
  type MixGraphInput,
  type MixGraphPanel,
} from "./MonitorMixGraph";

function panel(partial: MixGraphPanel): MixGraphPanel {
  return partial;
}

function base(overrides: Partial<MixGraphInput> = {}): MixGraphInput {
  return {
    roomId: null,
    screenShareAudioSourceId: null,
    frames: [],
    panels: [],
    friends: [],
    directorChannels: [],
    ...overrides,
  };
}

function assert(name: string, cond: boolean, results: Record<string, boolean>) {
  results[name] = cond;
  if (!cond) console.error("FAIL", name);
}

export function runMonitorMixGraphTest(): { allPassed: boolean; results: Record<string, boolean> } {
  const results: Record<string, boolean> = {};
  monitorMixController.resetForTests();
  ChannelMixerDirector.reset();

  const empty = discoverMixStrips(base({
    panels: [
      panel({ id: "p", monitorId: "MONITOR_1", sourceType: "EMPTY", sourceId: null, label: "EMPTY" }),
      panel({ id: "photo", monitorId: "MONITOR_1", sourceType: "MEDIA", sourceId: "img_1", label: "PHOTO" }),
      panel({
        id: "seed",
        monitorId: "MONITOR_1",
        sourceType: "EXPERIENCE",
        sourceId: "canonical-experience-stream",
        label: "PERFORMER LIVE",
      }),
    ],
    frames: [
      { id: "a", source: "SELF_CAMERA", parked: false, label: "CAM A" },
    ],
  }));
  assert("no_fake_strips", empty.length === 0, results);

  const one = discoverMixStrips(base({
    roomId: "room-1",
    frames: [{ id: "a", source: "VIDEO_PLAYBACK", parked: false, label: "Playlist" }],
  }));
  assert("one_source", one.length === 1 && one[0].label === "Playlist", results);

  const sixteen: MixGraphPanel[] = Array.from({ length: 16 }, (_, i) =>
    panel({
      id: `m1-${i}`,
      monitorId: "MONITOR_1",
      sourceType: "MEDIA",
      sourceId: `video-${i}`,
      label: `Video ${i + 1}`,
    }),
  );
  sixteen.push(panel({
    id: "silent",
    monitorId: "MONITOR_1",
    sourceType: "MEDIA",
    sourceId: "photo-extra",
    label: "PHOTO",
  }));
  const max = discoverMixStrips(base({ panels: sixteen }));
  assert("sixteen_discovered", max.length === 16, results);
  assert("photo_excluded", max.every((s) => !/photo/i.test(s.label)), results);

  const partyInput = base({
    friends: [
      { id: "marcel", displayName: "Marcel" },
      { id: "avery", displayName: "Avery" },
    ],
    panels: [
      panel({ id: "call-a", monitorId: "MONITOR_1", sourceType: "CALL_PARTICIPANT", sourceId: "marcel", label: "Marcel" }),
      panel({ id: "call-b", monitorId: "MONITOR_1", sourceType: "CALL_PARTICIPANT", sourceId: "avery", label: "Avery" }),
      panel({ id: "share", monitorId: "MONITOR_1", sourceType: "MEDIA", sourceId: "desk-1", label: "Screen Share" }),
      panel({ id: "show", monitorId: "MONITOR_2", sourceType: "MEDIA", sourceId: "show-1", label: "Show" }),
    ],
  });
  monitorMixController.discover(partyInput);
  const live = monitorMixController.getStrips();
  assert("party_and_share", live.length === 4, results);
  const m = live.find((s) => s.sourceId === "voice:marcel")!;
  const av = live.find((s) => s.sourceId === "voice:avery")!;
  const sh = live.find((s) => s.group === "SCREEN_SHARE")!;
  const show = live.find((s) => s.sourceId === "media:show-1")!;

  monitorMixController.setSourceGain(m, 0.62, "PERSONAL");
  monitorMixController.setSourceMute(m, true, "PERSONAL");
  assert("mute_keeps_gain", monitorMixController.sourceGain(m) === 0.62, results);
  assert("mute_effective_zero", monitorMixController.effective(m) === 0, results);
  monitorMixController.setSourceMute(m, false, "PERSONAL");
  assert("unmute_restores", monitorMixController.sourceGain(m) === 0.62, results);

  monitorMixController.setSourceGain(m, 0.8, "PERSONAL");
  monitorMixController.setSourceGain(av, 0.5, "PERSONAL");
  monitorMixController.setMonitorGain("MONITOR_1", 0.25);
  assert("master_keeps_child_a", monitorMixController.sourceGain(m) === 0.8, results);
  assert("master_keeps_child_b", monitorMixController.sourceGain(av) === 0.5, results);
  assert("m2_unchanged", monitorMixController.sourceGain(show) === 0.85, results);

  ChannelMixerDirector.bindSession({ roomId: "room-mix", liveSessionId: "live-mix" });
  ChannelMixerDirector.upsertParticipantChannel({
    participantId: "marcel",
    displayName: "Marcel",
    hasRealSource: true,
  });
  ChannelMixerDirector.upsertParticipantChannel({
    participantId: "avery",
    displayName: "Avery",
    hasRealSource: true,
  });

  const beforeProgram = ChannelMixerDirector.getProgramBusSnapshot("participant:marcel");
  monitorMixController.setSourceGain(m, 0.4, "PERSONAL");
  const afterProgram = ChannelMixerDirector.getProgramBusSnapshot("participant:marcel");
  assert(
    "personal_does_not_write_program",
    !beforeProgram || (afterProgram?.gain === beforeProgram.gain && afterProgram?.muted === beforeProgram.muted),
    results,
  );

  const denied = monitorMixController.setSourceGain(m, 0.2, "PROGRAM", { userId: "fan", role: "fan" });
  assert("program_denied", denied.ok === false, results);
  assert("program_ui_locked", programMixAllowed(null) === false, results);
  assert("program_host_allowed", programMixAllowed({ userId: "h", role: "host" }) === true, results);

  monitorMixController.setSourceMute(sh, true, "PERSONAL");
  assert("share_mute_keeps_voice", monitorMixController.sourceMuted(m) === false, results);
  monitorMixController.setSourceMute(sh, false, "PERSONAL");

  monitorMixController.setSourceGain(m, 0.7, "PERSONAL");
  monitorMixController.setSolo(m, true);
  assert("solo_does_not_mute_store", monitorMixController.sourceMuted(av) === false, results);
  assert("solo_isolates_effective", monitorMixController.effective(av) === 0, results);
  monitorMixController.setSolo(m, false);
  assert("solo_release_restores", monitorMixController.effective(av) > 0, results);

  const down = discoverMixStrips(base({
    panels: [panel({ id: "only", monitorId: "MONITOR_1", sourceType: "MEDIA", sourceId: "vid-a", label: "Performer" })],
  }));
  assert("shrink_drops_ghosts", down.length === 1, results);

  assert("shrink_drops_ghosts", down.length === 1, results);

  resetMixPresenceForTests();
  assert("writer_article_has_no_mix", readMixPresence().audible === false && readMixPresence().mixSlot === false, results);
  const releaseAudible = retainAudibleExperience();
  const releaseSlot = retainMixSlot();
  assert("audible_surface_opens_mix", readMixPresence().audible === true, results);
  assert("owned_slot_blocks_second_launcher", readMixPresence().mixSlot === true, results);
  releaseAudible();
  releaseSlot();
  assert("presence_clears", readMixPresence().audible === false && readMixPresence().mixSlot === false, results);

  const allPassed = Object.values(results).every(Boolean);
  return { allPassed, results };
}

describe("MonitorMixGraph runtime pair", () => {
  it("keeps the existing two-monitor mix assertions", () => {
    const report = runMonitorMixGraphTest();
    expect(report.allPassed).toBe(true);
  });
});
