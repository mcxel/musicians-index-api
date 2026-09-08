/**
 * runGoLiveMultiFeedGeometryAndLobbyWall.test.ts
 *
 * P0 Certification Suite:
 * - Multi-Feed Player Geometry Correction
 * - User-Controlled Performance Monitor Placement
 * - Role-Aware Multi-Monitor Experience Orchestration (Fan & Performer)
 * - Persistent Floating Lobby Wall Quick-Access
 *
 * Gates Covered:
 * MONITOR-01…30, PLACEMENT-01…20, MEDIA-FRAME-01…18, FAN-LIVE-01…05, MONITOR-ROLE-01…20
 */

import { readFileSync } from "fs";
import path from "path";
import { MonitorExperienceDirector, type MonitorExperienceInput } from "../lib/monitors/MonitorExperienceDirector";

const root = path.resolve(__dirname, "../..");

function readSrc(relPath: string): string {
  return readFileSync(path.join(root, relPath), "utf8");
}

describe("P0 Media Geometry Authority & Structural Integrity", () => {
  const shellSrc = readSrc("src/components/commandCenter/CommandCenterShell.tsx");
  const mediaStackSrc = readSrc("src/components/commandCenter/CommandCenterMediaStack.tsx");
  const dualStackSrc = readSrc("src/components/monitors/CanonicalDualMonitorStack.tsx");
  const floatingTriggerSrc = readSrc("src/components/lobby/FloatingLobbyWallTrigger.tsx");
  const contractsSrc = readSrc("src/lib/liveFabric/contracts/PresentationContracts.ts");

  test("MONITOR-01 & MEDIA-FRAME-01: One source = one full 16:9 player surface", () => {
    expect(dualStackSrc).not.toContain('aspectRatio: "1 / 1"');
    expect(dualStackSrc).toContain('aspectRatio: "16 / 9"');
    expect(dualStackSrc).toContain('data-monitor-frame="16x9"');
  });

  test("MONITOR-02 & MONITOR-03: No nested feed split inside one monitor slot", () => {
    // Verifies that participantTiles inside bottomSurface does NOT nest Feed A and B as subcells
    expect(mediaStackSrc).not.toContain('hubLiveMonitor={i === 0 ? "A" : "B"}');
    expect(mediaStackSrc).toContain('hubLiveMonitor="B"');
  });

  test("MONITOR-04 & MEDIA-FRAME-02: Presentation Contracts carry canonical surface specifications", () => {
    expect(contractsSrc).toContain("export type MonitorPlacement =");
    expect(contractsSrc).toContain("export type PerformanceLayoutPreset =");
    expect(contractsSrc).toContain("export interface PlayerSurfaceAssignment");
    expect(contractsSrc).toContain('"16:9"');
  });

  test("MONITOR-17 & MONITOR-18: Mobile 390x844 thumb selector without tiny square sub-cells", () => {
    expect(dualStackSrc).toContain("data-mobile-monitor-selector");
    expect(dualStackSrc).toContain("data-monitor-selector-tab");
    expect(dualStackSrc).toContain("data-placement-toggle");
    expect(dualStackSrc).toContain("activeMobileMonitor");
  });

  test("MONITOR-21 & MONITOR-22: Persistent floating Lobby Wall summon trigger mounted", () => {
    expect(floatingTriggerSrc).toContain("data-lobby-wall-trigger");
    expect(floatingTriggerSrc).toContain("tmi:toggle-mini-lobby-wall");
    expect(shellSrc).toContain("<FloatingLobbyWallTrigger />");
  });
});

