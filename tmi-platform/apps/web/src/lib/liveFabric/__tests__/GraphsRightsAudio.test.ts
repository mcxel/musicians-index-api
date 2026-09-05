/**
 * Media graph, frames, rights, audio, experience single-screen
 */

import { SessionMediaGraph } from "../SessionMediaGraph";
import { LiveFrameGraph } from "../LiveFrameGraph";
import { LiveAudioDirector } from "../LiveAudioDirector";
import { DistributionDirector } from "../DistributionDirector";
import {
  certifySingleScreenForAllExperiences,
  listExperiencePresentationContracts,
  ALL_CANONICAL_EXPERIENCE_TYPES,
} from "../ExperiencePresentationContract";
import {
  DEFAULT_FAIL_CLOSED_RIGHTS,
  DEFAULT_FAIL_CLOSED_PRIVACY,
  DEFAULT_PUBLIC_SOURCE_RIGHTS,
  DEFAULT_PUBLIC_PRIVACY,
} from "../contracts/MediaSourceContracts";
import { LiveCapabilityPolicy } from "../LiveCapabilityPolicy";
import { LiveTransportRouter } from "../LiveTransportRouter";
import { MediaBudget, DeviceCapabilityDirector } from "../DeviceCapabilityDirector";
import { isObservatoryCommandAuthorized } from "../contracts/ObservatoryContracts";
import { FABRIC_CONTRACT_VERSIONS, FOUNDATION_REQUIRED_VERSIONS } from "../contracts/ContractVersions";

describe("SessionMediaGraph + rights fail-closed", () => {
  test("unknown rights are not publishable", () => {
    const g = new SessionMediaGraph("s1");
    const s = g.register({
      sourceId: "cam1",
      ownerId: "u1",
      ownerRole: "performer",
      mediaKind: "CAMERA",
    });
    expect(s.publishEligible).toBe(false);
    expect(s.rightsPolicy).toEqual(DEFAULT_FAIL_CLOSED_RIGHTS);
    expect(() => g.assertPublishable("cam1")).toThrow(/DO_NOT_PUBLISH/);
  });

  test("explicit public rights can publish", () => {
    const g = new SessionMediaGraph("s1");
    g.register({
      sourceId: "cam2",
      ownerId: "u1",
      ownerRole: "performer",
      mediaKind: "CAMERA",
      rightsPolicy: { ...DEFAULT_PUBLIC_SOURCE_RIGHTS },
      privacyPolicy: { ...DEFAULT_PUBLIC_PRIVACY },
    });
    expect(() => g.assertPublishable("cam2")).not.toThrow();
  });

  test("health transitions enforce SM", () => {
    const g = new SessionMediaGraph("s1");
    g.register({
      sourceId: "cam3",
      ownerId: "u1",
      ownerRole: "performer",
      mediaKind: "CAMERA",
      rightsPolicy: { ...DEFAULT_PUBLIC_SOURCE_RIGHTS },
      privacyPolicy: { ...DEFAULT_PUBLIC_PRIVACY },
    });
    g.updateHealth("cam3", "HEALTHY");
    expect(() => g.updateHealth("cam3", "CONNECTING")).toThrow(/Illegal health/);
  });

  test("rights loss revokes publish", () => {
    const g = new SessionMediaGraph("s1");
    g.register({
      sourceId: "cam4",
      ownerId: "u1",
      ownerRole: "performer",
      mediaKind: "MIC",
      rightsPolicy: { ...DEFAULT_PUBLIC_SOURCE_RIGHTS },
      privacyPolicy: { ...DEFAULT_PUBLIC_PRIVACY },
    });
    g.updateRights("cam4", { ...DEFAULT_FAIL_CLOSED_RIGHTS }, { ...DEFAULT_FAIL_CLOSED_PRIVACY });
    expect(g.get("cam4")!.publishEligible).toBe(false);
  });
});

describe("LiveFrameGraph atomic transactions + PROGRAM/PREVIEW", () => {
  test("assign swap park promote without restart semantics", () => {
    const f = new LiveFrameGraph("s1");
    const a = f.assign("PREVIEW", "PRIMARY", "src-a");
    expect(a.success).toBe(true);
    f.assign("PREVIEW", "SECONDARY", "src-b");
    const swap = f.swap("PREVIEW", "PRIMARY", "SECONDARY");
    expect(swap.success).toBe(true);
    expect(f.getAssignment("PREVIEW", "PRIMARY").sourceId).toBe("src-b");
    f.park("PREVIEW", "SECONDARY");
    expect(f.getAssignment("PREVIEW", "SECONDARY").parked).toBe(true);
    f.promotePreviewToProgram();
    expect(f.getAssignment("PROGRAM", "PRIMARY").sourceId).toBe("src-b");
  });

  test("revision mismatch fails atomically", () => {
    const f = new LiveFrameGraph("s1");
    const r = f.commitTransaction({
      transactionId: "t1",
      sessionId: "s1",
      generation: 1,
      expectedRevision: 99,
      targetBus: "PROGRAM",
      assignments: [{ slot: "PRIMARY", sourceId: "x" }],
      timestampMs: Date.now(),
    });
    expect(r.success).toBe(false);
    expect(r.error).toBe("REVISION_MISMATCH");
    expect(f.getAssignment("PROGRAM", "PRIMARY").sourceId).toBeNull();
  });
});

