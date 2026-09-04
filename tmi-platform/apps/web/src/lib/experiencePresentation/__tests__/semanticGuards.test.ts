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
import { LoungePack, CypherPack, BattlePack, ChallengePack, ConcertPack, WorldConcertPack, DancePartyPack, MondayNightStagePack, WorldReleasePack, GameShowPack, FanLivePack } from "../packs";
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
import {
  clearDancePartyProgram,
  composeDancePartyProgram,
  getActiveDancePartyProgram,
  isDancePartyProgramProductionSurface,
  isDancePartyVsFree,
  mapDancePartyPhaseToComposition,
  PROGRAM_WDP_COMPOSITE,
} from "../composeDancePartyProgram";
import {
  clearMondayNightStageProgram,
  composeMondayNightStageProgram,
  getActiveMondayNightStageProgram,
  isMondayNightStageProgramProductionSurface,
  isMondayNightStageVsFree,
  mapMondayNightStagePhaseToComposition,
  PROGRAM_MNS_SHOW,
} from "../composeMondayNightStageProgram";
import {
  clearReleaseProgram,
  composeReleaseProgram,
  getActiveReleaseProgram,
  isReleaseProgramProductionSurface,
  isReleaseVsFree,
  mapReleasePhaseToComposition,
  PROGRAM_RELEASE_PREMIERE,
  PROGRAM_WORLD_RELEASE,
} from "../composeReleaseProgram";
import {
  clearGameShowProgram,
  composeGameShowProgram,
  getActiveGameShowProgram,
  isGameShowProgramProductionSurface,
  isGameShowVsFree,
  mapGameShowPhaseToComposition,
  PROGRAM_GAME_SHOW,
} from "../composeGameShowProgram";
import {
  clearFanLobbyProgram,
  composeFanLobbyProgram,
  getActiveFanLobbyProgram,
  isFanLobbyProgramProductionSurface,
  isFanLobbyVsFree,
  mapFanLobbyPhaseToComposition,
  PROGRAM_FAN_LOBBY,
} from "../composeFanLobbyProgram";
import {
  clearLoungeProgram,
  composeLoungeProgram,
  getActiveLoungeProgram,
  isLoungeProgramProductionSurface,
  isLoungeVsFree,
  mapLoungePhaseToComposition,
  PROGRAM_LOUNGE,
  PROGRAM_PLAYLIST_LOUNGE,
} from "../composeLoungeProgram";
import { RECORD_RALPH_BOT_ID } from "@/lib/dance/WorldDancePartyRotationPool";
import {
  isFanAvatarOwnershipRole,
  isPerformerIdentityRole,
} from "@/lib/avatars/fanAvatarOwnership";
import {
  catalogCosmeticIds,
  clearFanEquippedLookCache,
  resolveFanEquippedLook,
} from "@/lib/avatars/FanEquippedLookBridge";

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
    expect(pack.allowsVsLayout).toBe(false);
    expect(() => assertPackAllowsComposition("Lounge", "HOST_CLOSE")).not.toThrow();
    expect(() => assertPackAllowsComposition("Lounge", "DUAL")).toThrow();
    expect(() => assertPackAllowsComposition("Lounge", "FLOOR_WIDE")).toThrow();
    expect(() => assertPackAllowsComposition("Lounge", "CIRCLE_FOCUS")).toThrow();
    expect(() => assertPackAllowsComposition("Lounge", "GAME_BOARD")).toThrow();
  });

  test("FanLive pack authorizes fan avatars and rejects Battle/Cypher/GameShow DNA", () => {
    expect(FanLivePack.presenceModel).toBe("FAN_AVATARS");
    expect(FanLivePack.allowsVsLayout).toBe(false);
    expect(() => assertPackAllowsComposition("FanLive", "HOST_CLOSE")).not.toThrow();
    expect(() => assertPackAllowsComposition("FanLive", "PIP")).not.toThrow();
    expect(() => assertPackAllowsComposition("FanLive", "DUAL")).toThrow();
    expect(() => assertPackAllowsComposition("FanLive", "CIRCLE_FOCUS")).toThrow();
    expect(() => assertPackAllowsComposition("FanLive", "GAME_BOARD")).toThrow();
    expect(() => assertPackAllowsComposition("FanLive", "FLOOR_WIDE")).toThrow();
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
    expect(getPresentationPack("Challenge").routeCapability.experienceCert).toBe("DONE");

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

  test("composeDancePartyProgram: DJ+floor; never VS/circle; Cypher/Battle/Challenge/Concert clean", () => {
    clearDancePartyProgram("test-reset");

    const empty = composeDancePartyProgram({
      sessionId: "sess-wdp-empty",
      partyId: "wdp-1",
      roomId: "world-dance-party",
      scope: "WORLD",
      lifecyclePhase: "VENUE_OPENING",
      bindJumbotron: true,
    });

    expect(empty.packId).toBe("DanceParty");
    expect(empty.programSourceId).toBe(PROGRAM_WDP_COMPOSITE);
    expect(empty.worldMiniBadge).toBe("🌍 WORLD");
    expect(empty.surfaceKind).toBe("production");
    expect(empty.composition).toBe("HOST_CLOSE");
    expect(empty.dj?.id).toBe(RECORD_RALPH_BOT_ID);
    expect(empty.dj?.isBot).toBe(true);
    expect(empty.nowPlaying).toBeNull();
    expect(empty.floorPresenceCount).toBeNull();
    expect(empty.dualOccupancy).toBe(false);
    expect(empty.winnerId).toBeNull();
    expect(isDancePartyVsFree(empty)).toBe(true);
    expect(isDancePartyProgramProductionSurface()).toBe(true);
    expect(empty.sources.find((s) => s.sourceId === PROGRAM_WDP_COMPOSITE)?.boundTargets).toEqual(
      expect.arrayContaining(["UNIVERSAL_PLAYER_PRIMARY", "JUMBOTRON_IN_VENUE"])
    );

    // DanceParty rejects Battle VS + Cypher circle
    expect(DancePartyPack.allowsVsLayout).toBe(false);
    expect(DancePartyPack.allowsWinnerFinale).toBe(false);
    expect(() => assertPackAllowsComposition("DanceParty", "DUAL")).toThrow();
    expect(() => assertPackAllowsComposition("DanceParty", "A_DOMINANT")).toThrow();
    expect(() => assertPackAllowsComposition("DanceParty", "B_DOMINANT")).toThrow();
    expect(() => assertPackAllowsComposition("DanceParty", "CIRCLE_FOCUS")).toThrow();
    expect(() => assertPackAllowsComposition("DanceParty", "FLOOR_WIDE")).not.toThrow();
    expect(mapDancePartyPhaseToComposition("DANCE_SESSION")).toBe("FLOOR_WIDE");
    expect(mapDancePartyPhaseToComposition("SPONSOR_MOMENT")).toBe("SPLIT");

    // Non-Ralph World host coerced to Record Ralph
    const coerced = composeDancePartyProgram({
      sessionId: "sess-wdp-live",
      partyId: "wdp-2",
      roomId: "world-dance-party",
      scope: "WORLD",
      djId: "fake-dj",
      djDisplayName: "Fake DJ",
      lifecyclePhase: "DANCE_SESSION",
      nowPlaying: {
        trackId: "t-1",
        title: "Floor Cut",
        artistName: "Real Artist",
        bpm: 128,
      },
      floorPresenceCount: 12,
    });
    expect(coerced.dj?.id).toBe(RECORD_RALPH_BOT_ID);
    expect(coerced.nowPlaying?.title).toBe("Floor Cut");
    expect(coerced.floorPresenceCount).toBe(12);
    expect(coerced.composition).toBe("FLOOR_WIDE");
    expect(isDancePartyVsFree(coerced)).toBe(true);

    // Mini scope — human DJ allowed; no invented World badge
    const mini = composeDancePartyProgram({
      sessionId: "sess-wdp-mini",
      partyId: "mini-1",
      roomId: "mini-dance-party-1",
      scope: "MINI",
      djId: "gold-dj-1",
      djDisplayName: "Gold DJ One",
      djIsBot: false,
      lifecyclePhase: "WARMUP",
    });
    expect(mini.worldMiniBadge).toBe("⭐ MINI");
    expect(mini.dj?.id).toBe("gold-dj-1");
    expect(mini.dj?.isBot).toBe(false);
    expect(mini.programSourceId).toBe(PROGRAM_WDP_COMPOSITE);

    // Invented floor count rejected
    const bogusFloor = composeDancePartyProgram({
      sessionId: "sess-wdp-mini",
      partyId: "mini-1",
      roomId: "mini-dance-party-1",
      scope: "MINI",
      djId: "gold-dj-1",
      djDisplayName: "Gold DJ One",
      floorPresenceCount: -5,
    });
    expect(bogusFloor.floorPresenceCount).toBeNull();

    // Battle + Challenge + Cypher + Concert untouched
    expect(BattlePack.allowsVsLayout).toBe(true);
    expect(() => assertPackAllowsComposition("Battle", "DUAL")).not.toThrow();
    expect(ChallengePack.allowsVsLayout).toBe(false);
    expect(ChallengePack.prefersChallengeContract).toBe(true);
    expect(CypherPack.allowsVsLayout).toBe(false);
    expect(() => assertPackAllowsComposition("Cypher", "DUAL")).toThrow();
    expect(ConcertPack.allowsVsLayout).toBe(false);
    expect(WorldConcertPack.allowsVsLayout).toBe(false);
    expect(getPresentationPack("DanceParty").routeCapability.architectureCert).toBe("DONE");
    expect(getPresentationPack("DanceParty").routeCapability.experienceCert).toBe("OPEN");

    clearDancePartyProgram("test-done");
    expect(getActiveDancePartyProgram()).toBeNull();
  });

  test("composeMondayNightStageProgram: featured+Who's Next; never VS/circle/GO LIVE; prior packs clean", () => {
    clearMondayNightStageProgram("test-reset");

    const empty = composeMondayNightStageProgram({
      sessionId: "sess-mns-empty",
      roomId: "monday-stage",
      lifecyclePhase: "PRESHOW",
      bindJumbotron: true,
    });

    expect(empty.packId).toBe("MondayNightStage");
    expect(empty.programSourceId).toBe(PROGRAM_MNS_SHOW);
    expect(empty.worldMiniBadge).toBe("🌍 WORLD");
    expect(empty.scope).toBe("WORLD");
    expect(empty.surfaceKind).toBe("production");
    expect(empty.composition).toBe("HOST_CLOSE");
    expect(empty.isRegularGoLive).toBe(false);
    expect(empty.mainHost?.id).toBe("bobby-stanley");
    expect(empty.mainHost?.isBot).toBe(true);
    expect(empty.coHosts.map((h) => h.id)).toEqual(expect.arrayContaining(["kira", "bebo"]));
    expect(empty.featured).toBeNull();
    expect(empty.whosNext).toBeNull();
    expect(empty.audiencePresenceCount).toBeNull();
    expect(empty.dualOccupancy).toBe(false);
    expect(empty.winnerId).toBeNull();
    expect(isMondayNightStageVsFree(empty)).toBe(true);
    expect(isMondayNightStageProgramProductionSurface()).toBe(true);
    expect(empty.sources.find((s) => s.sourceId === PROGRAM_MNS_SHOW)?.boundTargets).toEqual(
      expect.arrayContaining(["UNIVERSAL_PLAYER_PRIMARY", "JUMBOTRON_IN_VENUE"])
    );

    // MNS rejects Battle VS + Cypher circle; SPLIT allowed for sponsor/host dual-panel
    expect(MondayNightStagePack.allowsVsLayout).toBe(false);
    expect(MondayNightStagePack.allowsWinnerFinale).toBe(false);
    expect(MondayNightStagePack.isRegularGoLive).toBe(false);
    expect(() => assertPackAllowsComposition("MondayNightStage", "DUAL")).toThrow();
    expect(() => assertPackAllowsComposition("MondayNightStage", "A_DOMINANT")).toThrow();
    expect(() => assertPackAllowsComposition("MondayNightStage", "B_DOMINANT")).toThrow();
    expect(() => assertPackAllowsComposition("MondayNightStage", "CIRCLE_FOCUS")).toThrow();
    expect(() => assertPackAllowsComposition("MondayNightStage", "STAGE_WIDE")).not.toThrow();
    expect(() => assertPackAllowsComposition("MondayNightStage", "SPLIT")).not.toThrow();
    expect(mapMondayNightStagePhaseToComposition("FEATURED_ACT")).toBe("STAGE_WIDE");
    expect(mapMondayNightStagePhaseToComposition("WHOS_NEXT")).toBe("PIP");
    expect(mapMondayNightStagePhaseToComposition("SPONSOR_BREAK")).toBe("SPLIT");

    const live = composeMondayNightStageProgram({
      sessionId: "sess-mns-live",
      roomId: "monday-stage",
      featuredId: "act-1",
      featuredDisplayName: "Real Act One",
      whosNextId: "act-2",
      whosNextDisplayName: "Real Act Two",
      audiencePresenceCount: 40,
      lifecyclePhase: "FEATURED_ACT",
    });
    expect(live.featured?.displayName).toBe("Real Act One");
    expect(live.whosNext?.displayName).toBe("Real Act Two");
    expect(live.audiencePresenceCount).toBe(40);
    expect(live.composition).toBe("STAGE_WIDE");
    expect(isMondayNightStageVsFree(live)).toBe(true);

    // Invented negative attendance rejected
    const bogusAudience = composeMondayNightStageProgram({
      sessionId: "sess-mns-live",
      roomId: "monday-stage",
      audiencePresenceCount: -3,
    });
    expect(bogusAudience.audiencePresenceCount).toBeNull();

    // Battle + Challenge + Cypher + Concert + DanceParty untouched
    expect(BattlePack.allowsVsLayout).toBe(true);
    expect(() => assertPackAllowsComposition("Battle", "DUAL")).not.toThrow();
    expect(ChallengePack.allowsVsLayout).toBe(false);
    expect(ChallengePack.prefersChallengeContract).toBe(true);
    expect(CypherPack.allowsVsLayout).toBe(false);
    expect(() => assertPackAllowsComposition("Cypher", "DUAL")).toThrow();
    expect(ConcertPack.allowsVsLayout).toBe(false);
    expect(DancePartyPack.allowsVsLayout).toBe(false);
    expect(getPresentationPack("MondayNightStage").routeCapability.architectureCert).toBe("DONE");
    expect(getPresentationPack("MondayNightStage").routeCapability.experienceCert).toBe("OPEN");
    expect(getPresentationPack("PerformerLive").isRegularGoLive).toBe(true);
    expect(getPresentationPack("MondayNightStage").isRegularGoLive).toBe(false);

    clearMondayNightStageProgram("test-done");
    expect(getActiveMondayNightStageProgram()).toBeNull();
  });

  test("composeReleaseProgram: premiere focus; never VS/circle; Cypher/Battle/MNS clean", () => {
    clearReleaseProgram("test-reset");

    const empty = composeReleaseProgram({
      sessionId: "sess-release-empty",
      releaseId: "rel-empty",
      roomId: "release-open",
      scope: "MINI",
      bindJumbotron: true,
    });
    expect(empty.packId).toBe("WorldRelease");
    expect(empty.scope).toBe("MINI");
    expect(empty.worldMiniBadge).toBe("⭐ MINI");
    expect(empty.programSourceId).toBe(PROGRAM_RELEASE_PREMIERE);
    expect(empty.artist).toBeNull();
    expect(empty.release).toBeNull();
    expect(empty.merchCtas).toEqual([]);
    expect(empty.countdownRemainingSec).toBeNull();
    expect(empty.dualOccupancy).toBe(false);
    expect(empty.winnerId).toBeNull();
    expect(isReleaseVsFree(empty)).toBe(true);
    expect(isReleaseProgramProductionSurface()).toBe(true);

    expect(WorldReleasePack.allowsVsLayout).toBe(false);
    expect(WorldReleasePack.isRegularGoLive).toBe(false);
    expect(() => assertPackAllowsComposition("WorldRelease", "DUAL")).toThrow();
    expect(() => assertPackAllowsComposition("WorldRelease", "A_DOMINANT")).toThrow();
    expect(() => assertPackAllowsComposition("WorldRelease", "B_DOMINANT")).toThrow();
    expect(() => assertPackAllowsComposition("WorldRelease", "CIRCLE_FOCUS")).toThrow();
    expect(() => assertPackAllowsComposition("WorldRelease", "GAME_BOARD")).toThrow();
    expect(() => assertPackAllowsComposition("WorldRelease", "STAGE_WIDE")).not.toThrow();
    expect(mapReleasePhaseToComposition("countdown")).toBe("PIP");
    expect(mapReleasePhaseToComposition("performing")).toBe("STAGE_WIDE");
    expect(mapReleasePhaseToComposition("PREMIERE_DROP")).toBe("STAGE_WIDE");

    const live = composeReleaseProgram({
      sessionId: "sess-release-live",
      releaseId: "rel-world-1",
      roomId: "world-release-1",
      eventId: "evt-1",
      scope: "WORLD",
      artistId: "artist-1",
      artistDisplayName: "Real Artist",
      releaseTitle: "Midnight Drop",
      artworkUrl: "/art/midnight.jpg",
      countdownRemainingSec: 12,
      merchCtas: [
        {
          productId: "merch-1",
          title: "Vinyl Preorder",
          href: "/store/merch-1",
          priceLabel: "$29",
        },
      ],
      lifecyclePhase: "countdown",
      bindJumbotron: true,
    });
    expect(live.packId).toBe("WorldRelease");
    expect(live.scope).toBe("WORLD");
    expect(live.worldMiniBadge).toBe("🌍 WORLD");
    expect(live.programSourceId).toBe(PROGRAM_WORLD_RELEASE);
    expect(live.artist?.displayName).toBe("Real Artist");
    expect(live.release?.title).toBe("Midnight Drop");
    expect(live.countdownRemainingSec).toBe(12);
    expect(live.merchCtas).toHaveLength(1);
    expect(live.composition).toBe("PIP");
    expect(isReleaseVsFree(live)).toBe(true);

    // Invented / invalid merch href rejected
    const bogusMerch = composeReleaseProgram({
      sessionId: "sess-release-live",
      releaseId: "rel-world-1",
      roomId: "world-release-1",
      scope: "WORLD",
      artistId: "artist-1",
      artistDisplayName: "Real Artist",
      releaseTitle: "Midnight Drop",
      merchCtas: [{ productId: "x", title: "Fake", href: "#" }],
    });
    expect(bogusMerch.merchCtas).toEqual([]);

    // Negative countdown rejected
    const bogusCd = composeReleaseProgram({
      sessionId: "sess-release-live",
      releaseId: "rel-world-1",
      roomId: "world-release-1",
      scope: "WORLD",
      countdownRemainingSec: -5,
    });
    expect(bogusCd.countdownRemainingSec).toBeNull();

    // Prior slices untouched
    expect(BattlePack.allowsVsLayout).toBe(true);
    expect(() => assertPackAllowsComposition("Battle", "DUAL")).not.toThrow();
    expect(ChallengePack.allowsVsLayout).toBe(false);
    expect(CypherPack.allowsVsLayout).toBe(false);
    expect(() => assertPackAllowsComposition("Cypher", "DUAL")).toThrow();
    expect(ConcertPack.allowsVsLayout).toBe(false);
    expect(DancePartyPack.allowsVsLayout).toBe(false);
    expect(MondayNightStagePack.allowsVsLayout).toBe(false);
    expect(getPresentationPack("WorldRelease").routeCapability.architectureCert).toBe("DONE");
    expect(getPresentationPack("WorldRelease").routeCapability.experienceCert).toBe("OPEN");

    clearReleaseProgram("test-done");
    expect(getActiveReleaseProgram()).toBeNull();
  });

  test("composeGameShowProgram: host+board; never VS/circle; winner only when real; prior packs clean", () => {
    clearGameShowProgram("test-reset");

    const empty = composeGameShowProgram({
      sessionId: "sess-gs-empty",
      roomId: "deal-vs-feud",
      formatId: "DEAL_OR_FEUD",
      lifecyclePhase: "HOST_OPEN",
      bindJumbotron: true,
    });

    expect(empty.packId).toBe("GameShow");
    expect(empty.programSourceId).toBe(PROGRAM_GAME_SHOW);
    expect(empty.worldMiniBadge).toBe("🌍 WORLD");
    expect(empty.scope).toBe("WORLD");
    expect(empty.formatId).toBe("DEAL_OR_FEUD");
    expect(empty.surfaceKind).toBe("production");
    expect(empty.composition).toBe("HOST_CLOSE");
    expect(empty.isRegularGoLive).toBe(false);
    expect(empty.mainHost?.id).toBe("bobby-stanley");
    expect(empty.mainHost?.isBot).toBe(true);
    expect(empty.prizeHost?.id).toBe("mindy-jean-long");
    expect(empty.contestants).toEqual([]);
    expect(empty.board).toBeNull();
    expect(empty.winnerId).toBeNull();
    expect(empty.dualOccupancy).toBe(false);
    expect(isGameShowVsFree(empty)).toBe(true);
    expect(isGameShowProgramProductionSurface()).toBe(true);
    expect(empty.sources.find((s) => s.sourceId === PROGRAM_GAME_SHOW)?.boundTargets).toEqual(
      expect.arrayContaining(["UNIVERSAL_PLAYER_PRIMARY", "JUMBOTRON_IN_VENUE"])
    );

    // Game Show rejects Battle VS + Cypher circle; GAME_BOARD / SPLIT allowed
    expect(GameShowPack.allowsVsLayout).toBe(false);
    expect(GameShowPack.allowsWinnerFinale).toBe(true);
    expect(GameShowPack.isRegularGoLive).toBe(false);
    expect(() => assertPackAllowsComposition("GameShow", "DUAL")).toThrow();
    expect(() => assertPackAllowsComposition("GameShow", "A_DOMINANT")).toThrow();
    expect(() => assertPackAllowsComposition("GameShow", "B_DOMINANT")).toThrow();
    expect(() => assertPackAllowsComposition("GameShow", "CIRCLE_FOCUS")).toThrow();
    expect(() => assertPackAllowsComposition("GameShow", "GAME_BOARD")).not.toThrow();
    expect(() => assertPackAllowsComposition("GameShow", "SPLIT")).not.toThrow();
    expect(mapGameShowPhaseToComposition("BOARD_LIVE")).toBe("GAME_BOARD");
    expect(mapGameShowPhaseToComposition("CONTESTANT_TURN")).toBe("SPLIT");
    expect(mapGameShowPhaseToComposition("HOST_OPEN")).toBe("HOST_CLOSE");

    const live = composeGameShowProgram({
      sessionId: "sess-gs-live",
      roomId: "deal-vs-feud",
      formatId: "DEAL_OR_FEUD",
      contestants: [
        { id: "c1", displayName: "Real Contestant A", score: 42 },
        { id: "c2", displayName: "Real Contestant B", score: 18 },
      ],
      activeContestantId: "c1",
      board: {
        category: "Name something people do at a concert",
        revealedCount: 2,
        answerCount: 6,
      },
      turnRemainingMs: 15_000,
      roundIndex: 1,
      lifecyclePhase: "CONTESTANT_TURN",
    });
    expect(live.contestants).toHaveLength(2);
    expect(live.activeContestantId).toBe("c1");
    expect(live.board?.category).toContain("concert");
    expect(live.turnRemainingMs).toBe(15_000);
    expect(live.composition).toBe("SPLIT");
    expect(live.winnerId).toBeNull();
    expect(isGameShowVsFree(live)).toBe(true);

    // Bogus active contestant / winner rejected
    const bogus = composeGameShowProgram({
      sessionId: "sess-gs-live",
      roomId: "deal-vs-feud",
      contestants: [{ id: "c1", displayName: "Real", score: 10 }],
      activeContestantId: "not-in-roster",
      winnerId: "invented-winner",
    });
    expect(bogus.activeContestantId).toBeNull();
    expect(bogus.winnerId).toBeNull();

    // Authoritative winner only when in roster
    const withWinner = composeGameShowProgram({
      sessionId: "sess-gs-live",
      roomId: "deal-vs-feud",
      contestants: [{ id: "c1", displayName: "Real", score: 200 }],
      winnerId: "c1",
      prizeLedger: [
        {
          entryId: "p1",
          label: "Store credit",
          currencyKind: "CREDIT",
          amount: 50,
          awardedToContestantId: "c1",
          authoritativeGrantId: "grant-real-1",
        },
        {
          entryId: "p2",
          label: "Fake cash",
          currencyKind: "CASH_GATED",
          amount: 1000,
          awardedToContestantId: "c1",
          // no grant → intent only, award cleared
        },
      ],
      lifecyclePhase: "WINNER_REVEAL",
    });
    expect(withWinner.winnerId).toBe("c1");
    expect(withWinner.prizeLedger).toHaveLength(2);
    expect(withWinner.prizeLedger[0].authoritativeGrantId).toBe("grant-real-1");
    expect(withWinner.prizeLedger[1].awardedToContestantId).toBeNull();

    // Negative timer rejected
    const bogusTimer = composeGameShowProgram({
      sessionId: "sess-gs-live",
      roomId: "deal-vs-feud",
      turnRemainingMs: -5,
    });
    expect(bogusTimer.turnRemainingMs).toBeNull();

    // Prior slices untouched — Battle still VS; Cypher still clean
    expect(BattlePack.allowsVsLayout).toBe(true);
    expect(() => assertPackAllowsComposition("Battle", "DUAL")).not.toThrow();
    expect(ChallengePack.allowsVsLayout).toBe(false);
    expect(CypherPack.allowsVsLayout).toBe(false);
    expect(() => assertPackAllowsComposition("Cypher", "DUAL")).toThrow();
    expect(ConcertPack.allowsVsLayout).toBe(false);
    expect(DancePartyPack.allowsVsLayout).toBe(false);
    expect(MondayNightStagePack.allowsVsLayout).toBe(false);
    expect(WorldReleasePack.allowsVsLayout).toBe(false);
    expect(getPresentationPack("GameShow").routeCapability.architectureCert).toBe("DONE");
    expect(getPresentationPack("GameShow").routeCapability.experienceCert).toBe("OPEN");

    clearGameShowProgram("test-done");
    expect(getActiveGameShowProgram()).toBeNull();
  });

  test("Fan Lobby compose: social hangout DNA — avatars OK, never VS/Cypher/GameShow", () => {
    clearFanLobbyProgram("test-setup");
    clearLoungeProgram("test-setup");

    expect(mapFanLobbyPhaseToComposition("HANGOUT")).toBe("HOST_CLOSE");
    expect(mapFanLobbyPhaseToComposition("WALL_FOCUS")).toBe("PIP");
    expect(() =>
      composeFanLobbyProgram({
        sessionId: "sess-fl",
        roomId: "anchor-global-fan-lobby",
        composition: "DUAL",
      })
    ).toThrow();
    expect(() =>
      composeFanLobbyProgram({
        sessionId: "sess-fl",
        roomId: "anchor-global-fan-lobby",
        composition: "GAME_BOARD",
      })
    ).toThrow();

    const idle = composeFanLobbyProgram({
      sessionId: "sess-fl",
      roomId: "anchor-global-fan-lobby",
      presenceCount: null,
      bindJumbotron: true,
    });
    expect(idle.programSourceId).toBe(PROGRAM_FAN_LOBBY);
    expect(idle.packId).toBe("FanLive");
    expect(idle.presenceModel).toBe("FAN_AVATARS");
    expect(idle.presenceCount).toBeNull();
    expect(idle.dualOccupancy).toBe(false);
    expect(idle.winnerId).toBeNull();
    expect(idle.surfaceKind).toBe("production");
    expect(isFanLobbyProgramProductionSurface()).toBe(true);
    expect(isFanLobbyVsFree(idle)).toBe(true);
    expect(idle.jumbotronBound).toBe(true);

    // Negative / invented occupancy rejected
    const bogus = composeFanLobbyProgram({
      sessionId: "sess-fl",
      roomId: "anchor-global-fan-lobby",
      presenceCount: -3,
    });
    expect(bogus.presenceCount).toBeNull();

    const live = composeFanLobbyProgram({
      sessionId: "sess-fl",
      roomId: "anchor-global-fan-lobby",
      skinId: "cinema",
      skinLabel: "Cinema Lobby",
      presenceCount: 4,
      lifecyclePhase: "HANGOUT",
    });
    expect(live.presenceCount).toBe(4);
    expect(live.skinLabel).toBe("Cinema Lobby");
    expect(getActiveFanLobbyProgram()?.roomId).toBe("anchor-global-fan-lobby");

    expect(getPresentationPack("FanLive").routeCapability.architectureCert).toBe("DONE");
    expect(getPresentationPack("FanLive").routeCapability.experienceCert).toBe("OPEN");
    // Prior slices untouched
    expect(BattlePack.allowsVsLayout).toBe(true);
    expect(GameShowPack.allowsVsLayout).toBe(false);
    expect(LoungePack.presenceModel).toBe("WEBRTC_PANELS");

    clearFanLobbyProgram("test-done");
    expect(getActiveFanLobbyProgram()).toBeNull();
  });

  test("Lounge compose: panels only — rejects avatar stadium / VS / Cypher / GameShow", () => {
    clearLoungeProgram("test-setup");
    clearFanLobbyProgram("test-setup");

    expect(mapLoungePhaseToComposition("ROAM")).toBe("HOST_CLOSE");
    expect(mapLoungePhaseToComposition("PLAYLIST")).toBe("PIP");
    expect(() =>
      composeLoungeProgram({
        sessionId: "sess-lg",
        roomId: "vip-lounge",
        composition: "DUAL",
      })
    ).toThrow();
    expect(() =>
      composeLoungeProgram({
        sessionId: "sess-lg",
        roomId: "vip-lounge",
        composition: "FLOOR_WIDE",
      })
    ).toThrow();

    const chill = composeLoungeProgram({
      sessionId: "sess-lg",
      roomId: "vip-lounge",
      loungeMode: "CHILL_LOUNGE",
      panelPresenceCount: null,
      bindJumbotron: true,
    });
    expect(chill.programSourceId).toBe(PROGRAM_LOUNGE);
    expect(chill.presenceModel).toBe("WEBRTC_PANELS");
    expect(chill.avatarOccupancyAllowed).toBe(false);
    expect(chill.panelPresenceCount).toBeNull();
    expect(chill.dualOccupancy).toBe(false);
    expect(chill.winnerId).toBeNull();
    expect(isLoungeProgramProductionSurface()).toBe(true);
    expect(isLoungeVsFree(chill)).toBe(true);

    const playlist = composeLoungeProgram({
      sessionId: "sess-pl",
      roomId: "lounge-playlist",
      loungeMode: "PLAYLIST_LOUNGE",
      playlistId: "pl-real-1",
      playlistTitle: "Night Drive",
      panelPresenceCount: 2,
    });
    expect(playlist.programSourceId).toBe(PROGRAM_PLAYLIST_LOUNGE);
    expect(playlist.worldMiniBadge).toBe("⭐ PLAYLIST");
    expect(playlist.playlistTitle).toBe("Night Drive");
    expect(playlist.panelPresenceCount).toBe(2);
    expect(playlist.avatarOccupancyAllowed).toBe(false);

    // Invented negative panel count rejected
    const bogus = composeLoungeProgram({
      sessionId: "sess-lg",
      roomId: "vip-lounge",
      panelPresenceCount: -1,
    });
    expect(bogus.panelPresenceCount).toBeNull();

    expect(getPresentationPack("Lounge").routeCapability.architectureCert).toBe("DONE");
    expect(getPresentationPack("Lounge").routeCapability.experienceCert).toBe("OPEN");
    expect(FanLivePack.presenceModel).toBe("FAN_AVATARS");
    expect(CypherPack.allowsVsLayout).toBe(false);
    expect(() => assertPackAllowsComposition("Cypher", "DUAL")).toThrow();

    clearLoungeProgram("test-done");
    expect(getActiveLoungeProgram()).toBeNull();
  });

  test("Avatar Studio → World: FAN-only look bridge; no fake occupancy; architecture stays PARTIAL", () => {
    clearFanEquippedLookCache();
    expect(isFanAvatarOwnershipRole("FAN")).toBe(true);
    expect(isFanAvatarOwnershipRole("USER")).toBe(true);
    expect(isFanAvatarOwnershipRole("ADMIN")).toBe(true);
    expect(isFanAvatarOwnershipRole("PERFORMER")).toBe(false);
    expect(isFanAvatarOwnershipRole("BAND")).toBe(false);
    expect(isPerformerIdentityRole("PERFORMER")).toBe(true);
    expect(isPerformerIdentityRole("FAN")).toBe(false);

    expect(catalogCosmeticIds(["street_fit", "gold_chain", "not-a-sku", "", "none"])).toEqual([
      "street_fit",
      "gold_chain",
    ]);
    const look = resolveFanEquippedLook({
      displayName: "Todd",
      skinTone: "#c07848",
      hairStyle: "Fade",
      outfitLabel: "Street Fit",
      equippedCosmeticIds: ["street_fit", "invented-mesh"],
    });
    expect(look.equippedCosmeticIds).toEqual(["street_fit"]);
    expect(look.glbSlotId).toBe("bobblehead_v0");
    expect(look.loadoutId.startsWith("fan-look:")).toBe(true);
    expect((look as { presenceCount?: number }).presenceCount).toBeUndefined();
    expect((look as { occupancy?: number }).occupancy).toBeUndefined();
    if (look.viewportDiagnostic === "OK") {
      expect(look.glbUrl).toBe("/models/avatars/bobblehead_v0.glb");
    } else {
      expect(look.glbUrl).toBeNull();
    }

    expect(LoungePack.presenceModel).toBe("WEBRTC_PANELS");
    expect(FanLivePack.presenceModel).toBe("FAN_AVATARS");
    expect(getPresentationPack("FanLive").routeCapability.architectureCert).toBe("DONE");
    expect(getPresentationPack("FanLive").routeCapability.experienceCert).toBe("OPEN");
    expect(listPresentationPacks()).toHaveLength(14);
    expect(canMarkExperienceCertPass({ surfaceKind: "green_debug", physicalObserved: true })).toBe(
      false,
    );
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
