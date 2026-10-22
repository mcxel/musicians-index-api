/**
 * runVenueCurtainDirector.test.ts — state machine + roomId preservation certification.
 */

import {
  pauseShow,
  resumeShow,
  applyVenueCurtainCue,
  getVenueCurtainDirectorState,
  getActiveBreakClock,
  resolveCommercialInventory,
} from "../lib/venue/VenueCurtainDirector";
import {
  shouldRenderBreakCurtain,
  type StageSnapshot,
} from "../lib/live/StageLifecycleEngine";

export function runVenueCurtainDirectorTest(): { allPassed: boolean; results: Record<string, boolean> } {
  const results: Record<string, boolean> = {};
  const roomId = "test-room-001";
  const sessionId = "test-session-001";
  const performerId = "perf-test-001";
  const venueId = "test-venue-001";

  results["commercial_inventory_no_fake_ads"] = (() => {
    const inv = resolveCommercialInventory("curtain-ad-rail");
    return inv.inventoryClass === "NO_FILL" || inv.inventoryClass === "HOUSE_PROMO" ||
      inv.inventoryClass === "EVENT_SPONSOR" || inv.inventoryClass === "TMI_DIRECT_COMMERCIAL";
  })();

  results["commercial_honest_no_fill"] = (() => {
    const inv = resolveCommercialInventory("nonexistent-zone-xyz");
    return typeof inv.honestNoFill === "boolean";
  })();

  const pauseResult = pauseShow(roomId, sessionId, performerId, venueId, 120_000);
  results["pause_show_ok"] = pauseResult.ok === true;
  results["pause_preserves_room_in_break_clock"] = (() => {
    const clock = getActiveBreakClock(sessionId);
    return clock?.roomId === roomId && clock?.sessionId === sessionId;
  })();
  results["pause_state_intermission_or_commercial"] = (() => {
    const state = getVenueCurtainDirectorState();
    return state === "INTERMISSION" || state === "COMMERCIAL_BREAK";
  })();

  const resumeResult = resumeShow(venueId, sessionId, performerId);
  results["resume_show_ok"] = resumeResult.ok === true;
  results["resume_clears_break_clock"] = getActiveBreakClock(sessionId) === undefined;
  results["resume_state_open"] = getVenueCurtainDirectorState() === "OPEN";

  const openResult = applyVenueCurtainCue({
    venueId,
    sessionId: "session-open-test",
    performerId,
    action: "OPEN_CURTAIN",
  });
  results["open_curtain_ok"] = openResult.ok === true;
  results["open_curtain_state_open"] = openResult.state === "OPEN";

  const prepareResult = applyVenueCurtainCue({
    venueId,
    sessionId: "session-prepare-test",
    performerId,
    action: "PREPARE_STAGE",
  });
  results["prepare_stage_closed"] = prepareResult.state === "CLOSED";

  results["same_room_id_after_pause_resume_cycle"] = (() => {
    pauseShow(roomId, "cycle-session", performerId, venueId, 60_000);
    const clock = getActiveBreakClock("cycle-session");
    const preservedRoom = clock?.roomId === roomId;
    resumeShow(venueId, "cycle-session", performerId);
    return preservedRoom;
  })();

  const stageSnapshot = (
    state: StageSnapshot["state"],
    closeTarget: StageSnapshot["closeTarget"] = null,
    intermissionStartedAt: number | null = null,
    intermissionEndedAt: number | null = null,
  ): StageSnapshot => ({
    state,
    closeTarget,
    analytics: {
      intermissionStartedAt,
      intermissionEndedAt,
      durationMs: null,
      adOpportunityCreated: false,
      adOpportunityPlayed: false,
      adOpportunityCompleted: false,
      resumeSuccess: null,
      lastAdCampaignId: null,
    },
    previous: null,
    countdownRemaining: null,
    enteredAt: 0,
    config: {
      curtainDurationMs: 4000,
      countdownSeconds: 10,
      lightingTransitionMs: 800,
      goLiveCurtainMs: 1500,
      intermissionCurtainMs: 1400,
    },
    intermissionArmRemaining: null,
    resumeError: null,
    audienceMicMuted: false,
  });
  results["stage_prep_has_no_curtain"] = !shouldRenderBreakCurtain(
    stageSnapshot("STAGE_PREP"),
  );
  results["normal_live_has_no_curtain"] = !shouldRenderBreakCurtain(
    stageSnapshot("CAMERA_LIVE"),
  );
  results["intermission_close_shows_curtain"] = shouldRenderBreakCurtain(
    stageSnapshot("CURTAIN_CLOSE", "intermission"),
  );
  results["intermission_state_shows_curtain"] = shouldRenderBreakCurtain(
    stageSnapshot("INTERMISSION", "intermission", 1),
  );
  results["intermission_resume_opens_with_curtain"] = shouldRenderBreakCurtain(
    stageSnapshot("CURTAIN_PART", null, 1),
  );
  results["completed_resume_has_no_curtain"] = !shouldRenderBreakCurtain(
    stageSnapshot("CAMERA_LIVE", null, 1, 2),
  );
  results["show_end_does_not_use_break_curtain"] = !shouldRenderBreakCurtain(
    stageSnapshot("CURTAIN_CLOSE", "end"),
  );

  const allPassed = Object.values(results).every(Boolean);
  console.log("[VENUE_CURTAIN_DIRECTOR_TEST]", JSON.stringify({ allPassed, results }, null, 2));
  return { allPassed, results };
}

