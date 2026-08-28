/**
 * MediaSurfaceLayoutDirector + share-cycle unit suite.
 *
 * Asserts:
 *   - participant grids 0–8 and >8 overflow
 *   - screenShare on/off surface assignment
 *   - fullscreen share/participant
 *   - join/leave reflow kind changes
 *   - share stop restoration
 *   - cyclic SHARE 1/N → … → OFF
 *   - dead sources skipped mid-cycle
 *   - layout never creates another live session / second audio owner
 */

import {
  capturePriorMediaPresentation,
  reduceShareCycle,
  resolveMediaSurfaceLayout,
  resolveParticipantGridKind,
  resolveParticipantLayout,
  resolveShareButtonLabel,
  type MediaSurfaceLayoutInput,
  type ShareCycleState,
  type ShareSourceDescriptor,
} from "../lib/monitors/MediaSurfaceLayoutDirector";

function baseInput(partial: Partial<MediaSurfaceLayoutInput> = {}): MediaSurfaceLayoutInput {
  return {
    screenShareActive: false,
    shareSourceIndex: null,
    availableShareSources: [],
    participantCount: 0,
    activeSpeakerId: null,
    audiencePanelEnabled: true,
    fullscreenState: "none",
    deviceTier: "desktop",
    roleContext: "performer",
    prefersReducedMotion: false,
    ...partial,
  };
}

function sources(n: number, dead: number[] = []): ShareSourceDescriptor[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `s${i + 1}`,
    label: `Screen ${i + 1}`,
    alive: !dead.includes(i),
  }));
}

