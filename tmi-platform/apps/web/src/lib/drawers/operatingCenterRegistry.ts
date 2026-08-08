/**
 * operatingCenterRegistry — Living OS Layer 2 taxonomy (locked 2026-07-31).
 *
 * Each Operating Center is a named workspace grouping related drawer modules.
 * The left rail renders Operating Center buttons; the drawer's swap chips
 * surface the modules within the active center.
 *
 * Rule: Assembly only — modules listed here must already exist in UniversalDrawerRegistry.
 */

import type { UniversalDrawerModuleId } from "@/lib/drawers/UniversalDrawerRegistry";
import type { ActionId } from "@/lib/os/universalActionRegistry";

export type OperatingCenterRole = "fan" | "performer" | "beat_creator";

export interface OperatingCenter {
  /** Stable ID — never change (used in state stores). */
  id: string;
  label: string;
  info: string;
  /** Emoji icon shown in left-rail button. */
  icon: string;
  /** Accent colour for the button active/hover state. */
  accent: string;
  /** Module opened when this center is first activated. */
  primaryModule: UniversalDrawerModuleId;
  /** Full set of modules accessible via drawer swap chips inside this center. */
  modules: UniversalDrawerModuleId[];
  roles: OperatingCenterRole[];
  /** Canonical Action ID for Living OS Command Bus dispatch when this center is activated. */
  actionId: ActionId;
}

// ─── Performer Operating Centers ──────────────────────────────────────────────

export const PERFORMER_OPERATING_CENTERS: OperatingCenter[] = [
  {
    id: "communication",
    label: "COMMUNICATION",
    info: "Messages · Calls · Groups",
    icon: "💬",
    accent: "#00D4FF",
    primaryModule: "messaging",
    modules: ["messaging", "notifications", "submissions", "queue"],
    roles: ["performer"],
    actionId: "ACTION_OPEN_COMMUNICATION_CENTER",
  },
  {
    id: "booking",
    label: "BOOKING CENTER",
    info: "Calendar · Requests · Contracts",
    icon: "📅",
    accent: "#00FF88",
    primaryModule: "booking",
    modules: ["booking"],
    roles: ["performer"],
    actionId: "ACTION_OPEN_BOOKING_CENTER",
  },
  {
    id: "media",
    label: "MEDIA CENTER",
    info: "Locker · Beats · Playlists",
    icon: "🎵",
    accent: "#9B59FF",
    primaryModule: "media_locker",
    modules: ["media_locker", "beat_lab", "playlist", "memory", "stage_tools", "live_destinations"],
    roles: ["performer"],
    actionId: "ACTION_OPEN_MEDIA_CENTER",
  },
  {
    id: "bio_magazine",
    label: "BIO & MAGAZINE",
    info: "Article · Gallery · Interviews",
    icon: "📰",
    accent: "#00FFFF",
    primaryModule: "bio_magazine",
    modules: ["bio_magazine", "yopho", "media_locker"],
    roles: ["performer"],
    actionId: "ACTION_OPEN_BIO_MAGAZINE_CENTER",
  },
  {
    id: "commerce_center",
    label: "COMMERCE CENTER",
    info: "Products · Store · Own · Payouts",
    icon: "🛒",
    accent: "#FFD700",
    primaryModule: "commerce_center",
    modules: ["commerce_center", "store", "beat_marketplace"],
    roles: ["performer"],
    actionId: "ACTION_OPEN_COMMERCE_CENTER",
  },
  {
    id: "commercial",
    label: "COMMERCIAL CENTER",
    info: "Store · Commerce",
    icon: "💰",
    accent: "#FFD700",
    // Rule 26: no sponsor-management chrome for performers — store/commerce only
    primaryModule: "store",
    modules: ["store", "commerce_center"],
    roles: ["performer"],
    actionId: "ACTION_OPEN_COMMERCIAL_CENTER",
  },
  {
    id: "analytics",
    label: "ANALYTICS CENTER",
    info: "Revenue · Periods · Scores",
    icon: "📊",
    accent: "#FF6B35",
    primaryModule: "analytics",
    modules: ["analytics", "scores"],
    roles: ["performer"],
    actionId: "ACTION_OPEN_ANALYTICS_CENTER",
  },
  {
    id: "achievement_center",
    label: "ACHIEVEMENT CENTER",
    info: "Crowns · Belts · XP · Timeline",
    icon: "🏆",
    accent: "#FFD700",
    primaryModule: "achievement_center",
    modules: ["achievement_center", "scores", "championship_center"],
    roles: ["performer"],
    actionId: "ACTION_OPEN_ACHIEVEMENT_CENTER",
  },
  {
    id: "championship_center",
    label: "CHAMPIONSHIP CENTER",
    info: "Crowns · Belts · Defenses · HoF",
    icon: "👑",
    accent: "#FFD700",
    primaryModule: "championship_center",
    modules: ["championship_center", "achievement_center", "scores"],
    roles: ["performer"],
    actionId: "ACTION_OPEN_CHAMPIONSHIP_CENTER",
  },
  {
    id: "yopho",
    label: "YOPHO STUDIO",
    info: "Identity Card · Motion",
    icon: "🃏",
    accent: "#FF2DAA",
    primaryModule: "yopho",
    modules: ["yopho"],
    roles: ["performer"],
    actionId: "ACTION_OPEN_YOPHO_STUDIO",
  },
  {
    id: "shop_center",
    label: "SHOP CENTER",
    info: "Connections · Products · Orders · Payouts",
    icon: "🏬",
    accent: "#FFD700",
    primaryModule: "shop_center",
    modules: ["shop_center", "asset_vault", "commerce_center"],
    roles: ["performer"],
    actionId: "ACTION_OPEN_SHOP",
  },
  {
    id: "marketplace_center",
    label: "MARKETPLACE",
    info: "Albums · Merch · Beats · TMI Store",
    icon: "🛍️",
    accent: "#00FFFF",
    primaryModule: "marketplace",
    modules: ["marketplace", "tmi_store", "beat_marketplace"],
    roles: ["performer"],
    actionId: "ACTION_OPEN_MARKETPLACE",
  },
];

