/**
 * Simulation + chaos certification for Live Media Fabric foundation
 */

import { LiveFabricSimulationHarness } from "../LiveFabricSimulationHarness";
import { LiveSessionKernel } from "../LiveSessionKernel";
import { AdaptivePresentationDirector } from "../AdaptivePresentationDirector";
import { LiveRecoveryDirector } from "../LiveRecoveryDirector";
import { getExperiencePresentationContract } from "../ExperiencePresentationContract";
import {
  DEFAULT_FAIL_CLOSED_RIGHTS,
  DEFAULT_FAIL_CLOSED_PRIVACY,
} from "../contracts/MediaSourceContracts";
import { LiveCapabilityPolicy } from "../LiveCapabilityPolicy";
import * as fs from "node:fs";
import * as path from "node:path";

describe("LiveFabricSimulationHarness", () => {
  test("multi-participant go-live happy path", () => {
    const h = new LiveFabricSimulationHarness({
      roomId: "sim-room",
      experienceType: "REGULAR_GO_LIVE",
      host: { userId: "host", role: "PERFORMER", displayName: "Host" },
      guests: [
        { userId: "fan1", role: "FAN", displayName: "Fan One" },
        { userId: "fan2", role: "FAN", displayName: "Fan Two" },
      ],
    });
    const snap = h.goLiveHappyPath();
    expect(snap.state).toBe("LIVE");
    expect(snap.programPrimary).toBe("src-host-cam");
    expect(snap.sourceCount).toBe(1);
    expect(h.kernel.getSnapshot().participants.length).toBeGreaterThanOrEqual(3);
  });

  test("battle experience default split path", () => {
    const h = new LiveFabricSimulationHarness({
      roomId: "battle-room",
      experienceType: "BATTLE",
      host: { userId: "a", role: "PERFORMER", displayName: "A" },
      guests: [{ userId: "b", role: "PERFORMER", displayName: "B" }],
    });
    h.goLiveHappyPath();
    expect(h.composer.getLayout()).toBe("SPLIT");
  });
});