export function runMediaSurfaceLayoutDirectorTest(): {
  allPassed: boolean;
  results: Record<string, boolean>;
} {
  const results: Record<string, boolean> = {};

  // ── Participant grid kinds 0–8 / >8 ──────────────────────────────────────
  results["grid_0_or_1_single"] =
    resolveParticipantGridKind(0) === "single" && resolveParticipantGridKind(1) === "single";
  results["grid_2_equal"] = resolveParticipantGridKind(2) === "equal_2";
  results["grid_3_primary_plus"] = resolveParticipantGridKind(3) === "primary_plus_2";
  results["grid_4_2x2"] = resolveParticipantGridKind(4) === "grid_2x2";
  results["grid_5_6_3x2"] =
    resolveParticipantGridKind(5) === "grid_3x2" && resolveParticipantGridKind(6) === "grid_3x2";
  results["grid_7_8_4x2"] =
    resolveParticipantGridKind(7) === "grid_4x2" && resolveParticipantGridKind(8) === "grid_4x2";
  results["grid_gt8_overflow"] = resolveParticipantGridKind(9) === "overflow";

  const layout8 = resolveParticipantLayout(8, "desktop");
  results["layout_8_visible_8"] = layout8.visibleCount === 8 && layout8.hiddenCount === 0;
  const layout12 = resolveParticipantLayout(12, "desktop");
  results["layout_12_overflow_hidden_4"] =
    layout12.visibleCount === 8 && layout12.hiddenCount === 4 && layout12.kind === "overflow";

  const phone3 = resolveParticipantLayout(3, "phone");
  results["phone_3_mobile_stack"] = phone3.isMobileStack === true;

  // ── MEDIA_ONLY / STAGE_AND_AUDIENCE ──────────────────────────────────────
  const mediaOnly = resolveMediaSurfaceLayout(baseInput({ audiencePanelEnabled: false }));
  results["media_only_state"] = mediaOnly.state === "MEDIA_ONLY";
  results["media_only_preserves_session"] = mediaOnly.preservesLiveSession === true;
  results["media_only_single_audio"] = mediaOnly.preservesSingleAudioOwner === true;

  const stageAud = resolveMediaSurfaceLayout(baseInput({ audiencePanelEnabled: true }));
  results["stage_and_audience"] = stageAud.state === "STAGE_AND_AUDIENCE";

  // ── Screen share on → TOP share / BOTTOM participants ────────────────────
  const shareOn = resolveMediaSurfaceLayout(
    baseInput({
      screenShareActive: true,
      shareSourceIndex: 0,
      availableShareSources: sources(1),
      participantCount: 4,
      audiencePanelEnabled: true,
    }),
  );
  results["share_on_state"] = shareOn.state === "SCREEN_SHARE_WITH_PARTICIPANTS";
  results["share_on_top_is_screen"] = shareOn.topSurface === "screen_share";
  results["share_on_bottom_is_grid"] = shareOn.bottomSurface === "participant_grid";
  results["share_on_grid_2x2"] = shareOn.participantLayout.kind === "grid_2x2";
  results["share_on_label_1_1"] = shareOn.shareButtonLabel === "SHARE 1/1";
  results["share_on_no_new_session"] = shareOn.preservesLiveSession === true;
  results["share_on_single_audio"] = shareOn.preservesSingleAudioOwner === true;

  // ── Share off restores MEDIA / STAGE ─────────────────────────────────────
  const shareOff = resolveMediaSurfaceLayout(
    baseInput({
      screenShareActive: false,
      shareSourceIndex: null,
      availableShareSources: [],
      participantCount: 4,
      priorTopSurface: "prior_media",
      priorBottomSurface: "audience",
    }),
  );
  results["share_off_not_share_state"] = shareOff.state !== "SCREEN_SHARE_WITH_PARTICIPANTS";
  results["share_off_top_not_screen"] = shareOff.topSurface !== "screen_share";
  results["share_off_label_share"] = shareOff.shareButtonLabel === "SHARE";

  const priorSnap = capturePriorMediaPresentation(shareOn, "none");
  results["prior_snapshot_strips_share_top"] = priorSnap.topSurface !== "screen_share";

  // ── Fullscreen ───────────────────────────────────────────────────────────
  const fsShare = resolveMediaSurfaceLayout(
    baseInput({
      screenShareActive: true,
      shareSourceIndex: 0,
      availableShareSources: sources(2),
      participantCount: 3,
      fullscreenState: "share",
    }),
  );
  results["fullscreen_share"] =
    fsShare.state === "FULLSCREEN_SHARE" &&
    fsShare.topSurface === "screen_share" &&
    fsShare.bottomSurface === "empty";

  const fsPart = resolveMediaSurfaceLayout(
    baseInput({
      screenShareActive: true,
      shareSourceIndex: 0,
      availableShareSources: sources(1),
      participantCount: 2,
      fullscreenState: "participant",
      activeSpeakerId: "p0",
    }),
  );
  results["fullscreen_participant"] =
    fsPart.state === "FULLSCREEN_PARTICIPANT" && fsPart.focusPanelId === "p0";

  // ── Join/leave reflow (kind changes, session flags stay true) ────────────
  const join1 = resolveMediaSurfaceLayout(
    baseInput({
      screenShareActive: true,
      shareSourceIndex: 0,
      availableShareSources: sources(1),
      participantCount: 1,
    }),
  );
  const join3 = resolveMediaSurfaceLayout(
    baseInput({
      screenShareActive: true,
      shareSourceIndex: 0,
      availableShareSources: sources(1),
      participantCount: 3,
    }),
  );
  const join5 = resolveMediaSurfaceLayout(
    baseInput({
      screenShareActive: true,
      shareSourceIndex: 0,
      availableShareSources: sources(1),
      participantCount: 5,
    }),
  );
  results["reflow_1_to_3_kind_change"] =
    join1.participantLayout.kind === "single" &&
    join3.participantLayout.kind === "primary_plus_2";
  results["reflow_3_to_5_kind_change"] = join5.participantLayout.kind === "grid_3x2";
  results["reflow_preserves_session"] =
    join1.preservesLiveSession && join3.preservesLiveSession && join5.preservesLiveSession;
  results["reflow_preserves_audio_owner"] =
    join1.preservesSingleAudioOwner &&
    join3.preservesSingleAudioOwner &&
    join5.preservesSingleAudioOwner;

  // ── Reduced motion → instant transition ──────────────────────────────────
  const reduced = resolveMediaSurfaceLayout(
    baseInput({
      screenShareActive: true,
      shareSourceIndex: 0,
      availableShareSources: sources(1),
      participantCount: 2,
      prefersReducedMotion: true,
    }),
  );
  results["reduced_motion_instant"] = reduced.transitionMode === "instant";
  const animated = resolveMediaSurfaceLayout(
    baseInput({
      screenShareActive: true,
      shareSourceIndex: 0,
      availableShareSources: sources(1),
      participantCount: 2,
      prefersReducedMotion: false,
    }),
  );
  results["animated_slide_fade"] = animated.transitionMode === "slide_fade";

  // ── Share cycle: 1 source ────────────────────────────────────────────────
  let cycle: ShareCycleState = {
    shareActive: false,
    shareSourceIndex: null,
    availableShareSources: [],
  };
  results["idle_label_share"] = resolveShareButtonLabel(cycle) === "SHARE";

  let step = reduceShareCycle(cycle, { type: "ADVANCE" });
  results["idle_advance_needs_capture"] = step.needsCapture === true;

  step = reduceShareCycle(cycle, {
    type: "ADD_SOURCE",
    source: { id: "s1", label: "Screen 1", alive: true },
  });
  cycle = step.next;
  results["one_source_active"] = cycle.shareActive === true && cycle.shareSourceIndex === 0;
  results["one_source_label"] = resolveShareButtonLabel(cycle) === "SHARE 1/1";

  step = reduceShareCycle(cycle, { type: "ADVANCE" });
  results["one_source_second_press_off"] =
    step.restoredPrior === true && step.next.shareActive === false;
  cycle = step.next;

  // ── Share cycle: 2 sources ───────────────────────────────────────────────
  step = reduceShareCycle(cycle, {
    type: "ADD_SOURCE",
    source: { id: "s1", label: "Screen 1", alive: true },
  });
  cycle = step.next;
  step = reduceShareCycle(cycle, {
    type: "ADD_SOURCE",
    source: { id: "s2", label: "Screen 2", alive: true },
  });
  cycle = step.next;
  results["two_sources_on_second"] =
    cycle.shareActive &&
    cycle.shareSourceIndex === 1 &&
    resolveShareButtonLabel(cycle) === "SHARE 2/2";

  // Reset to index 0 then cycle: S1 → S2 → OFF
  step = reduceShareCycle(cycle, { type: "SET_INDEX", index: 0 });
  cycle = step.next;
  results["two_sources_label_1_2"] = resolveShareButtonLabel(cycle) === "SHARE 1/2";
  step = reduceShareCycle(cycle, { type: "ADVANCE" });
  cycle = step.next;
  results["two_sources_advance_to_2"] =
    cycle.shareSourceIndex === 1 && step.activeSourceId === "s2";
  step = reduceShareCycle(cycle, { type: "ADVANCE" });
  results["two_sources_third_press_off"] =
    step.restoredPrior === true && step.next.shareActive === false;

  // ── Share cycle: 5 sources → 6th press OFF ───────────────────────────────
  cycle = {
    shareActive: false,
    shareSourceIndex: null,
    availableShareSources: [],
  };
  for (let i = 1; i <= 5; i++) {
    step = reduceShareCycle(cycle, {
      type: "ADD_SOURCE",
      source: { id: `s${i}`, label: `Screen ${i}`, alive: true },
    });
    cycle = step.next;
  }
  step = reduceShareCycle(cycle, { type: "SET_INDEX", index: 0 });
  cycle = step.next;
  for (let i = 0; i < 4; i++) {
    step = reduceShareCycle(cycle, { type: "ADVANCE" });
    cycle = step.next;
  }
  results["five_sources_on_last"] =
    cycle.shareSourceIndex === 4 && resolveShareButtonLabel(cycle) === "SHARE 5/5";
  step = reduceShareCycle(cycle, { type: "ADVANCE" });
  results["five_sources_sixth_off"] =
    step.restoredPrior === true && step.next.shareActive === false;

  // ── Dead source skipped mid-cycle ────────────────────────────────────────
  cycle = {
    shareActive: true,
    shareSourceIndex: 0,
    availableShareSources: sources(5, [2]), // s3 dead
  };
  // Alive = s1,s2,s4,s5 — index 0 = s1
  step = reduceShareCycle(cycle, { type: "ADVANCE" });
  cycle = step.next;
  results["skip_dead_advance_to_s2"] = step.activeSourceId === "s2";
  step = reduceShareCycle(cycle, { type: "ADVANCE" });
  // next alive after s2 is s4 (s3 dead)
  results["skip_dead_jumps_to_s4"] = step.activeSourceId === "s4";

  step = reduceShareCycle(
    {
      shareActive: true,
      shareSourceIndex: 1,
      availableShareSources: sources(3),
    },
    { type: "SOURCE_ENDED", sourceId: "s2" },
  );
  results["source_ended_stays_active_or_advances"] =
    step.next.shareActive === true &&
    step.next.availableShareSources.find((s) => s.id === "s2")?.alive === false;

  step = reduceShareCycle(
    {
      shareActive: true,
      shareSourceIndex: 0,
      availableShareSources: sources(1),
    },
    { type: "SOURCE_ENDED", sourceId: "s1" },
  );
  results["last_source_ended_restores"] =
    step.restoredPrior === true && step.next.shareActive === false;

  // ── Layout change does not create another live session (invariant flags) ─
  const before = resolveMediaSurfaceLayout(
    baseInput({
      screenShareActive: false,
      audiencePanelEnabled: true,
      participantCount: 2,
    }),
  );
  const after = resolveMediaSurfaceLayout(
    baseInput({
      screenShareActive: true,
      shareSourceIndex: 0,
      availableShareSources: sources(1),
      participantCount: 6,
      audiencePanelEnabled: true,
    }),
  );
  results["layout_change_preserves_live_session_flag"] =
    before.preservesLiveSession === true && after.preservesLiveSession === true;
  results["layout_change_preserves_single_audio_flag"] =
    before.preservesSingleAudioOwner === true && after.preservesSingleAudioOwner === true;
  results["layout_change_does_not_emit_new_room"] =
    // Director has no roomId / session factory — output never carries session mint fields
    !("roomId" in after) && !("newSessionId" in after);

  const allPassed = Object.values(results).every(Boolean);
  console.log(`[MEDIA_SURFACE_LAYOUT_DIRECTOR_TEST]`, JSON.stringify({ allPassed, results }, null, 2));
  return { allPassed, results };
}
