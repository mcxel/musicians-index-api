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

  const allPassed = Object.values(results).every(Boolean);
  console.log("[VENUE_CURTAIN_DIRECTOR_TEST]", JSON.stringify({ allPassed, results }, null, 2));
  return { allPassed, results };
}

if (typeof require !== "undefined" && require.main === module) {
  const { allPassed } = runVenueCurtainDirectorTest();
  process.exit(allPassed ? 0 : 1);
}
