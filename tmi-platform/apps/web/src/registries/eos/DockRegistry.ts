/**
 * DockRegistry — data-driven bottom dock navigation (Phase 2 Dashboard Runtime).
 * MasterControlDock renders from here; no duplicate Fan/Performer JSX trees.
 */

import type { EosRole } from "@/core/eos/types";

export type DockItemId =
  | "home"
  | "explore"
  | "search"
  | "live_now"
  | "messages"
  | "notifications"
  | "stats"
  | "sponsors"
  | "observatory"
  | "analytics"
  | "runtime"
  | "settings";

export type DockActionId =
  | "leave"
  | "mic"
  | "cam"
  | "camera"
  | "broadcast"
  | "memory"
  | "record"
  | "snips"
  | "video-shuffle"
  | "stream-win";

export type DockCenterButton = "camera" | "broadcast";

export interface DockNavItemDefinition {
  id: DockItemId;
  label: string;
  icon: string;
  path: string;
  /** Primary discovery accent (Explore) */
  primary?: boolean;
}

export interface DockActionDefinition {
  id: DockActionId;
  label: string;
  icon: string;
  activeLabel?: string;
}

export interface DockRoleConfig {
  role: EosRole;
  navItemIds: DockItemId[];
  actionIds: DockActionId[];
  centerButton: DockCenterButton;
  accentColor: string;
  playlistPlaylistId: string;
  playlistLabel: string;
}

export const DOCK_NAV_CATALOG: Record<DockItemId, DockNavItemDefinition> = {
  home: { id: "home", label: "HOME", icon: "🏠", path: "/dashboard" },
  explore: { id: "explore", label: "EXPLORE", icon: "🧭", path: "/explore", primary: true },
  search: { id: "search", label: "SEARCH", icon: "🔍", path: "/search" },
  live_now: { id: "live_now", label: "LIVE NOW", icon: "📹", path: "/live/lobby-wall" },
  messages: { id: "messages", label: "MESSAGES", icon: "💬", path: "/messages" },
  notifications: { id: "notifications", label: "ALERTS", icon: "🔔", path: "/notifications" },
  stats: { id: "stats", label: "STATS", icon: "📊", path: "/performer/analytics" },
  sponsors: { id: "sponsors", label: "SPONSORS", icon: "💼", path: "/profile/sponsor" },
  observatory: { id: "observatory", label: "OBSERVATORY", icon: "🛡", path: "/admin/overseer" },
  analytics: { id: "analytics", label: "ANALYTICS", icon: "📈", path: "/admin/revenue" },
  runtime: { id: "runtime", label: "RUNTIME", icon: "⚡", path: "/eos/test" },
  settings: { id: "settings", label: "SETTINGS", icon: "⚙️", path: "/settings" },
};

export const DOCK_ACTION_CATALOG: Record<DockActionId, DockActionDefinition> = {
  leave: { id: "leave", label: "LEAVE", icon: "🚪" },
  mic: { id: "mic", label: "MIC OFF", icon: "🎙️", activeLabel: "MIC ON" },
  cam: { id: "cam", label: "CAM OFF", icon: "📹", activeLabel: "CAM ON" },
  camera: { id: "camera", label: "CAMERA", icon: "📷" },
  broadcast: { id: "broadcast", label: "GO LIVE", icon: "🔴" },
  memory: { id: "memory", label: "SCREEN", icon: "📷" },
  record: { id: "record", label: "REC", icon: "⏺" },
  snips: { id: "snips", label: "SNIPS", icon: "📱" },
  "video-shuffle": { id: "video-shuffle", label: "VIDEO SHUFFLE", icon: "🔀" },
  "stream-win": { id: "stream-win", label: "STREAM & WIN", icon: "📻" },
};

export const DOCK_ROLE_REGISTRY: Record<EosRole, DockRoleConfig> = {
  fan: {
    role: "fan",
    navItemIds: ["home", "explore", "search", "live_now", "messages", "notifications"],
    actionIds: ["leave", "mic", "cam", "snips", "video-shuffle", "stream-win", "camera"],
    centerButton: "camera",
    accentColor: "#00FF88",
    playlistPlaylistId: "stream-and-win",
    playlistLabel: "Stream & Win Radio",
  },
  performer: {
    role: "performer",
    navItemIds: ["home", "explore", "search", "live_now", "messages", "notifications"],
    actionIds: ["leave", "mic", "cam", "snips", "video-shuffle", "stream-win", "broadcast"],
    centerButton: "broadcast",
    accentColor: "#AA2DFF",
    playlistPlaylistId: "discovery",
    playlistLabel: "Media Locker Set",
  },
  admin: {
    role: "admin",
    navItemIds: ["home", "explore", "observatory", "analytics", "runtime", "settings"],
    actionIds: ["leave", "mic", "cam", "camera"],
    centerButton: "broadcast",
    accentColor: "#FFD700",
    playlistPlaylistId: "stream-and-win",
    playlistLabel: "Platform Feed",
  },
};

export function normalizeDockRole(
  role: "fan" | "performer" | "artist" | "admin" | undefined
): EosRole {
  if (role === "admin") return "admin";
  if (role === "performer" || role === "artist") return "performer";
  return "fan";
}

export function getDockConfigForRole(
  role: "fan" | "performer" | "artist" | "admin" | undefined
): DockRoleConfig {
  return DOCK_ROLE_REGISTRY[normalizeDockRole(role)];
}

export function getDockNavItems(role: EosRole): DockNavItemDefinition[] {
  return DOCK_ROLE_REGISTRY[role].navItemIds
    .map((id) => DOCK_NAV_CATALOG[id])
    .filter(Boolean);
}

export function getDockActions(role: EosRole): DockActionDefinition[] {
  return DOCK_ROLE_REGISTRY[role].actionIds
    .map((id) => DOCK_ACTION_CATALOG[id])
    .filter(Boolean);
}
