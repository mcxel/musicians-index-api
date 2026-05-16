import type { FanTransitionState } from "./FanTierSkinEngine";

const TRANSITION_ORDER: FanTransitionState[] = [
  "HUB_IDLE",
  "LOBBY_OPEN",
  "INVITE_ACCEPTED",
  "SEATED",
  "SHOW_START",
  "FULLSCREEN_MODE",
  "INTERMISSION",
  "RETURN_TO_HUB",
];

export function nextFanTransitionState(current: FanTransitionState): FanTransitionState {
  const currentIndex = TRANSITION_ORDER.indexOf(current);
  if (currentIndex < 0 || currentIndex === TRANSITION_ORDER.length - 1) {
    return "HUB_IDLE";
  }
  return TRANSITION_ORDER[currentIndex + 1];
}

export function canReturnToHub(current: FanTransitionState): boolean {
  return current !== "HUB_IDLE" && current !== "RETURN_TO_HUB";
}
