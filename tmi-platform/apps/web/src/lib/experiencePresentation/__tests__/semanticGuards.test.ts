/**
 * Semantic guards — encode Marcel hard laws for presentation packs.
 */

import {
  assertPackAllowsComposition,
  getPresentationPack,
  listPresentationPacks,
} from "../ExperiencePresentationDirector";
import { PresentationEventBus } from "../PresentationEventBus";
import { ExperienceSourceRegistry } from "../ExperienceSourceRegistry";
import {
  canMarkExperienceCertPass,
  isGreenOrDebugSurface,
} from "../CertificationGuards";
import { LoungePack, CypherPack, BattlePack, ChallengePack, ConcertPack, WorldConcertPack } from "../packs";
import {
  clearPerformerLiveProgram,
  composePerformerLiveProgram,
  getActivePerformerLiveProgram,
  isPerformerLiveProgramProductionSurface,
  PROGRAM_PERFORMER_CAMERA,
} from "../composePerformerLiveProgram";
import {
  clearBattleProgram,
  composeBattleProgram,
  getActiveBattleProgram,
  hasRealDualOccupancy,
  isBattleProgramProductionSurface,
  PROGRAM_BATTLE_COMPOSITE,
} from "../composeBattleProgram";
import {
  clearChallengeProgram,
  composeChallengeProgram,
  getActiveChallengeProgram,
  isChallengeProgramProductionSurface,
  isChallengeVsFree,
  PROGRAM_CHALLENGE_PRIMARY,
} from "../composeChallengeProgram";
import {
  clearCypherProgram,
  composeCypherProgram,
  getActiveCypherProgram,
  isCypherProgramProductionSurface,
  isCypherVsFree,
  mapCypherPhaseToComposition,
  PROGRAM_CYPHER_FOCUS,
} from "../composeCypherProgram";
import {
  clearConcertProgram,
  composeConcertProgram,
  getActiveConcertProgram,
  isConcertProgramProductionSurface,
  isConcertVsFree,
  mapConcertPhaseToComposition,
  PROGRAM_CONCERT_STAGE,
  PROGRAM_WORLD_CONCERT,
} from "../composeConcertProgram";

