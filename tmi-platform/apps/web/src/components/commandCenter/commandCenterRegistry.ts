/**
 * Command Center panel registry — Fan vs Performer drawer payloads (Rule 26).
 * Same chrome/shell; different drawer content. Never mount Fan Lobby ownership
 * or Avatar Studio for PERFORMER.
 */

export type CommandCenterRole = "fan" | "performer";

export type CommandCenterPanelId =
  | "lobby"
  | "yopho"
  | "playlist"
  | "memory"
  | "inventory"
  | "media_locker"
  | "beat_lab"
  | "booking"
  | "stage_tools"
  | "store"
  | "sponsors";

export interface CommandCenterPanelDef {
  id: CommandCenterPanelId;
  label: string;
  info: string;
  accent: string;
  /** Primary = highlighted left-rail OPEN DRAWER section */
  primary?: boolean;
}

/** Marcel P0: Lobby / YoPho / Memory / Playlist all open the same under-monitor drawer. */
export const FAN_COMMAND_PANELS: CommandCenterPanelDef[] = [
  { id: "lobby", label: "AVATAR FAN LOBBY", info: "Cinema hangout", accent: "#FFD700", primary: true },
  { id: "yopho", label: "YOPHO", info: "Fan canvas", accent: "#FF2DAA", primary: true },
  { id: "playlist", label: "PLAYLISTS", info: "Your tracks", accent: "#AA2DFF", primary: true },
  { id: "memory", label: "MEMORY WALL", info: "Your moments", accent: "#AA2DFF", primary: true },
  { id: "inventory", label: "INVENTORY", info: "Wearables", accent: "#FF6B35" },
];

/** Quick-swap chips inside the open drawer (Fan Command Center). */
export const FAN_DRAWER_SWAP_PANELS: CommandCenterPanelId[] = ["lobby", "yopho", "playlist", "memory"];

/** Performer drawers — NO avatar lobby ownership / Avatar Studio (Rule 26). */
export const PERFORMER_COMMAND_PANELS: CommandCenterPanelDef[] = [
  { id: "media_locker", label: "MEDIA LOCKER", info: "Songs & video", accent: "#00FFFF", primary: true },
  { id: "yopho", label: "YOPHO", info: "Performer canvas", accent: "#FF2DAA", primary: true },
  { id: "beat_lab", label: "BEAT LAB", info: "Vault & beats", accent: "#FFD700" },
  { id: "booking", label: "BOOKINGS", info: "Requests", accent: "#00FF88" },
  { id: "stage_tools", label: "STAGE TOOLS", info: "Go Live / stage", accent: "#AA2DFF" },
  { id: "sponsors", label: "SPONSORS", info: "Placements", accent: "#FFD700" },
  { id: "playlist", label: "PLAYLISTS", info: "Setlist", accent: "#AA2DFF" },
  { id: "memory", label: "MEMORY WALL", info: "Moments", accent: "#AA2DFF" },
  { id: "store", label: "STORE", info: "Merch / skins", accent: "#FF6B35" },
];

export function panelsForRole(role: CommandCenterRole): CommandCenterPanelDef[] {
  return role === "performer" ? PERFORMER_COMMAND_PANELS : FAN_COMMAND_PANELS;
}

export function isFanOnlyPanel(id: CommandCenterPanelId): boolean {
  return id === "lobby" || id === "inventory";
}
