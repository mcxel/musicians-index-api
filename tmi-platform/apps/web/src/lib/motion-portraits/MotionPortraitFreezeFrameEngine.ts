import { clampPortraitDuration, type MotionPortraitResolution } from "./MotionPortraitEngine";

export interface FreezeFrameInstruction {
  freezeAfterMs: number;
  posterFrameUrl: string;
  replayOn: Array<"hover" | "tap" | "focus" | "revisit">;
  pauseOffscreen: boolean;
}

export function getFreezeAfterMs(durationMs = 4000): number {
  const clamped = clampPortraitDuration(durationMs);
  return Math.max(2500, clamped - 180);
}

export function buildFreezeFrameInstruction(
  resolution: MotionPortraitResolution,
): FreezeFrameInstruction {
  return {
    freezeAfterMs: getFreezeAfterMs(resolution.durationMs),
    posterFrameUrl: resolution.posterFrameUrl,
    replayOn: ["hover", "tap", "focus", "revisit"],
    pauseOffscreen: true,
  };
}