describe("Chaos certification", () => {
  test("camera loss → recovery demote", () => {
    const h = new LiveFabricSimulationHarness({
      roomId: "chaos-cam",
      experienceType: "REGULAR_GO_LIVE",
      host: { userId: "h", role: "PERFORMER", displayName: "H" },
    });
    h.goLiveHappyPath();
    h.media.updateHealth("src-host-cam", "FAILED");
    const inc = h.recovery.detect("MEDIA-CAM-LOSS", "camera gone", {
      sourceId: "src-host-cam",
      mediaClockMs: h.kernel.getClock().now(),
    });
    expect(inc.code).toBe("MEDIA-CAM-LOSS");
    expect(inc.fallbackApplied).toBeTruthy();
    const tel = h.recovery.drainTelemetry();
    expect(tel.length).toBeGreaterThan(0);
  });

  test("Voltron mid-network drop falls back + NET-DROP", () => {
    const h = new LiveFabricSimulationHarness({
      roomId: "chaos-voltron",
      experienceType: "BATTLE",
      host: { userId: "h", role: "PERFORMER", displayName: "H" },
      deviceTier: "HIGH",
    });
    h.goLiveHappyPath();
    const experience = getExperiencePresentationContract("BATTLE");
    const director = new AdaptivePresentationDirector(
      h.kernel.getSessionId(),
      h.kernel.getGeneration(),
      h.composer,
      h.frames,
      experience
    );
    const plan = director.buildPlan({
      toLayout: "VOLTRON",
      frameAssignments: { PRIMARY: "src-host-cam", OPPONENT: "src-host-cam" },
      reason: "chaos-voltron",
      mediaClockMs: h.kernel.getClock().now(),
      reducedMotion: false,
      targetBus: "PREVIEW",
      takeAfterCommit: true,
    });
    // Fix expected revisions for composer after goLive
    plan.expectedRevision = h.composer.getRevision();
    const composed = h.composer.executePlan(plan);
    expect(composed.success).toBe(true);

    h.recovery.detect("NET-DROP", "network drop during voltron", {
      mediaClockMs: h.kernel.getClock().now(),
    });
    const reduced = h.composer.executePlan(
      {
        ...director.buildPlan({
          toLayout: "VOLTRON",
          frameAssignments: { PRIMARY: "src-host-cam" },
          reason: "reduced-motion-fallback",
          mediaClockMs: h.kernel.getClock().now(),
          reducedMotion: true,
          targetBus: "PROGRAM",
        }),
        expectedRevision: h.composer.getRevision(),
      },
      { reducedMotion: true }
    );
    expect(reduced.success).toBe(true);
    expect(reduced.usedFallback || reduced.appliedLayout !== "VOLTRON").toBe(true);
  });

  test("duplicate END is idempotent at kernel layer", () => {
    const k = new LiveSessionKernel({ roomId: "e", hostUserId: "h" });
    k.transitionTo("CONNECTING");
    k.transitionTo("LIVE");
    k.transitionTo("ENDING");
    k.transitionTo("ENDED");
    k.transitionTo("ENDED");
    expect(k.getState()).toBe("ENDED");
  });

  test("CAST lost recovery", () => {
    const r = new LiveRecoveryDirector("s", 1);
    const i = r.detect("CAST-LOST", "cast session ended");
    expect(i.code).toBe("CAST-LOST");
    expect(i.fallbackApplied).toBe(true);
    expect(["RETRY", "DROP_CAST"]).toContain(i.fallbackAction);
  });

  test("rights loss demotes source", () => {
    const h = new LiveFabricSimulationHarness({
      roomId: "rights",
      experienceType: "REGULAR_GO_LIVE",
      host: { userId: "h", role: "PERFORMER", displayName: "H" },
    });
    h.goLiveHappyPath();
    h.media.updateRights(
      "src-host-cam",
      { ...DEFAULT_FAIL_CLOSED_RIGHTS },
      { ...DEFAULT_FAIL_CLOSED_PRIVACY }
    );
    expect(h.media.get("src-host-cam")!.publishEligible).toBe(false);
    h.recovery.detect("DISC-RIGHTS-LOSS", "rights revoked", { sourceId: "src-host-cam" });
    expect(h.recovery.listIncidents().some((i) => i.code === "DISC-RIGHTS-LOSS")).toBe(true);
  });

  test("host rotation / succession GRACE_PERIOD → RECONNECTING", () => {
    const k = new LiveSessionKernel({
      roomId: "succ",
      hostUserId: "h",
      hostSuccessionPolicy: "GRACE_PERIOD",
    });
    k.transitionTo("CONNECTING");
    k.transitionTo("LIVE");
    k.disconnectParticipant("h", "TEMPORARILY_DISCONNECTED");
    expect(k.getState()).toBe("RECONNECTING");
  });

  test("memory budget backpressure parks non-primary", () => {
    const h = new LiveFabricSimulationHarness({
      roomId: "mem",
      experienceType: "REGULAR_GO_LIVE",
      host: { userId: "h", role: "PERFORMER", displayName: "H" },
      deviceTier: "LOW",
    });
    const decision = h.device.getBudget().evaluate({
      cpuPct: 20,
      gpuPct: 20,
      memoryMb: 99999,
      bandwidthUpKbps: 100,
      bandwidthDownKbps: 100,
      decodeSlots: 1,
      encodeSlots: 1,
      concurrentSources: 2,
    });
    expect(decision.action).toBe("PARK_NON_PRIMARY");
  });

  test("Fan capability cannot host battle during sim", () => {
    expect(() => LiveCapabilityPolicy.assert("FAN", "canHostBattle")).toThrow();
  });
});

describe("Isolation guard — zero legacy imports from liveFabric", () => {
  test("no forbidden import strings in liveFabric sources", () => {
    const root = path.resolve(__dirname, "..");
    const forbidden = [
      "executeInstantGoLive",
      "presentInstantGoLiveInPlace",
      "LaunchDock",
      "MonitorRuntime",
      "GlobalLiveSessionRegistry",
    ];
    const hits: string[] = [];

    function walk(dir: string) {
      for (const name of fs.readdirSync(dir)) {
        const full = path.join(dir, name);
        const st = fs.statSync(full);
        if (st.isDirectory()) {
          if (name === "__tests__" || name === "node_modules") continue;
          walk(full);
          continue;
        }
        if (!/\.(ts|tsx)$/.test(name)) continue;
        const text = fs.readFileSync(full, "utf8");
        for (const f of forbidden) {
          // Allow mentioning in comments that we do NOT import them is OK if not an import path
          const importHit =
            new RegExp(`from ['\"][^'\"]*${f}['\"]`).test(text) ||
            new RegExp(`require\\(['\"][^'\"]*${f}['\"]\\)`).test(text);
          if (importHit) hits.push(`${full} → ${f}`);
        }
      }
    }

    walk(root);
    expect(hits).toEqual([]);
  });
});
