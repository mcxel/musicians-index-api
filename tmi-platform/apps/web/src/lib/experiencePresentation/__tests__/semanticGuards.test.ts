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