describe("experiencePresentation semantic guards", () => {
  test("Cypher pack rejects VS/winner layouts", () => {
    expect(CypherPack.allowsVsLayout).toBe(false);
    expect(CypherPack.allowsWinnerFinale).toBe(false);
    expect(CypherPack.allowsEliminationFinale).toBe(false);
    expect(() => assertPackAllowsComposition("Cypher", "DUAL")).toThrow(/VS|forbids|does not allow/i);
    expect(() => assertPackAllowsComposition("Cypher", "A_DOMINANT")).toThrow();
    expect(() => assertPackAllowsComposition("Cypher", "B_DOMINANT")).toThrow();
    expect(() => assertPackAllowsComposition("Cypher", "SPLIT")).toThrow();
    expect(() => assertPackAllowsComposition("Cypher", "CIRCLE_FOCUS")).not.toThrow();
  });

  test("Lounge pack rejects avatar presence model", () => {
    expect(LoungePack.presenceModel).toBe("WEBRTC_PANELS");
    expect(LoungePack.presenceModel).not.toBe("FAN_AVATARS");
    const pack = getPresentationPack("Lounge");
    expect(pack.presenceModel).toBe("WEBRTC_PANELS");
  });

  test("Battle pack allows VS; Challenge pack prefers contract/objective", () => {
    expect(BattlePack.allowsVsLayout).toBe(true);
    expect(() => assertPackAllowsComposition("Battle", "DUAL")).not.toThrow();
    expect(() => assertPackAllowsComposition("Battle", "A_DOMINANT")).not.toThrow();

    expect(ChallengePack.prefersChallengeContract).toBe(true);
    expect(ChallengePack.allowsVsLayout).toBe(false);
    expect(ChallengePack.requiredPrimitives).toContain("ChallengeContract");
    expect(() => assertPackAllowsComposition("Challenge", "OBJECTIVE_FOCUS")).not.toThrow();
    expect(() => assertPackAllowsComposition("Challenge", "DUAL")).toThrow(/contract|objective|forbids|does not allow/i);
  });

  test("PresentationEventBus rejects fabricated crowd events", () => {
    const bus = new PresentationEventBus();
    expect(() =>
      bus.publish({
        eventId: "e1",
        sessionId: "s1",
        type: "FAKE_CROWD_APPLAUSE" as never,
        issuedAtMs: Date.now(),
        authoritativeSourceId: "x",
        payload: {},
      })
    ).toThrow(/fabricated crowd/i);

    expect(() => bus.tryPublishUnsafe("SYNTHETIC_VIEWER_COUNT", "s1")).toThrow(/fabricated crowd/i);

    expect(() =>
      bus.publish({
        eventId: "e2",
        sessionId: "s1",
        type: "REAL_REACTION",
        issuedAtMs: Date.now(),
        authoritativeSourceId: "reaction-engine",
        payload: { userId: "u1", emoji: "🔥" },
      })
    ).not.toThrow();
  });

  test("ExperienceSourceRegistry: one session → many sources → multiple targets without new session id", () => {
    const sessionId = "session-abc";
    const reg = new ExperienceSourceRegistry(sessionId);

    reg.registerSource({
      sourceId: "program-1",
      kind: "PROGRAM",
      label: "Program",
      decoderId: null,
    });
    reg.registerSource({
      sourceId: "iso-a",
      kind: "ISO",
      label: "ISO A",
      decoderId: null,
    });
    reg.registerSource({
      sourceId: "aud-1",
      kind: "AUDIENCE",
      label: "Audience",
      decoderId: null,
    });

    reg.attachDecoder("program-1", "decoder-h264");
    reg.bindTarget("program-1", "UNIVERSAL_PLAYER_PRIMARY");
    reg.bindTarget("program-1", "JUMBOTRON_DISCOVERY");
    reg.bindTarget("iso-a", "RECORDING_ISO");
    reg.bindTarget("aud-1", "UNIVERSAL_PLAYER_SECONDARY");

    expect(reg.getSessionId()).toBe(sessionId);
    reg.assertSameSession(sessionId);
    expect(reg.listSources()).toHaveLength(3);
    expect(reg.listSources().find((s) => s.sourceId === "program-1")?.boundTargets).toEqual(
      expect.arrayContaining(["UNIVERSAL_PLAYER_PRIMARY", "JUMBOTRON_DISCOVERY"])
    );
    // Decoder is not a target and not a new session
    expect(reg.listSources().find((s) => s.sourceId === "program-1")?.decoderId).toBe("decoder-h264");
  });

  test("Green/debug surface cannot mark experienceCert PASS", () => {
    expect(
      canMarkExperienceCertPass({
        surfaceKind: "green_debug",
        physicalObserved: true,
      })
    ).toBe(false);
    expect(
      isGreenOrDebugSurface({
        surfaceKind: "green_debug",
        physicalObserved: true,
      })
    ).toBe(true);
    expect(
      canMarkExperienceCertPass({
        surfaceKind: "observatory",
        physicalObserved: true,
      })
    ).toBe(false);
    expect(
      canMarkExperienceCertPass({
        surfaceKind: "production",
        physicalObserved: false,
      })
    ).toBe(false);
    expect(
      canMarkExperienceCertPass({
        surfaceKind: "production",
        physicalObserved: true,
      })
    ).toBe(true);
  });

  test("PerformerLive is Regular GO LIVE; MondayNightStage is not", () => {
    expect(getPresentationPack("PerformerLive").isRegularGoLive).toBe(true);
    expect(getPresentationPack("MondayNightStage").isRegularGoLive).toBe(false);
    expect(() => assertPackAllowsComposition("PerformerLive", "HOST_CLOSE")).not.toThrow();
    expect(() => assertPackAllowsComposition("PerformerLive", "DUAL")).toThrow();
    expect(getPresentationPack("PerformerLive").routeCapability.architectureCert).toBe("DONE");
    expect(getPresentationPack("PerformerLive").routeCapability.experienceCert).toBe("OPEN");
  });

  test("composePerformerLiveProgram binds PROGRAM to Universal Player without new session", () => {
    clearPerformerLiveProgram("test-reset");
    const sessionId = "sess-performer-live-test";
    const composed = composePerformerLiveProgram({
      sessionId,
      roomId: "room-test-1",
      hostDisplayName: "Test Host",
      composition: "HOST_CLOSE",
      bindJumbotron: true,
    });

    expect(composed.packId).toBe("PerformerLive");
    expect(composed.programSourceId).toBe(PROGRAM_PERFORMER_CAMERA);
    expect(composed.surfaceKind).toBe("production");
    expect(composed.sessionId).toBe(sessionId);
    expect(composed.jumbotronBound).toBe(true);
    expect(isPerformerLiveProgramProductionSurface()).toBe(true);

    const targets = composed.sources.find((s) => s.sourceId === PROGRAM_PERFORMER_CAMERA)?.boundTargets ?? [];
    expect(targets).toEqual(
      expect.arrayContaining([
        "UNIVERSAL_PLAYER_PRIMARY",
        "UNIVERSAL_PLAYER_SECONDARY",
        "JUMBOTRON_IN_VENUE",
      ])
    );

    // Rebind same session — no id mutation
    const again = composePerformerLiveProgram({
      sessionId,
      roomId: "room-test-1",
      hostDisplayName: "Test Host",
      composition: "PIP",
      bindJumbotron: true,
    });
    expect(again.sessionId).toBe(sessionId);
    expect(getActivePerformerLiveProgram()?.composition).toBe("PIP");

    clearPerformerLiveProgram("test-done");
    expect(getActivePerformerLiveProgram()).toBeNull();
  });

  test("composeBattleProgram: dual only when real; never invents winner; Cypher untouched", () => {
    clearBattleProgram("test-reset");

    const solo = composeBattleProgram({
      sessionId: "sess-battle-solo",
      battleId: "battle-solo-1",
      roomId: "room-battle-1",
      cornerA: { id: "champ-1", displayName: "Champion One" },
      cornerB: null,
      bindJumbotron: true,
      broadcastEntry: {
        battleId: "battle-solo-1",
        state: "SOLO_WAITING",
        competitorAId: "champ-1",
        updatedAt: Date.now(),
      },
    });

    expect(solo.packId).toBe("Battle");
    expect(solo.programSourceId).toBe(PROGRAM_BATTLE_COMPOSITE);
    expect(solo.surfaceKind).toBe("production");
    expect(solo.dualOccupancy).toBe(false);
    expect(hasRealDualOccupancy(solo)).toBe(false);
    expect(solo.winnerId).toBeNull();
    expect(solo.scores).toBeNull();
    expect(solo.composition).toBe("A_DOMINANT");
    expect(isBattleProgramProductionSurface()).toBe(true);

    clearBattleProgram("solo-done");

    const dual = composeBattleProgram({
      sessionId: "sess-battle-dual",
      battleId: "battle-dual-1",
      roomId: "room-battle-2",
      cornerA: { id: "a-1", displayName: "Corner A" },
      cornerB: { id: "b-1", displayName: "Corner B" },
      bindJumbotron: true,
      broadcastEntry: {
        battleId: "battle-dual-1",
        state: "BATTLE_LIVE",
        competitorAId: "a-1",
        competitorBId: "b-1",
        updatedAt: Date.now(),
      },
    });

    expect(dual.dualOccupancy).toBe(true);
    expect(hasRealDualOccupancy(dual)).toBe(true);
    expect(dual.composition).toBe("DUAL");
    expect(dual.winnerId).toBeNull();
    expect(dual.scores).toBeNull();
    expect(dual.sources.find((s) => s.sourceId === PROGRAM_BATTLE_COMPOSITE)?.boundTargets).toEqual(
      expect.arrayContaining(["UNIVERSAL_PLAYER_PRIMARY", "JUMBOTRON_IN_VENUE"])
    );

    // Foreign / unauthorized winner id must not surface
    const bogus = composeBattleProgram({
      sessionId: "sess-battle-dual",
      battleId: "battle-dual-1",
      roomId: "room-battle-2",
      cornerA: { id: "a-1", displayName: "Corner A" },
      cornerB: { id: "b-1", displayName: "Corner B" },
      broadcastEntry: {
        battleId: "battle-dual-1",
        state: "WINNER_REVEAL",
        competitorAId: "a-1",
        competitorBId: "b-1",
        winnerId: "not-a-participant",
        updatedAt: Date.now(),
      },
    });
    expect(bogus.winnerId).toBeNull();

    // Authorized winner from broadcast machine only (no invented settle path in unit test)
    const withWinner = composeBattleProgram({
      sessionId: "sess-battle-settle",
      battleId: "battle-dual-settle",
      roomId: "room-battle-3",
      cornerA: { id: "a-1", displayName: "Corner A" },
      cornerB: { id: "b-1", displayName: "Corner B" },
      scores: { scoreA: 12, scoreB: 9 },
      broadcastEntry: {
        battleId: "battle-dual-settle",
        state: "WINNER_REVEAL",
        competitorAId: "a-1",
        competitorBId: "b-1",
        winnerId: "a-1",
        updatedAt: Date.now(),
      },
    });
    expect(withWinner.winnerId).toBe("a-1");
    expect(withWinner.scores).toEqual({ scoreA: 12, scoreB: 9 });
    expect(withWinner.composition).toBe("A_DOMINANT");

    // Cypher pack must remain free of VS / winner patterns
    expect(CypherPack.allowsVsLayout).toBe(false);
    expect(CypherPack.allowsWinnerFinale).toBe(false);
    expect(() => assertPackAllowsComposition("Cypher", "DUAL")).toThrow();
    expect(getPresentationPack("Battle").routeCapability.architectureCert).toBe("DONE");
    expect(getPresentationPack("Battle").routeCapability.experienceCert).toBe("OPEN");

    clearBattleProgram("test-done");
    expect(getActiveBattleProgram()).toBeNull();
  });

  test("composeChallengeProgram: objective-first; never VS; no invented result; Cypher/Battle clean", () => {
    clearChallengeProgram("test-reset");

    const baseObjective = {
      objectiveId: "obj-test-1",
      objective: "Hit the measurable mark in 60s",
      category: "TECHNICAL",
      timeLimitSec: 60,
      attemptCount: 1,
      judgingPolicy: "MEASURABLE_RESULT" as const,
      realStakeOrReward: "NONE",
      qualificationRules: ["Real attempt only"],
    };

    const solo = composeChallengeProgram({
      sessionId: "sess-challenge-solo",
      challengeId: "chal-1",
      roomId: "room-challenge-1",
      objective: baseObjective,
      challenger: { id: "c-1", displayName: "Challenger One" },
      challenged: null,
      lifecyclePhase: "OBJECTIVE_CONTRACT_ASSEMBLY",
      bindJumbotron: true,
    });

    expect(solo.packId).toBe("Challenge");
    expect(solo.programSourceId).toBe(PROGRAM_CHALLENGE_PRIMARY);
    expect(solo.surfaceKind).toBe("production");
    expect(solo.composition).toBe("OBJECTIVE_FOCUS");
    expect(solo.hasBothParticipants).toBe(false);
    expect(solo.winnerId).toBeNull();
    expect(solo.result).toBeNull();
    expect(isChallengeVsFree(solo)).toBe(true);
    expect(isChallengeProgramProductionSurface()).toBe(true);
    expect(solo.sources.find((s) => s.sourceId === PROGRAM_CHALLENGE_PRIMARY)?.boundTargets).toEqual(
      expect.arrayContaining(["UNIVERSAL_PLAYER_PRIMARY", "JUMBOTRON_IN_VENUE"])
    );

    // Challenge pack must reject Battle VS compositions
    expect(() => assertPackAllowsComposition("Challenge", "DUAL")).toThrow();
    expect(() => assertPackAllowsComposition("Challenge", "A_DOMINANT")).toThrow();

    // Both participants still do NOT force DUAL / VS
    const both = composeChallengeProgram({
      sessionId: "sess-challenge-both",
      challengeId: "chal-2",
      roomId: "room-challenge-2",
      objective: baseObjective,
      challenger: { id: "c-1", displayName: "A" },
      challenged: { id: "d-1", displayName: "B" },
      lifecyclePhase: "ATTEMPT_1_ACTIVE",
    });
    expect(both.hasBothParticipants).toBe(true);
    expect(both.composition).toBe("HOST_CLOSE");
    expect(isChallengeVsFree(both)).toBe(true);

    // Unauthorized winner dropped
    const bogus = composeChallengeProgram({
      sessionId: "sess-challenge-both",
      challengeId: "chal-2",
      roomId: "room-challenge-2",
      objective: baseObjective,
      challenger: { id: "c-1", displayName: "A" },
      challenged: { id: "d-1", displayName: "B" },
      lifecyclePhase: "RESULT_PRESENTATION",
      result: {
        outcome: "WIN",
        winnerId: "not-a-participant",
        summaryText: "Bogus",
      },
    });
    expect(bogus.winnerId).toBeNull();
    expect(bogus.result?.winnerId).toBeNull();

    // Authorized result only when winner matches participant
    const settled = composeChallengeProgram({
      sessionId: "sess-challenge-settle",
      challengeId: "chal-3",
      roomId: "room-challenge-3",
      objective: baseObjective,
      challenger: { id: "c-1", displayName: "A" },
      challenged: { id: "d-1", displayName: "B" },
      result: {
        outcome: "WIN",
        winnerId: "c-1",
        summaryText: "Measurable criteria met by A",
        challengerScore: 10,
        challengedScore: 7,
      },
    });
    expect(settled.winnerId).toBe("c-1");
    expect(settled.result?.challengerScore).toBe(10);

    // Cypher + Battle untouched
    expect(CypherPack.allowsVsLayout).toBe(false);
    expect(() => assertPackAllowsComposition("Cypher", "DUAL")).toThrow();
    expect(BattlePack.allowsVsLayout).toBe(true);
    expect(getPresentationPack("Challenge").routeCapability.architectureCert).toBe("DONE");
    expect(getPresentationPack("Challenge").routeCapability.experienceCert).toBe("OPEN");

    clearChallengeProgram("test-done");
    expect(getActiveChallengeProgram()).toBeNull();
  });

  test("composeCypherProgram: circle + mic; never VS/winner; Battle/Challenge clean", () => {
    clearCypherProgram("test-reset");

    const empty = composeCypherProgram({
      sessionId: "sess-cypher-empty",
      cypherId: "cyp-1",
      roomId: "room-cypher-1",
      circle: [],
      lifecyclePhase: "LOBBY_OPEN",
      bindJumbotron: true,
    });

    expect(empty.packId).toBe("Cypher");
    expect(empty.programSourceId).toBe(PROGRAM_CYPHER_FOCUS);
    expect(empty.surfaceKind).toBe("production");
    expect(empty.composition).toBe("CIRCLE_FOCUS");
    expect(empty.activeMic).toBeNull();
    expect(empty.nextUp).toBeNull();
    expect(empty.dualOccupancy).toBe(false);
    expect(empty.winnerId).toBeNull();
    expect(isCypherVsFree(empty)).toBe(true);
    expect(isCypherProgramProductionSurface()).toBe(true);
    expect(empty.sources.find((s) => s.sourceId === PROGRAM_CYPHER_FOCUS)?.boundTargets).toEqual(
      expect.arrayContaining(["UNIVERSAL_PLAYER_PRIMARY", "JUMBOTRON_IN_VENUE"])
    );

    // Cypher pack must reject Battle VS compositions
    expect(() => assertPackAllowsComposition("Cypher", "DUAL")).toThrow();
    expect(() => assertPackAllowsComposition("Cypher", "SPLIT")).toThrow();
    expect(mapCypherPhaseToComposition("SPLIT_CLASH")).toBe("CIRCLE_FOCUS");
    expect(mapCypherPhaseToComposition("WINNER_DECLARED")).toBe("CIRCLE_FOCUS");

    const live = composeCypherProgram({
      sessionId: "sess-cypher-live",
      cypherId: "cyp-2",
      roomId: "room-cypher-2",
      circle: [
        { id: "m-1", displayName: "MC One" },
        { id: "m-2", displayName: "MC Two" },
        { id: "m-3", displayName: "MC Three" },
      ],
      activeMicId: "m-1",
      lifecyclePhase: "VERSE_ACTIVE",
    });
    expect(live.composition).toBe("HOST_CLOSE");
    expect(live.activeMic?.id).toBe("m-1");
    expect(live.nextUp?.id).toBe("m-2");
    expect(live.winnerId).toBeNull();
    expect(isCypherVsFree(live)).toBe(true);

    // Stranger mic id dropped when circle is authoritative
    const bogusMic = composeCypherProgram({
      sessionId: "sess-cypher-live",
      cypherId: "cyp-2",
      roomId: "room-cypher-2",
      circle: [
        { id: "m-1", displayName: "MC One" },
        { id: "m-2", displayName: "MC Two" },
      ],
      activeMicId: "not-in-circle",
      lifecyclePhase: "VERSE_ACTIVE",
    });
    expect(bogusMic.activeMic).toBeNull();

    // Battle + Challenge untouched
    expect(BattlePack.allowsVsLayout).toBe(true);
    expect(() => assertPackAllowsComposition("Battle", "DUAL")).not.toThrow();
    expect(ChallengePack.allowsVsLayout).toBe(false);
    expect(ChallengePack.prefersChallengeContract).toBe(true);
    expect(getPresentationPack("Cypher").routeCapability.architectureCert).toBe("DONE");
    expect(getPresentationPack("Cypher").routeCapability.experienceCert).toBe("OPEN");

    clearCypherProgram("test-done");
    expect(getActiveCypherProgram()).toBeNull();
  });

  test("composeConcertProgram: stage-forward; never VS/circle; Cypher/Battle/Challenge clean", () => {
    clearConcertProgram("test-reset");

    const empty = composeConcertProgram({
      sessionId: "sess-concert-empty",
      concertId: "con-1",
      roomId: "room-concert-1",
      scope: "MINI",
      lifecyclePhase: "VENUE_PREP",
      bindJumbotron: true,
    });

    expect(empty.packId).toBe("Concert");
    expect(empty.programSourceId).toBe(PROGRAM_CONCERT_STAGE);
    expect(empty.worldMiniBadge).toBe("⭐ MINI");
    expect(empty.surfaceKind).toBe("production");
    expect(empty.composition).toBe("STAGE_WIDE");
    expect(empty.headliner).toBeNull();
    expect(empty.setlist).toEqual([]);
    expect(empty.nowPlaying).toBeNull();
    expect(empty.dualOccupancy).toBe(false);
    expect(empty.winnerId).toBeNull();
    expect(isConcertVsFree(empty)).toBe(true);
    expect(isConcertProgramProductionSurface()).toBe(true);
    expect(empty.sources.find((s) => s.sourceId === PROGRAM_CONCERT_STAGE)?.boundTargets).toEqual(
      expect.arrayContaining(["UNIVERSAL_PLAYER_PRIMARY", "JUMBOTRON_IN_VENUE"])
    );

    // Concert packs reject Battle VS + Cypher circle
    expect(ConcertPack.allowsVsLayout).toBe(false);
    expect(WorldConcertPack.allowsVsLayout).toBe(false);
    expect(() => assertPackAllowsComposition("Concert", "DUAL")).toThrow();
    expect(() => assertPackAllowsComposition("Concert", "CIRCLE_FOCUS")).toThrow();
    expect(() => assertPackAllowsComposition("WorldConcert", "A_DOMINANT")).toThrow();
    expect(() => assertPackAllowsComposition("WorldConcert", "CIRCLE_FOCUS")).toThrow();
    expect(mapConcertPhaseToComposition("PERFORMANCE_ACTIVE", "MINI")).toBe("STAGE_WIDE");
    expect(mapConcertPhaseToComposition("SPONSOR_MOMENT", "WORLD")).toBe("SPLIT");

    const live = composeConcertProgram({
      sessionId: "sess-concert-live",
      concertId: "con-2",
      roomId: "room-concert-2",
      scope: "WORLD",
      headlinerId: "h-1",
      headlinerDisplayName: "Headliner One",
      setlist: [
        { trackId: "t-1", title: "Opener" },
        { trackId: "t-2", title: "Encore Cut", isEncoreTrack: true },
      ],
      nowPlayingIndex: 0,
      lifecyclePhase: "PERFORMANCE_ACTIVE",
    });
    expect(live.packId).toBe("WorldConcert");
    expect(live.programSourceId).toBe(PROGRAM_WORLD_CONCERT);
    expect(live.worldMiniBadge).toBe("🌍 WORLD");
    expect(live.composition).toBe("STAGE_WIDE");
    expect(live.headliner?.id).toBe("h-1");
    expect(live.nowPlaying?.title).toBe("Opener");
    expect(live.winnerId).toBeNull();
    expect(isConcertVsFree(live)).toBe(true);

    // Out-of-bounds nowPlayingIndex dropped
    const bogusIdx = composeConcertProgram({
      sessionId: "sess-concert-live",
      concertId: "con-2",
      roomId: "room-concert-2",
      scope: "WORLD",
      headlinerId: "h-1",
      headlinerDisplayName: "Headliner One",
      setlist: [{ trackId: "t-1", title: "Opener" }],
      nowPlayingIndex: 99,
      lifecyclePhase: "PERFORMANCE_ACTIVE",
    });
    expect(bogusIdx.nowPlaying).toBeNull();

    // Battle + Challenge + Cypher untouched
    expect(BattlePack.allowsVsLayout).toBe(true);
    expect(() => assertPackAllowsComposition("Battle", "DUAL")).not.toThrow();
    expect(ChallengePack.allowsVsLayout).toBe(false);
    expect(ChallengePack.prefersChallengeContract).toBe(true);
    expect(CypherPack.allowsVsLayout).toBe(false);
    expect(() => assertPackAllowsComposition("Cypher", "DUAL")).toThrow();
    expect(getPresentationPack("Concert").routeCapability.architectureCert).toBe("DONE");
    expect(getPresentationPack("WorldConcert").routeCapability.architectureCert).toBe("DONE");
    expect(getPresentationPack("Concert").routeCapability.experienceCert).toBe("OPEN");
    expect(getPresentationPack("WorldConcert").routeCapability.experienceCert).toBe("OPEN");

    clearConcertProgram("test-done");
    expect(getActiveConcertProgram()).toBeNull();
  });

  test("registry lists all DNA packs", () => {
    const packs = listPresentationPacks();
    expect(packs.length).toBe(14);
    expect(packs.map((p) => p.packId)).toEqual(
      expect.arrayContaining([
        "Battle",
        "Challenge",
        "Cypher",
        "Gauntlet",
        "LiveCollaboration",
        "Concert",
        "WorldConcert",
        "WorldRelease",
        "DanceParty",
        "Lounge",
        "MondayNightStage",
        "GameShow",
        "FanLive",
        "PerformerLive",
      ])
    );
  });
});