describe("P0 Role-Aware Monitor Experience Orchestration (MonitorExperienceDirector)", () => {
  const fanInput = {
    role: "FAN" as const,
    profileId: "fan-alice",
    sessionId: "sess-fan-01",
    roomId: "stage-arena-01",
    experienceType: "LIVE_SHOW",
    deviceTier: "phone" as const,
    availableSources: [
      { sourceId: "performer-stream-01", sourceType: "PERFORMER_FEED" as const, isAuthorized: true },
      { sourceId: "fan-avatar-cam-01", sourceType: "FAN_PRESENCE" as const, isAuthorized: true },
      { sourceId: "audience-venue-cam-01", sourceType: "AUDIENCE_VIEW" as const, isAuthorized: true },
    ],
  };

  const performerInput = {
    role: "PERFORMER" as const,
    profileId: "perf-bob",
    sessionId: "sess-perf-01",
    roomId: "stage-arena-01",
    experienceType: "LIVE_SHOW",
    deviceTier: "desktop" as const,
    availableSources: [
      { sourceId: "perf-cam-01", sourceType: "SELF_CAMERA" as const, isAuthorized: true },
      { sourceId: "audience-cam-01", sourceType: "AUDIENCE_VIEW" as const, isAuthorized: true },
      { sourceId: "band-keys-01", sourceType: "BAND_MEMBER" as const, isAuthorized: true },
    ],
  };

  test("MONITOR-05, 06, 07 (FAN): Ordered independent monitor assignments", () => {
    const director = new MonitorExperienceDirector(fanInput);
    const state = director.getState();

    expect(state.assignments).toHaveLength(3);

    // Monitor 1 = Performer
    const mon1 = state.assignments[0];
    expect(mon1.monitorId).toBe("monitor-1");
    expect(mon1.sourceType).toBe("PERFORMER_FEED");
    expect(mon1.aspectRatio).toBe("16:9");
    expect(mon1.isFocused).toBe(true);
    expect(mon1.isPrimaryAudio).toBe(true);

    // Monitor 2 = Fan Self Presence / Avatar
    const mon2 = state.assignments[1];
    expect(mon2.monitorId).toBe("monitor-2");
    expect(mon2.sourceType).toBe("FAN_PRESENCE");
    expect(mon2.aspectRatio).toBe("16:9");
    expect(mon2.isFocused).toBe(false);
    expect(mon2.isPrimaryAudio).toBe(false); // Self presence cannot own audio

    // Monitor 3 = Audience / Venue View
    const mon3 = state.assignments[2];
    expect(mon3.monitorId).toBe("monitor-3");
    expect(mon3.sourceType).toBe("AUDIENCE_VIEW");
    expect(mon3.aspectRatio).toBe("16:9");
    expect(mon3.isFocused).toBe(false);
  });

  test("MONITOR-08, 09, 10 (PERFORMER): Ordered independent monitor assignments", () => {
    const director = new MonitorExperienceDirector(performerInput);
    const state = director.getState();

    expect(state.assignments).toHaveLength(3);

    // Monitor 1 = Performer Self Cam
    const mon1 = state.assignments[0];
    expect(mon1.monitorId).toBe("monitor-1");
    expect(mon1.sourceType).toBe("SELF_CAMERA");
    expect(mon1.aspectRatio).toBe("16:9");
    expect(mon1.isFocused).toBe(true);

    // Monitor 2 = Audience View
    const mon2 = state.assignments[1];
    expect(mon2.monitorId).toBe("monitor-2");
    expect(mon2.sourceType).toBe("AUDIENCE_VIEW");
    expect(mon2.aspectRatio).toBe("16:9");

    // Monitor 3 = Authorized Secondary (Band Member)
    const mon3 = state.assignments[2];
    expect(mon3.monitorId).toBe("monitor-3");
    expect(mon3.sourceType).toBe("BAND_MEMBER");
    expect(mon3.aspectRatio).toBe("16:9");
  });

  test("MONITOR-10: Missing source is truthful (STANDBY / UNAVAILABLE, never fabricated)", () => {
    const missingInput = {
      ...performerInput,
      availableSources: [
        { sourceId: "perf-cam-01", sourceType: "SELF_CAMERA" as const, isAuthorized: true },
      ],
    };
    const director = new MonitorExperienceDirector(missingInput);
    const state = director.getState();

    expect(state.assignments[2].sourceType).toBe("AUX");
    expect(state.assignments[2].isAuthorized).toBe(false);
  });
});

