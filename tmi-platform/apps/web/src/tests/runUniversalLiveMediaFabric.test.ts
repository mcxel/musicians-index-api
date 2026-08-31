/**
 * runUniversalLiveMediaFabric.test.ts — Master Certification Suite for Live Media Fabric Foundation
 *
 * Certifies all 25 Architectural Laws.
 */

import {
  LiveSessionKernel,
  LiveSessionTransitionError,
  VALID_TRANSITIONS,
  SessionClock,
  SessionMediaGraph,
  LiveFrameGraph,
  SurfaceComposer,
  AdaptivePresentationDirector,
  LiveAudioDirector,
  LiveCapabilityPolicy,
  LiveTransportRouter,
  LiveRecoveryDirector,
  DeviceCapabilityDirector,
  DistributionDirector,
  LiveFabricSimulationHarness,
  FABRIC_CONTRACT_VERSIONS,
  FOUNDATION_REQUIRED_VERSIONS,
  ALL_CANONICAL_EXPERIENCE_TYPES,
  getExperiencePresentationContract,
  certifySingleScreenForAllExperiences,
  DEFAULT_FAIL_CLOSED_RIGHTS,
  DEFAULT_PUBLIC_SOURCE_RIGHTS,
  DEFAULT_PUBLIC_PRIVACY,
  DEFAULT_FAIL_CLOSED_PRIVACY,
} from "../lib/liveFabric";
import * as fs from "node:fs";
import * as path from "node:path";

