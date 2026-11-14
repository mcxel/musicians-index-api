import {
  framesToLobbyMonitorSlots,
  resolveLobbyWallWatchTarget,
} from "./lobbyWallMediaRouter";
import type { FrameId, FrameState } from "@/lib/media/canonicalMediaPlayerRuntime";

function emptyFrames(): Record<FrameId, FrameState> {
  const ids = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;
  const out = {} as Record<FrameId, FrameState>;
  for (const id of ids) {
    out[id] = {
      id,
      source: null,
      parked: false,
      label: id,
      fit: "cover",
      focused: false,
    };
  }
  return out;
}

describe("lobbyWallMediaRouter", () => {
  it("routes Lobby Wall watch to Media Player 1 when free", () => {
    const slots = framesToLobbyMonitorSlots(emptyFrames());
    const decision = resolveLobbyWallWatchTarget(slots);
    expect(decision.success).toBe(true);
    expect(decision.frameId).toBe("a");
    expect(decision.requiresUserChoice).toBe(false);
  });

  it("replaces ordinary watch on Player 1 without user choice", () => {
    const frames = emptyFrames();
    frames.a.source = "AUDIENCE_VIEW";
    const slots = framesToLobbyMonitorSlots(frames, {
      roomOverrides: { a: "room-show-1" },
    });
    const decision = resolveLobbyWallWatchTarget(slots);
    expect(decision.success).toBe(true);
    expect(decision.frameId).toBe("a");
    expect(decision.previousContentPreserved).toBe(false);
  });

  it("preserves Player 1 video chat and routes to next free player", () => {
    const frames = emptyFrames();
    frames.a.source = "SELF_CAMERA";
    const slots = framesToLobbyMonitorSlots(frames, {
      protectedFrameIds: ["a"],
    });
    const decision = resolveLobbyWallWatchTarget(slots);
    expect(decision.success).toBe(true);
    expect(decision.frameId).toBe("b");
    expect(decision.previousContentPreserved).toBe(true);
  });

  it("requires choice when all canonical players carry protected calls", () => {
    const frames = emptyFrames();
    for (const id of ["a", "b", "c", "d", "e", "f", "g", "h"] as const) {
      frames[id].source = "SELF_CAMERA";
    }
    const slots = framesToLobbyMonitorSlots(frames, {
      protectedFrameIds: ["a", "b", "c", "d", "e", "f", "g", "h"],
    });
    const decision = resolveLobbyWallWatchTarget(slots);
    expect(decision.success).toBe(false);
    expect(decision.requiresUserChoice).toBe(true);
  });
});