// ─── Fan Operating Centers ────────────────────────────────────────────────────

export const FAN_OPERATING_CENTERS: OperatingCenter[] = [
  {
    id: "avatar",
    label: "AVATAR CENTER",
    info: "Lobby · Wearables · Emotes",
    icon: "🧑‍🎤",
    accent: "#9B59FF",
    primaryModule: "lobby",
    modules: ["lobby", "inventory", "room_controls"],
    roles: ["fan"],
    actionId: "ACTION_OPEN_AVATAR_CENTER",
  },
  {
    id: "memory",
    label: "MEMORY CENTER",
    info: "Wall · Photos · Playlists",
    icon: "📸",
    accent: "#00D4FF",
    primaryModule: "memory",
    modules: ["memory", "playlist"],
    roles: ["fan"],
    actionId: "ACTION_OPEN_MEMORY_CENTER",
  },
  {
    id: "rewards",
    label: "REWARDS CENTER",
    info: "Prizes · Inventory · Orders",
    icon: "🏆",
    accent: "#FF6B35",
    primaryModule: "prize_vault",
    modules: ["prize_vault", "achievement_center", "inventory", "tickets"],
    roles: ["fan"],
    actionId: "ACTION_OPEN_REWARDS_CENTER",
  },
  {
    id: "achievement_center",
    label: "ACHIEVEMENT CENTER",
    info: "Trophies · Crowns · XP · Points",
    icon: "👑",
    accent: "#FFD700",
    primaryModule: "achievement_center",
    modules: ["achievement_center", "scores", "prize_vault", "championship_center"],
    roles: ["fan"],
    actionId: "ACTION_OPEN_ACHIEVEMENT_CENTER",
  },
  {
    id: "championship_center",
    label: "CHAMPIONSHIP CENTER",
    info: "Crowns · Belts · Defenses · HoF",
    icon: "🏆",
    accent: "#FFD700",
    primaryModule: "championship_center",
    modules: ["championship_center", "achievement_center", "scores"],
    roles: ["fan"],
    actionId: "ACTION_OPEN_CHAMPIONSHIP_CENTER",
  },
  {
    id: "yopho",
    label: "YOPHO STUDIO",
    info: "Identity · Motion · Share",
    icon: "🃏",
    accent: "#FF2DAA",
    primaryModule: "yopho",
    modules: ["yopho"],
    roles: ["fan"],
    actionId: "ACTION_OPEN_YOPHO_STUDIO",
  },
  {
    id: "statistics",
    label: "STATISTICS CENTER",
    info: "XP · Levels · Favorites",
    icon: "📊",
    accent: "#FFD700",
    primaryModule: "analytics",
    modules: ["analytics", "scores", "favorites", "submissions"],
    roles: ["fan"],
    actionId: "ACTION_OPEN_STATISTICS_CENTER",
  },
  {
    id: "marketplace_center",
    label: "MARKETPLACE",
    info: "Albums · Merch · Beats · TMI Store",
    icon: "🛍️",
    accent: "#00FFFF",
    primaryModule: "marketplace",
    modules: ["marketplace", "tmi_store", "beat_marketplace"],
    roles: ["fan"],
    actionId: "ACTION_OPEN_MARKETPLACE",
  },
];

