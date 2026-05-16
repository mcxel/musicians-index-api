import type { RoomRuntimeState } from "./RoomChatEngine";
import type { BubblePlacement } from "./ChatBubblePlacementEngine";

export type ChatVisibilityPolicy = {
  maxVisibleBubbles: number;
  maxLongRangeBubbles: number;
  fadeInMs: number;
  fadeOutMs: number;
  longRangeScale: number;
};

const POLICY_BY_STATE: Record<RoomRuntimeState, ChatVisibilityPolicy> = {
  FREE_ROAM: {
    maxVisibleBubbles: 24,
    maxLongRangeBubbles: 10,
    fadeInMs: 140,
    fadeOutMs: 260,
    longRangeScale: 1,
  },
  PRE_SHOW: {
    maxVisibleBubbles: 20,
    maxLongRangeBubbles: 9,
    fadeInMs: 140,
    fadeOutMs: 260,
    longRangeScale: 1,
  },
  LIVE_SHOW: {
    maxVisibleBubbles: 14,
    maxLongRangeBubbles: 8,
    fadeInMs: 120,
    fadeOutMs: 220,
    longRangeScale: 0.95,
  },
  POST_SHOW: {
    maxVisibleBubbles: 18,
    maxLongRangeBubbles: 9,
    fadeInMs: 130,
    fadeOutMs: 240,
    longRangeScale: 1,
  },
};

export function getVisibilityPolicy(state: RoomRuntimeState): ChatVisibilityPolicy {
  return POLICY_BY_STATE[state];
}

export function selectVisibleBubbles(
  placements: BubblePlacement[],
  state: RoomRuntimeState,
  viewerDistance: "near" | "mid" | "far",
): BubblePlacement[] {
  const policy = getVisibilityPolicy(state);
  const sorted = [...placements].sort((a, b) => b.priority - a.priority);

  const maxByDistance = viewerDistance === "far"
    ? policy.maxLongRangeBubbles
    : viewerDistance === "mid"
      ? Math.floor((policy.maxVisibleBubbles + policy.maxLongRangeBubbles) / 2)
      : policy.maxVisibleBubbles;

  return sorted.slice(0, Math.max(1, maxByDistance));
}

export function shouldMirrorToPerformer(
  state: RoomRuntimeState,
  role: "audience" | "host" | "judge" | "sponsor" | "performer" | "system" | "moderator",
): boolean {
  if (state === "LIVE_SHOW") {
    return role === "audience" || role === "host" || role === "judge" || role === "sponsor";
  }
  return role !== "system";
}
