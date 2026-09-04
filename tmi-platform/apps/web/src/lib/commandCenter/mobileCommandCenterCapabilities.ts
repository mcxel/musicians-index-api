/**
 * Shared mobile quick-panel capability resolver — Fan vs Performer buttons only.
 * Geometry is identical; capabilities differ by role (Rule 26).
 *
 * Primary strip (QP-10): MIC ON | CAM ON | CAMERA | SNIPS | VIDEO SHUFFLE | STREAM & WIN | GO LIVE
 * Lower row (QP-10): role-specific quick tools (see LOWER_ROW_FAN / LOWER_ROW_PERFORMER)
 */

import {
  isVenueToolsEnabled,
  resolveVenueToolsPolicy,
  type VenueToolsPolicyContext,
} from "@/lib/venue/VenueToolsRegistry";

export type MobileQuickPanelActionId =
  | "avatar"
  | "inventory"
  | "lobbies"
  | "stream-win"
  | "remote"
  | "yopho"
  | "playlist"
  | "magazine"
  | "messages"
  | "venue-tools"
  | "share-screen"
  | "record"
  | "share"
  | "memory";

export type MobileCommandCenterRole = "fan" | "performer";

export interface MobileQuickPanelButtonDef {
  id: MobileQuickPanelActionId;
  label: string;
  tier: "primary" | "more";
}

const LOWER_ROW_FAN: MobileQuickPanelButtonDef[] = [
  { id: "avatar", label: "👤 AVATAR", tier: "primary" },
  { id: "inventory", label: "🎒 INVENTORY", tier: "primary" },
  { id: "magazine", label: "📰 MAGAZINE", tier: "primary" },
  { id: "yopho", label: "📷 YOPHO", tier: "primary" },
  { id: "playlist", label: "🎵 PLAYLIST", tier: "primary" },
  { id: "lobbies", label: "🧭 DISCOVERY", tier: "primary" },
  { id: "venue-tools", label: "VENUE TOOLS", tier: "primary" },
  { id: "remote", label: "🎚️ REMOTE", tier: "primary" },
  { id: "memory", label: "🧠 MEMORY", tier: "primary" },
];

const LOWER_ROW_PERFORMER: MobileQuickPanelButtonDef[] = [
  { id: "magazine", label: "📰 MAGAZINE", tier: "primary" },
  { id: "yopho", label: "📷 YOPHO", tier: "primary" },
  { id: "playlist", label: "🎵 PLAYLIST", tier: "primary" },
  { id: "lobbies", label: "🧭 DISCOVERY", tier: "primary" },
  { id: "venue-tools", label: "VENUE TOOLS", tier: "primary" },
  { id: "remote", label: "🎚️ REMOTE", tier: "primary" },
  { id: "memory", label: "🧠 MEMORY", tier: "primary" },
];

const MORE_COMMON: MobileQuickPanelButtonDef[] = [
  { id: "share-screen", label: "🖥 SHARE SCREEN", tier: "more" },
  { id: "record", label: "⏺ RECORD", tier: "more" },
  { id: "share", label: "↗ SHARE", tier: "more" },
];

export interface MobileQuickPanelCapabilitiesContext extends VenueToolsPolicyContext {
  role: MobileCommandCenterRole;
}

export function getMobileQuickPanelCapabilities(
  role: MobileCommandCenterRole,
  ctx?: Partial<Omit<MobileQuickPanelCapabilitiesContext, "role">>,
): {
  primary: MobileQuickPanelButtonDef[];
  more: MobileQuickPanelButtonDef[];
} {
  const policy = resolveVenueToolsPolicy({ role, ...ctx });
  const primary = role === "fan" ? [...LOWER_ROW_FAN] : [...LOWER_ROW_PERFORMER];
  if (!isVenueToolsEnabled(policy)) {
    return {
      primary: primary.filter((item) => item.id !== "venue-tools"),
      more: MORE_COMMON,
    };
  }
  return { primary, more: MORE_COMMON };
}

/** Primary session strip on mobile — locked QP-10 row (mirrors sessionControlCapabilities). */
export const MOBILE_PRIMARY_SESSION_IDS = [
  "mic",
  "cam",
  "camera",
  "snips",
  "video-shuffle",
  "stream-win",
  "go-live",
] as const;
