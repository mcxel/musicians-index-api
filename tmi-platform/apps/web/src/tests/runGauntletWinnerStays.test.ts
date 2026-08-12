import {
  createGauntletRun,
  beginRound,
  openAudienceEliminationVote,
  reduceRound,
  openSurvivorRestAndSideBattles,
  contractField,
  completeRunCeremony,
  getGauntletRun,
} from "../lib/gauntlet/GauntletRunRuntime";
import { getOrCreateGauntletRoom } from "../lib/gauntlet/GauntletRoomRuntime";

function runGauntletWinnerStaysTest() {
  const results: Record<string, boolean> = {};
  const roomId = "gauntlet-test-arena-01";

  getOrCreateGauntletRoom(roomId);

  const mockCompetitors = [
    { userId: "comp_1", displayName: "MC One", role: "WAITING_COMPETITOR" as const, eliminated: false, joinedAt: Date.now(), sideBattleEligible: false },
    { userId: "comp_2", displayName: "MC Two", role: "WAITING_COMPETITOR" as const, eliminated: false, joinedAt: Date.now(), sideBattleEligible: false },
  ];

  // 1. Create run -> REGISTRATION
  const run = createGauntletRun(roomId, mockCompetitors);
  results["gauntlet_run_created"] = run.phase === "REGISTRATION";
  results["gauntlet_starters_count"] = run.aliveIds.length === 2;

  // 2. Begin round -> FINAL (since 2 competitors)
  const round1 = beginRound(run.runId);
  results["gauntlet_round1_is_final"] = round1?.phase === "FINAL";
  results["gauntlet_clock_set"] = (round1?.performanceClockSeconds ?? 0) > 0;

  // 3. Open audience vote -> AUDIENCE_ELIMINATION_VOTE
  const votePhase = openAudienceEliminationVote(run.runId, 30);
  results["gauntlet_vote_phase_active"] = votePhase?.phase === "AUDIENCE_ELIMINATION_VOTE";

  // 4. Reduce round (eliminate comp_2) -> ELIMINATION_RESULT + SIDE_BATTLE_WINDOW
  const elimPhase = reduceRound(run.runId, ["comp_2"]);
  results["gauntlet_elimination_result_active"] = elimPhase?.phase === "SIDE_BATTLE_WINDOW";
  results["gauntlet_alive_count_is_1"] = elimPhase?.aliveIds.length === 1;

  // 5. Contract field with 1 survivor -> CHAMPION
  const contractPhase = contractField(run.runId);
  results["gauntlet_contract_champion"] = contractPhase?.phase === "CHAMPION";
  results["gauntlet_champion_crowned"] = contractPhase?.championId === "comp_1";

  // 6. Complete run ceremony -> WHOS_ENTERING_NEXT
  const ceremonyPhase = completeRunCeremony(run.runId);
  results["gauntlet_whos_next_active"] = ceremonyPhase?.phase === "WHOS_ENTERING_NEXT";

  // 7. Verify final run state
  const finalRun = getGauntletRun(run.runId);
  results["gauntlet_run_retrievable"] = finalRun !== null;

  const allPassed = Object.values(results).every(Boolean);

  console.log("[GAUNTLET_WINNER_STAYS_TEST_ASSERT]", { allPassed, results });

  if (!allPassed) {
    const failed = Object.entries(results)
      .filter(([, v]) => !v)
      .map(([k]) => k);
    throw new Error(`[GAUNTLET_WINNER_STAYS_TEST] FAILED: ${failed.join(", ")}`);
  }
}

runGauntletWinnerStaysTest();