// ─── Beat Creator Operating Centers ──────────────────────────────────────────────
// Shown when a user's account has the beat_creator contributor role.
// Per Rule 26: this is ADDITIVE — the beat_creator sees their base-role centers
// PLUS the Beat Creator centers below.

export const BEAT_CREATOR_OPERATING_CENTERS: OperatingCenter[] = [
  {
    id: "beat_locker",
    label: "BEAT LOCKER",
    info: "Upload · Edit · Manage",
    icon: "🎧",
    accent: "#FF6B1A",
    primaryModule: "submission_center",
    modules: ["submission_center", "beat_lab", "submissions", "analytics"],
    roles: ["beat_creator"],
    actionId: "ACTION_OPEN_BEAT_LOCKER_CENTER",
  },
  {
    id: "beat_queue",
    label: "COMPETITION QUEUE",
    info: "Battles · Cyphers · Challenges",
    icon: "🥁",
    accent: "#9B59FF",
    primaryModule: "submissions",
    modules: ["submissions", "scores"],
    roles: ["beat_creator"],
    actionId: "ACTION_SUBMIT_BEAT_TO_BATTLE",
  },
  {
    id: "beat_analytics",
    label: "BEAT ANALYTICS",
    info: "Revenue · Plays · Reports",
    icon: "📊",
    accent: "#FFD700",
    primaryModule: "analytics",
    modules: ["analytics"],
    roles: ["beat_creator"],
    actionId: "ACTION_OPEN_BEAT_REVENUE_DASHBOARD",
  },
  {
    id: "beat_marketplace_center",
    label: "BEAT MARKETPLACE",
    info: "Browse · License · Purchase",
    icon: "🏪",
    accent: "#00D4FF",
    primaryModule: "beat_marketplace",
    modules: ["beat_marketplace"],
    roles: ["beat_creator"],
    actionId: "ACTION_OPEN_BEAT_LOCKER_CENTER",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function centersForRole(role: OperatingCenterRole): OperatingCenter[] {
  if (role === "beat_creator") return BEAT_CREATOR_OPERATING_CENTERS;
  return role === "performer" ? PERFORMER_OPERATING_CENTERS : FAN_OPERATING_CENTERS;
}

/**
 * Finds the Operating Center that owns a given module for a given role.
 * Returns null if the module isn't covered by any center (e.g. queue, notifications
 * when accessed directly from MasterControlDock).
 */
export function centerForModule(
  role: OperatingCenterRole,
  moduleId: UniversalDrawerModuleId,
): OperatingCenter | null {
  return (
    centersForRole(role).find((c) => c.modules.includes(moduleId)) ?? null
  );
}
