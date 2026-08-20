/**
 * Shared mobile quick-panel capability resolver — Fan vs Performer buttons only.
 * Geometry is identical; capabilities differ by role (Rule 26).
 *
 * Lower row (QP-10): MAGAZINE | YOPHO | PLAYLIST | REMOTE | AVATAR | MEMORY | MORE (LOBBIES moved to primary strip)
 */

export type MobileQuickPanelActionId =
  | "avatar"
  | "inventory"
  | "lobbies"
  | "remote"
  | "yopho"
  | "playlist"
  | "magazine"
  | "share-screen"
  | "record"
  | "share"
  | "memory"
  | "emotes";

export type MobileCommandCenterRole = "fan" | "performer";

export interface MobileQuickPanelButtonDef {
  id: MobileQuickPanelActionId;
  label: string;
  tier: "primary" | "more";
}

const LOWER_ROW_COMMON: MobileQuickPanelButtonDef[] = [
  { id: "magazine", label: "📰 MAGAZINE", tier: "primary" },
  { id: "yopho", label: "📷 YOPHO", tier: "primary" },
  { id: "playlist", label: "🎵 PLAYLIST", tier: "primary" },
  { id: "remote", label: "🎚️ REMOTE", tier: "primary" },
  { id: "memory", label: "🧠 MEMORY", tier: "primary" },
];

const LOWER_ROW_FAN: MobileQuickPanelButtonDef[] = [
  ...LOWER_ROW_COMMON.slice(0, 4),
  { id: "avatar", label: "👤 AVATAR", tier: "primary" },
  LOWER_ROW_COMMON[4]!,
];

const LOWER_ROW_PERFORMER: MobileQuickPanelButtonDef[] = [...LOWER_ROW_COMMON];

const MORE_COMMON: MobileQuickPanelButtonDef[] = [
  { id: "share-screen", label: "🖥 SHARE SCREEN", tier: "more" },
  { id: "record", label: "⏺ RECORD", tier: "more" },
  { id: "share", label: "↗ SHARE", tier: "more" },
];

export function getMobileQuickPanelCapabilities(role: MobileCommandCenterRole): {
  primary: MobileQuickPanelButtonDef[];
  more: MobileQuickPanelButtonDef[];
} {
  return {
    primary: role === "fan" ? LOWER_ROW_FAN : LOWER_ROW_PERFORMER,
    more: MORE_COMMON,
  };
}

/** Primary session strip on mobile — locked QP-10 row (mirrors sessionControlCapabilities). */
export const MOBILE_PRIMARY_SESSION_IDS = [
  "mic",
  "cam",
  "camera",
  "snips",
  "video-shuffle",
  "lobbies",
  "go-live",
] as const;
