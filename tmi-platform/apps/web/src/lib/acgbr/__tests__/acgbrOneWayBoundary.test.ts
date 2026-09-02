/**
 * ACGBR one-way boundary + Challenge DNA freeze tests (automated).
 */

import {
  assertAcgbrCannotWriteChallengeTruth,
  AcgbrBoundaryViolation,
  listAcgbrForbiddenChallengeWrites,
  computeSceneSeed,
  CanonicalPresentationTimeline,
  ChallengeAcgbrBridge,
  readChallengeSnapshot,
  assertChallengeDnaNotBattle,
  assertChallengeDnaNotCypher,
  assertChallengeDnaNotGauntlet,
  ChallengeSceneGraph,
  CANONICAL_RESULT_BRANCHES,
  planChallengeJumbotronFaces,
  assertFourDistinctFaceRoles,
  applyChallengeJumbotronFacePlan,
  resolveChallengeAcgbrFacePlanForMount,
  TMI_CHALLENGE_ACGBR_FACES_HOOK,
  adaptChallengeResultForPresentation,
  resultFinalizedDoesNotImplyPayout,
  NEURAL_GENERATION_UNAVAILABLE,
  dialogueHasHallucinatedStake,
  buildChallengeDialogueFacts,
  resolvePresentationCapabilities,
} from "../index";
import {
  ChallengeOperationalLifecycle,
  type AuthoritativeObjectiveContract,
} from "../../challenge/ChallengeOperationalLifecycle";
import type { ParticipantEntranceProfile } from "../../battle/CinematicParticipantArrivalDirector";
import { JumbotronFaceTargetRegistry } from "../../jumbotron/JumbotronFaceTargetRegistry";
import { JumbotronShowDirector } from "../../jumbotron/JumbotronShowDirector";
import { VenueAdPriority } from "../../jumbotron/JumbotronAdContracts";

const challenger: ParticipantEntranceProfile = {
  participantId: "p-a",
  name: "A",
  role: "CHALLENGER",
  hometown: "ATL",
  genre: "HIP-HOP",
  record: "1-0",
};

const challenged: ParticipantEntranceProfile = {
  participantId: "p-b",
  name: "B",
  role: "PERFORMER",
  hometown: "NYC",
  genre: "HIP-HOP",
  record: "1-0",
};

const contract: AuthoritativeObjectiveContract = {
  objectiveId: "obj-1",
  objective: "Hit the target note",
  category: "PRECISION",
  timeLimitSec: 30,
  attemptCount: 1,
  judgingPolicy: "MEASURABLE_RESULT",
  realStakeOrReward: "NONE",
  qualificationRules: ["Real attempt"],
};