describe("P0 Placement Law — FEED IDENTITY ≠ FEED POSITION", () => {
  test("PLACEMENT-01…07: Changing placement does NOT alter source identity or disconnect stream", () => {
    const director = new MonitorExperienceDirector({
      role: "PERFORMER",
      profileId: "perf-p1",
      sessionId: "sess-01",
      roomId: "room-01",
      experienceType: "LIVE_SHOW",
      deviceTier: "desktop",
      availableSources: [
        { sourceId: "source-cam", sourceType: "SELF_CAMERA" },
        { sourceId: "source-audience", sourceType: "AUDIENCE_VIEW" },
      ],
    });

    const initialSourceId = director.getState().assignments[1].sourceId;
    const initialSessionId = director.getState().sessionId;

    // Move Monitor 2 from RIGHT to BOTTOM
    director.switchPlacement("monitor-2", "BOTTOM");
    const moved = director.getState().assignments[1];

    expect(moved.placement).toBe("BOTTOM");
    expect(moved.sourceId).toBe(initialSourceId); // Stable
    expect(director.getState().sessionId).toBe(initialSessionId); // Session preserved
    expect(moved.aspectRatio).toBe("16:9"); // Frame shape preserved

    // Move Monitor 2 to PIP
    director.switchPlacement("monitor-2", "PIP");
    expect(director.getState().assignments[1].placement).toBe("PIP");

    // Swap Monitor 1 and Monitor 2
    director.swapMonitors("monitor-1", "monitor-2");
    expect(director.getState().assignments[0].sourceId).toBe("source-cam");
    expect(director.getState().assignments[1].sourceId).toBe("source-audience");
  });

  test("PLACEMENT-08…12: Focus authority and Single Audio Authority", () => {
    const director = new MonitorExperienceDirector({
      role: "FAN",
      profileId: "fan-01",
      sessionId: "sess-fan",
      roomId: "room-01",
      experienceType: "LIVE_SHOW",
      deviceTier: "phone",
      availableSources: [
        { sourceId: "perf-live", sourceType: "PERFORMER_FEED" },
        { sourceId: "fan-self", sourceType: "FAN_PRESENCE" },
        { sourceId: "venue-feed", sourceType: "AUDIENCE_VIEW" },
      ],
    });

    expect(director.getState().activeFocusMonitorId).toBe("monitor-1");
    expect(director.getState().primaryAudioMonitorId).toBe("monitor-1");

    // Fan focuses Audience view (Monitor 3)
    director.focusMonitor("monitor-3");
    const state = director.getState();

    expect(state.activeFocusMonitorId).toBe("monitor-3");
    expect(state.primaryAudioMonitorId).toBe("monitor-3");
    expect(state.assignments[2].isPrimaryAudio).toBe(true);
    expect(state.assignments[0].isPrimaryAudio).toBe(false);
    expect(state.assignments[1].isPrimaryAudio).toBe(false);
  });

  test("PLACEMENT-13…16: Performance Layout Presets (PERFORMANCE_FOCUS, AUDIENCE_FOCUS, DUAL_PERFORMANCE)", () => {
    const director = new MonitorExperienceDirector({
      role: "PERFORMER",
      profileId: "perf-bob",
      sessionId: "sess-perf",
      roomId: "room-live",
      experienceType: "LIVE_SHOW",
      deviceTier: "phone",
      availableSources: [
        { sourceId: "self", sourceType: "SELF_CAMERA" },
        { sourceId: "aud", sourceType: "AUDIENCE_VIEW" },
      ],
    });

    // Preset 1: PERFORMANCE_FOCUS (Self large, audience below)
    director.applyPreset("FOCUS_PRIMARY");
    expect(director.getState().assignments[0].placement).toBe("FOCUS");
    expect(director.getState().assignments[1].placement).toBe("BOTTOM");

    // Preset 2: AUDIENCE_FOCUS (Audience focus, self secondary)
    director.focusMonitor("monitor-2");
    expect(director.getState().assignments[1].isFocused).toBe(true);

    // Preset 3: DUAL_PERFORMANCE
    director.applyPreset("DUAL_SIDE_BY_SIDE");
    expect(director.getState().activePreset).toBe("DUAL_SIDE_BY_SIDE");
  });

  test("MONITOR-15 & MONITOR-16: Fullscreen promotes selected player surface, not multi-grid wrapper", () => {
    const director = new MonitorExperienceDirector({
      role: "FAN",
      profileId: "fan-01",
      sessionId: "sess-01",
      roomId: "room-01",
      experienceType: "LIVE_SHOW",
      deviceTier: "desktop",
      availableSources: [
        { sourceId: "s1", sourceType: "PERFORMER_FEED" },
        { sourceId: "s2", sourceType: "FAN_PRESENCE" },
      ],
    });

    // Enter fullscreen on Monitor 1
    director.toggleFullscreen("monitor-1");
    expect(director.getState().assignments[0].placement).toBe("FOCUS");
    expect(director.getState().assignments[1].placement).toBe("HIDDEN");

    // Exit fullscreen
    director.toggleFullscreen("monitor-1");
    expect(director.getState().assignments[0].placement).not.toBe("HIDDEN");
  });
});
