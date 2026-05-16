export type ProfileShowState =
  | "HUB_IDLE"
  | "LOBBY_OPEN"
  | "INVITE_ACCEPTED"
  | "SEATED"
  | "SHOW_START"
  | "FULLSCREEN_MODE"
  | "INTERMISSION"
  | "RETURN_TO_HUB";

export function isCurtainPreShowState(state: ProfileShowState): boolean {
  return state === "LOBBY_OPEN" || state === "INVITE_ACCEPTED" || state === "SEATED";
}

export function showCountdownForState(state: ProfileShowState): boolean {
  return isCurtainPreShowState(state) || state === "SHOW_START";
}