describe("ACGBR one-way boundary + Challenge operational activation", () => {
  test("ACGBR cannot write Challenge truth fields", () => {
    const forbidden = listAcgbrForbiddenChallengeWrites();
    expect(forbidden).toContain("winnerId");
    expect(forbidden).toContain("settlement");
    expect(() => assertAcgbrCannotWriteChallengeTruth(["winnerId"])).toThrow(
      AcgbrBoundaryViolation
    );
    expect(() => assertAcgbrCannotWriteChallengeTruth(["score"])).toThrow(
      AcgbrBoundaryViolation
    );
    expect(() => assertAcgbrCannotWriteChallengeTruth(["sceneSeed"])).not.toThrow();
  });

  test("ChallengeSnapshot is frozen read-only", () => {
    const life = new ChallengeOperationalLifecycle(
      "sess-freeze",
      challenger,
      challenged,
      contract
    );
    life.advancePhase("OBJECTIVE_CONTRACT_ASSEMBLY");
    const snap = readChallengeSnapshot(life);
    expect(Object.isFrozen(snap)).toBe(true);
    expect(Object.isFrozen(snap.objective)).toBe(true);
    const before = snap.objective.realStakeOrReward;
    try {
      (snap.objective as { realStakeOrReward: string }).realStakeOrReward = "$999";
    } catch {
      // strict mode throws — OK
    }
    expect(snap.objective.realStakeOrReward).toBe(before);
    expect(snap.objective.realStakeOrReward).not.toBe("$999");
  });

  test("deterministic scene seed + reconnect resumes elapsed", () => {
    expect(computeSceneSeed("s1", 3, 2)).toBe(computeSceneSeed("s1", 3, 2));
    expect(computeSceneSeed("s1", 3, 2)).not.toBe(computeSceneSeed("s1", 3, 3));

    const timeline = new CanonicalPresentationTimeline({
      sessionId: "s1",
      pacingMode: "FULL",
      nominalDurationMs: 10000,
    });
    timeline.tick(4000);
    const cp = timeline.createCheckpoint();
    expect(cp.elapsedInSceneMs).toBe(4000);

    const restored = new CanonicalPresentationTimeline({
      sessionId: "s1",
      pacingMode: "RECONNECT",
    });
    expect(restored.restoreFromCheckpoint(cp, 10000)).toBe(true);
    const tick = restored.tick(0);
    expect(tick.elapsedInSceneMs).toBe(4000);
    expect(tick.sceneSeed).toBe(cp.sceneSeed);
  });

  test("Challenge DNA semantic negatives", () => {
    expect(assertChallengeDnaNotBattle()).toBe(true);
    expect(assertChallengeDnaNotCypher()).toBe(true);
    expect(assertChallengeDnaNotGauntlet()).toBe(true);
    expect(ChallengeSceneGraph.resultBranches).toEqual([...CANONICAL_RESULT_BRANCHES]);
  });

  test("result finalize does not imply payout; settle is separate", () => {
    const life = new ChallengeOperationalLifecycle(
      "sess-settle",
      challenger,
      challenged,
      { ...contract, realStakeOrReward: "$50 USD" }
    );
    life.recordMeasurableMetric("p-a_score", 9);
    life.recordMeasurableMetric("p-b_score", 7);
    life.advancePhase("JUDGMENT_OPEN");
    const finalized = life.finalizeResult();
    expect(finalized.settlementStatus).toBe("PENDING");
    const view = adaptChallengeResultForPresentation(finalized)!;
    expect(resultFinalizedDoesNotImplyPayout(view)).toBe(true);
    const settled = life.settleResult()!;
    expect(settled.settlementStatus).toBe("SETTLED");
    expect(adaptChallengeResultForPresentation(settled)!.settlementImpliesPayout).toBe(
      true
    );
  });

  test("four-face Jumbotron plan during active attempt", () => {
    const plan = planChallengeJumbotronFaces("ATTEMPT_1_ACTIVE", {
      sessionId: "sess-j",
      objectiveLabel: "Hit the target note",
      activeParticipantId: "p-a",
    });
    expect(assertFourDistinctFaceRoles(plan)).toBe(true);
    expect(plan.find((f) => f.face === "NORTH")?.role).toBe("ACTIVE_ATTEMPT");
    expect(plan.find((f) => f.face === "SOUTH")?.role).toBe("OBJECTIVE_TIMER");
    expect(plan.find((f) => f.face === "EAST")?.role).toBe("SPONSOR");
    expect(plan.find((f) => f.face === "WEST")?.role).toBe("AUDIENCE");

    const registry = new JumbotronFaceTargetRegistry("room-j", "challenge-arena");
    const bridge = new ChallengeAcgbrBridge("sess-j");
    bridge.applyJumbotronPlan(registry, plan);
    expect(registry.getFace("NORTH").creativeId).toContain("active");
    expect(registry.getAllFaces()).toHaveLength(4);
  });

  test("mount resolver prefers room hook then PROGRAM; ShowDirector applies plan", () => {
    const hookPlan = planChallengeJumbotronFaces("ATTEMPT_1_ACTIVE", {
      sessionId: "sess-mount",
      objectiveLabel: "Objective from hook",
      activeParticipantId: "p-hook",
    });
    const host = globalThis as unknown as Record<string, unknown>;
    host[TMI_CHALLENGE_ACGBR_FACES_HOOK] = hookPlan;

    const fromHook = resolveChallengeAcgbrFacePlanForMount();
    expect(fromHook?.find((f) => f.face === "NORTH")?.role).toBe("ACTIVE_ATTEMPT");
    expect(fromHook?.find((f) => f.face === "NORTH")?.creativeId).toContain("p-hook");

    host[TMI_CHALLENGE_ACGBR_FACES_HOOK] = null;
    const fromProgram = resolveChallengeAcgbrFacePlanForMount({
      program: {
        sessionId: "sess-prog",
        lifecyclePhase: "JUDGMENT_OPEN",
        objective: { objective: "Prog objective" },
        challenger: { id: "c1" },
        challenged: { id: "c2" },
      },
    });
    expect(fromProgram?.find((f) => f.face === "NORTH")?.role).toBe("CONTRACT");
    expect(assertFourDistinctFaceRoles(fromProgram!)).toBe(true);

    const show = new JumbotronShowDirector("challenge-dome", "sess-mount");
    applyChallengeJumbotronFacePlan(show.getFaceRegistry(), hookPlan);
    for (const a of hookPlan) {
      show.updateFaceState(a.face, {
        sourceId: a.creativeId,
        overlayText: a.role,
      });
    }
    expect(show.getFaceState("NORTH")?.overlayText).toBe("ACTIVE_ATTEMPT");
    expect(show.getFaceRegistry().getFace("NORTH").priorityState).toBe(
      VenueAdPriority.P1_CRITICAL_LIVE
    );
    expect(show.getFaceRegistry().getFace("EAST").priorityState).toBe(
      VenueAdPriority.P4_DIRECT_AD
    );

    delete host[TMI_CHALLENGE_ACGBR_FACES_HOOK];
  });

  test("Generation Foundry honesty + dialogue fact envelope", () => {
    expect(NEURAL_GENERATION_UNAVAILABLE.lipSyncNeuralNetAvailable).toBe(false);
    expect(NEURAL_GENERATION_UNAVAILABLE.unconstrainedLiveAi3dAvailable).toBe(false);

    const facts = buildChallengeDialogueFacts({
      sessionId: "sess-d",
      objectiveText: "Hit the target note",
      category: "PRECISION",
      timeLimitSec: 30,
      attemptCount: 1,
      judgingPolicy: "MEASURABLE_RESULT",
      stakeOrReward: "NONE",
      challengerDisplayName: "A",
      challengedDisplayName: "B",
      phaseLabel: "OBJECTIVE_CONTRACT_ASSEMBLY",
      resultSummary: null,
      settlementStatusLabel: null,
    });
    expect(
      dialogueHasHallucinatedStake(facts, "Winner takes $500 cash prize")
    ).toBe(true);
    expect(dialogueHasHallucinatedStake(facts, "Complete the objective")).toBe(
      false
    );
  });

  test("PresentationCapabilityResolver: premium enhances never pay-to-function", () => {
    const caps = resolvePresentationCapabilities(
      {
        wantFourFaceJumbotron: true,
        wantKineticPanels: true,
        wantVolumetrics: true,
        wantAvatarAudience: true,
        wantRings: true,
        introPackage: "FULL",
      },
      {
        jumbotronFourFaces: true,
        jumbotronRings: true,
        kineticPanels: true,
        volumetrics: true,
        avatarAudience: true,
        deviceTier: "MEDIUM",
        reducedMotion: false,
        premiumEnhancementsUnlocked: false,
      }
    );
    expect(caps.premiumIsEnhancementOnly).toBe(true);
    expect(caps.jumbotronFacesActive).toBe(true);
    expect(caps.volumetricsActive).toBe(false);
    expect(caps.degradedReasons.some((r) => r.includes("volumetrics"))).toBe(true);
  });

  test("ChallengeAcgbrBridge syncs from lifecycle without writing truth", () => {
    const life = new ChallengeOperationalLifecycle(
      "sess-bridge",
      challenger,
      challenged,
      contract
    );
    life.advancePhase("ATTEMPT_1_ACTIVE");
    const bridge = new ChallengeAcgbrBridge("sess-bridge", "FULL");
    const runtime = bridge.syncFromLifecycle(life, {
      jumbotronFourFaces: true,
      jumbotronRings: false,
      kineticPanels: false,
      volumetrics: false,
      avatarAudience: true,
      deviceTier: "HIGH",
      reducedMotion: false,
      premiumEnhancementsUnlocked: false,
    });
    expect(runtime.snapshot.phase).toBe("ATTEMPT_1_ACTIVE");
    expect(runtime.activeTemplate.blocksLiveWhileGenerating).toBe(false);
    expect(runtime.cinematicProfileId).toContain("challenge");
    expect(() => bridge.refuseForbiddenWrites(["stake"])).toThrow(
      AcgbrBoundaryViolation
    );
  });
});
