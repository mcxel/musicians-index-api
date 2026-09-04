/**
 * Regular GO LIVE → Live Media Fabric canary — certification suite (12 proof gates).
 *
 * Scope: REGULAR_GO_LIVE only. Does not migrate battles/cyphers/other experiences.
 */

import {
  beginRegularGoLiveCanary,
  advanceRegularGoLiveCanaryReady,
  advanceRegularGoLiveCanaryPublishing,
  prepareThenTakeRegularGoLiveProgram,
  cycleRegularGoLiveSurfaces,
  syncRegularGoLiveCanaryAudience,
  markRegularGoLiveCanaryLive,
  simulateRegularGoLiveCanaryRecovery,
  teardownRegularGoLiveCanary,
  getRegularGoLiveCanaryObservatory,
  runRegularGoLiveCanaryHappyPath,
  shouldAttachRegularGoLiveFabricCanary,
  isRegularGoLiveExperience,
  isRegularGoLiveFabricCanaryEnabled,
  CANARY_SURFACE_CYCLE,
} from "../lib/live/canary/regularGoLiveFabricCanary";

describe("Regular GO LIVE Fabric Canary", () => {
  afterEach(() => {
    teardownRegularGoLiveCanary({ reason: "test-cleanup" });
  });

  describe("experience gate", () => {
    it("allows only Regular GO LIVE experiences", () => {
      expect(isRegularGoLiveExperience("live")).toBe(true);
      expect(isRegularGoLiveExperience("live-show")).toBe(true);
      expect(isRegularGoLiveExperience(undefined)).toBe(true);
      expect(isRegularGoLiveExperience("battle")).toBe(false);
      expect(isRegularGoLiveExperience("cypher")).toBe(false);
      expect(isRegularGoLiveExperience("challenge")).toBe(false);
      expect(isRegularGoLiveExperience("fan-social")).toBe(false);
      expect(isRegularGoLiveExperience("concert")).toBe(false);
      expect(isRegularGoLiveExperience("monday-night-stage")).toBe(false);
    });

    it("shouldAttach requires both flag and regular experience", () => {
      expect(isRegularGoLiveFabricCanaryEnabled()).toBe(true);
      expect(shouldAttachRegularGoLiveFabricCanary("live")).toBe(true);
      expect(shouldAttachRegularGoLiveFabricCanary("battle")).toBe(false);
    });
  });

  describe("1. PREFLIGHT — MIC/CAM/privacy OFF by default", () => {
    it("captures explicit OFF defaults at canary begin", () => {
      beginRegularGoLiveCanary({
        roomId: "room-preflight",
        hostUserId: "host-1",
        cameraPreviewActive: false,
        micPreviewActive: false,
        isLivePublished: false,
      });
      const obs = getRegularGoLiveCanaryObservatory();
      expect(obs.state).toBe("PREFLIGHT");
      expect(obs.preflightDefaults.cameraPreviewActive).toBe(false);
      expect(obs.preflightDefaults.micPreviewActive).toBe(false);
      expect(obs.preflightDefaults.isLivePublished).toBe(false);
      expect(obs.stateHistory).toEqual(["PREFLIGHT"]);
    });
  });

  describe("2–5. Publication kernel + media graph + program/preview", () => {
    it("drives PREFLIGHT→READY→CONNECTING→PUBLISHING→LIVE with media graph", () => {
      beginRegularGoLiveCanary({
        roomId: "room-kernel",
        hostUserId: "host-1",
        cameraPreviewActive: false,
        micPreviewActive: false,
        isLivePublished: false,
      });
      advanceRegularGoLiveCanaryReady();
      advanceRegularGoLiveCanaryPublishing({ hasCamera: true, hasMic: true });

      let obs = getRegularGoLiveCanaryObservatory();
      expect(obs.stateHistory).toEqual(
        expect.arrayContaining(["PREFLIGHT", "READY", "CONNECTING", "PUBLISHING"]),
      );

      const kinds = obs.sources.map((s) => s.mediaKind).sort();
      expect(kinds).toEqual(
        ["AUDIENCE_RENDERER", "CAMERA", "MIC", "VENUE_RENDERER"].sort(),
      );
      expect(obs.sources.every((s) => s.publishEligible)).toBe(true);

      const take = prepareThenTakeRegularGoLiveProgram("FLAT");
      expect(take.ok).toBe(true);
      expect(take.programPrimary).toBe("src-performer-cam");

      // Second prepare+take must not require stream recreation — same source ids
      const take2 = prepareThenTakeRegularGoLiveProgram("FLAT");
      expect(take2.ok).toBe(true);
      expect(take2.programPrimary).toBe("src-performer-cam");

      markRegularGoLiveCanaryLive();
      obs = getRegularGoLiveCanaryObservatory();
      expect(obs.state).toBe("LIVE");
      expect(obs.stateHistory).toContain("LIVE");
      expect(obs.generation).toBeGreaterThanOrEqual(1);
      expect(obs.revision).toBeGreaterThan(0);
    });
  });

  describe("6. SURFACE COMPOSITION", () => {
    it("cycles single-screen → split-class → PiP → fullscreen-class → return on same session", () => {
      runRegularGoLiveCanaryHappyPath({ roomId: "room-surface", hostUserId: "host-1" });
      // happy path already cycles; re-run cycle on live session
      const cycle = cycleRegularGoLiveSurfaces();
      expect(cycle.ok).toBe(true);
      expect(cycle.layouts.length).toBe(CANARY_SURFACE_CYCLE.length);
      expect(cycle.layouts[0]).toBe("FLAT");
      expect(cycle.layouts).toContain("PIP");
      expect(cycle.layouts).toContain("HYBRID");
      expect(cycle.layouts).toContain("FOCUS");
      expect(cycle.layouts[cycle.layouts.length - 1]).toBe("FLAT");
      expect(getRegularGoLiveCanaryObservatory().sessionId).toBeTruthy();
    });
  });

  describe("7. AUDIENCE — real count only", () => {
    it("syncs provided human count and rejects fabrication path (no auto invent)", () => {
      beginRegularGoLiveCanary({
        roomId: "room-aud",
        hostUserId: "host-1",
      });
      advanceRegularGoLiveCanaryReady();
      advanceRegularGoLiveCanaryPublishing();
      markRegularGoLiveCanaryLive();

      expect(getRegularGoLiveCanaryObservatory().audienceHumanCount).toBe(0);
      syncRegularGoLiveCanaryAudience(1);
      expect(getRegularGoLiveCanaryObservatory().audienceHumanCount).toBe(1);
      syncRegularGoLiveCanaryAudience(-3);
      expect(getRegularGoLiveCanaryObservatory().errors.some((e) => e.includes("INVALID_AUDIENCE"))).toBe(
        true,
      );
    });
  });

  describe("8. DISCOVERY gate (experience isolation)", () => {
    it("does not attach fabric for non-regular experiences (discovery stays legacy path)", () => {
      expect(shouldAttachRegularGoLiveFabricCanary("battle")).toBe(false);
      expect(shouldAttachRegularGoLiveFabricCanary("cypher")).toBe(false);
      expect(shouldAttachRegularGoLiveFabricCanary("live")).toBe(true);
    });
  });

  describe("9. AUDIO — one program authority", () => {
    it("commits a single MIC program audio path", () => {
      beginRegularGoLiveCanary({ roomId: "room-audio", hostUserId: "host-1" });
      advanceRegularGoLiveCanaryReady();
      advanceRegularGoLiveCanaryPublishing();
      prepareThenTakeRegularGoLiveProgram("FLAT");
      markRegularGoLiveCanaryLive();
      const obs = getRegularGoLiveCanaryObservatory();
      expect(obs.audioAuthoritySourceId).toBe("src-performer-mic");
      expect(obs.programAudibleSourceIds).toEqual(["src-performer-mic"]);
    });
  });

  describe("10. RECOVERY", () => {
    it("survives camera loss with session still LIVE", () => {
      runRegularGoLiveCanaryHappyPath({ roomId: "room-recov", hostUserId: "host-1" });
      // happy path already ran recovery; assert observatory
      const obs = getRegularGoLiveCanaryObservatory();
      expect(obs.state).toBe("LIVE");
      expect(obs.recoveryIncidents.some((i) => i.code === "MEDIA-CAM-LOSS")).toBe(true);
      expect(obs.stateHistory).toContain("RECONNECTING");

      const net = simulateRegularGoLiveCanaryRecovery("NET-DROP");
      expect(net.ok).toBe(true);
      expect(net.sessionAlive).toBe(true);
    });
  });

  describe("11. TEARDOWN", () => {
    it("ENDS session, revokes sources, clears canary (no orphan publisher)", () => {
      runRegularGoLiveCanaryHappyPath({ roomId: "room-end", hostUserId: "host-1" });
      const after = teardownRegularGoLiveCanary({ reason: "end-live" });
      expect(after.teardownComplete).toBe(true);
      expect(after.state).toBe("ENDED");
      expect(after.canaryActive).toBe(false);
      expect(getRegularGoLiveCanaryObservatory().canaryActive).toBe(false);
      expect(getRegularGoLiveCanaryObservatory().sessionId).toBeNull();
    });
  });

  describe("12. OBSERVATORY", () => {
    it("captures session state, generation/revision, sources, PROGRAM/PREVIEW, audio, audience, recovery", () => {
      const obs = runRegularGoLiveCanaryHappyPath({
        roomId: "room-obs",
        hostUserId: "host-obs",
        audienceHumanCount: 2,
      });
      expect(obs.canaryActive).toBe(true);
      expect(obs.experienceType).toBe("REGULAR_GO_LIVE");
      expect(obs.sessionId).toMatch(/^sess-/);
      expect(obs.roomId).toBe("room-obs");
      expect(obs.state).toBe("LIVE");
      expect(obs.generation).toBeGreaterThanOrEqual(1);
      expect(obs.revision).toBeGreaterThan(0);
      expect(obs.sources.length).toBe(4);
      expect(obs.programPrimary).toBeTruthy();
      expect(obs.layout).toBeTruthy();
      expect(obs.audioAuthoritySourceId).toBe("src-performer-mic");
      expect(obs.audienceHumanCount).toBe(2);
      expect(obs.recoveryIncidents.length).toBeGreaterThan(0);
      expect(obs.transport.reconnectCount).toBeGreaterThanOrEqual(1);
      expect(obs.errors).toEqual([]);
    });
  });
});
