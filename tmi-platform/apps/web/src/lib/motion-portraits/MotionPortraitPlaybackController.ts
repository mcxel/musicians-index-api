import {
  type MotionPortraitResolution,
} from "./MotionPortraitEngine";
import { buildFreezeFrameInstruction } from "./MotionPortraitFreezeFrameEngine";

export type MotionPortraitSurface =
  | "home-orbit"
  | "magazine-portrait"
  | "profile-portrait"
  | "battle-card"
  | "cypher-card"
  | "billboard";

export interface MotionPortraitPlaybackRequest {
  surface: MotionPortraitSurface;
  isVisible: boolean;
  reducedMotion?: boolean;
  liveFeedActive?: boolean;
}

export interface MotionPortraitPlaybackPlan {
  mode: "live" | "continuous" | "timed-freeze" | "static";
  autoplay: boolean;
  freezeAfterMs?: number;
  replayOn: Array<"hover" | "tap" | "focus" | "revisit">;
  pauseOffscreen: boolean;
}

export function resolveMotionPortraitPlayback(
  resolution: MotionPortraitResolution,
  request: MotionPortraitPlaybackRequest,
): MotionPortraitPlaybackPlan {
  if (!request.isVisible || request.reducedMotion || !resolution.canRender) {
    return {
      mode: "static",
      autoplay: false,
      replayOn: ["hover", "tap", "focus", "revisit"],
      pauseOffscreen: true,
    };
  }

  if (request.liveFeedActive || resolution.sourceKind === "live-feed") {
    return {
      mode: "live",
      autoplay: true,
      replayOn: ["revisit"],
      pauseOffscreen: true,
    };
  }

  if (request.surface === "home-orbit") {
    return {
      mode: "continuous",
      autoplay: true,
      replayOn: ["hover", "focus", "revisit"],
      pauseOffscreen: true,
    };
  }

  const freeze = buildFreezeFrameInstruction(resolution);
  return {
    mode: "timed-freeze",
    autoplay: true,
    freezeAfterMs: freeze.freezeAfterMs,
    replayOn: freeze.replayOn,
    pauseOffscreen: freeze.pauseOffscreen,
  };
}