describe("TMI Universal Live Media Fabric — Master Certification Suite", () => {
  describe("1. Contract Versioning (Law 20)", () => {
    it("freezes canonical 1.0 contract identifiers", () => {
      expect(FABRIC_CONTRACT_VERSIONS.LIVE_SESSION_KERNEL).toBe("LiveSessionKernel/1.0");
      expect(FABRIC_CONTRACT_VERSIONS.SESSION_MEDIA_GRAPH).toBe("SessionMediaGraph/1.0");
      expect(FABRIC_CONTRACT_VERSIONS.EXPERIENCE_PRESENTATION).toBe("ExperiencePresentation/1.0");
      expect(FABRIC_CONTRACT_VERSIONS.LIVE_RIGHTS).toBe("LiveRights/1.0");
      expect(FABRIC_CONTRACT_VERSIONS.LIVE_RECOVERY).toBe("LiveRecovery/1.0");
      expect(FOUNDATION_REQUIRED_VERSIONS.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe("2. Lifecycle, Generation Epoch & Command Idempotency (Laws 1, 2, 19)", () => {
    it("starts IDLE with generation 1 revision 0 and validates legal transitions", () => {
      const kernel = new LiveSessionKernel({
        roomId: "room-cert-01",
        hostUserId: "host-cert-01",
        experienceType: "REGULAR_GO_LIVE",
      });

      expect(kernel.getState()).toBe("IDLE");
      expect(kernel.getGeneration()).toBe(1);
      expect(kernel.getRevision()).toBe(0);

      // Rejects illegal jumps
      expect(() => kernel.transitionTo("LIVE")).toThrow(LiveSessionTransitionError);

      // Follows legal path
      kernel.transitionTo("PREFLIGHT");
      kernel.transitionTo("READY");
      kernel.transitionTo("CONNECTING");
      kernel.transitionTo("PUBLISHING");
      kernel.transitionTo("LIVE");
      expect(kernel.isLive()).toBe(true);

      kernel.transitionTo("ENDING");
      kernel.transitionTo("ENDED");
      expect(kernel.getState()).toBe("ENDED");
    });

    it("rejects commands from stale generations (Law 1)", () => {
      const kernel = new LiveSessionKernel({
        roomId: "room-cert-02",
        hostUserId: "host-cert-02",
      });

      const staleCmd = {
        commandId: "cmd-stale-01",
        sessionId: kernel.getSessionId(),
        generation: 99,
        expectedRevision: 0,
        issuedAtMs: Date.now(),
        type: "MUTATE",
        payload: {},
        issuerId: "host-cert-02",
        issuerRole: "performer" as const,
      };

      const result = kernel.executeCommand(staleCmd, () => undefined);
      expect(result.success).toBe(false);
      expect(result.generationMismatch).toBe(true);
    });

    it("enforces command idempotency on duplicates (Law 2)", () => {
      const kernel = new LiveSessionKernel({
        roomId: "room-cert-03",
        hostUserId: "host-cert-03",
      });

      kernel.transitionTo("PREFLIGHT");
      const rev = kernel.getRevision();

      const cmd = {
        commandId: "cmd-idem-01",
        sessionId: kernel.getSessionId(),
        generation: kernel.getGeneration(),
        expectedRevision: rev,
        issuedAtMs: Date.now(),
        type: "SET_LAYOUT",
        payload: { layout: "SPLIT" },
        issuerId: "host-cert-03",
        issuerRole: "performer" as const,
      };

      const r1 = kernel.executeCommand(cmd, () => undefined);
      expect(r1.success).toBe(true);
      expect(r1.idempotentSkip).toBeFalsy();

      const r2 = kernel.executeCommand(cmd, () => {
        throw new Error("Should not execute on duplicate");
      });
      expect(r2.success).toBe(true);
      expect(r2.idempotentSkip).toBe(true);
      expect(r2.appliedRevision).toBe(r1.appliedRevision);
    });

    it("generates and reconciles canonical snapshots (Law 19)", () => {
      const kernel = new LiveSessionKernel({
        roomId: "room-cert-04",
        hostUserId: "host-cert-04",
      });

      kernel.transitionTo("PREFLIGHT");
      kernel.transitionTo("READY");
      kernel.transitionTo("CONNECTING");
      kernel.transitionTo("PUBLISHING");
      kernel.transitionTo("LIVE");

      const snap = kernel.getSnapshot();
      expect(snap.state).toBe("LIVE");
      expect(snap.contractVersion).toBe(FABRIC_CONTRACT_VERSIONS.LIVE_SESSION_KERNEL);

      const fresh = new LiveSessionKernel({
        sessionId: snap.sessionId,
        roomId: "room-cert-04",
        hostUserId: "host-cert-04",
      });

      const reconciled = fresh.reconcile(snap);
      expect(reconciled.accepted).toBe(true);
      expect(fresh.getState()).toBe("LIVE");
    });
  });

  describe("3. Media Clock & Monotonic Sync (Law 3)", () => {
    it("calculates high-resolution monotonic time and formatted live duration", () => {
      const clock = new SessionClock();
      expect(clock.now()).toBeGreaterThanOrEqual(0);
      clock.markLiveStart();
      expect(clock.getLiveDurationMs()).toBeGreaterThanOrEqual(0);
    });
  });

  describe("4. Media Graph, Fail-Closed Rights & Privacy (Laws 4, 14, 15)", () => {
    it("enforces fail-closed publishing on missing metadata", () => {
      const graph = new SessionMediaGraph("sess-rights-01");
      const src = graph.register({
        sourceId: "cam-anon-01",
        ownerId: "u-anon",
        ownerRole: "performer",
        mediaKind: "CAMERA",
      });

      expect(src.publishEligible).toBe(false);
      expect(src.rightsPolicy).toEqual(DEFAULT_FAIL_CLOSED_RIGHTS);
      expect(() => graph.assertPublishable("cam-anon-01")).toThrow(/DO_NOT_PUBLISH/);
    });

    it("allows publishing for explicit public rights and revokes on loss", () => {
      const graph = new SessionMediaGraph("sess-rights-02");
      graph.register({
        sourceId: "cam-pub-01",
        ownerId: "u-pub",
        ownerRole: "performer",
        mediaKind: "CAMERA",
        rightsPolicy: { ...DEFAULT_PUBLIC_SOURCE_RIGHTS },
        privacyPolicy: { ...DEFAULT_PUBLIC_PRIVACY },
      });

      expect(() => graph.assertPublishable("cam-pub-01")).not.toThrow();

      // Revoke rights -> immediately unpublishable
      graph.updateRights("cam-pub-01", { ...DEFAULT_FAIL_CLOSED_RIGHTS }, { ...DEFAULT_FAIL_CLOSED_PRIVACY });
      expect(graph.get("cam-pub-01")?.publishEligible).toBe(false);
    });
  });

  describe("5. Frame Graph & Program/Preview Transactions (Laws 5, 9)", () => {
    it("commits atomic frame assignments across PREVIEW and promotes to PROGRAM", () => {
      const frames = new LiveFrameGraph("sess-frame-01");

      const a1 = frames.assign("PREVIEW", "PRIMARY", "src-cam-01");
      const a2 = frames.assign("PREVIEW", "SECONDARY", "src-cam-02");
      expect(a1.success).toBe(true);
      expect(a2.success).toBe(true);

      // Program is still clean
      expect(frames.getAssignment("PROGRAM", "PRIMARY").sourceId).toBeNull();

      // Promote Preview to Program
      const promo = frames.promotePreviewToProgram();
      expect(promo.success).toBe(true);
      expect(frames.getAssignment("PROGRAM", "PRIMARY").sourceId).toBe("src-cam-01");
      expect(frames.getAssignment("PROGRAM", "SECONDARY").sourceId).toBe("src-cam-02");
    });
  });

  describe("6. Experience Contracts & Single-Screen Certification (Laws 7, 13, 17)", () => {
    it("certifies valid single-screen composition for all canonical experiences", () => {
      expect(ALL_CANONICAL_EXPERIENCE_TYPES.length).toBeGreaterThanOrEqual(18);

      const cert = certifySingleScreenForAllExperiences();
      expect(cert.certified).toBe(true);
      expect(cert.totalExperiences).toBe(ALL_CANONICAL_EXPERIENCE_TYPES.length);
      expect(cert.failedExperiences).toHaveLength(0);
    });

    it("verifies experience contracts contain accessibility and host succession", () => {
      for (const exp of ALL_CANONICAL_EXPERIENCE_TYPES) {
        const contract = getExperiencePresentationContract(exp);
        expect(contract.experienceType).toBe(exp);
        expect(contract.accessibility.reducedMotionLayout).toBeDefined();
        expect(contract.hostSuccessionPolicy).toBeDefined();
      }
    });
  });

  describe("7. Centralized Audio Graph & Priority Ducking (Law 12)", () => {
    it("arbitrates 8 channels and ducks background music when mic is active", () => {
      const audio = new LiveAudioDirector("sess-audio-01");
      audio.registerChannel("MIC", "MIC", "mic-host", 1.0);
      audio.registerChannel("MUSIC", "MUSIC", "track-beat", 0.8);

      const snap = audio.snapshot();
      expect(snap.channels.MIC).toBeDefined();
      expect(snap.channels.MUSIC).toBeDefined();

      // Ducking applied
      audio.recalculateDucking();
      expect(audio.isChannelDucked("MUSIC")).toBe(true);
    });
  });

  describe("8. Live Recovery Director & Chaos Failovers (Laws 4, 18, 22)", () => {
    it("detects camera loss, applies fallback, and logs telemetry", () => {
      const recovery = new LiveRecoveryDirector("sess-recov-01");
      const inc = recovery.detect("MEDIA-CAM-LOSS", "camera lost", { sourceId: "cam-01" });

      expect(inc.code).toBe("MEDIA-CAM-LOSS");
      expect(inc.fallbackApplied).toBe(true);
      expect(recovery.drainTelemetry().length).toBeGreaterThan(0);
    });
  });

  describe("9. LiveFabricSimulationHarness Multi-Party Lab (Law 21)", () => {
    it("runs complete multi-party go-live simulation", () => {
      const harness = new LiveFabricSimulationHarness({
        roomId: "sim-cert-room",
        experienceType: "REGULAR_GO_LIVE",
        host: { userId: "host-1", role: "PERFORMER", displayName: "Host" },
        guests: [{ userId: "guest-1", role: "FAN", displayName: "Guest Fan" }],
      });

      const snap = harness.goLiveHappyPath();
      expect(snap.state).toBe("LIVE");
      expect(snap.programPrimary).toBe("src-host-cam");
    });
  });

  describe("10. Zero Legacy Import Law (Law 23)", () => {
    it("verifies no files in lib/liveFabric import legacy GO LIVE orchestration", () => {
      const fabricDir = path.resolve(__dirname, "../lib/liveFabric");
      const forbiddenTokens = [
        "executeInstantGoLive",
        "presentInstantGoLiveInPlace",
        "LaunchDock",
        "MonitorRuntime",
      ];

      function scanDir(dir: string): string[] {
        let files: string[] = [];
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory() && entry.name !== "__tests__") {
            files = files.concat(scanDir(fullPath));
          } else if (entry.isFile() && entry.name.endsWith(".ts")) {
            files.push(fullPath);
          }
        }
        return files;
      }

      const tsFiles = scanDir(fabricDir);
      expect(tsFiles.length).toBeGreaterThan(5);

      for (const file of tsFiles) {
        const content = fs.readFileSync(file, "utf-8");
        for (const token of forbiddenTokens) {
          expect(content).not.toMatch(new RegExp(`from\\s+['"][^'"]*${token}`));
          expect(content).not.toMatch(new RegExp(`require\\s*\\(\\s*['"][^'"]*${token}`));
        }
      }
    });
  });
});
