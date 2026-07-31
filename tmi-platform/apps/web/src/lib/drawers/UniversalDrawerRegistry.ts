/**
 * UniversalDrawerRegistry — one shell pattern, many module personalities.
 *
 * Blueprint: detachable side panels around a central player (future).
 * This pass: under-dashboard Command Center swap (Lobby / YoPho / Memory /
 * Playlist / Live Destinations / Analytics / Room Controls / Sponsor).
 *
 * Animation id is per drawer type — never a single shared slide for all.
 */

import type { DrawerAnimationId } from "./DrawerAnimationProfile";

export type UniversalDrawerModuleId =
  | "lobby"
  | "yopho"
  | "playlist"
  | "memory"
  | "inventory"
  | "live_destinations"
  | "room_controls"
  | "analytics"
  | "sponsors"
  | "media_locker"
  | "beat_lab"
  | "booking"
  | "stage_tools"
  | "store"
  | "appearance";

export type UniversalDrawerRole = "fan" | "performer" | "shared";

export interface UniversalDrawerModuleDef {
  id: UniversalDrawerModuleId;
  label: string;
  info: string;
  accent: string;
  animation: DrawerAnimationId;
  /** Who may open this module in Command Center (Rule 26). */
  roles: UniversalDrawerRole[];
  /** Primary = left-rail OPEN DRAWER section */
  primary?: boolean;
  /**
   * Media bind point for Phase B WebRTC head panels.
   * Consumers must read SocialRoomPresence / FanLobbyPresence — never invent presence from media.
   */
  mediaBindPoint?: "lobby_presence" | "none";
}

export const UNIVERSAL_DRAWER_MODULES: UniversalDrawerModuleDef[] = [
  {
    id: "lobby",
    label: "AVATAR FAN LOBBY",
    info: "Cinema hangout",
    accent: "#FFD700",
    animation: "orbit",
    roles: ["fan"],
    primary: true,
    mediaBindPoint: "lobby_presence",
  },
  {
    id: "yopho",
    label: "YOPHO",
    info: "Canvas",
    accent: "#FF2DAA",
    animation: "hologram",
    roles: ["fan", "performer"],
    primary: true,
    mediaBindPoint: "none",
  },
  {
    id: "playlist",
    label: "PLAYLISTS",
    info: "Your tracks",
    accent: "#AA2DFF",
    animation: "vinyl_flip",
    roles: ["fan", "performer"],
    primary: true,
    mediaBindPoint: "none",
  },
  {
    id: "memory",
    label: "MEMORY WALL",
    info: "Your moments",
    accent: "#AA2DFF",
    animation: "memory_scatter",
    roles: ["fan", "performer"],
    primary: true,
    mediaBindPoint: "none",
  },
  {
    id: "live_destinations",
    label: "LIVE DESTINATIONS",
    info: "What's live",
    accent: "#00FFFF",
    animation: "portal",
    roles: ["fan", "performer"],
    primary: true,
    mediaBindPoint: "none",
  },
  {
    id: "room_controls",
    label: "ROOM CONTROLS",
    info: "Skin · gather",
    accent: "#00FF88",
    animation: "mechanical",
    roles: ["fan"],
    mediaBindPoint: "lobby_presence",
  },
  {
    id: "analytics",
    label: "ANALYTICS",
    info: "Mission control",
    accent: "#FFD700",
    animation: "command_lift",
    roles: ["fan", "performer"],
    mediaBindPoint: "none",
  },
  {
    id: "sponsors",
    label: "SPONSORS",
    info: "Placements",
    accent: "#FFD700",
    animation: "fold",
    roles: ["fan", "performer"],
    mediaBindPoint: "none",
  },
  {
    id: "inventory",
    label: "INVENTORY",
    info: "Wearables",
    accent: "#FF6B35",
    animation: "orbit",
    roles: ["fan"],
    mediaBindPoint: "none",
  },
  {
    id: "media_locker",
    label: "MEDIA LOCKER",
    info: "Songs & video",
    accent: "#00FFFF",
    animation: "mechanical",
    roles: ["performer"],
    primary: true,
    mediaBindPoint: "none",
  },
  {
    id: "beat_lab",
    label: "BEAT LAB",
    info: "Vault & beats",
    accent: "#FFD700",
    animation: "mechanical",
    roles: ["performer"],
    mediaBindPoint: "none",
  },
  {
    id: "booking",
    label: "BOOKINGS",
    info: "Requests",
    accent: "#00FF88",
    animation: "fold",
    roles: ["performer"],
    mediaBindPoint: "none",
  },
  {
    id: "stage_tools",
    label: "STAGE TOOLS",
    info: "Go Live / stage",
    accent: "#AA2DFF",
    animation: "portal",
    roles: ["performer"],
    mediaBindPoint: "none",
  },
  {
    id: "store",
    label: "STORE",
    info: "Merch / skins",
    accent: "#FF6B35",
    animation: "vinyl_flip",
    roles: ["performer"],
    mediaBindPoint: "none",
  },
  {
    id: "appearance",
    label: "SHELL COLORS",
    info: "This device",
    accent: "#FF2DAA",
    animation: "fold",
    roles: ["shared"],
    mediaBindPoint: "none",
  },
];

const BY_ID = new Map(UNIVERSAL_DRAWER_MODULES.map((m) => [m.id, m]));

export function getUniversalDrawerModule(id: UniversalDrawerModuleId): UniversalDrawerModuleDef | undefined {
  return BY_ID.get(id);
}

export function animationForDrawerModule(id: UniversalDrawerModuleId): DrawerAnimationId {
  return BY_ID.get(id)?.animation ?? "command_lift";
}

export function modulesForRole(role: "fan" | "performer"): UniversalDrawerModuleDef[] {
  return UNIVERSAL_DRAWER_MODULES.filter(
    (m) => m.id !== "appearance" && (m.roles.includes(role) || m.roles.includes("shared")),
  );
}

/** Fan under-drawer quick-swap chips (shell + module pattern). */
export const FAN_UNIVERSAL_SWAP_MODULES: UniversalDrawerModuleId[] = [
  "lobby",
  "yopho",
  "playlist",
  "memory",
  "live_destinations",
  "room_controls",
];
