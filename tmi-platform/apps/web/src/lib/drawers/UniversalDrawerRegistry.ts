/**
 * UniversalDrawerRegistry — one shell pattern, many module personalities.
 *
 * Blueprint: detachable side panels around a central player (future).
 * This pass: under-dashboard Command Center swap (Lobby / YoPho / Memory /
 * Playlist / Live Destinations / Analytics / Room Controls / Sponsor).
 *
 * Animation id is per drawer type — never a single shared slide for all.
 *
 * ADAPTER (Phase 1): Flight Deck Share + audio playlist open
 * `lib/workspace/universal` workspaces (share-studio / playlist-studio),
 * not these under-monitor drawers. Drawer `playlist` remains for Command
 * Center rail until migrated into Universal Workspace Window.
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
  | "appearance"
  | "notifications"
  | "queue"
  | "submissions"
  | "scores"
  /** Coordinate → invite → join venues (MessagingCanister). */
  | "messaging"
  /** Fan: digital + physical prizes, claims, shipping tracking. */
  | "prize_vault"
  /** Fan: event tickets and purchase order history. */
  | "tickets"
  /** Fan: saved artists, songs, battles, concerts, YoPho cards. */
  | "favorites"
  /** Performer: bio, magazine article, gallery slots, music links, interviews. */
  | "bio_magazine"
  /** Performer: Creator Commerce Center — products, store, distributors, YoPho collectibles. */
  | "commerce_center"
  /** Beat Creator: multi-step submission form for the Beat Locker pipeline. */
  | "submission_center"
  /** Beat Creator / Fan: browse, preview, and purchase licensed beats. */
  | "beat_marketplace"
  /** Fan: ACTIVE_PERFORMER marketplace (albums/merch/beats/YoPho) — context-aware. */
  | "marketplace"
  /** Performer: private commerce management HQ — connections, products, orders, payouts. */
  | "shop_center"
  /** Shared: TMI Platform Store — avatar items, coins, venue skins, seasonal drops. */
  | "tmi_store"
  /** Performer: Creator Asset Vault — master media library (albums, art, press kits). */
  | "asset_vault"
  /** Fan + Performer: trophies, crowns, belts, achievements, streaks, XP, points, timeline. */
  | "achievement_center"
  /** Fan + Performer: ESPN-style Championship Center hub (Phase 2C). */
  | "championship_center";

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
    label: "SHOP",
    info: "Personal · TMI Store",
    accent: "#FF6B35",
    animation: "vinyl_flip",
    roles: ["fan", "performer"],
    primary: true,
    mediaBindPoint: "none",
  },
  {
    id: "marketplace",
    label: "MARKETPLACE",
    info: "Active artist products",
    accent: "#FF6B35",
    animation: "vinyl_flip",
    roles: ["fan"],
    primary: true,
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
  {
    id: "notifications",
    label: "NOTIFICATIONS",
    info: "Alerts · inbox",
    accent: "#FF2DAA",
    animation: "fold",
    roles: ["fan", "performer"],
    mediaBindPoint: "none",
  },
  {
    id: "queue",
    label: "QUEUE",
    info: "Up next",
    accent: "#00D4FF",
    animation: "mechanical",
    roles: ["fan", "performer"],
    mediaBindPoint: "none",
  },
  {
    id: "messaging",
    label: "MESSAGES",
    info: "Invite · join",
    accent: "#00FFFF",
    animation: "fold",
    roles: ["fan", "performer"],
    primary: true,
    mediaBindPoint: "none",
  },
  {
    id: "submissions",
    label: "SUBMISSIONS",
    /** Fan lane = contests/spotlight; Performer drawer mounts BeatLocker (Rule 26). */
    info: "Entries & vault",
    accent: "#FFD700",
    animation: "mechanical",
    roles: ["fan", "performer"],
    primary: true,
    mediaBindPoint: "none",
  },
  {
    id: "scores",
    label: "SCORES & RANKS",
    info: "Leaderboards",
    accent: "#00D4FF",
    animation: "command_lift",
    roles: ["fan", "performer"],
    primary: true,
    mediaBindPoint: "none",
  },
  {
    id: "prize_vault",
    label: "PRIZE VAULT",
    info: "Awards & claims",
    accent: "#FF6B35",
    animation: "memory_scatter",
    roles: ["fan"],
    primary: false,
    mediaBindPoint: "none",
  },
  {
    id: "tickets",
    label: "TICKETS & ORDERS",
    info: "Events · Purchases",
    accent: "#00D4FF",
    animation: "mechanical",
    roles: ["fan"],
    primary: false,
    mediaBindPoint: "none",
  },
  {
    id: "favorites",
    label: "FAVORITES",
    info: "Artists · Songs · Battles",
    accent: "#FF2DAA",
    animation: "orbit",
    roles: ["fan"],
    primary: false,
    mediaBindPoint: "none",
  },
  {
    id: "bio_magazine",
    label: "BIO & MAGAZINE",
    info: "Article · Gallery · Interviews",
    accent: "#00FFFF",
    animation: "hologram",
    roles: ["performer"],
    primary: true,
    mediaBindPoint: "none",
  },
  {
    id: "commerce_center",
    label: "COMMERCE CENTER",
    info: "Store · Products · Own",
    accent: "#FFD700",
    animation: "vinyl_flip",
    roles: ["performer"],
    primary: true,
    mediaBindPoint: "none",
  },
  {
    id: "submission_center",
    label: "SUBMISSION CENTER",
    info: "Upload Beat · Track Status",
    accent: "#FF6B1A",
    animation: "mechanical",
    roles: ["performer"],   // beat_creator role is a performer-tier contributor
    primary: false,
    mediaBindPoint: "none",
  },
  {
    id: "beat_marketplace",
    label: "BEAT MARKETPLACE",
    info: "Browse · License · Purchase",
    accent: "#FFD700",
    animation: "vinyl_flip",
    roles: ["fan", "performer"],
    primary: false,
    mediaBindPoint: "none",
  },
  {
    id: "marketplace",
    label: "MARKETPLACE",
    info: "Albums · Merch · Beats · VIP",
    accent: "#00FFFF",
    animation: "hologram",
    roles: ["fan", "performer"],
    primary: true,
    mediaBindPoint: "none",
  },
  {
    id: "shop_center",
    label: "SHOP CENTER",
    info: "Connections · Orders · Payouts",
    accent: "#FFD700",
    animation: "mechanical",
    roles: ["performer"],
    primary: true,
    mediaBindPoint: "none",
  },
  {
    id: "tmi_store",
    label: "TMI STORE",
    info: "Avatar · Coins · Venue Skins",
    accent: "#AA2DFF",
    animation: "orbit",
    roles: ["fan", "performer"],
    primary: false,
    mediaBindPoint: "none",
  },
  {
    id: "asset_vault",
    label: "ASSET VAULT",
    info: "Albums · Art · Press Kits",
    accent: "#FF2DAA",
    animation: "memory_scatter",
    roles: ["performer"],
    primary: false,
    mediaBindPoint: "none",
  },
  {
    id: "achievement_center",
    label: "ACHIEVEMENT CENTER",
    info: "Crowns · Belts · XP · Timeline",
    accent: "#FFD700",
    animation: "command_lift",
    roles: ["fan", "performer"],
    primary: true,
    mediaBindPoint: "none",
  },
  {
    id: "championship_center",
    label: "CHAMPIONSHIP CENTER",
    info: "Crowns · Belts · Defenses · HoF",
    accent: "#FFD700",
    animation: "command_lift",
    roles: ["fan", "performer"],
    primary: true,
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
  "marketplace",
  "store",
  "messaging",
  "submissions",
  "scores",
  "inventory",
  "prize_vault",
  "achievement_center",
  "championship_center",
  "tickets",
  "favorites",
  "live_destinations",
  "room_controls",
  "notifications",
  "analytics",
];

/** Performer under-drawer quick-swap chips — includes BeatLocker submissions. */
export const PERFORMER_UNIVERSAL_SWAP_MODULES: UniversalDrawerModuleId[] = [
  "media_locker",
  "bio_magazine",
  "commerce_center",
  "yopho",
  "playlist",
  "memory",
  "live_destinations",
  "messaging",
  "submissions",
  "scores",
  "achievement_center",
  "championship_center",
  "beat_lab",
  "booking",
  "stage_tools",
  "store",
  "sponsors",
  "analytics",
  "notifications",
];