describe("LiveAudioDirector visible ≠ audible", () => {
  test("focus transaction is separate from visibility", () => {
    const a = new LiveAudioDirector("s1");
    a.ensureChannel("c1", "MIC", "src-vis");
    const r = a.commitFocus({
      transactionId: "af1",
      sessionId: "s1",
      generation: 1,
      expectedRevision: 0,
      primaryOwnerSourceId: null,
      duckTargets: [],
      duckLevelDb: -12,
      programAudibleSourceIds: [],
      monitorAudibleSourceIds: ["src-vis"],
      issuedAtMs: Date.now(),
    });
    expect(r.success).toBe(true);
    expect(a.isAudibleOnProgram("src-vis")).toBe(false);
  });
});

describe("Experience single-screen guarantee", () => {
  test("all experience types registered", () => {
    expect(ALL_CANONICAL_EXPERIENCE_TYPES.length).toBeGreaterThanOrEqual(22);
    expect(listExperiencePresentationContracts()).toHaveLength(ALL_CANONICAL_EXPERIENCE_TYPES.length);
  });

  test("every experience has valid one-display composition", () => {
    const cert = certifySingleScreenForAllExperiences();
    expect(cert.failures).toEqual([]);
    expect(cert.ok).toBe(true);
  });
});

describe("Capability / transport / budget / observatory contracts", () => {
  test("Fan cannot go live performer; Performer cannot own avatar", () => {
    expect(LiveCapabilityPolicy.forRole("FAN").canGoLivePerformer).toBe(false);
    expect(LiveCapabilityPolicy.forRole("FAN").canOwnAvatar).toBe(true);
    expect(LiveCapabilityPolicy.forRole("PERFORMER").canOwnAvatar).toBe(false);
    expect(() => LiveCapabilityPolicy.assert("FAN", "canHostBattle")).toThrow(/CAPABILITY_DENIED/);
  });

  test("transport never invents localhost endpoint", () => {
    const router = new LiveTransportRouter();
    const d = router.route("WEBRTC", "s", "r");
    expect(d.allowed).toBe(false);
    expect(d.reason).toBe("ENDPOINT_UNCONFIGURED");
  });

  test("MediaBudget backpressure on memory", () => {
    const b = new MediaBudget();
    const d = b.evaluate({
      cpuPct: 10,
      gpuPct: 10,
      memoryMb: 5000,
      bandwidthUpKbps: 100,
      bandwidthDownKbps: 100,
      decodeSlots: 1,
      encodeSlots: 1,
      concurrentSources: 1,
    });
    expect(d.action).toBe("PARK_NON_PRIMARY");
  });

  test("DeviceCapabilityDirector scales budget for LOW", () => {
    const d = new DeviceCapabilityDirector({ gpuTier: "LOW" });
    expect(d.getBudget().getLimits().maxVoltronParticipants).toBe(0);
  });

  test("Observatory command authority gate", () => {
    const bad = isObservatoryCommandAuthorized({
      commandId: "o1",
      sessionId: "s",
      generation: 1,
      expectedRevision: 0,
      issuedAtMs: Date.now(),
      type: "TAKE",
      payload: {},
      authority: {
        authorized: true,
        audited: true,
        sessionBound: true,
        revisionChecked: false,
        operatorId: "op",
        authorityScope: "EXECUTE",
        auditTrailId: "a1",
      },
    });
    expect(bad.ok).toBe(false);
  });

  test("foundation contract versions present", () => {
    for (const v of FOUNDATION_REQUIRED_VERSIONS) {
      expect(Object.values(FABRIC_CONTRACT_VERSIONS)).toContain(v);
    }
  });
});

describe("DistributionDirector composite rights + recording", () => {
  test("composite intersection never widens", () => {
    const d = new DistributionDirector("s1");
    const out = d.deriveCompositeRights("out1", [
      {
        sourceId: "a",
        rights: { ...DEFAULT_PUBLIC_SOURCE_RIGHTS, commercialAllowed: true },
        privacy: { ...DEFAULT_PUBLIC_PRIVACY },
      },
      {
        sourceId: "b",
        rights: { ...DEFAULT_PUBLIC_SOURCE_RIGHTS, commercialAllowed: false },
        privacy: { ...DEFAULT_PUBLIC_PRIVACY },
      },
    ]);
    expect(out.effective.commercialAllowed).toBe(false);
    expect(out.publishEligible).toBe(true);
  });

  test("PROGRAM vs ISO recording metadata", () => {
    const d = new DistributionDirector("s1");
    const tracks = d.startRecording(
      {
        planId: "rp1",
        sessionId: "s1",
        generation: 1,
        programEnabled: true,
        isoSourceIds: ["cam1"],
        retentionDays: 7,
        replayAllowed: true,
      },
      1000,
      "FLAT",
      "rights-snap-1"
    );
    expect(tracks.some((t) => t.kind === "PROGRAM")).toBe(true);
    expect(tracks.some((t) => t.kind === "ISO" && t.sourceId === "cam1")).toBe(true);
  });

  test("fail-closed evaluate unknown rights", () => {
    const d = new DistributionDirector("s1");
    const r = d.evaluateSourceRights(
      { ...DEFAULT_FAIL_CLOSED_RIGHTS },
      { ...DEFAULT_FAIL_CLOSED_PRIVACY },
      { action: "PUBLISH" }
    );
    expect(r.decision).toBe("DENY");
    expect(r.failClosed).toBe(true);
  });
});
