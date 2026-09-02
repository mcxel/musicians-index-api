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
import { LoungePack, CypherPack, BattlePack, ChallengePack } from "../packs";
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

describe("experiencePresentation semantic guards", () => {
  test("Cypher pack rejects VS/winner layouts", () => {
    expect(CypherPack.allowsVsLayout).toBe(false);
    expect(CypherPack.allowsWinnerFinale).toBe(false);
    expect(CypherPack.allowsEliminationFinale).toBe(false);
    expect(() => assertPackAllowsComposition("Cypher", "DUAL")).toThrow(/VS|forbids|does not allow/i);
    expect(() => assertPackAllowsComposition("Cypher", "A_DOMINANT")).toThrow();
    expect(() => assertPackAllowsComposition("Cypher", "B_DOMINANT")).toThrow();
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