if (typeof require !== "undefined" && require.main === module) {
  const { allPassed } = runVenueCurtainDirectorTest();
  process.exit(allPassed ? 0 : 1);
}

// Jest wiring — the checks above ran as a plain function with zero
// describe/test blocks, so Jest reported "must contain at least one test"
// and this suite silently never executed under `jest`/CI (Step 2B "curtain
// reconciliation" audit finding, 2026-09-24). Named per-assertion so a
// regression in one check doesn't hide the others.
describe("VenueCurtainDirector — pause/resume preserves session identity", () => {
  const { results } = runVenueCurtainDirectorTest();

  test("LIVE-14-ish: commercial inventory never fabricates an ad class", () => {
    expect(results.commercial_inventory_no_fake_ads).toBe(true);
  });

  test("commercial inventory reports honest no-fill as a real boolean", () => {
    expect(results.commercial_honest_no_fill).toBe(true);
  });

  test("LIVE-05/LIVE-14: pauseShow succeeds and enters intermission/commercial state", () => {
    expect(results.pause_show_ok).toBe(true);
    expect(results.pause_state_intermission_or_commercial).toBe(true);
  });

  test("LIVE-06: pause preserves the live session's roomId in the break clock", () => {
    expect(results.pause_preserves_room_in_break_clock).toBe(true);
  });

  test("LIVE-16: resumeShow succeeds and returns the show to OPEN", () => {
    expect(results.resume_show_ok).toBe(true);
    expect(results.resume_state_open).toBe(true);
  });

  test("resume clears the active break clock", () => {
    expect(results.resume_clears_break_clock).toBe(true);
  });

  test("OPEN_CURTAIN and PREPARE_STAGE cues resolve to the correct state", () => {
    expect(results.open_curtain_ok).toBe(true);
    expect(results.open_curtain_state_open).toBe(true);
    expect(results.prepare_stage_closed).toBe(true);
  });

  test("LIVE-21: repeated pause/resume cycle preserves the same roomId (idempotent)", () => {
    expect(results.same_room_id_after_pause_resume_cycle).toBe(true);
  });

  test("curtain is visible only for the active live intermission lifecycle", () => {
    expect(results.stage_prep_has_no_curtain).toBe(true);
    expect(results.normal_live_has_no_curtain).toBe(true);
    expect(results.intermission_close_shows_curtain).toBe(true);
    expect(results.intermission_state_shows_curtain).toBe(true);
    expect(results.intermission_resume_opens_with_curtain).toBe(true);
    expect(results.completed_resume_has_no_curtain).toBe(true);
    expect(results.show_end_does_not_use_break_curtain).toBe(true);
  });
});

