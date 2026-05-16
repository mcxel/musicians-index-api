import type { CanonShellRegion } from "./ShellRegionMap";

export type CanonMountMap = Record<CanonShellRegion, string[]>;

export const FAN_CANON_MOUNT_MAP: CanonMountMap = {
  HEADER_ZONE: ["fan.header"],
  STAGE_ZONE: ["fan.liveMonitor", "fan.fullscreenVenue"],
  REACTION_ZONE: ["fan.reactionBar"],
  TIP_ZONE: ["fan.pointsPanel"],
  PLAYLIST_ZONE: ["fan.avatarPresence", "fan.readAndEarn"],
  BOT_STRIP_ZONE: ["fan.inviteLobby", "fan.lobbyPopup"],
  RIGHT_TOWER_ZONE: ["fan.shopRail"],
  BOTTOM_ACTION_ZONE: ["fan.bottomRail", "fan.actionDock"],
  ENGINE_LOG_ZONE: ["fan.engineLog"],
};
